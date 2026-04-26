"""
JWT 认证中间件 - 与 Go 版本的 middleware.go 一致
"""
from fastapi import Request, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional
from utils.security import decode_access_token


# HTTP Bearer 安全方案
bearer_scheme = HTTPBearer(auto_error=False)


async def get_current_user(credentials: Optional[HTTPAuthorizationCredentials] = None) -> dict:
    """
    获取当前用户 (从 JWT Token)
    与 Go 版本的 AuthRequired 中间件一致
    """
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"code": 1, "message": "未授权，请先登录"}
        )

    token = credentials.credentials
    payload = decode_access_token(token)

    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"code": 1, "message": "Token 已失效"}
        )

    return payload


async def auth_required(request: Request) -> dict:
    """
    认证依赖 - 用于需要认证的路由
    与 Go 版本的 AuthRequired 中间件一致
    """
    auth_header = request.headers.get("Authorization")

    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"code": 1, "message": "未授权，请先登录"}
        )

    token = auth_header.replace("Bearer ", "")
    payload = decode_access_token(token)

    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"code": 1, "message": "Token 已失效"}
        )

    return payload


def get_optional_user(request: Request) -> Optional[dict]:
    """
    获取当前用户 (可选 - 不强制认证)
    """
    auth_header = request.headers.get("Authorization")

    if not auth_header or not auth_header.startswith("Bearer "):
        return None

    token = auth_header.replace("Bearer ", "")
    return decode_access_token(token)