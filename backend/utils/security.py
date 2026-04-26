"""
安全工具 - 密码哈希、JWT 编码解码
与 Go 版本的 JWT 中间件逻辑一致
"""
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from passlib.context import CryptContext
from jose import jwt, JWTError
from config import settings


# 密码哈希上下文
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    """哈希密码"""
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """验证密码"""
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """
    创建 JWT token
    与 Go 版本保持一致，使用相同的 secret 和算法
    """
    to_encode = data.copy()

    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.JWT_EXPIRE_MINUTES)

    to_encode.update({"exp": expire, "iat": datetime.utcnow()})

    encoded_jwt = jwt.encode(
        to_encode,
        settings.JWT_SECRET_KEY,
        algorithm=settings.JWT_ALGORITHM
    )
    return encoded_jwt


def decode_access_token(token: str) -> Optional[Dict[str, Any]]:
    """
    解码 JWT token
    返回 None 表示 token 无效或过期
    """
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM]
        )
        return payload
    except JWTError:
        return None


def create_guest_token(user_id: int) -> str:
    """创建游客 token (与 Go 版本一致)"""
    return create_access_token({
        "user_id": user_id,  # Go 版本使用 snake_case
        "username": "guest",
    })


def create_user_token(user_id: int, username: str) -> str:
    """创建用户 token (与 Go 版本一致)"""
    return create_access_token({
        "user_id": user_id,  # Go 版本使用 snake_case
        "username": username,
    })
