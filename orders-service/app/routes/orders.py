"""
Orders API routes.
Calls the Products service to validate product existence and update stock.
"""

import httpx
import structlog
from fastapi import APIRouter, HTTPException, Request
from uuid import UUID

from app.config import settings
from app.db.pool import get_pool
from app.models import OrderCreate, OrderResponse, OrderStatusUpdate

router = APIRouter()
logger = structlog.get_logger()


async def _get_product(product_id: str, trace_id: str | None) -> dict:
    """Fetch product from products-service. Raises HTTPException if unavailable."""
    headers = {}
    if trace_id:
        headers["x-amzn-trace-id"] = trace_id
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.get(
                f"{settings.PRODUCTS_SERVICE_URL}/api/products/{product_id}",
                headers=headers
            )
        if resp.status_code == 404:
            raise HTTPException(status_code=404, detail=f"Product {product_id} not found")
        resp.raise_for_status()
        return resp.json()["data"]
    except httpx.RequestError as e:
        logger.error("products_service_unreachable", error=str(e))
        raise HTTPException(status_code=503, detail="Products service unavailable")


async def _decrement_stock(product_id: str, quantity: int, trace_id: str | None):
    """Decrement product stock in products-service."""
    headers = {}
    if trace_id:
        headers["x-amzn-trace-id"] = trace_id
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.patch(
                f"{settings.PRODUCTS_SERVICE_URL}/api/products/{product_id}/stock",
                json={"quantity": -quantity},
                headers=headers
            )
        if resp.status_code == 409:
            raise HTTPException(status_code=409, detail=f"Insufficient stock for product {product_id}")
        resp.raise_for_status()
    except httpx.RequestError as e:
        logger.error("stock_update_failed", product_id=product_id, error=str(e))
        raise HTTPException(status_code=503, detail="Could not update product stock")


# GET /api/orders — list all orders
@router.get("/", response_model=list[OrderResponse])
async def list_orders(limit: int = 50, offset: int = 0):
    pool = get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch(
            "SELECT * FROM orders ORDER BY created_at DESC LIMIT $1 OFFSET $2",
            limit, offset
        )
        result = []
        for row in rows:
            items = await conn.fetch(
                "SELECT * FROM order_items WHERE order_id = $1", row["id"]
            )
            result.append({**dict(row), "items": [dict(i) for i in items]})
    return result


# GET /api/orders/:id — get single order
@router.get("/{order_id}", response_model=OrderResponse)
async def get_order(order_id: UUID):
    pool = get_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow("SELECT * FROM orders WHERE id = $1", order_id)
        if not row:
            raise HTTPException(status_code=404, detail="Order not found")
        items = await conn.fetch("SELECT * FROM order_items WHERE order_id = $1", order_id)
    return {**dict(row), "items": [dict(i) for i in items]}


# GET /api/orders/customer/:customer_id — get orders by customer
@router.get("/customer/{customer_id}", response_model=list[OrderResponse])
async def get_orders_by_customer(customer_id: UUID):
    pool = get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch(
            "SELECT * FROM orders WHERE customer_id = $1 ORDER BY created_at DESC", customer_id
        )
        result = []
        for row in rows:
            items = await conn.fetch("SELECT * FROM order_items WHERE order_id = $1", row["id"])
            result.append({**dict(row), "items": [dict(i) for i in items]})
    return result


# POST /api/orders — create order
@router.post("/", response_model=OrderResponse, status_code=201)
async def create_order(payload: OrderCreate, request: Request):
    trace_id = request.headers.get("x-amzn-trace-id")
    pool = get_pool()

    # Validate all products and compute total
    enriched_items = []
    total = 0
    for item in payload.items:
        product = await _get_product(str(item.product_id), trace_id)
        unit_price = float(product["price"])
        total += unit_price * item.quantity
        enriched_items.append({
            "product_id": str(item.product_id),
            "product_name": product["name"],
            "quantity": item.quantity,
            "unit_price": unit_price
        })

    async with pool.acquire() as conn:
        async with conn.transaction():
            order = await conn.fetchrow(
                """INSERT INTO orders (customer_id, status, total, notes)
                   VALUES ($1, 'pending', $2, $3) RETURNING *""",
                payload.customer_id, total, payload.notes
            )
            inserted_items = []
            for item in enriched_items:
                row = await conn.fetchrow(
                    """INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price)
                       VALUES ($1, $2, $3, $4, $5) RETURNING *""",
                    order["id"], item["product_id"], item["product_name"],
                    item["quantity"], item["unit_price"]
                )
                inserted_items.append(dict(row))

    # Decrement stock after committing the order (outside the transaction)
    for item in enriched_items:
        await _decrement_stock(item["product_id"], item["quantity"], trace_id)

    logger.info("order_created", order_id=str(order["id"]), total=total, trace_id=trace_id)
    return {**dict(order), "items": inserted_items}


# PATCH /api/orders/:id/status — update order status
@router.patch("/{order_id}/status", response_model=OrderResponse)
async def update_order_status(order_id: UUID, payload: OrderStatusUpdate):
    pool = get_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            "UPDATE orders SET status=$1, updated_at=NOW() WHERE id=$2 RETURNING *",
            payload.status, order_id
        )
        if not row:
            raise HTTPException(status_code=404, detail="Order not found")
        items = await conn.fetch("SELECT * FROM order_items WHERE order_id = $1", order_id)
    logger.info("order_status_updated", order_id=str(order_id), status=payload.status)
    return {**dict(row), "items": [dict(i) for i in items]}


# DELETE /api/orders/:id — cancel order
@router.delete("/{order_id}", status_code=204)
async def cancel_order(order_id: UUID):
    pool = get_pool()
    async with pool.acquire() as conn:
        result = await conn.execute(
            "UPDATE orders SET status='cancelled', updated_at=NOW() WHERE id=$1", order_id
        )
    if result == "UPDATE 0":
        raise HTTPException(status_code=404, detail="Order not found")
    logger.info("order_cancelled", order_id=str(order_id))
