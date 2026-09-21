"""
End-to-End Forecast Orchestration Pipeline for TRINETRA.
Coordinates:
Observation Feeds -> Normalization -> Deep Inference -> Terrain Risk Fusion -> GeoJSON Export.
"""

import time
import json
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
import numpy as np

from ingestion.normalizer import SpatiotemporalNormalizer
from ingestion.synthetic_replay import generate_synthetic_nowcast_payload
from models.deep_inference import TrinetraDeepInference
from terrain.risk_fusion import FlashFloodRiskFusion
from terrain.basin_catalog import PILOT_BASINS
from .job_manager import JobManager, ForecastJob, JobStatus


class ForecastPipeline:
    """
    Unified execution pipeline connecting multi-sensor observations
    to calibrated forecasts and GIS GeoJSON features.
    """

    def __init__(
        self,
        deep_inference: Optional[TrinetraDeepInference] = None,
        risk_fusion: Optional[FlashFloodRiskFusion] = None,
        normalizer: Optional[SpatiotemporalNormalizer] = None,
    ):
        self.normalizer = normalizer or SpatiotemporalNormalizer()
        self.deep_inference = deep_inference or TrinetraDeepInference()
        self.risk_fusion = risk_fusion or FlashFloodRiskFusion()
        self.job_manager = JobManager()

        self._latest_snapshot: Optional[Dict[str, Any]] = None
        self._latest_geojson: Optional[Dict[str, Any]] = None

    def execute_cycle(
        self,
        raw_observation_batch: Optional[Dict[str, Any]] = None,
        is_synthetic_replay: bool = True,
        trigger_source: str = "scheduled_interval",
    ) -> Dict[str, Any]:
        """
        Executes a single nowcast prediction cycle with full job lifecycle tracking and idempotency.
        """
        start_wall = time.perf_counter()

        # Step 0: Ingestion fallback to standard Uttarakhand synthetic observation if none passed
        if raw_observation_batch is None:
            raw_observation_batch = generate_synthetic_nowcast_payload()

        data_ts = (
            raw_observation_batch.get("observation_timestamp")
            or raw_observation_batch.get("metadata", {}).get("timestamp")
            or datetime.now(timezone.utc).isoformat()
        )

        # Idempotent job retrieval/creation
        job, is_new = self.job_manager.create_or_get_job(
            data_timestamp=data_ts,
            raw_payload=raw_observation_batch,
            source=trigger_source,
        )

        # If job was already completed and snapshot is cached, return it immediately
        if not is_new and job.status == JobStatus.COMPLETED and self._latest_snapshot:
            job.log("Returning cached snapshot from previous identical run.")
            return self._latest_snapshot

        job.started_at = datetime.now(timezone.utc).isoformat()

        try:
            # Step 1: Normalization & Quality Assessment
            job.transition_to(JobStatus.NORMALIZING)
            norm_result = self.normalizer.process_raw_batch(raw_observation_batch)
            cell_count = norm_result["shape"][1] * norm_result["shape"][2]
            job.log(f"Normalized {cell_count} cells. Tensor Hash: {norm_result['tensor_hash'][:12]}")

            # Step 2: Deep Spatiotemporal Inference
            job.transition_to(JobStatus.INFERRING)
            raw_tensor = norm_result.get("raw_tensor")
            if raw_tensor is not None and getattr(raw_tensor, "ndim", 0) == 3 and raw_tensor.shape[0] == 10:
                H, W = raw_tensor.shape[1], raw_tensor.shape[2]
                tensor_seq = np.zeros((4, 10, H, W), dtype=np.float32)
                for t in range(4):
                    tensor_seq[t] = raw_tensor.copy()
                    # Apply physical convective evolution: t=0 (earlier) to t=3 (current observation)
                    cooling_k_hr = raw_tensor[2]
                    # Updraft cooling accumulates towards current time
                    delta_k = (cooling_k_hr / 60.0) * (3 - t) * 30.0
                    tensor_seq[t, 0] = np.clip(raw_tensor[0] - delta_k, 180.0, 330.0) / 100.0
                    tensor_seq[t, 1] = tensor_seq[t, 1] / 10.0
                    tensor_seq[t, 2] = tensor_seq[t, 2] / 20.0
                    tensor_seq[t, 3] = tensor_seq[t, 3] / 4000.0
                    tensor_seq[t, 4] = tensor_seq[t, 4] / 200.0
                    tensor_seq[t, 5] = tensor_seq[t, 5] / 80.0
                    tensor_seq[t, 6] = tensor_seq[t, 6] / 2.0
                    tensor_seq[t, 7] = tensor_seq[t, 7] / 4000.0
                    tensor_seq[t, 8] = tensor_seq[t, 8] / 60.0
                    tensor_seq[t, 9] = tensor_seq[t, 9] / 15.0
            else:
                # Fallback to standard 15x15 representative convective profile
                tensor_seq = np.zeros((4, 10, 15, 15), dtype=np.float32)
                for t in range(4):
                    tensor_seq[t, 0, :, :] = (205.0 - 5.0 * t - 200.0) / 100.0
                    tensor_seq[t, 1, :, :] = (2.2 + 0.4 * t) / 10.0
                    tensor_seq[t, 2, :, :] = (-15.5 * (1.0 + 0.1 * t)) / 15.0
                    tensor_seq[t, 3, :, :] = (3350.0 + 100.0 * t) / 4000.0
                    tensor_seq[t, 4, :, :] = 18.0 / 200.0
                    tensor_seq[t, 5, :, :] = (64.0 + 1.5 * t) / 80.0
                    tensor_seq[t, 6, :, :] = (-1.6 - 0.2 * t) / 2.0
                    tensor_seq[t, 7, :, :] = 2800.0 / 4000.0
                    tensor_seq[t, 8, :, :] = 38.0 / 60.0
                    tensor_seq[t, 9, :, :] = 12.0 / 15.0

            deep_preds = self.deep_inference.predict(
                tensor_data=tensor_seq,
                is_synthetic_replay=is_synthetic_replay,
                source_id=f"pipeline_{data_ts}",
            )
            job.log(f"Deep inference finished in {deep_preds['inference_latency_ms']} ms.")

            # Step 3: Terrain Risk Fusion across Target Basins
            job.transition_to(JobStatus.TERRAIN_FUSING)
            cell_forecasts = []
            geojson_features = []

            for basin_key, basin in PILOT_BASINS.items():
                centroid = basin["centroid"]
                cell_id = basin["representative_cell_id"]
                elev = float(np.mean(basin["elevation_range_m"]))
                slope = float(basin["mean_slope_deg"])
                twi = 12.5 if "gorge" in basin["confinement_rating"].lower() else 9.0

                # Per-horizon calculations
                horizon_risks = {}
                for h_name, h_vals in deep_preds["horizons"].items():
                    fused = self.risk_fusion.calculate_risk(
                        cloudburst_prob=h_vals["cloudburst_probability"],
                        thunderstorm_prob=h_vals["thunderstorm_probability"],
                        slope_deg=slope,
                        twi=twi,
                        elevation_m=elev,
                    )
                    horizon_risks[h_name] = fused

                h_2h = horizon_risks["2h"]
                cell_data = {
                    "cell_id": cell_id,
                    "basin_id": basin["basin_id"],
                    "basin_name": basin["name"],
                    "centroid": centroid,
                    "severity": h_2h["severity_level"],
                    "threat_label": h_2h["threat_label"],
                    "color_cue": h_2h["color_cue"],
                    "icon_shape": h_2h["icon_shape"],
                    "flash_flood_risk": h_2h["flash_flood_risk_score"],
                    "meteorological_forcing": h_2h["dual_factor_attribution"]["meteorological_forcing"]["score"],
                    "terrain_susceptibility": h_2h["dual_factor_attribution"]["terrain_susceptibility"]["score"],
                    "dominant_driver": h_2h["dominant_driver"],
                    "terrain": {
                        "slope_deg": slope,
                        "elevation_m": elev,
                        "twi": twi,
                        "confinement": basin["confinement_rating"],
                    },
                    "horizons": horizon_risks,
                }
                cell_forecasts.append(cell_data)

                # Construct 0.04-degree GeoJSON Polygon feature
                delta = 0.02
                polygon_coords = [
                    [
                        [centroid[0] - delta, centroid[1] - delta],
                        [centroid[0] + delta, centroid[1] - delta],
                        [centroid[0] + delta, centroid[1] + delta],
                        [centroid[0] - delta, centroid[1] + delta],
                        [centroid[0] - delta, centroid[1] - delta],
                    ]
                ]

                geojson_features.append({
                    "type": "Feature",
                    "id": cell_id,
                    "geometry": {
                        "type": "Polygon",
                        "coordinates": polygon_coords,
                    },
                    "properties": {
                        "cell_id": cell_id,
                        "name": basin["name"],
                        "severity": h_2h["severity_level"],
                        "flash_flood_risk": h_2h["flash_flood_risk_score"],
                        "p_meteo": h_2h["dual_factor_attribution"]["meteorological_forcing"]["score"],
                        "s_terrain": h_2h["dual_factor_attribution"]["terrain_susceptibility"]["score"],
                        "dominant_driver": h_2h["dominant_driver"],
                        "slope_deg": slope,
                        "elevation_m": elev,
                        "twi": twi,
                        "is_synthetic_replay": is_synthetic_replay,
                        "disclaimer": FlashFloodRiskFusion.DISCLAIMER,
                    },
                })

            # Step 4: Finalize Snapshot & GeoJSON
            now_iso = datetime.now(timezone.utc).isoformat()
            snapshot_id = f"snap_{int(datetime.now(timezone.utc).timestamp())}_{norm_result['tensor_hash'][:8]}"

            geojson_collection = {
                "type": "FeatureCollection",
                "snapshot_id": snapshot_id,
                "generated_at": now_iso,
                "data_timestamp": data_ts,
                "is_synthetic_replay": is_synthetic_replay,
                "crs": {"type": "name", "properties": {"name": "urn:ogc:def:crs:OGC:1.3:CRS84"}},
                "features": geojson_features,
            }

            snapshot = {
                "snapshot_id": snapshot_id,
                "job_id": job.job_id,
                "generated_at": now_iso,
                "data_timestamp": data_ts,
                "is_synthetic_replay": is_synthetic_replay,
                "model_version": self.deep_inference.model_version,
                "total_pipeline_latency_ms": round((time.perf_counter() - start_wall) * 1000.0, 2),
                "cells_count": len(cell_forecasts),
                "cells": cell_forecasts,
                "disclaimer": FlashFloodRiskFusion.DISCLAIMER,
                "geojson": geojson_collection,
            }

            self._latest_snapshot = snapshot
            self._latest_geojson = geojson_collection

            # Finalize job
            job.snapshot_id = snapshot_id
            job.completed_at = now_iso
            job.duration_ms = (time.perf_counter() - start_wall) * 1000.0
            job.transition_to(JobStatus.COMPLETED)
            job.log(f"Cycle completed successfully in {round(job.duration_ms, 1)} ms.")

            return snapshot

        except Exception as e:
            job.duration_ms = (time.perf_counter() - start_wall) * 1000.0
            job.transition_to(JobStatus.FAILED, error=str(e))
            self.job_manager.mark_dead_letter(job, str(e))
            raise

    def get_latest_snapshot(self) -> Optional[Dict[str, Any]]:
        return self._latest_snapshot

    def get_latest_geojson(self) -> Optional[Dict[str, Any]]:
        if self._latest_geojson is None:
            # Trigger initial bootstrap cycle if empty
            self.execute_cycle()
        return self._latest_geojson
