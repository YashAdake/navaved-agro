"""Store, StoreAddress, and StoreContact models."""

import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, String, Text, Integer, Boolean, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.database import Base


class Store(Base):
    __tablename__ = "stores"

    store_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    store_name = Column(String(200), nullable=False)
    slug = Column(String(255), nullable=False, unique=True, index=True)
    owner_fname = Column(String(100), nullable=True)
    owner_lname = Column(String(100), nullable=True)
    region = Column(String(100), nullable=True, index=True)
    email = Column(String(255), nullable=True)
    tagline = Column(String(255), nullable=True)
    has_whatsapp = Column(Boolean, default=False)
    whatsapp_number = Column(String(15), nullable=True)
    sort_order = Column(Integer, default=0)
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
    addresses = relationship(
        "StoreAddress",
        back_populates="store",
        cascade="all, delete-orphan",
        lazy="selectin",
    )
    contacts = relationship(
        "StoreContact",
        back_populates="store",
        cascade="all, delete-orphan",
        lazy="selectin",
    )

    def __repr__(self):
        return f"<Store {self.store_name}>"


class StoreAddress(Base):
    __tablename__ = "store_addresses"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    store_id = Column(
        UUID(as_uuid=True),
        ForeignKey("stores.store_id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    address_line1 = Column(Text, nullable=False)
    address_line2 = Column(Text, nullable=True)
    city = Column(String(100), nullable=True)
    state = Column(String(100), nullable=True)
    pincode = Column(String(10), nullable=True)
    created_at = Column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    # Relationships
    store = relationship("Store", back_populates="addresses")

    def __repr__(self):
        return f"<Address {self.address_line1[:30]}>"


class StoreContact(Base):
    __tablename__ = "store_contacts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    store_id = Column(
        UUID(as_uuid=True),
        ForeignKey("stores.store_id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    mobile_number = Column(String(15), nullable=False)

    # Relationships
    store = relationship("Store", back_populates="contacts")

    def __repr__(self):
        return f"<Contact {self.mobile_number}>"
