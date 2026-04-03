"""Public store endpoints — only ACTIVE stores are returned."""

import logging
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas.common import success_response
from app.schemas.store import StoreOut
from app.services import store_service

logger = logging.getLogger("navaved.routers")

router = APIRouter(prefix="/api/stores", tags=["Stores (Public)"])


@router.get("")
async def list_stores(
    region: Optional[str] = Query(None, description="Filter by region"),
    search: Optional[str] = Query(None, description="Search by name/owner"),
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    """List all ACTIVE stores grouped by region."""
    logger.info("GET /api/stores — page=%d limit=%d region=%s search=%s", page, limit, region, search)

    stores, total = await store_service.get_active_stores(
        db, page=page, limit=limit, region=region, search=search,
    )

    # Group by region for frontend convenience
    grouped = store_service.group_stores_by_region(stores)
    regions = list(grouped.keys())
    logger.info("GET /api/stores — %d stores across %d regions: %s", total, len(regions), ", ".join(regions))

    return success_response(
        data=grouped,
        message=f"{total} stores fetched successfully",
    )


@router.get("/{slug}")
async def get_store(
    slug: str,
    db: AsyncSession = Depends(get_db),
):
    """Get a single ACTIVE store by slug."""
    logger.info("GET /api/stores/%s", slug)

    store = await store_service.get_store_by_slug(db, slug, active_only=True)

    if not store:
        logger.warning("GET /api/stores/%s — NOT FOUND", slug)
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Store not found",
        )

    store_data = StoreOut.model_validate(store).model_dump(mode="json")
    logger.info("GET /api/stores/%s — found '%s' (region=%s)", slug, store.store_name, store.region)

    return success_response(
        data=store_data,
        message="Store fetched successfully",
    )
