/**
 * Production-ready environment and URL resolution utility.
 * Adapts seamlessly across local development, Vercel preview environments,
 * and custom production domains without hardcoded dependencies on localhost.
 */

export function getSiteUrl(): string {
  // 1. Explicitly configured public site URL (custom domain)
  if (process.env.NEXT_PUBLIC_SITE_URL && process.env.NEXT_PUBLIC_SITE_URL.trim() !== "") {
    return process.env.NEXT_PUBLIC_SITE_URL.trim().replace(/\/$/, "");
  }

  // 2. Vercel deployment URL (populated automatically by Vercel for preview and production)
  if (process.env.NEXT_PUBLIC_VERCEL_URL && process.env.NEXT_PUBLIC_VERCEL_URL.trim() !== "") {
    return `https://${process.env.NEXT_PUBLIC_VERCEL_URL.trim().replace(/\/$/, "")}`;
  }

  // 3. Server-side Vercel URL
  if (process.env.VERCEL_URL && process.env.VERCEL_URL.trim() !== "") {
    return `https://${process.env.VERCEL_URL.trim().replace(/\/$/, "")}`;
  }

  // 4. Fallback for local development
  return "http://localhost:3000";
}

export function getInferenceUrl(): string {
  const url =
    process.env.NEXT_PUBLIC_INFERENCE_URL ||
    process.env.ML_INFERENCE_SERVICE_URL;

  if (url && url.trim() !== "") {
    return url.trim().replace(/\/$/, "");
  }

  // In development, default to local FastAPI port; in production, use relative proxy
  if (process.env.NODE_ENV === "development") {
    return "http://localhost:8000";
  }

  return "";
}

export function isProduction(): boolean {
  return (
    process.env.NODE_ENV === "production" ||
    process.env.NEXT_PUBLIC_APP_ENV === "production"
  );
}
