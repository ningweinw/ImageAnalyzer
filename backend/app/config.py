import os
from pathlib import Path

from dotenv import load_dotenv


def _load_local_env() -> None:
    # Prefer backend/.env when running app with --app-dir backend.
    backend_dir = Path(__file__).resolve().parents[1]
    backend_env = backend_dir / ".env"
    if backend_env.exists():
        load_dotenv(backend_env)
        return

    # Fallback to current working directory .env for alternate launch patterns.
    load_dotenv()


_load_local_env()


class Settings:
    def __init__(self) -> None:
        self.openai_endpoint = os.getenv("OPENAI_ENDPOINT", "").strip()
        self.model_deployment_name = os.getenv("MODEL_DEPLOYMENT_NAME", "").strip()

    @property
    def has_required_values(self) -> bool:
        return bool(self.openai_endpoint and self.model_deployment_name)


settings = Settings()
