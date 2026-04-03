"""Store service — all business logic and DB operations for stores."""

import logging
from typing import Optional, List, Tuple, Dict
from uuid import UUID
from collections import OrderedDict

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_, delete
from slugify import slugify

from app.models.store import Store, StoreAddress, StoreContact
from app.schemas.store import StoreCreate, StoreUpdate

logger = logging.getLogger("navaved.stores")


async def get_active_stores(
    db: AsyncSession,
    page: int = 1,
    limit: int = 50,
    region: Optional[str] = None,
    search: Optional[str] = None,
) -> Tuple[List[Store], int]:
    """Get ACTIVE stores with pagination, region filter, and search."""
    logger.info("Fetching active stores — page=%d limit=%d region=%s search=%s",
                page, limit, region, search)

    query = select(Store).where(Store.status == "ACTIVE")

    if region:
        query = query.where(Store.region.ilike(f"%{region}%"))
        logger.debug("Applied region filter: '%s'", region)

    if search:
        search_term = f"%{search}%"
        query = query.where(
            or_(
                Store.store_name.ilike(search_term),
                Store.owner_fname.ilike(search_term),
                Store.owner_lname.ilike(search_term),
            )
        )
        logger.debug("Applied search filter: '%s'", search)

    # Count total
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0

    # Apply ordering and pagination
    query = query.order_by(Store.region.asc(), Store.sort_order.asc(), Store.store_name.asc())
    query = query.offset((page - 1) * limit).limit(limit)

    result = await db.execute(query)
    stores = result.scalars().unique().all()

    logger.info("Returned %d stores (total=%d, page=%d)", len(stores), total, page)
    return stores, total


def group_stores_by_region(stores: List[Store]) -> Dict[str, List[dict]]:
    """Group a list of stores by their region field."""
    from app.schemas.store import StoreOut

    logger.debug("Grouping %d stores by region", len(stores))
    grouped: Dict[str, List[dict]] = OrderedDict()
    for store in stores:
        region = store.region or "Other"
        if region not in grouped:
            grouped[region] = []
        store_data = StoreOut.model_validate(store).model_dump(mode="json")
        grouped[region].append(store_data)

    regions = list(grouped.keys())
    logger.info("Grouped into %d regions: %s", len(regions), ", ".join(regions))
    return grouped


async def get_store_by_slug(
    db: AsyncSession, slug: str, active_only: bool = True
) -> Optional[Store]:
    """Get a single store by slug."""
    logger.info("Looking up store by slug='%s' (active_only=%s)", slug, active_only)

    query = select(Store).where(Store.slug == slug)
    if active_only:
        query = query.where(Store.status == "ACTIVE")
    result = await db.execute(query)
    store = result.scalar_one_or_none()

    if store:
        logger.info("Store found: name='%s' id=%s region='%s'", store.store_name, store.store_id, store.region)
    else:
        logger.warning("Store NOT found for slug='%s'", slug)
    return store


async def get_store_by_id(db: AsyncSession, store_id: UUID) -> Optional[Store]:
    """Get a single store by ID (admin, includes INACTIVE)."""
    logger.debug("Looking up store by id=%s", store_id)
    result = await db.execute(select(Store).where(Store.store_id == store_id))
    store = result.scalar_one_or_none()
    if store:
        logger.debug("Store found: '%s' (status=%s, region='%s')", store.store_name, store.status, store.region)
    else:
        logger.warning("Store NOT found for id=%s", store_id)
    return store


async def get_all_stores(
    db: AsyncSession,
    page: int = 1,
    limit: int = 50,
    region: Optional[str] = None,
    search: Optional[str] = None,
) -> Tuple[List[Store], int]:
    """Get ALL stores including INACTIVE (for admin)."""
    logger.info("[ADMIN] Fetching all stores — page=%d limit=%d region=%s search=%s",
                page, limit, region, search)

    query = select(Store)

    if region:
        query = query.where(Store.region.ilike(f"%{region}%"))

    if search:
        search_term = f"%{search}%"
        query = query.where(
            or_(
                Store.store_name.ilike(search_term),
                Store.owner_fname.ilike(search_term),
                Store.owner_lname.ilike(search_term),
            )
        )

    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0

    query = query.order_by(Store.region.asc(), Store.sort_order.asc())
    query = query.offset((page - 1) * limit).limit(limit)

    result = await db.execute(query)
    stores = result.scalars().unique().all()

    logger.info("[ADMIN] Returned %d stores (total=%d)", len(stores), total)
    return stores, total


async def create_store(db: AsyncSession, data: StoreCreate) -> Store:
    """Create a new store with addresses and contacts."""
    logger.info("[ADMIN] Creating store: name='%s' region='%s' addresses=%d contacts=%d",
                data.store_name, data.region, len(data.addresses), len(data.contacts))

    slug = data.slug or slugify(data.store_name)
    slug = await _ensure_unique_slug(db, slug)
    logger.debug("Generated slug: '%s'", slug)

    store = Store(
        store_name=data.store_name,
        slug=slug,
        owner_fname=data.owner_fname,
        owner_lname=data.owner_lname,
        region=data.region,
        email=data.email,
        tagline=data.tagline,
        has_whatsapp=data.has_whatsapp or False,
        whatsapp_number=data.whatsapp_number,
        sort_order=data.sort_order or 0,
        status=data.status or "ACTIVE",
    )

    # Add addresses
    for addr in data.addresses:
        address = StoreAddress(
            address_line1=addr.address_line1,
            address_line2=addr.address_line2,
            city=addr.city,
            state=addr.state,
            pincode=addr.pincode,
        )
        store.addresses.append(address)
        logger.debug("  Added address: %s, %s", addr.address_line1, addr.city)

    # Add contacts
    for contact in data.contacts:
        store_contact = StoreContact(mobile_number=contact.mobile_number)
        store.contacts.append(store_contact)
        logger.debug("  Added contact: %s", contact.mobile_number)

    db.add(store)
    await db.commit()
    await db.refresh(store)
    logger.info("[ADMIN] Store CREATED: id=%s name='%s' slug='%s' region='%s'",
                store.store_id, store.store_name, store.slug, store.region)
    return store


async def update_store(
    db: AsyncSession, store_id: UUID, data: StoreUpdate
) -> Optional[Store]:
    """Update an existing store, its addresses, and contacts."""
    logger.info("[ADMIN] Updating store id=%s", store_id)

    store = await get_store_by_id(db, store_id)
    if not store:
        logger.warning("[ADMIN] Update FAILED: store id=%s not found", store_id)
        return None

    # Update scalar fields
    update_fields = data.model_dump(exclude_unset=True, exclude={"addresses", "contacts"})
    for field, value in update_fields.items():
        if field == "slug" and value:
            value = await _ensure_unique_slug(db, value, exclude_id=store_id)
        setattr(store, field, value)
        logger.debug("  Updated field: %s = %s", field, repr(value)[:100])

    # Replace addresses if provided
    if data.addresses is not None:
        old_count = len(store.addresses) if hasattr(store, 'addresses') else 0
        logger.debug("  Replacing %d addresses with %d new ones", old_count, len(data.addresses))
        await db.execute(
            delete(StoreAddress).where(StoreAddress.store_id == store_id)
        )
        for addr in data.addresses:
            address = StoreAddress(
                store_id=store_id,
                address_line1=addr.address_line1,
                address_line2=addr.address_line2,
                city=addr.city,
                state=addr.state,
                pincode=addr.pincode,
            )
            db.add(address)

    # Replace contacts if provided
    if data.contacts is not None:
        old_count = len(store.contacts) if hasattr(store, 'contacts') else 0
        logger.debug("  Replacing %d contacts with %d new ones", old_count, len(data.contacts))
        await db.execute(
            delete(StoreContact).where(StoreContact.store_id == store_id)
        )
        for contact in data.contacts:
            store_contact = StoreContact(
                store_id=store_id,
                mobile_number=contact.mobile_number,
            )
            db.add(store_contact)

    await db.commit()
    await db.refresh(store)
    logger.info("[ADMIN] Store UPDATED: id=%s name='%s'", store.store_id, store.store_name)
    return store


async def toggle_store_status(db: AsyncSession, store_id: UUID) -> Optional[Store]:
    """Toggle store status between ACTIVE and INACTIVE."""
    logger.info("[ADMIN] Toggling status for store id=%s", store_id)

    store = await get_store_by_id(db, store_id)
    if not store:
        logger.warning("[ADMIN] Toggle FAILED: store id=%s not found", store_id)
        return None

    old_status = store.status
    store.status = "INACTIVE" if store.status == "ACTIVE" else "ACTIVE"
    await db.commit()
    await db.refresh(store)

    logger.info("[ADMIN] Store status TOGGLED: '%s' %s → %s", store.store_name, old_status, store.status)
    return store


async def _ensure_unique_slug(
    db: AsyncSession,
    slug: str,
    exclude_id: Optional[UUID] = None,
) -> str:
    """Ensure slug is unique for stores, appending number if necessary."""
    base_slug = slug
    counter = 1

    while True:
        query = select(Store).where(Store.slug == slug)
        if exclude_id:
            query = query.where(Store.store_id != exclude_id)

        result = await db.execute(query)
        if result.scalar_one_or_none() is None:
            if counter > 1:
                logger.debug("Slug collision resolved: '%s' → '%s'", base_slug, slug)
            return slug

        slug = f"{base_slug}-{counter}"
        counter += 1
