"""TRINETRA Common Alerting Protocol (CAP v1.2) & GeoJSON Alert Feed Serializer

Complies with ITU-T X.1303 / OASIS CAP v1.2 and RFC 7946 GeoJSON specifications
for interoperability with disaster management agencies (NDRF, SDMA, IMD).
"""

from __future__ import annotations
import xml.etree.ElementTree as ET
from xml.dom import minidom
from typing import List, Dict, Any
from .alert_engine import AlertEvent, AlertSeverity, HazardType


CAP_SEVERITY_MAP = {
    AlertSeverity.CRITICAL: "Extreme",
    AlertSeverity.WARNING: "Severe",
    AlertSeverity.WATCH: "Moderate",
    AlertSeverity.ADVISORY: "Minor",
}

CAP_URGENCY_MAP = {
    AlertSeverity.CRITICAL: "Immediate",
    AlertSeverity.WARNING: "Expected",
    AlertSeverity.WATCH: "Future",
    AlertSeverity.ADVISORY: "Past",
}

CAP_CERTAINTY_MAP = {
    AlertSeverity.CRITICAL: "Observed",
    AlertSeverity.WARNING: "Likely",
    AlertSeverity.WATCH: "Possible",
    AlertSeverity.ADVISORY: "Unlikely",
}


class CAPSerializer:
    """Serializes AlertEvent models into standard OASIS CAP v1.2 XML"""

    CAP_XMLNS = "urn:oasis:names:tc:emergency:cap:1.2"
    DEFAULT_SENDER = "trinetra-nowcast@sdma.uk.gov.in"

    @classmethod
    def to_cap_xml(cls, alert: AlertEvent) -> str:
        """Generates standard CAP v1.2 XML string"""
        root = ET.Element("alert", xmlns=cls.CAP_XMLNS)

        ET.SubElement(root, "identifier").text = alert.id
        ET.SubElement(root, "sender").text = cls.DEFAULT_SENDER
        ET.SubElement(root, "sent").text = alert.issued_at
        ET.SubElement(root, "status").text = "Actual" if not alert.is_synthetic_replay else "Test"
        ET.SubElement(root, "msgType").text = "Alert"
        ET.SubElement(root, "scope").text = "Public"
        ET.SubElement(root, "note").text = (
            "TRINETRA Model-Generated Advisory. Not an official state decree. "
            f"Peak Probability: {alert.peak_probability * 100:.1f}%."
        )

        info = ET.SubElement(root, "info")
        ET.SubElement(info, "category").text = "Met"
        ET.SubElement(info, "event").text = alert.hazard_type.value.replace("_", " ").title()
        ET.SubElement(info, "urgency").text = CAP_URGENCY_MAP.get(alert.severity, "Expected")
        ET.SubElement(info, "severity").text = CAP_SEVERITY_MAP.get(alert.severity, "Moderate")
        ET.SubElement(info, "certainty").text = CAP_CERTAINTY_MAP.get(alert.severity, "Possible")

        # Event code
        event_code = ET.SubElement(info, "eventCode")
        ET.SubElement(event_code, "valueName").text = "SAME"
        if alert.hazard_type == HazardType.FLASH_FLOOD:
            ET.SubElement(event_code, "value").text = "FFW" if alert.severity == AlertSeverity.CRITICAL else "FFA"
        elif alert.hazard_type == HazardType.CLOUDBURST:
            ET.SubElement(event_code, "value").text = "SVR"
        else:
            ET.SubElement(event_code, "value").text = "TSA"

        ET.SubElement(info, "expires").text = alert.valid_to
        ET.SubElement(info, "headline").text = alert.headline
        ET.SubElement(info, "description").text = alert.description
        ET.SubElement(info, "instruction").text = alert.instruction
        ET.SubElement(info, "web").text = "https://trinetra.uk.gov.in"
        ET.SubElement(info, "contact").text = "State Emergency Operations Centre (SEOC) Dehradun"

        # Parameter: Model probability
        param = ET.SubElement(info, "parameter")
        ET.SubElement(param, "valueName").text = "PeakProbability"
        ET.SubElement(param, "value").text = f"{alert.peak_probability:.4f}"

        # Area
        area = ET.SubElement(info, "area")
        ET.SubElement(area, "areaDesc").text = alert.region_name

        # CAP polygon coordinates: "lat,lon lat,lon ..."
        if alert.boundary_polygon:
            # Note: boundary_polygon is stored as [lon, lat]
            cap_coords = " ".join([f"{pt[1]:.4f},{pt[0]:.4f}" for pt in alert.boundary_polygon])
            ET.SubElement(area, "polygon").text = cap_coords

        raw_xml = ET.tostring(root, encoding="utf-8")
        parsed = minidom.parseString(raw_xml)
        return parsed.toprettyxml(indent="  ", encoding="utf-8").decode("utf-8")


class GeoJSONAlertFeedSerializer:
    """Serializes AlertEvents into RFC 7946 GeoJSON FeatureCollections"""

    @classmethod
    def to_geojson_feature(cls, alert: AlertEvent) -> Dict[str, Any]:
        """Converts an AlertEvent to a GeoJSON Feature with polygon geometry"""
        # Ensure polygon closes
        coords = [list(pt) for pt in alert.boundary_polygon]
        if coords and coords[0] != coords[-1]:
            coords.append(coords[0])

        return {
            "type": "Feature",
            "id": alert.id,
            "geometry": {
                "type": "Polygon",
                "coordinates": [coords],
            },
            "properties": {
                "alert_id": alert.id,
                "hazard_type": alert.hazard_type.value,
                "severity": alert.severity.value,
                "status": alert.status.value,
                "region_name": alert.region_name,
                "headline": alert.headline,
                "description": alert.description,
                "instruction": alert.instruction,
                "issued_at": alert.issued_at,
                "valid_from": alert.valid_from,
                "valid_to": alert.valid_to,
                "lead_time_minutes": alert.lead_time_minutes,
                "peak_probability": alert.peak_probability,
                "is_official_warning": alert.is_official_warning,
                "is_synthetic_replay": alert.is_synthetic_replay,
                "affected_cells": alert.affected_cells,
                "trigger_metrics": alert.trigger_metrics,
            },
        }

    @classmethod
    def to_geojson_feed(cls, alerts: List[AlertEvent]) -> Dict[str, Any]:
        """Generates an RFC 7946 FeatureCollection for all alerts"""
        return {
            "type": "FeatureCollection",
            "crs": {
                "type": "name",
                "properties": {"name": "urn:ogc:def:crs:OGC:1.3:CRS84"},
            },
            "features": [cls.to_geojson_feature(a) for a in alerts],
            "metadata": {
                "total_alerts": len(alerts),
                "disclaimer": (
                    "Model-Generated Advisories for disaster decision-support. "
                    "Official statutory warnings are issued by IMD and SDMA."
                ),
            },
        }
