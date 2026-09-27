# TRINETRA Production Deployment Guide

A step-by-step, zero-guesswork production deployment guide for the **TRINETRA Hyper-Local Severe Weather Nowcasting Platform**.

---

## Architecture Overview

```text
┌─────────────────────────────────┐
│     End User / Browser          │
└───────────────┬─────────────────┘
                │
                │ HTTPS
                ▼
┌─────────────────────────────────┐        Server Rewrites / Direct       ┌─────────────────────────────────┐
│       Vercel (Next.js)          │ ────────────────────────────────────► │     Render / Railway (FastAPI)   │
│         apps/web                │   /api/py/*  ──►  /api/v1/*           │       services/inference        │
└───────────────┬─────────────────┘                                       └────────────────┬────────────────┘
                │                                                                          │
                │ Realtime Subscriptions & PostGIS Alerts                                  │ (Optional Internal DB)
                ▼                                                                          ▼
┌───────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                       Supabase Production Cloud                                           │
│                     PostgreSQL 15 + PostGIS + Realtime Channels + Row Level Security                      │
└───────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Environment Variable Mapping Matrix

| Variable Name | Description | Where It Belongs | Visibility | Production Example |
| :--- | :--- | :--- | :--- | :--- |
| `NEXT_PUBLIC_APP_NAME` | Display branding | Vercel | **Public** | `"TRINETRA Severe Weather Nowcasting"` |
| `NEXT_PUBLIC_APP_ENV` | Application environment | Vercel | **Public** | `"production"` |
| `NEXT_PUBLIC_SITE_URL` | Canonical Vercel domain | Vercel | **Public** | `https://trinetra.vercel.app` |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Project URL | Vercel | **Public** | `https://jbfisdwxaojkegczsbn.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Publishable / Anon Key | Vercel | **Public** | `sb_publishable_...` |
| `NEXT_PUBLIC_MAP_TILE_STYLE_URL`| Map style endpoint | Vercel | **Public** | `https://demotiles.maplibre.org/style.json` |
| `NEXT_PUBLIC_INFERENCE_URL` | Deployed FastAPI public HTTPS URL | Vercel | **Public** | `https://trinetra-inference.onrender.com` |
| `ML_INFERENCE_SERVICE_URL` | Internal URL used by Vercel server rewrites | Vercel | **Server Secret** | `https://trinetra-inference.onrender.com` |
| `ML_INFERENCE_API_KEY` | Shared internal authentication token | Vercel & Render | **Server Secret** | `<Generate random 32-char hex>` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase admin secret key | Vercel & Supabase | **Server Secret** | `sb_secret_...` *(Never prefix with NEXT_PUBLIC)* |
| `DATABASE_URL` | PostgreSQL direct connection URI | Supabase / Server | **Server Secret** | `postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres` |
| `FRONTEND_URL` | Allowed frontend origin for CORS | Render / Railway | **Backend Config**| `https://trinetra.vercel.app` |
| `ALLOWED_ORIGINS` | Comma-separated CORS origins | Render / Railway | **Backend Config**| `https://trinetra.vercel.app` |
| `PORT` | Dynamic port injected by host | Render / Railway | **System Assigned**| `10000` or `$PORT` |
| `INFERENCE_ENV` | Python runtime mode | Render / Railway | **Backend Config**| `"production"` |
| `MODEL_VERSION` | Neural nowcast model release | Render / Railway | **Backend Config**| `"v1.0.0-conv3d-multitask"` |

> [!CAUTION]
> **NEVER** expose `SUPABASE_SERVICE_ROLE_KEY` or `DATABASE_URL` inside `NEXT_PUBLIC_*` variables. Any variable prefixed with `NEXT_PUBLIC_` is baked into public client-side JavaScript bundles.

---

## Step 1: Supabase Backend Configuration

1. Log in to your [Supabase Dashboard](https://supabase.com/dashboard).
2. Select your project: `https://jbfisdwxaojkegczsbn.supabase.co`.
3. Verify Extensions:
   - Navigate to **Database** $\rightarrow$ **Extensions**.
   - Ensure `postgis` is enabled.
4. Verify Schema Migrations:
   - Go to **SQL Editor** and verify tables: `authority_alert_events`, `alerts`, `spatial_ref_sys`.
5. Obtain API Keys:
   - Navigate to **Project Settings** $\rightarrow$ **API**.
   - Note down:
     - **Project URL** $\rightarrow$ `https://jbfisdwxaojkegczsbn.supabase.co`
     - **anon / public key** $\rightarrow$ Safe for frontend (`NEXT_PUBLIC_SUPABASE_ANON_KEY`).
     - **service_role key** $\rightarrow$ Secret server-side key (`SUPABASE_SERVICE_ROLE_KEY`).

---

## Step 2: Deploy FastAPI ML Inference Microservice

Deploy to **Render** (free/low-cost) or **Railway**.

### Option A: Render (Recommended)
1. Go to [Render Dashboard](https://dashboard.render.com/) and click **New +** $\rightarrow$ **Web Service**.
2. Connect your GitHub repository: `https://github.com/Praticksingh/TRINETRA`.
3. Configure the service settings:
   - **Name**: `trinetra-inference`
   - **Region**: Choose the closest region (e.g. `Singapore` or `Frankfurt`).
   - **Root Directory**: `services/inference`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Configure Environment Variables in Render:
   - `INFERENCE_ENV`: `production`
   - `MODEL_VERSION`: `v1.0.0-conv3d-multitask`
   - `FRONTEND_URL`: `https://YOUR-APP.vercel.app` *(update once you create your Vercel project)*
5. Configure Health Check Path:
   - Under **Advanced**, set **Health Check Path** to `/health`.
6. Click **Deploy Web Service**.
7. Once deployed, copy your assigned HTTPS service URL:
   - Example: `https://trinetra-inference.onrender.com`

### Option B: Railway
1. Go to [Railway Dashboard](https://railway.app/) and select **New Project** $\rightarrow$ **Deploy from GitHub repo**.
2. Select the `TRINETRA` repository.
3. In service settings, set **Root Directory** to `/services/inference`.
4. Railway will automatically detect the `Procfile` or `Dockerfile`.
5. Under **Variables**, add:
   - `INFERENCE_ENV`: `production`
   - `FRONTEND_URL`: `https://YOUR-APP.vercel.app`
6. Under **Settings** $\rightarrow$ **Networking**, click **Generate Domain** to get your public HTTPS URL.

---

## Step 3: Verify the FastAPI Health Probe

Open a terminal or browser and query the health endpoint:

```bash
curl -f https://YOUR-INFERENCE-URL.onrender.com/health
```

Expected JSON response (HTTP 200):
```json
{
  "status": "ok",
  "state": "healthy",
  "service": "trinetra-ml-inference",
  "version": "0.1.0",
  "model_version": "v1.0.0-conv3d-multitask",
  "gpu_available": false,
  "timestamp": "2026-09-27T03:00:00.000000+00:00"
}
```

---

## Step 4: Deploy Next.js Frontend to Vercel

1. Log in to [Vercel](https://vercel.com/dashboard).
2. Click **Add New...** $\rightarrow$ **Project**.
3. Import your GitHub repository: `Praticksingh/TRINETRA`.
4. Configure the Project:
   - **Framework Preset**: `Next.js` (auto-detected).
   - **Root Directory**: `apps/web`.
   - **Build Command**: Leave default (`next build` / `npm run build`).
   - **Output Directory**: Leave default (`.next`).
5. Add **Environment Variables** in Vercel:
   ```env
   NEXT_PUBLIC_APP_NAME="TRINETRA Severe Weather Nowcasting"
   NEXT_PUBLIC_APP_ENV="production"
   NEXT_PUBLIC_SITE_URL="https://YOUR-PROJECT.vercel.app"

   NEXT_PUBLIC_SUPABASE_URL="https://jbfisdwxaojkegczsbn.supabase.co"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="<your-supabase-publishable-key>"

   NEXT_PUBLIC_MAP_TILE_STYLE_URL="https://demotiles.maplibre.org/style.json"

   NEXT_PUBLIC_INFERENCE_URL="https://YOUR-INFERENCE-URL.onrender.com"
   ML_INFERENCE_SERVICE_URL="https://YOUR-INFERENCE-URL.onrender.com"
   ML_INFERENCE_API_KEY="<your-shared-internal-key>"
   ```
6. Click **Deploy**.
7. Once deployment finishes, note down your production Vercel URL (e.g. `https://trinetra.vercel.app`).

---

## Step 5: Connect Frontend CORS to FastAPI

1. Return to your **Render** or **Railway** dashboard.
2. Update the environment variable:
   - `FRONTEND_URL` $\rightarrow$ `https://your-exact-vercel-domain.vercel.app`
3. Save and let the inference service redeploy (takes ~30 seconds).

---

## Step 6: End-to-End System Verification

Once both services are deployed, perform this 5-point verification:

1. **Frontend Uptime**:
   - Visit `https://your-vercel-domain.vercel.app` in your browser.
   - Verify that the dark, calm interface loads immediately without JavaScript errors in the console.
2. **Nowcast Inference Pipeline**:
   - Go to the **Overview** or **Data Sources** tab.
   - Click **Run Nowcast Cycle**.
   - Verify that the frontend calls `/api/py/orchestration/trigger` and receives a successful response with a generated `job_id`.
3. **Interactive Weather Map**:
   - Click on the **Weather Map** tab.
   - Verify the Leaflet map tiles render, markers appear across the Uttarakhand basins (Kedarnath, Chamoli, Rishikesh), and the location inspection drawer opens smoothly on click.
4. **Supabase Realtime Alert Listener**:
   - Check the **Active Alerts** counter in the header.
   - If alerts exist in Supabase PostGIS `alerts` or `authority_alert_events`, they synchronize dynamically.
5. **Mobile Responsiveness**:
   - Open developer tools or your mobile phone.
   - Verify the bottom navigation bar (`[Overview, Map, Forecast, Alerts, More]`) allows thumb-friendly navigation with zero horizontal table overflow.

---

## Troubleshooting Common Issues

### 1. `CORS error: No 'Access-Control-Allow-Origin' header`
- **Cause**: The FastAPI microservice does not have your Vercel domain in its allowed origins.
- **Fix**: In Render/Railway, set `FRONTEND_URL=https://your-project.vercel.app` and redeploy. All `*.vercel.app` domains are also supported via regex.

### 2. Next.js rewrite 502 / 504 on `/api/py/*`
- **Cause**: `ML_INFERENCE_SERVICE_URL` in Vercel environment variables is pointing to `localhost:8000` or an incorrect URL.
- **Fix**: Update `ML_INFERENCE_SERVICE_URL` in Vercel Project Settings to `https://your-service.onrender.com`.

### 3. Supabase Realtime Disconnected / Offline Fallback
- **Cause**: `NEXT_PUBLIC_SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_ANON_KEY` is missing or invalid.
- **Result**: The application automatically switches to local memory state and demo replay without crashing. Check Vercel environment variables to restore live mode.
