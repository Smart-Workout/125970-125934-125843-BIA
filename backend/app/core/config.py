from functools import lru_cache                                             # Cache settings so path detection runs once per backend process.
from pathlib import Path                                                    # Build Windows-safe project and data paths.

from pydantic_settings import BaseSettings, SettingsConfigDict              # Load typed settings from defaults and optional .env values.


def find_project_root(start: Path | None = None) -> Path:
    current = (start or Path(__file__)).resolve()                           # Start from this config file unless another start path is provided.
    for candidate in [current, *current.parents]:
        if (candidate / "data" / "raw").exists() and (candidate / "backend").exists():
            return candidate                                                # Root is the folder that owns both data and backend directories.
    return Path(__file__).resolve().parents[3]                              # Fallback keeps the API usable if directory scanning changes.


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")      # Optional .env can override defaults without breaking unknown keys.

    PROJECT_ROOT: Path = find_project_root()                                # Shared root path prevents hard-coded user-specific folders.
    MOCK_MODE: bool = True                                                  # Mock mode signals that final LLM generation is not connected yet.
    RAW_DATA_DIR: Path = PROJECT_ROOT / "data" / "raw"                      # Raw CSV folder used by health checks and legacy services.
    PROCESSED_DATA_DIR: Path = PROJECT_ROOT / "data" / "processed"          # Week 1 cleaned datasets live here.
    MODEL_DIR: Path = PROJECT_ROOT / "models"                               # Week 2 trained model artifacts live here.
    CHROMA_DB_DIR: Path = PROJECT_ROOT / "chroma_db"                        # Local Chroma persistent index lives here.
    RAG_COLLECTION_NAME: str = "smart_workout_knowledge"                    # Collection name must match RAG build and retrieval scripts.
    EMBEDDING_MODEL_NAME: str = "all-MiniLM-L6-v2"                           # Query embedding model must match the indexed vectors.
    CORS_ALLOW_ORIGINS: str = ""                                             # Comma-separated frontend origins for deployment environments.


@lru_cache
def get_settings() -> Settings:
    settings = Settings()                                                   # Settings object centralizes all backend paths and flags.
    return settings                                                         # Cached settings are reused across services and routers.


settings = get_settings()                                                   # Importable singleton keeps service code concise.
