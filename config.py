import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # AWS Configuration
    aws_access_key_id: str #= os.getenv("AWS_ACCESS_KEY_ID", "")
    aws_secret_access_key: str #= os.getenv("AWS_SECRET_ACCESS_KEY", "")
    aws_default_region: str #= os.getenv("AWS_DEFAULT_REGION", "")
    s3_bucket_name: str

    class Config:
        env_file = ".env"

settings = Settings()