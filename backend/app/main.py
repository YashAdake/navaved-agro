"""NAVAVED Agro API — FastAPI application entry point."""

import logging
import sys
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import get_settings
from app.database import create_tables
from app.middleware.logging_mw import LoggingMiddleware
from app.routers import health, auth, products, stores, admin

# Import models so SQLAlchemy knows about them
from app.models import User, Product, ProductVariant, Store, StoreAddress, StoreContact  # noqa: F401

settings = get_settings()

# ── Logging Configuration ──
# Set up a detailed logging format for ALL navaved.* loggers
LOG_FORMAT = "%(asctime)s | %(levelname)-8s | %(name)-25s | %(message)s"
DATE_FORMAT = "%Y-%m-%d %H:%M:%S"

# Root logger config
logging.basicConfig(
    level=logging.DEBUG,
    format=LOG_FORMAT,
    datefmt=DATE_FORMAT,
    handlers=[logging.StreamHandler(sys.stdout)],
)

# Set our app loggers to DEBUG for detailed output
for logger_name in [
    "navaved",
    "navaved.api",
    "navaved.auth",
    "navaved.products",
    "navaved.stores",
    "navaved.storage",
    "navaved.middleware",
    "navaved.routers",
]:
    logging.getLogger(logger_name).setLevel(logging.DEBUG)

# Quiet noisy 3rd-party loggers
logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)
logging.getLogger("httpcore").setLevel(logging.WARNING)
logging.getLogger("httpx").setLevel(logging.WARNING)

logger = logging.getLogger("navaved.api")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events."""
    logger.info("=" * 60)
    logger.info("🚀 Starting NAVAVED Agro API v1.0.0")
    logger.info("=" * 60)
    logger.info("Database URL: %s...%s", settings.DATABASE_URL[:30], settings.DATABASE_URL[-15:])
    logger.info("CORS Origins: %s", settings.CORS_ORIGINS)
    logger.info("JWT Expiry: %d hours", settings.JWT_EXPIRY_HOURS)

    # Create tables on startup (safe — won't recreate existing tables)
    await create_tables()
    logger.info("✅ Database tables ready")
    logger.info("=" * 60)
    yield
    logger.info("👋 Shutting down NAVAVED API...")


app = FastAPI(
    title="NAVAVED Agro API",
    description="Backend API for NAVAVED Agro Food & Products LLP",
    version="1.0.0",
    lifespan=lifespan,
)


# --- CORS ---
origins = [origin.strip() for origin in settings.CORS_ORIGINS.split(",")]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# --- Logging Middleware ---
app.add_middleware(LoggingMiddleware)


# --- Global Exception Handler ---
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(
        "💥 Unhandled exception on %s %s: %s",
        request.method, request.url.path, str(exc),
        exc_info=True,
    )
    return JSONResponse(
        status_code=500,
        content={"success": False, "error": "Internal server error"},
    )


# --- Register Routers ---
app.include_router(health.router)
app.include_router(auth.router)
app.include_router(products.router)
app.include_router(stores.router)
app.include_router(admin.router)

logger.info("📋 Routers registered: health, auth, products, stores, admin")


# --- Root Redirect ---
@app.get("/", include_in_schema=False)
async def root():
    return {
        "success": True,
        "message": "NAVAVED Agro API v1.0.0",
        "docs": "/docs",
    }
