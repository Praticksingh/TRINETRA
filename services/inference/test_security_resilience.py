"""Test suite for Phase 10: Security, Reliability & System Hardening

Tests:
  - Circuit Breaker state transitions (CLOSED -> OPEN -> HALF_OPEN -> CLOSED)
  - Exponential backoff with jitter retry decorator
  - Sliding-window rate limiter logic
  - OWASP Security headers on FastAPI responses
  - Rate limiting HTTP 429 response when threshold exceeded
"""

import time
import pytest
from fastapi.testclient import TestClient
from main import app, rate_limiter
from core.resilience import (
    CircuitBreaker,
    CircuitState,
    CircuitBreakerOpenException,
    with_retry,
    SlidingWindowRateLimiter,
)

client = TestClient(app)


def test_circuit_breaker_lifecycle():
    """Verifies that CircuitBreaker transitions through CLOSED -> OPEN -> HALF_OPEN -> CLOSED"""
    cb = CircuitBreaker(
        name="test_cb",
        failure_threshold=3,
        recovery_timeout_seconds=0.2,
        success_threshold=2,
    )
    assert cb.state == CircuitState.CLOSED

    # Simulate 2 failures: still CLOSED
    cb.record_failure()
    cb.record_failure()
    assert cb.state == CircuitState.CLOSED

    # 3rd failure: trips to OPEN
    cb.record_failure()
    assert cb.state == CircuitState.OPEN

    # Executing function while OPEN raises CircuitBreakerOpenException
    @cb
    def protected_call():
        return "success"

    with pytest.raises(CircuitBreakerOpenException, match="Fast-failing"):
        protected_call()

    # Wait for recovery timeout to elapse
    time.sleep(0.25)
    assert cb.state == CircuitState.HALF_OPEN

    # 1st success in HALF_OPEN: still HALF_OPEN
    protected_call()
    assert cb.state == CircuitState.HALF_OPEN

    # 2nd success in HALF_OPEN (meets success_threshold=2): resets to CLOSED
    protected_call()
    assert cb.state == CircuitState.CLOSED


def test_with_retry_intermittent_success():
    """Verifies that with_retry succeeds when a transient error resolves within max_attempts"""
    attempts = 0

    @with_retry(max_attempts=3, backoff_base=0.01, jitter=False)
    def flaky_network_call():
        nonlocal attempts
        attempts += 1
        if attempts < 3:
            raise ConnectionError("Upstream timeout")
        return "ok"

    result = flaky_network_call()
    assert result == "ok"
    assert attempts == 3


def test_with_retry_exhaustion():
    """Verifies that with_retry raises exception once max_attempts are exhausted"""
    attempts = 0

    @with_retry(max_attempts=3, backoff_base=0.01, jitter=False)
    def failing_call():
        nonlocal attempts
        attempts += 1
        raise ValueError("Permanent parsing failure")

    with pytest.raises(ValueError, match="Permanent parsing failure"):
        failing_call()

    assert attempts == 3


def test_sliding_window_rate_limiter():
    """Verifies sliding window rate limiter thresholds and remaining quota calculation"""
    limiter = SlidingWindowRateLimiter(max_requests=5, window_seconds=1)

    # 5 requests should be allowed
    for i in range(5):
        allowed, remaining, _ = limiter.is_allowed("client_1")
        assert allowed is True
        assert remaining == 5 - (i + 1)

    # 6th request should be denied
    allowed, remaining, reset_secs = limiter.is_allowed("client_1")
    assert allowed is False
    assert remaining == 0
    assert reset_secs > 0

    # Different client key should have its own separate quota
    allowed, remaining, _ = limiter.is_allowed("client_2")
    assert allowed is True
    assert remaining == 4


def test_owasp_security_headers():
    """Verifies that FastAPI middleware injects OWASP recommended security headers"""
    res = client.get("/health")
    assert res.status_code == 200

    headers = res.headers
    assert headers.get("X-Content-Type-Options") == "nosniff"
    assert headers.get("X-Frame-Options") == "DENY"
    assert headers.get("X-XSS-Protection") == "1; mode=block"
    assert "max-age=31536000" in headers.get("Strict-Transport-Security", "")
    assert headers.get("Referrer-Policy") == "strict-origin-when-cross-origin"
    assert "X-RateLimit-Limit" in headers
    assert "X-RateLimit-Remaining" in headers


def test_http_rate_limit_enforcement():
    """Verifies that HTTP requests return 429 when client exceeds rate limit"""
    # Temporarily set max_requests to 3 on the global rate limiter
    original_max = rate_limiter.max_requests
    rate_limiter.max_requests = 3
    rate_limiter.reset()

    try:
        # 3 requests succeed
        for _ in range(3):
            res = client.get("/api/v1/gis/layers", headers={"X-Forwarded-For": "198.51.100.42"})
            assert res.status_code == 200

        # 4th request must be rejected with HTTP 429
        res = client.get("/api/v1/gis/layers", headers={"X-Forwarded-For": "198.51.100.42"})
        assert res.status_code == 429
        assert "Rate limit exceeded" in res.json()["detail"]
        assert "Retry-After" in res.headers
    finally:
        # Restore original limit
        rate_limiter.max_requests = original_max
        rate_limiter.reset()
