"""
数据库连接模块 - SQLAlchemy 异步连接
"""
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy import create_engine
from config import settings


class Base(DeclarativeBase):
    """SQLAlchemy 基类"""
    pass


# 异步引擎 (主用)
async_engine = create_async_engine(
    settings.DATABASE_URL,
    echo=False,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20,
)

# 异步 Session 工厂
AsyncSessionLocal = async_sessionmaker(
    bind=async_engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)

# 同步引擎 (用于创建表)
sync_engine = create_engine(
    settings.SYNC_DATABASE_URL,
    echo=False,
    pool_pre_ping=True,
)


async def get_db() -> AsyncSession:
    """获取数据库会话的依赖"""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()


def create_tables():
    """创建所有表 (同步调用，用于初始化)"""
    Base.metadata.create_all(bind=sync_engine)


async def init_db():
    """初始化数据库连接池"""
    # 确保引擎已创建
    pass


async def close_db():
    """关闭数据库连接"""
    await async_engine.dispose()
