from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    APP_NAME: str = "Finance Tracker"
    SECRET_KEY: str = "super-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    DATABASE_URL: str = "sqlite:///./finance.db"

    model_config = {"env_file": ".env"}


cfg = Settings()
