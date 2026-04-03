"""Product and ProductVariant schemas for request/response validation."""

from typing import Optional, List
from decimal import Decimal
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, Field


# --- Variant Schemas ---

class VariantCreate(BaseModel):
    """Schema for creating a product variant."""
    quantity: int = Field(..., gt=0, description="e.g. 215")
    unit: str = Field(..., max_length=20, description="e.g. g, ml, kg, pcs")
    price: Decimal = Field(..., gt=0, description="e.g. 100.00")


class VariantOut(BaseModel):
    """Schema for returning a product variant."""
    id: UUID
    quantity: int
    unit: str
    price: Decimal

    class Config:
        from_attributes = True


# --- Product Schemas ---

class ProductCreate(BaseModel):
    """Schema for creating a product."""
    prod_name: str = Field(..., max_length=150)
    slug: Optional[str] = Field(None, max_length=255, description="Auto-generated from name if not provided")
    tagline: Optional[str] = Field(None, max_length=255)
    badge: Optional[str] = Field(None, max_length=50, description="e.g. Bestseller, Premium, Spicy")
    description: Optional[str] = None
    ingredients: Optional[List[str]] = []
    benefits: Optional[List[str]] = []
    image_url: Optional[str] = Field(None, max_length=500)
    sort_order: Optional[int] = 0
    status: Optional[str] = Field("ACTIVE", pattern="^(ACTIVE|INACTIVE)$")
    variants: List[VariantCreate] = []


class ProductUpdate(BaseModel):
    """Schema for updating a product."""
    prod_name: Optional[str] = Field(None, max_length=150)
    slug: Optional[str] = Field(None, max_length=255)
    tagline: Optional[str] = Field(None, max_length=255)
    badge: Optional[str] = Field(None, max_length=50)
    description: Optional[str] = None
    ingredients: Optional[List[str]] = None
    benefits: Optional[List[str]] = None
    image_url: Optional[str] = Field(None, max_length=500)
    sort_order: Optional[int] = None
    status: Optional[str] = Field(None, pattern="^(ACTIVE|INACTIVE)$")
    variants: Optional[List[VariantCreate]] = None


class ProductOut(BaseModel):
    """Schema for returning a product."""
    product_id: UUID
    prod_name: str
    slug: str
    tagline: Optional[str] = None
    badge: Optional[str] = None
    description: Optional[str] = None
    ingredients: List[str] = []
    benefits: List[str] = []
    image_url: Optional[str] = None
    sort_order: int = 0
    status: str
    variants: List[VariantOut] = []
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
