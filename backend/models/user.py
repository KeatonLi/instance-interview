"""
User 模型 - 与 Go 版本的 User 表结构一致
"""
from sqlalchemy import Column, Integer, String, DateTime, func
from database import Base


class User(Base):
    """用户表"""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(100), unique=True, nullable=False, index=True)
    password = Column(String(255), nullable=False)
    nickname = Column(String(50), nullable=True)
    avatar = Column(String(500), nullable=True)
    phone = Column(String(20), nullable=True)
    status = Column(String(20), default="active")
    created_at = Column(DateTime, server_default=func.now())
