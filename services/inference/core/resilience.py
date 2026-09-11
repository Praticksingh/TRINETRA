"""TRINETRA Resilience, Reliability & Security Hardening Module

Includes:
  1. CircuitBreaker: Protects upstream data feeds from cascading failures.
  2. with_retry: Exponential backoff with jitter for network calls.
  3. SlidingWindowRateLimiter: In-memory sliding-window request throttling.
"""

from __future__ import annotations
import time
import random
import functools
import logging
from typing import Callable, Any, Dict, Optional, Tuple
from enum import Enum

logger = logging.getLogger("trinetra.resilience")


class CircuitState(str, Enum):
    CLOSED = "CLOSED"      # Normal operational state
    OPEN = "OPEN"          # Tripped, blocking all calls
    HALF_OPEN = "HALF_OPEN"# Trial testing recovery state


class CircuitBreakerOpenException(Exception):
    """Raised when an operation is attempted while the circuit breaker is open"""
    pass


class CircuitBreaker:
    """Implements the standard Circuit Breaker pattern

    Trips to OPEN when consecutive failures exceed failure_threshold.
    Remains OPEN for recovery_timeout_seconds before transitioning to HALF_OPEN.
    Transitions back to CLOSED after success_threshold successful operations.
    """

    def __init__(
        self,
        name: str = "default_circuit",
        failure_threshold: int = 5,
        recovery_timeout_seconds: float = 30.0,
        success_threshold: int = 2,
    ):
        self.name = name
        self.failure_threshold = failure_threshold
        self.recovery_timeout_seconds = recovery_timeout_seconds
        self.success_threshold = success_threshold

        self._state = CircuitState.CLOSED
        self._consecutive_failures = 0
        self._consecutive_successes = 0
        self._last_state_change = time.monotonic()

    @property
    def state(self) -> CircuitState:
        # Check if OPEN timeout has expired to transition to HALF_OPEN
        if self._state == CircuitState.OPEN:
            if time.monotonic() - self._last_state_change >= self.recovery_timeout_seconds:
                self._state = CircuitState.HALF_OPEN
                self._consecutive_successes = 0
                self._last_state_change = time.monotonic()
                logger.info(f"CircuitBreaker[{self.name}] transitioned to HALF_OPEN")
        return self._state

    def record_success(self) -> None:
        """Records a successful operation"""
        if self._state == CircuitState.HALF_OPEN:
            self._consecutive_successes += 1
            if self._consecutive_successes >= self.success_threshold:
                self._state = CircuitState.CLOSED
                self._consecutive_failures = 0
                self._last_state_change = time.monotonic()
                logger.info(f"CircuitBreaker[{self.name}] recovered to CLOSED")
        elif self._state == CircuitState.CLOSED:
            self._consecutive_failures = 0

    def record_failure(self) -> None:
        """Records a failed operation"""
        self._consecutive_failures += 1
        if self._state == CircuitState.HALF_OPEN or self._consecutive_failures >= self.failure_threshold:
            self._state = CircuitState.OPEN
            self._last_state_change = time.monotonic()
            logger.warning(
                f"CircuitBreaker[{self.name}] tripped to OPEN (failures={self._consecutive_failures})"
            )

    def __call__(self, func: Callable) -> Callable:
        """Decorator for circuit-breaker protected functions"""
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            if self.state == CircuitState.OPEN:
                raise CircuitBreakerOpenException(
                    f"CircuitBreaker[{self.name}] is OPEN. Fast-failing request."
                )
            try:
                result = func(*args, **kwargs)
                self.record_success()
                return result
            except Exception as e:
                self.record_failure()
                raise e
        return wrapper

    def reset(self) -> None:
        self._state = CircuitState.CLOSED
        self._consecutive_failures = 0
        self._consecutive_successes = 0
        self._last_state_change = time.monotonic()


def with_retry(
    max_attempts: int = 3,
    backoff_base: float = 0.5,
    max_backoff: float = 4.0,
    jitter: bool = True,
    retryable_exceptions: Tuple[type, ...] = (Exception,),
):
    """Decorator providing exponential backoff with decorrelated jitter"""
    def decorator(func: Callable) -> Callable:
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            attempts = 0
            while True:
                try:
                    attempts += 1
                    return func(*args, **kwargs)
                except retryable_exceptions as e:
                    if attempts >= max_attempts:
                        logger.error(f"Function {func.__name__} failed after {attempts} attempts: {e}")
                        raise e

                    # Exponential backoff calculation
                    delay = min(max_backoff, backoff_base * (2 ** (attempts - 1)))
                    if jitter:
                        delay = random.uniform(0.5 * delay, 1.5 * delay)

                    logger.warning(
                        f"Attempt {attempts} for {func.__name__} failed ({e}). Retrying in {delay:.2f}s..."
                    )
                    time.sleep(delay)
        return wrapper
    return decorator


class SlidingWindowRateLimiter:
    """Thread-safe in-memory sliding window rate limiter per client key"""

    def __init__(self, max_requests: int = 60, window_seconds: int = 60):
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self._clients: Dict[str, list[float]] = {}

    def is_allowed(self, client_key: str) -> Tuple[bool, int, int]:
        """Checks if a request is allowed

        Returns:
          (allowed: bool, remaining_requests: int, reset_seconds: int)
        """
        now = time.monotonic()
        cutoff = now - self.window_seconds

        # Clean timestamps older than window
        timestamps = self._clients.get(client_key, [])
        valid_timestamps = [ts for ts in timestamps if ts > cutoff]

        if len(valid_timestamps) >= self.max_requests:
            remaining = 0
            oldest = valid_timestamps[0]
            reset_seconds = max(1, int(oldest + self.window_seconds - now))
            self._clients[client_key] = valid_timestamps
            return False, remaining, reset_seconds

        valid_timestamps.append(now)
        self._clients[client_key] = valid_timestamps
        remaining = self.max_requests - len(valid_timestamps)
        reset_seconds = self.window_seconds
        return True, remaining, reset_seconds

    def reset(self) -> None:
        self._clients.clear()
