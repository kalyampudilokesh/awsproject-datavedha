"""
Application settings — loaded from environment variables.
In AWS, sensitive values (DB_PASSWORD) are injected from Secrets Manager
into ECS task environment via the secrets block in the task definition.
"""

from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    ENV: str = "development"
    PORT: int = 8000
    LOG_LEVEL: str = "info"

    # Database
    DB_HOST: str = "localhost"
    DB_PORT: int = 5432
    DB_NAME: str = "ecommerce"
    DB_USER: str = "postgres"
    DB_PASSWORD: str = "changeme"
    DB_SSL: bool = False

    # Inter-service communication (internal ALB DNS or ECS service discovery)
    PRODUCTS_SERVICE_URL: str = "http://localhost:3000"

    # CORS
    ALLOWED_ORIGINS: str = "http://localhost:5173"

    # X-Ray
    ENABLE_XRAY: bool = False

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
