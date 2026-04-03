"""Request/response logging middleware."""

import time
import logging

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request

logger = logging.getLogger("navaved.middleware")


class LoggingMiddleware(BaseHTTPMiddleware):
    """Logs every request with method, path, status code, duration, and client IP."""

    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        client_ip = request.client.host if request.client else "unknown"
        method = request.method
        path = request.url.path
        query = str(request.query_params) if request.query_params else ""

        logger.info("→ %s %s%s [client=%s]",
                     method, path, f"?{query}" if query else "", client_ip)

        try:
            response = await call_next(request)
        except Exception as exc:
            duration = time.time() - start_time
            logger.error("✗ %s %s → EXCEPTION after %.2fs: %s",
                          method, path, duration, str(exc))
            raise

        duration = time.time() - start_time

        # Color code by status
        status = response.status_code
        if status >= 500:
            logger.error("✗ %s %s → %d (%.2fs)", method, path, status, duration)
        elif status >= 400:
            logger.warning("⚠ %s %s → %d (%.2fs)", method, path, status, duration)
        else:
            logger.info("✓ %s %s → %d (%.2fs)", method, path, status, duration)

        return response
