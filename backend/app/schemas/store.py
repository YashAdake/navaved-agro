"""Store, StoreAddress, and StoreContact schemas for request/response validation."""

from typing import Optional, List
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, Field


# --- Address Schemas ---

class AddressCreate(BaseModel):
    """Schema for creating a store address."""
    address_line1: str = Field(..., description="Primary address line")
    address_line2: Optional[str] = None
    city: Optional[str] = Field(None, max_length=100)
    state: Optional[str] = Field(None, max_length=100)
    pincode: Optional[str] = Field(None, max_length=10)


class AddressOut(BaseModel):
    """Schema for returning a store address."""
    id: UUID
    address_line1: str
    address_line2: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None

    class Config:
        from_attributes = True


# --- Contact Schemas ---

class ContactCreate(BaseModel):
    """Schema for creating a store contact."""
    mobile_number: str = Field(..., max_length=15)


class ContactOut(BaseModel):
    """Schema for returning a store contact."""
    id: UUID
    mobile_number: str

    class Config:
        from_attributes = True


# --- Store Schemas ---

class StoreCreate(BaseModel):
    """Schema for creating a store."""
    store_name: str = Field(..., max_length=200)
    slug: Optional[str] = Field(None, max_length=255, description="Auto-generated from name if not provided")
    owner_fname: Optional[str] = Field(None, max_length=100)
    owner_lname: Optional[str] = Field(None, max_length=100)
    region: Optional[str] = Field(None, max_length=100)
    email: Optional[str] = Field(None, max_length=255)
    tagline: Optional[str] = Field(None, max_length=255)
    has_whatsapp: Optional[bool] = False
    whatsapp_number: Optional[str] = Field(None, max_length=15)
    sort_order: Optional[int] = 0
    status: Optional[str] = Field("ACTIVE", pattern="^(ACTIVE|INACTIVE)$")
    addresses: List[AddressCreate] = []
    contacts: List[ContactCreate] = []


class StoreUpdate(BaseModel):
    """Schema for updating a store."""
    store_name: Optional[str] = Field(None, max_length=200)
    slug: Optional[str] = Field(None, max_length=255)
    owner_fname: Optional[str] = Field(None, max_length=100)
    owner_lname: Optional[str] = Field(None, max_length=100)
    region: Optional[str] = Field(None, max_length=100)
    email: Optional[str] = Field(None, max_length=255)
    tagline: Optional[str] = Field(None, max_length=255)
    has_whatsapp: Optional[bool] = None
    whatsapp_number: Optional[str] = Field(None, max_length=15)
    sort_order: Optional[int] = None
    status: Optional[str] = Field(None, pattern="^(ACTIVE|INACTIVE)$")
    addresses: Optional[List[AddressCreate]] = None
    contacts: Optional[List[ContactCreate]] = None


class StoreOut(BaseModel):
    """Schema for returning a store."""
    store_id: UUID
    store_name: str
    slug: str
    owner_fname: Optional[str] = None
    owner_lname: Optional[str] = None
    region: Optional[str] = None
    email: Optional[str] = None
    tagline: Optional[str] = None
    has_whatsapp: bool = False
    whatsapp_number: Optional[str] = None
    sort_order: int = 0
    status: str
    addresses: List[AddressOut] = []
    contacts: List[ContactOut] = []
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
