from functools import lru_cache

from pydantic import computed_field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    app_name: str = "Recruitment Automation API"
    app_env: str = "development"
    debug: bool = False
    api_v1_prefix: str = "/api/v1"

    cors_origins: str = "http://localhost:5173"

    database_url: str = (
        "postgresql+asyncpg://postgres:[YOUR-PASSWORD]@db.hwoiecdegltbrjmsullk.supabase.co:5432/postgres?ssl=require"
    )

    log_level: str = "INFO"

    @computed_field(return_type=list[str])
    @property
    def cors_origins_list(self) -> list[str]:
        return [item.strip() for item in self.cors_origins.split(",") if item.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
