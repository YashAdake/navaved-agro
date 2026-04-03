"""Public product endpoints — only ACTIVE products are returned."""

import logging
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas.common import paginated_response, success_response
from app.schemas.product import ProductOut
from app.services import product_service

logger = logging.getLogger("navaved.routers")

router = APIRouter(prefix="/api/products", tags=["Products (Public)"])


@router.get("")
async def list_products(
    search: Optional[str] = Query(None, description="Search by name/tagline/description"),
    min_price: Optional[float] = Query(None, ge=0, description="Minimum variant price"),
    max_price: Optional[float] = Query(None, ge=0, description="Maximum variant price"),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(10, ge=1, le=100, description="Items per page"),
    db: AsyncSession = Depends(get_db),
):
    """List all ACTIVE products with pagination, search, and price filtering."""
    logger.info("GET /api/products — page=%d limit=%d search=%s min_price=%s max_price=%s",
                page, limit, search, min_price, max_price)

    products, total = await product_service.get_active_products(
        db, page=page, limit=limit, search=search,
        min_price=min_price, max_price=max_price,
    )

    products_data = [
        ProductOut.model_validate(p).model_dump(mode="json") for p in products
    ]

    logger.info("GET /api/products — returning %d products (total=%d)", len(products_data), total)

    return paginated_response(
        data=products_data,
        total=total,
        page=page,
        limit=limit,
        message="Products fetched successfully",
    )


@router.get("/{slug}")
async def get_product(
    slug: str,
    db: AsyncSession = Depends(get_db),
):
    """Get a single ACTIVE product by slug."""
    logger.info("GET /api/products/%s", slug)

    product = await product_service.get_product_by_slug(db, slug, active_only=True)

    if not product:
        logger.warning("GET /api/products/%s — NOT FOUND", slug)
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found",
        )

    product_data = ProductOut.model_validate(product).model_dump(mode="json")
    logger.info("GET /api/products/%s — found '%s'", slug, product.prod_name)

    return success_response(
        data=product_data,
        message="Product fetched successfully",
    )
