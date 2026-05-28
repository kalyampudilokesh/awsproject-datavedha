"""
Orders service unit tests.
Uses pytest-asyncio and mocks the DB pool + products service HTTP calls.
"""

import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from fastapi.testclient import TestClient


@pytest.fixture
def client():
    """Create a test client with mocked DB and lifespan."""
    with patch("app.db.pool.init_db", new_callable=AsyncMock), \
         patch("app.db.pool.close_db", new_callable=AsyncMock), \
         patch("app.db.pool._pool", MagicMock()):
        from main import app
        with TestClient(app) as c:
            yield c


def test_health_check(client):
    resp = client.get("/health")
    assert resp.status_code == 200
    assert resp.json()["status"] == "healthy"


def test_list_orders_empty(client):
    mock_conn = AsyncMock()
    mock_conn.fetch = AsyncMock(return_value=[])
    mock_pool = MagicMock()
    mock_pool.acquire.return_value.__aenter__ = AsyncMock(return_value=mock_conn)
    mock_pool.acquire.return_value.__aexit__ = AsyncMock(return_value=False)

    with patch("app.routes.orders.get_pool", return_value=mock_pool):
        resp = client.get("/api/orders/")
    assert resp.status_code == 200
    assert resp.json() == []


def test_get_order_not_found(client):
    mock_conn = AsyncMock()
    mock_conn.fetchrow = AsyncMock(return_value=None)
    mock_pool = MagicMock()
    mock_pool.acquire.return_value.__aenter__ = AsyncMock(return_value=mock_conn)
    mock_pool.acquire.return_value.__aexit__ = AsyncMock(return_value=False)

    with patch("app.routes.orders.get_pool", return_value=mock_pool):
        resp = client.get("/api/orders/00000000-0000-0000-0000-000000000000")
    assert resp.status_code == 404
