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
    cors_origin_regex: str = r"https?://(localhost|127\.0\.0\.1)(:\d+)?"

    database_url: str = "sqlite+aiosqlite:///./recruitment.db"
    frontend_base_url: str = "http://localhost:5173"
    backend_base_url: str = "http://localhost:8000"
    local_upload_dir: str = "uploads"

    supabase_url: str = ""
    supabase_service_role_key: str = ""
    supabase_jd_bucket: str = "job-descriptions"
    supabase_application_bucket: str = "candidate-applications"

    # SMTP Configuration
    smtp_server: str = "smtp.gmail.com"
    smtp_port: int = 587
    smtp_sender_email: str = ""
    smtp_sender_password: str = ""
    candidate_portal_url: str = "http://localhost:5173"

    # JWT Configuration
    jwt_secret_key: str = "your-secret-key-change-in-production-12345"
    jwt_algorithm: str = "HS256"
    jwt_access_token_expire_hours: int = 24
    jwt_refresh_token_expire_days: int = 7

    log_level: str = "INFO"

    @computed_field(return_type=list[str])
    @property
    def cors_origins_list(self) -> list[str]:
        return [item.strip() for item in self.cors_origins.split(",") if item.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()

