"""Product and ProductVariant models."""

import uuid
from datetime import datetime, timezone
from decimal import Decimal

from sqlalchemy import Column, String, Text, Integer, DateTime, Numeric, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship

from app.database import Base


class Product(Base):
    __tablename__ = "products"

    product_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    prod_name = Column(String(150), nullable=False)
    slug = Column(String(255), nullable=False, unique=True, index=True)
    tagline = Column(String(255), nullable=True)
    badge = Column(String(50), nullable=True)
    description = Column(Text, nullable=True)
    ingredients = Column(JSONB, default=list)
    benefits = Column(JSONB, default=list)
    image_url = Column(String(500), nullable=True)
    sort_order = Column(Integer, default=0, index=True)
    status = Column(String(10), nullable=False, default="ACTIVE", index=True)
    created_at = Column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    # Relationships
    variants = relationship(
        "ProductVariant",
        back_populates="product",
        cascade="all, delete-orphan",
        lazy="selectin",
        order_by="ProductVariant.price",
    )

    def __repr__(self):
        return f"<Product {self.prod_name}>"


class ProductVariant(Base):
    __tablename__ = "product_variants"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    product_id = Column(
        UUID(as_uuid=True),
        ForeignKey("products.product_id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    quantity = Column(Integer, nullable=False)
    unit = Column(String(20), nullable=False)  # g, ml, kg, pcs
    price = Column(Numeric(10, 2), nullable=False)
    created_at = Column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    # Relationships
    product = relationship("Product", back_populates="variants")

    def __repr__(self):
        return f"<Variant {self.quantity}{self.unit} @ ₹{self.price}>"
