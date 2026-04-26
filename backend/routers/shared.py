"""
公开分享路由 - 与 Go 版本 API 一致
GET /api/v1/shared/:token - 获取分享的简历
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from services.resume_service import get_resume_by_share_token, api_response

router = APIRouter(prefix="/api/v1/shared", tags=["分享"])


@router.get("/{token}")
async def get_shared_resume(
    token: str,
    db: AsyncSession = Depends(get_db)
):
    """获取分享的简历 (公开接口，无需认证)"""
    result = await get_resume_by_share_token(db, token)

    if result.get("code") != 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=result.get("message", "resume not found or sharing disabled")
        )

    return api_response(code=0, message="success", data=result.get("data"))
