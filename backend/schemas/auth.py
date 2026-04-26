"""
认证相关 Pydantic 模型 - 与 Go 版本入参出参一致
"""
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime


# ============ 请求模型 ============

class RegisterRequest(BaseModel):
    """用户注册请求"""
    username: str = Field(..., min_length=3, max_length=20)
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=20)
    nickname: Optional[str] = None


class LoginRequest(BaseModel):
    """用户登录请求"""
    username: str
    password: str


class ProfileUpdateRequest(BaseModel):
    """更新个人资料请求"""
    nickname: Optional[str] = None
    avatar: Optional[str] = None
    phone: Optional[str] = None


class PasswordChangeRequest(BaseModel):
    """修改密码请求"""
    old_password: str
    new_password: str = Field(..., min_length=6, max_length=20)


# ============ 响应模型 ============

class UserResponse(BaseModel):
    """用户响应"""
    id: int
    username: str
    email: str
    nickname: Optional[str] = None
    avatar: Optional[str] = None
    phone: Optional[str] = None
    status: str = "active"
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class GuestUserResponse(BaseModel):
    """游客用户响应"""
    id: int
    username: str
    email: str
    nickname: str
    avatar: str = ""


class LoginData(BaseModel):
    """登录成功返回数据"""
    token: str
    user: UserResponse


class LoginResponse(BaseModel):
    """登录响应"""
    code: int = 0
    message: str = "登录成功"
    data: LoginData


class GuestResponse(BaseModel):
    """游客登录响应"""
    code: int = 0
    message: str = "游客登录成功"
    data: dict  # {token, user, is_guest}


class RegisterResponse(BaseModel):
    """注册响应"""
    code: int = 0
    message: str = "注册成功"
    data: UserResponse


class MeResponse(BaseModel):
    """获取当前用户响应"""
    code: int = 0
    data: UserResponse


class ProfileUpdateResponse(BaseModel):
    """更新资料响应"""
    code: int = 0
    message: str = "更新成功"
    data: UserResponse


class PasswordChangeResponse(BaseModel):
    """修改密码响应"""
    code: int = 0
    message: str = "密码修改成功"


class ErrorResponse(BaseModel):
    """错误响应"""
    code: int = 1
    message: str
