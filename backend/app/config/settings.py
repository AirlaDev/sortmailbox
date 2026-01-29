from pydantic_settings import BaseSettings
from typing import List
import os

class Settings(BaseSettings):
    database_url: str = "postgresql://user:password@localhost:5432/autou_db"
    huggingface_api_key: str = ""
    secret_key: str = "your-secret-key-change-in-production"
    environment: str = "development"
    debug: bool = True
    cors_origins: str = "http://localhost:3000,http://127.0.0.1:3000"
    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.cors_origins.split(",")]
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

settings = Settings()
