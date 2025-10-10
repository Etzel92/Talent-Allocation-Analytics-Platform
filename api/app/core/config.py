from pydantic import Field
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # SQLite local por defecto (archivo en /api/employees.db)
    DATABASE_URL: str = Field(default="sqlite:///employees.db")
    SECRET_KEY: str = Field(default="dev-secret-change-me")
    ALGORITHM: str = Field(default="HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(default=60)

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
