from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    DATABASE_URL: str = "sqlite:///./prunape.db"
    CORS_ORIGINS: list[str] = ["http://localhost:5173", "http://localhost:3000"]
    ENV: str = "dev"
    LOG_LEVEL: str = "INFO"

    # Phase 3 — Clerk auth (empty by default; required in production)
    CLERK_JWT_ISSUER: str = ""
    CLERK_JWKS_URL: str = ""


settings = Settings()
