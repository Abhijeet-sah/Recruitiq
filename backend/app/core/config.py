import os
from typing import List, Union, Any
from pydantic_settings import BaseSettings
from pydantic import AnyHttpUrl, field_validator

class Settings(BaseSettings):
    PROJECT_NAME: str = "RecruitIQ"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    
    SECRET_KEY: str = "recruitiq-secret-key-super-secure-production-ready-2026-xyz"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    # Database: Supports SQLite by default for zero-config local run, or PostgreSQL
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./recruitiq.db")
    
    @field_validator("DATABASE_URL", mode="before")
    @classmethod
    def sanitize_database_url(cls, v: str) -> str:
        if isinstance(v, str) and v.startswith("postgres://"):
            return v.replace("postgres://", "postgresql://", 1)
        return v
    
    # Uploads
    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", "./uploads/resumes")
    MAX_FILE_SIZE_MB: int = 10
    ALLOWED_EXTENSIONS: List[str] = [".pdf", ".docx"]
    
    # AI/ML Configuration
    AI_PROVIDER: str = os.getenv("AI_PROVIDER", "local")  # local, openai, gemini, fallback
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    EMBEDDING_MODEL: str = os.getenv("EMBEDDING_MODEL", "all-MiniLM-L6-v2")
    
    # CORS
    CORS_ORIGINS: Any = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://localhost:8000",
        "*"
    ]

    @field_validator("CORS_ORIGINS", mode="after")
    @classmethod
    def assemble_cors_origins(cls, v: Any) -> List[str]:
        if isinstance(v, str):
            if not v.strip():
                return ["*"]
            if v.startswith("[") and v.endswith("]"):
                try:
                    import json
                    parsed = json.loads(v)
                    if isinstance(parsed, list):
                        return parsed
                except Exception:
                    pass
            return [i.strip() for i in v.split(",") if i.strip()]
        elif isinstance(v, (list, tuple)):
            return list(v)
        return ["*"]

    # Email / SMTP Notifications
    SMTP_HOST: str = os.getenv("SMTP_HOST", "")
    SMTP_PORT: int = int(os.getenv("SMTP_PORT", "587"))
    SMTP_USER: str = os.getenv("SMTP_USER", "")
    SMTP_PASSWORD: str = os.getenv("SMTP_PASSWORD", "")
    EMAILS_FROM_EMAIL: str = os.getenv("EMAILS_FROM_EMAIL", "notifications@recruitiq.ai")
    EMAILS_FROM_NAME: str = os.getenv("EMAILS_FROM_NAME", "RecruitIQ Recruitment Support")
    ENABLE_EMAIL_NOTIFICATIONS: bool = os.getenv("ENABLE_EMAIL_NOTIFICATIONS", "True").lower() in ("true", "1")
    
    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()

# Ensure uploads directory exists
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
