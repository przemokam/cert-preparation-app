"""
Configuration module — auto-detects local vs production environment.
Local: reads .env file via python-dotenv.
Production (Azure): reads Key Vault via Managed Identity.
"""

import os
import secrets
import logging
from pathlib import Path
from functools import lru_cache
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

PROJECT_ROOT = Path(__file__).resolve().parents[1]
BUNDLED_DATABASE_PATH = PROJECT_ROOT / "az500_dev.db"
LOCAL_DATABASE_PATH = PROJECT_ROOT / "az500_local.db"
BUNDLED_DATABASE_URL = f"sqlite:///{BUNDLED_DATABASE_PATH.as_posix()}"
LOCAL_DATABASE_URL = f"sqlite:///{LOCAL_DATABASE_PATH.as_posix()}"
LEGACY_LOCAL_DATABASE_URLS = {
    "sqlite:///./az500_dev.db",
    BUNDLED_DATABASE_URL,
}
LOCAL_DATABASE_URL_ALIASES = {
    "sqlite:///./az500_local.db",
    LOCAL_DATABASE_URL,
}


def resolve_database_url(raw_database_url: str, environment: str) -> str:
    """Use an ignored local working DB in local mode, including legacy .env values."""
    if environment == "local":
        if not raw_database_url or raw_database_url in LEGACY_LOCAL_DATABASE_URLS:
            return LOCAL_DATABASE_URL
        if raw_database_url in LOCAL_DATABASE_URL_ALIASES:
            return LOCAL_DATABASE_URL
    return raw_database_url or BUNDLED_DATABASE_URL


class Settings:
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "local")
    ENTRA_CLIENT_ID: str = os.getenv("ENTRA_CLIENT_ID", "")
    ENTRA_CLIENT_SECRET: str = os.getenv("ENTRA_CLIENT_SECRET", "")
    ENTRA_TENANT_ID: str = os.getenv("ENTRA_TENANT_ID", "")
    DATABASE_URL: str = resolve_database_url(os.getenv("DATABASE_URL", ""), ENVIRONMENT)
    REDIRECT_URI: str = os.getenv("REDIRECT_URI", "http://localhost:8000/auth/callback")
    KEY_VAULT_URL: str = os.getenv("KEY_VAULT_URL", "")

    # JWT secret: require explicit setting, generate random for local dev only
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "")
    if not JWT_SECRET_KEY or JWT_SECRET_KEY.startswith("<"):
        if os.getenv("ENVIRONMENT", "local") == "production":
            raise ValueError(
                "JWT_SECRET_KEY must be set in production. "
                "Generate one with: openssl rand -hex 32"
            )
        JWT_SECRET_KEY = secrets.token_hex(32)

    # Entra ID endpoints
    AUTHORITY: str = f"https://login.microsoftonline.com/{ENTRA_TENANT_ID}"
    SCOPES: list = ["User.Read"]

    def __init__(self):
        if self.ENVIRONMENT == "production" and self.KEY_VAULT_URL:
            self._load_from_keyvault()

    def _load_from_keyvault(self):
        """Load secrets from Azure Key Vault in production."""
        try:
            from azure.identity import DefaultAzureCredential
            from azure.keyvault.secrets import SecretClient

            credential = DefaultAzureCredential()
            client = SecretClient(vault_url=self.KEY_VAULT_URL, credential=credential)

            self.ENTRA_CLIENT_ID = client.get_secret("ENTRA-CLIENT-ID").value
            self.ENTRA_CLIENT_SECRET = client.get_secret("ENTRA-CLIENT-SECRET").value
            self.JWT_SECRET_KEY = client.get_secret("JWT-SECRET-KEY").value
        except Exception as e:
            logger.error("Failed to load secrets from Key Vault: %s", e)
            raise


@lru_cache()
def get_settings() -> Settings:
    return Settings()
