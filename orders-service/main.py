"""
Datavedha Analytics - Orders Microservice
FastAPI application entry point
"""

import os
import asyncio
from contextlib import asynccontextmanager

import structlog
import uvicorn
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.db.pool import init_db, close_db
from app.routes import orders
from app.middleware.logging import setup_logging, RequestLoggingMiddleware

setup_logging()
logger = structlog.get_logger()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown lifecycle handler."""
    logger.info("orders_service_starting", port=settings.PORT, env=settings.ENV)
    await init_db()
    logger.info("database_connected")
    yield
    await close_db()
    logger.info("orders_service_stopped")


app = FastAPI(
    title="Orders Service",
    description="Datavedha Analytics - Order management microservice",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs" if settings.ENV != "production" else None,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Structured request logging middleware
app.add_middleware(RequestLoggingMiddleware)


@app.get("/health", tags=["health"])
async def health_check():
    """ALB target group health check endpoint."""
    return {"status": "healthy", "service": "orders-service"}


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    trace_id = request.headers.get("x-amzn-trace-id")
    logger.error("unhandled_exception", error=str(exc), path=str(request.url), trace_id=trace_id)
    return JSONResponse(
        status_code=500,
        content={"error": "Internal server error", "trace_id": trace_id},
    )


app.include_router(orders.router, prefix="/api/orders", tags=["orders"])


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=settings.PORT, reload=settings.ENV == "development")
