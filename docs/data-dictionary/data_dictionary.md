# TRINETRA Data Dictionary & Spatiotemporal Standards

## 1. Geospatial & Temporal Standards

| Parameter | Standard / Specification | Notes |
| :--- | :--- | :--- |
| **Coordinate Reference System (CRS)** | EPSG:4326 (WGS84) | Standard longitude/latitude format for all GeoJSON payloads and API responses. |
| **Projected Metric CRS (for distance/area)** | EPSG:3857 (Web Mercator) / Regional UTM | Used internally for buffer calculations, slope, and drainage basin geometry. |
| **Temporal Standard** | ISO 8601 UTC (`YYYY-MM-DDTHH:mm:ssZ`) | All timestamps across ingest, model inference, and frontend display are stored in UTC. |
| **Forecast Horizon** | T+0 to T+6 hours | 15-minute time steps (`T+00:15`, `T+00:30`, ..., `T+06:00`). |
| **Default Spatial Resolution** | 0.04° (~4 km x 4 km grid) | Standard nowcast cell resolution. |

---

## 2. Atmospheric & Satellite Features

| Feature Name | Symbol / ID | Unit | Source Type | Physical Meaning |
| :--- | :--- | :--- | :--- | :--- |
| **Convective Available Potential Energy** | `cape` | J/kg | Reanalysis / NWP | Atmospheric instability measure; buoyant energy available for convection. |
| **Convective Inhibition** | `cin` | J/kg | Reanalysis / NWP | Negative buoyancy preventing parcel ascent; capping inversion strength. |
| **Total Precipitable Water** | `tpw` | mm (kg/m²) | Satellite Sounder / Model | Total atmospheric water vapor contained in a vertical column from surface to top. |
| **Brightness Temperature (TIR1)** | `bt_tir1` | Kelvin (K) | Geostationary Satellite IR (10.8µm) | Cloud-top temperature; rapid cooling indicates deep convective cloud growth. |
| **Brightness Temperature Difference** | `btd_split` | Kelvin (K) | Satellite (TIR1 - TIR2) | Cloud microphysics indicator; separates ice anvils, deep cores, and cirrus. |
| **Vertical Velocity (Omega)** | `omega_500` | Pa/s | NWP / Reanalysis | Updraft/downdraft dynamic forcing at 500 hPa pressure level. |
| **Composite Radar Reflectivity** | `radar_dbz` | dBZ | Doppler Radar (DWR) | Precipitation intensity indicator; values >45 dBZ indicate severe convection/hail. |

---

## 3. Terrain & Hydrological Features (DEM-Derived)

| Feature Name | Symbol / ID | Unit | Source Type | Physical Meaning |
| :--- | :--- | :--- | :--- | :--- |
| **Elevation** | `elevation` | Meters (m) | SRTM / CartoDEM | Topographic height above mean sea level. |
| **Topographic Slope** | `slope_deg` | Degrees (°) | DEM derivative | Gradient of incline; steep slopes accelerate storm runoff generation. |
| **Flow Accumulation** | `flow_accum` | Number of cells | Hydrological routing | Cumulative number of upstream cells draining into current cell. |
| **Topographic Wetness Index** | `twi` | Dimensionless | $\ln(a / \tan \beta)$ | Propensity of terrain to saturate and accumulate surface water. |
| **Catchment Vulnerability Score** | `catchment_vuln` | Scale 0.0 - 1.0 | Composite terrain model | Inherent susceptibility of local catchment to flash flooding given heavy rain. |

---

## 4. Prediction Targets & Hazard Definitions

| Target ID | Hazard Name | Physical Definition & Operational Threshold |
| :--- | :--- | :--- |
| `thunderstorm_prob` | **Severe Thunderstorm** | Convective storm accompanied by lightning, wind gusts $\ge 50$ km/h, or hail. |
| `cloudburst_prob` | **Cloudburst** | Extreme localized rainfall rate $\ge 100$ mm/hour over a localized area. |
| `flash_flood_risk` | **Flash Flood Risk** | Rapid inundation of low-lying areas or mountain valleys occurring within 6 hours of heavy rainfall. |

---

## 5. Alert Severity Matrix

| Severity Level | Color Code | Description | Operational Action |
| :--- | :--- | :--- | :--- |
| **None / Green** | `#10b981` | Probability $< 0.20$ | Routine monitoring; standard operations. |
| **Advisory / Yellow** | `#f59e0b` | $0.20 \le \text{Probability} < 0.45$ | Be aware; atmospheric conditions favorable for rapid convective development. |
| **Watch / Orange** | `#f97316` | $0.45 \le \text{Probability} < 0.70$ | Be prepared; high likelihood of severe convective storm within 2–6 hours. |
| **Warning / Red** | `#ef4444` | $\text{Probability} \ge 0.70$ | Take immediate action; imminent high-impact hazard; deploy emergency protocols. |
