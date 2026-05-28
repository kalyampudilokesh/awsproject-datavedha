"""Pydantic models for request/response validation."""

from datetime import datetime
from decimal import Decimal
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, Field


class OrderItemCreate(BaseModel):
    product_id: UUID
    quantity: int = Field(gt=0, description="Must be at least 1")


class OrderCreate(BaseModel):
    customer_id: UUID
    items: List[OrderItemCreate] = Field(min_length=1)
    notes: Optional[str] = None


class OrderItemResponse(BaseModel):
    id: UUID
    order_id: UUID
    product_id: UUID
    product_name: str
    quantity: int
    unit_price: Decimal
    created_at: datetime


class OrderResponse(BaseModel):
    id: UUID
    customer_id: UUID
    status: str
    total: Decimal
    notes: Optional[str]
    created_at: datetime
    updated_at: datetime
    items: List[OrderItemResponse] = []


class OrderStatusUpdate(BaseModel):
    status: str = Field(pattern="^(pending|confirmed|shipped|delivered|cancelled)$")
