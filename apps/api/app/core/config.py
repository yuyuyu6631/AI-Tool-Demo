from pathlib import Path

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


ROOT_DIR = Path(__file__).resolve().parents[4]


class Settings(BaseSettings):
    app_name: str = "Xingdianping API"
    api_prefix: str = "/api"
    database_url: str = "sqlite+pysqlite:///:memory:"
    redis_url: str = "redis://localhost:6379/0"
    auth_secret_key: str = "dev-auth-secret-key"
    session_cookie_name: str = "xingdianping_session"
    session_ttl_seconds: int = 604800
    cookie_secure: bool = False
    ai_provider: str = "stub"
    ai_api_key: str = ""
    ai_model: str = ""
    ai_openai_base_url: str = ""
    ai_anthropic_base_url: str = ""
    embedding_provider: str = ""
    embedding_api_key: str = ""
    embedding_model: str = ""
    embedding_openai_base_url: str = ""
    embedding_recall_top_k: int = 12
    embedding_recall_min_similarity: float = 0.2
    recommendation_ttl_seconds: int = 1800

    model_config = SettingsConfigDict(env_file=ROOT_DIR / ".env", extra="ignore")

    @field_validator("database_url", mode="before")
    @classmethod
    def normalize_sqlite_url(cls, value: str) -> str:
        prefix = "sqlite:///./"
        if isinstance(value, str) and value.startswith(prefix):
            return f"sqlite:///{(ROOT_DIR / value.removeprefix(prefix)).as_posix()}"
        return value


settings = Settings()
