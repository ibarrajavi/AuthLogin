from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List

"""
Key fields:
- DATABASE_URL: defaults to SQLite in `data/app.db`.
- SECRET_KEY: required, no default (critical for JWT signing).
- ALGORITHM: default HS256 for JWT.
- JWT_EXPIRY_MINUTES: short-lived access tokens.
- JWT_REFRESH_EXPIRY: refresh token lifetime (days).
- JWT_LEEWAY: leeway for JWT validation (seconds).
- TOKEN_BYTES: 
- TOKEN_TTL_MIN: 
"""

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False
    )

    DATABASE_URL: str = "sqlite:///./data/app.db"
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    JWT_EXPIRY_MINUTES: int = 2
    JWT_REFRESH_EXPIRY: int = 7
    JWT_LEEWAY: int = 10
    TOKEN_BYTES: int = 32
    TOKEN_TTL_MIN: int = 30
    CORS_ORIGINS: List[str] = Field(default_factory=list)

settings = Settings()