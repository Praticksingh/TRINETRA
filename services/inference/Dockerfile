# ==============================================================================
# TRINETRA ML Inference Microservice — Production Multi-Stage Dockerfile
# Base: Python 3.11-slim (Debian Bookworm)
# Security: Non-root user, read-only rootfs compatible, explicit healthcheck
# ==============================================================================

# --- Stage 1: Build & Dependencies ---
FROM python:3.11-slim AS builder

WORKDIR /build

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --prefix=/install -r requirements.txt

# --- Stage 2: Minimal Runtime ---
FROM python:3.11-slim AS runner

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=8000

# Install curl for healthcheck probe
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Create dedicated non-root application user
RUN groupadd -g 10001 trinetra && \
    useradd -u 10001 -g trinetra -s /bin/sh -M trinetra

# Copy installed Python packages from builder
COPY --from=builder /install /usr/local

# Copy application source code
COPY . /app

# Ensure non-root ownership
RUN chown -R trinetra:trinetra /app

USER trinetra

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
