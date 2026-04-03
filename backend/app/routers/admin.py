"""Admin endpoints — JWT-protected CRUD for products and stores."""

import logging
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas.common import paginated_response, success_response
from app.schemas.auth import TokenData
from app.schemas.product import ProductCreate, ProductUpdate, ProductOut
from app.schemas.store import StoreCreate, StoreUpdate, StoreOut
from app.middleware.auth import require_admin
from app.services import product_service, store_service, storage_service

logger = logging.getLogger("navaved.routers")

router = APIRouter(prefix="/api/admin", tags=["Admin"])


# ============================================
# IMAGE UPLOAD
# ============================================

@router.post("/upload", dependencies=[Depends(require_admin)])
async def upload_image(file: UploadFile = File(...)):
    """Upload a product image to Supabase Storage. Returns the public URL."""
    logger.info("[ADMIN] Image upload request: filename=%s content_type=%s", file.filename, file.content_type)

    # Validate file type
    allowed_types = {"image/jpeg", "image/png", "image/webp", "image/jpg"}
    if file.content_type not in allowed_types:
        logger.warning("[ADMIN] Upload REJECTED: invalid type=%s (allowed: %s)", file.content_type, allowed_types)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file type: {file.content_type}. Allowed: {', '.join(allowed_types)}",
        )

    # Validate file size (max 5MB)
    contents = await file.read()
    file_size_mb = len(contents) / (1024 * 1024)
    logger.info("[ADMIN] Upload file size: %.2f MB", file_size_mb)

    if len(contents) > 5 * 1024 * 1024:
        logger.warning("[ADMIN] Upload REJECTED: file too large (%.2f MB)", file_size_mb)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File too large. Maximum size is 5MB.",
        )

    try:
        url = await storage_service.upload_image(
            file_bytes=contents,
            filename=file.filename or "image.jpg",
            content_type=file.content_type or "image/jpeg",
        )
        logger.info("[ADMIN] Image UPLOADED successfully: %s", url)
        return success_response(
            data={"image_url": url},
            message="Image uploaded successfully",
        )
    except ValueError as e:
        logger.error("[ADMIN] Upload FAILED (config error): %s", str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        )
    except Exception as e:
        logger.error("[ADMIN] Upload FAILED (unexpected): %s", str(e), exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Upload failed: {str(e)}",
        )


# ============================================
# PRODUCTS CRUD
# ============================================

@router.get("/products", dependencies=[Depends(require_admin)])
async def list_all_products(
    search: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    """List ALL products (ACTIVE + INACTIVE) for admin management."""
    logger.info("[ADMIN] GET /api/admin/products — search=%s page=%d limit=%d", search, page, limit)

    products, total = await product_service.get_all_products(
        db, page=page, limit=limit, search=search,
    )

    products_data = [
        ProductOut.model_validate(p).model_dump(mode="json") for p in products
    ]

    logger.info("[ADMIN] Returning %d/%d products", len(products_data), total)

    return paginated_response(
        data=products_data,
        total=total,
        page=page,
        limit=limit,
        message="Admin: All products fetched",
    )


@router.post("/products", dependencies=[Depends(require_admin)])
async def create_product(
    data: ProductCreate,
    db: AsyncSession = Depends(get_db),
):
    """Create a new product with variants."""
    logger.info("[ADMIN] POST /api/admin/products — name='%s' variants=%d", data.prod_name, len(data.variants))

    product = await product_service.create_product(db, data)
    product_data = ProductOut.model_validate(product).model_dump(mode="json")

    logger.info("[ADMIN] Product CREATED: id=%s slug='%s'", product.product_id, product.slug)

    return success_response(
        data=product_data,
        message="Product created successfully",
    )


@router.put("/products/{product_id}", dependencies=[Depends(require_admin)])
async def update_product(
    product_id: UUID,
    data: ProductUpdate,
    db: AsyncSession = Depends(get_db),
):
    """Update an existing product and its variants."""
    logger.info("[ADMIN] PUT /api/admin/products/%s", product_id)

    product = await product_service.update_product(db, product_id, data)

    if not product:
        logger.warning("[ADMIN] Update FAILED: product %s not found", product_id)
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found",
        )

    product_data = ProductOut.model_validate(product).model_dump(mode="json")
    logger.info("[ADMIN] Product UPDATED: id=%s name='%s'", product.product_id, product.prod_name)

    return success_response(
        data=product_data,
        message="Product updated successfully",
    )


@router.patch("/products/{product_id}/status", dependencies=[Depends(require_admin)])
async def toggle_product_status(
    product_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    """Toggle product status between ACTIVE and INACTIVE."""
    logger.info("[ADMIN] PATCH /api/admin/products/%s/status", product_id)

    product = await product_service.toggle_product_status(db, product_id)

    if not product:
        logger.warning("[ADMIN] Toggle FAILED: product %s not found", product_id)
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found",
        )

    logger.info("[ADMIN] Product status TOGGLED: '%s' → %s", product.prod_name, product.status)

    return success_response(
        data={"product_id": str(product.product_id), "status": product.status},
        message=f"Product status changed to {product.status}",
    )


# ============================================
# STORES CRUD
# ============================================

@router.get("/stores", dependencies=[Depends(require_admin)])
async def list_all_stores(
    region: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    """List ALL stores (ACTIVE + INACTIVE) for admin management."""
    logger.info("[ADMIN] GET /api/admin/stores — region=%s search=%s page=%d limit=%d",
                region, search, page, limit)

    stores, total = await store_service.get_all_stores(
        db, page=page, limit=limit, region=region, search=search,
    )

    stores_data = [
        StoreOut.model_validate(s).model_dump(mode="json") for s in stores
    ]

    logger.info("[ADMIN] Returning %d/%d stores", len(stores_data), total)

    return paginated_response(
        data=stores_data,
        total=total,
        page=page,
        limit=limit,
        message="Admin: All stores fetched",
    )


@router.post("/stores", dependencies=[Depends(require_admin)])
async def create_store(
    data: StoreCreate,
    db: AsyncSession = Depends(get_db),
):
    """Create a new store with addresses and contacts."""
    logger.info("[ADMIN] POST /api/admin/stores — name='%s' region='%s'", data.store_name, data.region)

    store = await store_service.create_store(db, data)
    store_data = StoreOut.model_validate(store).model_dump(mode="json")

    logger.info("[ADMIN] Store CREATED: id=%s slug='%s'", store.store_id, store.slug)

    return success_response(
        data=store_data,
        message="Store created successfully",
    )


@router.put("/stores/{store_id}", dependencies=[Depends(require_admin)])
async def update_store(
    store_id: UUID,
    data: StoreUpdate,
    db: AsyncSession = Depends(get_db),
):
    """Update an existing store, its addresses, and contacts."""
    logger.info("[ADMIN] PUT /api/admin/stores/%s", store_id)

    store = await store_service.update_store(db, store_id, data)

    if not store:
        logger.warning("[ADMIN] Update FAILED: store %s not found", store_id)
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Store not found",
        )

    store_data = StoreOut.model_validate(store).model_dump(mode="json")
    logger.info("[ADMIN] Store UPDATED: id=%s name='%s'", store.store_id, store.store_name)

    return success_response(
        data=store_data,
        message="Store updated successfully",
    )


@router.patch("/stores/{store_id}/status", dependencies=[Depends(require_admin)])
async def toggle_store_status(
    store_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    """Toggle store status between ACTIVE and INACTIVE."""
    logger.info("[ADMIN] PATCH /api/admin/stores/%s/status", store_id)

    store = await store_service.toggle_store_status(db, store_id)

    if not store:
        logger.warning("[ADMIN] Toggle FAILED: store %s not found", store_id)
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Store not found",
        )

    logger.info("[ADMIN] Store status TOGGLED: '%s' → %s", store.store_name, store.status)

    return success_response(
        data={"store_id": str(store.store_id), "status": store.status},
        message=f"Store status changed to {store.status}",
    )
