"""
认证路由 - 与 Go 版本 API 一致
POST /api/v1/auth/register      - 用户注册
POST /api/v1/auth/login        - 用户登录
POST /api/v1/auth/guest       - 游客登录
GET  /api/v1/auth/me          - 获取当前用户
PUT  /api/v1/auth/profile      - 更新个人资料
PUT  /api/v1/auth/password     - 修改密码
"""
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from database import get_db
from schemas.auth import (
    RegisterRequest, LoginRequest, GuestResponse,
    ProfileUpdateRequest, PasswordChangeRequest,
    RegisterResponse, LoginResponse, MeResponse,
    ProfileUpdateResponse, PasswordChangeResponse, ErrorResponse,
    UserResponse
)
from services.auth_service import AuthService
from middleware.auth import auth_required
from utils.security import decode_access_token

router = APIRouter(prefix="/api/v1/auth", tags=["认证"])


@router.post("/register")
async def register(
    req: RegisterRequest,
    db: AsyncSession = Depends(get_db)
):
    """用户注册"""
    service = AuthService(db)
    user, err_msg = await service.register(
        username=req.username,
        email=req.email,
        password=req.password,
        nickname=req.nickname
    )

    if err_msg:
        # 与 Go 版本一致，不使用 HTTPException
        return {"code": 1, "message": err_msg}

    # 与 Go 版本一致
    return {
        "code": 0,
        "message": "注册成功",
        "data": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "nickname": user.nickname,
            "created_at": user.created_at.isoformat() if user.created_at else None,
        }
    }


@router.post("/login")
async def login(
    req: LoginRequest,
    db: AsyncSession = Depends(get_db)
):
    """用户登录"""
    service = AuthService(db)
    result, err_msg = await service.login(req.username, req.password)

    if err_msg:
        return {"code": 1, "message": err_msg}

    # 与 Go 版本一致
    return {
        "code": 0,
        "message": "登录成功",
        "data": {
            "token": result["token"],
            "user": result["user"]
        }
    }


@router.post("/guest", response_model=GuestResponse)
async def guest_login(db: AsyncSession = Depends(get_db)):
    """游客登录"""
    service = AuthService(db)
    result, err_msg = await service.guest_login()

    if err_msg:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"code": 1, "message": err_msg}
        )

    return GuestResponse(
        code=0,
        message="游客登录成功",
        data={
            "token": result["token"],
            "user": result["user"],
            "is_guest": True
        }
    )


@router.get("/me")
async def get_me(
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """获取当前用户"""
    payload = await auth_required(request)
    user_id = int(payload.get("user_id", 0))

    if not user_id:
        return {"code": 1, "message": "无效的 Token"}

    service = AuthService(db)
    result, err_msg = await service.get_current_user(user_id)

    if err_msg:
        return {"code": 1, "message": err_msg}

    # 与 Go 版本一致 - 直接返回结果，不再用 response_model
    return {"code": 0, "data": result}


@router.put("/profile")
async def update_profile(
    req: ProfileUpdateRequest,
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """更新个人资料"""
    payload = await auth_required(request)
    user_id = int(payload.get("user_id", 0))

    if not user_id:
        return {"code": 1, "message": "无效的 Token"}

    service = AuthService(db)
    result, err_msg = await service.update_profile(
        user_id=user_id,
        nickname=req.nickname,
        avatar=req.avatar,
        phone=req.phone
    )

    if err_msg:
        return {"code": 1, "message": err_msg}

    # 与 Go 版本一致
    return {
        "code": 0,
        "message": "更新成功",
        "data": result
    }


@router.put("/password", response_model=PasswordChangeResponse)
async def change_password(
    req: PasswordChangeRequest,
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """修改密码"""
    payload = await auth_required(request)
    user_id = int(payload.get("user_id", 0))

    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"code": 1, "message": "无效的 Token"}
        )

    service = AuthService(db)
    success, err_msg = await service.change_password(
        user_id=user_id,
        old_password=req.old_password,
        new_password=req.new_password
    )

    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"code": 1, "message": err_msg}
        )

    return PasswordChangeResponse(code=0, message="密码修改成功")
