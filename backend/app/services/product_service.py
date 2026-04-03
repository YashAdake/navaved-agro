"""Product service — all business logic and DB operations for products."""

import logging
from typing import Optional, List, Tuple
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_, delete
from slugify import slugify

from app.models.product import Product, ProductVariant
from app.schemas.product import ProductCreate, ProductUpdate, ProductOut

logger = logging.getLogger("navaved.products")


async def get_active_products(
    db: AsyncSession,
    page: int = 1,
    limit: int = 10,
    search: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
) -> Tuple[List[Product], int]:
    """Get ACTIVE products with pagination, search, and price filtering."""
    logger.info("Fetching active products — page=%d limit=%d search=%s min_price=%s max_price=%s",
                page, limit, search, min_price, max_price)

    query = select(Product).where(Product.status == "ACTIVE")

    # Search filter
    if search:
        search_term = f"%{search}%"
        query = query.where(
            or_(
                Product.prod_name.ilike(search_term),
                Product.tagline.ilike(search_term),
                Product.description.ilike(search_term),
            )
        )
        logger.debug("Applied search filter: '%s'", search)

    # Price filter (via subquery on variants)
    if min_price is not None or max_price is not None:
        variant_subq = select(ProductVariant.product_id).distinct()
        if min_price is not None:
            variant_subq = variant_subq.where(ProductVariant.price >= min_price)
        if max_price is not None:
            variant_subq = variant_subq.where(ProductVariant.price <= max_price)
        query = query.where(Product.product_id.in_(variant_subq))
        logger.debug("Applied price filter: min=%s max=%s", min_price, max_price)

    # Count total
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0

    # Apply pagination and ordering
    query = query.order_by(Product.sort_order.asc(), Product.prod_name.asc())
    query = query.offset((page - 1) * limit).limit(limit)

    result = await db.execute(query)
    products = result.scalars().unique().all()

    logger.info("Returned %d products (total=%d, page=%d)", len(products), total, page)
    return products, total


async def get_product_by_slug(
    db: AsyncSession, slug: str, active_only: bool = True
) -> Optional[Product]:
    """Get a single product by slug."""
    logger.info("Looking up product by slug='%s' (active_only=%s)", slug, active_only)

    query = select(Product).where(Product.slug == slug)
    if active_only:
        query = query.where(Product.status == "ACTIVE")
    result = await db.execute(query)
    product = result.scalar_one_or_none()

    if product:
        logger.info("Product found: name='%s' id=%s status=%s", product.prod_name, product.product_id, product.status)
    else:
        logger.warning("Product NOT found for slug='%s'", slug)
    return product


async def get_product_by_id(db: AsyncSession, product_id: UUID) -> Optional[Product]:
    """Get a single product by ID (admin, includes INACTIVE)."""
    logger.debug("Looking up product by id=%s", product_id)
    result = await db.execute(
        select(Product).where(Product.product_id == product_id)
    )
    product = result.scalar_one_or_none()
    if product:
        logger.debug("Product found: '%s' (status=%s)", product.prod_name, product.status)
    else:
        logger.warning("Product NOT found for id=%s", product_id)
    return product


async def get_all_products(
    db: AsyncSession,
    page: int = 1,
    limit: int = 50,
    search: Optional[str] = None,
) -> Tuple[List[Product], int]:
    """Get ALL products including INACTIVE (for admin)."""
    logger.info("[ADMIN] Fetching all products — page=%d limit=%d search=%s", page, limit, search)

    query = select(Product)

    if search:
        search_term = f"%{search}%"
        query = query.where(
            or_(
                Product.prod_name.ilike(search_term),
                Product.tagline.ilike(search_term),
            )
        )

    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0

    query = query.order_by(Product.sort_order.asc(), Product.prod_name.asc())
    query = query.offset((page - 1) * limit).limit(limit)

    result = await db.execute(query)
    products = result.scalars().unique().all()

    logger.info("[ADMIN] Returned %d products (total=%d)", len(products), total)
    return products, total


async def create_product(db: AsyncSession, data: ProductCreate) -> Product:
    """Create a new product with its variants."""
    logger.info("[ADMIN] Creating product: name='%s' variants=%d", data.prod_name, len(data.variants))

    # Auto-generate slug if not provided
    slug = data.slug or slugify(data.prod_name)
    slug = await _ensure_unique_slug(db, slug, table="product")
    logger.debug("Generated slug: '%s'", slug)

    product = Product(
        prod_name=data.prod_name,
        slug=slug,
        tagline=data.tagline,
        badge=data.badge,
        description=data.description,
        ingredients=data.ingredients or [],
        benefits=data.benefits or [],
        image_url=data.image_url,
        sort_order=data.sort_order or 0,
        status=data.status or "ACTIVE",
    )

    # Add variants
    for v in data.variants:
        variant = ProductVariant(
            quantity=v.quantity,
            unit=v.unit,
            price=v.price,
        )
        product.variants.append(variant)
        logger.debug("  Added variant: %d%s @ ₹%s", v.quantity, v.unit, v.price)

    db.add(product)
    await db.commit()
    await db.refresh(product)
    logger.info("[ADMIN] Product CREATED: id=%s name='%s' slug='%s'", product.product_id, product.prod_name, product.slug)
    return product


async def update_product(
    db: AsyncSession, product_id: UUID, data: ProductUpdate
) -> Optional[Product]:
    """Update an existing product and its variants."""
    logger.info("[ADMIN] Updating product id=%s", product_id)

    product = await get_product_by_id(db, product_id)
    if not product:
        logger.warning("[ADMIN] Update FAILED: product id=%s not found", product_id)
        return None

    # Update scalar fields
    update_fields = data.model_dump(exclude_unset=True, exclude={"variants"})
    for field, value in update_fields.items():
        if field == "slug" and value:
            value = await _ensure_unique_slug(
                db, value, table="product", exclude_id=product_id
            )
        setattr(product, field, value)
        logger.debug("  Updated field: %s = %s", field, repr(value)[:100])

    # Update variants if provided (replace all)
    if data.variants is not None:
        logger.debug("  Replacing %d variants with %d new ones",
                      len(product.variants) if hasattr(product, 'variants') else 0, len(data.variants))
        # Delete existing variants
        await db.execute(
            delete(ProductVariant).where(
                ProductVariant.product_id == product_id
            )
        )
        # Add new variants
        for v in data.variants:
            variant = ProductVariant(
                product_id=product_id,
                quantity=v.quantity,
                unit=v.unit,
                price=v.price,
            )
            db.add(variant)

    await db.commit()
    await db.refresh(product)
    logger.info("[ADMIN] Product UPDATED: id=%s name='%s'", product.product_id, product.prod_name)
    return product


async def toggle_product_status(
    db: AsyncSession, product_id: UUID
) -> Optional[Product]:
    """Toggle product status between ACTIVE and INACTIVE."""
    logger.info("[ADMIN] Toggling status for product id=%s", product_id)

    product = await get_product_by_id(db, product_id)
    if not product:
        logger.warning("[ADMIN] Toggle FAILED: product id=%s not found", product_id)
        return None

    old_status = product.status
    product.status = "INACTIVE" if product.status == "ACTIVE" else "ACTIVE"
    await db.commit()
    await db.refresh(product)

    logger.info("[ADMIN] Product status TOGGLED: '%s' %s → %s", product.prod_name, old_status, product.status)
    return product


async def _ensure_unique_slug(
    db: AsyncSession,
    slug: str,
    table: str = "product",
    exclude_id: Optional[UUID] = None,
) -> str:
    """Ensure slug is unique, appending number if necessary."""
    base_slug = slug
    counter = 1

    while True:
        query = select(Product).where(Product.slug == slug)
        if exclude_id:
            query = query.where(Product.product_id != exclude_id)

        result = await db.execute(query)
        if result.scalar_one_or_none() is None:
            if counter > 1:
                logger.debug("Slug collision resolved: '%s' → '%s'", base_slug, slug)
            return slug

        slug = f"{base_slug}-{counter}"
        counter += 1
