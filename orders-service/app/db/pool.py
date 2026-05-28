"""
Async PostgreSQL connection pool using asyncpg.
Initialised at startup, closed on shutdown.
"""

import asyncpg
import structlog
from app.config import settings

logger = structlog.get_logger()
_pool: asyncpg.Pool | None = None


async def init_db():
    global _pool
    dsn = (
        f"postgresql://{settings.DB_USER}:{settings.DB_PASSWORD}"
        f"@{settings.DB_HOST}:{settings.DB_PORT}/{settings.DB_NAME}"
    )
    ssl = "require" if settings.DB_SSL else None
    _pool = await asyncpg.create_pool(dsn=dsn, min_size=2, max_size=10, ssl=ssl)

    async with _pool.acquire() as conn:
        # Create orders and order_items tables
        await conn.execute("""
            CREATE TABLE IF NOT EXISTS orders (
                id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                customer_id UUID NOT NULL,
                status      VARCHAR(50) NOT NULL DEFAULT 'pending',
                total       NUMERIC(10, 2) NOT NULL DEFAULT 0,
                notes       TEXT,
                created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
            );
        """)
        await conn.execute("""
            CREATE TABLE IF NOT EXISTS order_items (
                id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                order_id    UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
                product_id  UUID NOT NULL,
                product_name VARCHAR(255) NOT NULL,
                quantity    INTEGER NOT NULL,
                unit_price  NUMERIC(10, 2) NOT NULL,
                created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
            );
        """)
        # Index for fast order lookups by customer
        await conn.execute("""
            CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
            CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
        """)
    logger.info("db_tables_ready")


async def close_db():
    global _pool
    if _pool:
        await _pool.close()
        _pool = None


def get_pool() -> asyncpg.Pool:
    if _pool is None:
        raise RuntimeError("Database pool not initialised")
    return _pool
