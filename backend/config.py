"""
配置模块 - 环境变量管理
与 Go 版本的配置保持一致
"""
import os
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """应用配置"""

    # 服务器配置
    RESUME_PORT: int = 8082

    # 数据库配置
    RESUME_DB_HOST: str = "localhost"
    RESUME_DB_PORT: int = 3306
    RESUME_DB_USER: str = "root"
    RESUME_DB_PASSWORD: str = ""
    RESUME_DB_NAME: str = "interview"

    # AI API 配置
    ANTHROPIC_BASE_URL: str = "https://api.minimax.chat/v1/text/chatcompletion_v2"
    ANTHROPIC_API_KEY: str = ""

    # JWT 配置
    JWT_SECRET_KEY: str = "resume-ai-secret-key-change-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    @property
    def DATABASE_URL(self) -> str:
        """构建数据库连接 URL"""
        return f"mysql+aiomysql://{self.RESUME_DB_USER}:{self.RESUME_DB_PASSWORD}@{self.RESUME_DB_HOST}:{self.RESUME_DB_PORT}/{self.RESUME_DB_NAME}"

    @property
    def SYNC_DATABASE_URL(self) -> str:
        """同步数据库连接 URL (用于创建表)"""
        return f"mysql+pymysql://{self.RESUME_DB_USER}:{self.RESUME_DB_PASSWORD}@{self.RESUME_DB_HOST}:{self.RESUME_DB_PORT}/{self.RESUME_DB_NAME}"

    class Config:
        env_file = ".env"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    """获取配置单例"""
    return Settings()


settings = get_settings()
