from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


BACKEND_ROOT = Path(__file__).resolve().parents[2]
PROJECT_ROOT = BACKEND_ROOT.parent
ENV_FILE = BACKEND_ROOT / ".env"


class Settings(BaseSettings):
    APP_NAME: str = "Smart Workout DSS/BIS API"
    APP_ENV: str = "development"
    API_V1_STR: str = "/api/v1"
    LOG_LEVEL: str = "INFO"
    MOCK_MODE: bool = True

    RAW_DATA_DIR: Path = PROJECT_ROOT / "data" / "raw"
    PROCESSED_DATA_DIR: Path = PROJECT_ROOT / "data" / "processed"
    MODEL_DIR: Path = PROJECT_ROOT / "models"
    CHROMA_DB_DIR: Path = PROJECT_ROOT / "chroma_db"
    ALLOWED_ORIGINS: str = (
        "http://localhost:3000,http://localhost:3001,"
        "http://localhost:5173,http://localhost:5174,"
        "http://127.0.0.1:3000,http://127.0.0.1:5173"
    )

    model_config = SettingsConfigDict(
        env_file=ENV_FILE,
        env_file_encoding="utf-8",
        case_sensitive=True,
    )

    @property
    def allowed_origins_list(self) -> list[str]:
        return [
            origin.strip()
            for origin in self.ALLOWED_ORIGINS.split(",")
            if origin.strip()
        ]


settings = Settings()

