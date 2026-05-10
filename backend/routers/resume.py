"""
简历路由 - 与 Go 版本 API 一致

API 端点:
GET   /api/v1/resumes        - 获取简历列表
GET   /api/v1/resumes/:id    - 获取简历详情
POST  /api/v1/resumes        - 创建简历
POST  /api/v1/resumes/import - 从 PDF 导入简历
PUT   /api/v1/resumes/:id    - 更新简历
DELETE /api/v1/resumes/:id   - 删除简历
POST  /api/v1/resumes/:id/share - 启用分享
DELETE /api/v1/resumes/:id/share - 禁用分享
"""
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Query, Request
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
import json

from database import get_db
from schemas.resume import (
    ResumeCreateRequest, ResumeUpdateRequest,
    ResumeResponse, ResumeListResponse, ResumeImportResponse,
    ShareResponse, DeleteResponse, OptimizeRequest, OptimizeResponse,
    OptimizeFullRequest, OptimizeFullResponse
)
from services import resume_service
from services.ai_service import optimize_single_content, optimize_full_resume
from services.pdf_parser import ResumePDFParser, parse_pdf
from middleware.auth import auth_required


router = APIRouter(prefix="/api/v1/resumes", tags=["简历"])


@router.get("", response_model=ResumeListResponse)
async def list_resumes(
    request: Request,
    search: Optional[str] = Query(None),
    sort: str = Query("updated_at_desc"),
    theme_id: Optional[int] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(auth_required),
):
    """获取简历列表"""
    user_id = int(user.get("user_id", 0))

    result = await resume_service.get_resumes(
        db=db,
        user_id=user_id,
        search=search,
        sort=sort,
        theme_id=theme_id,
        page=page,
        page_size=page_size
    )

    if result.get("code") != 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"code": result.get("code", 1), "message": result.get("message", "获取简历列表失败")}
        )

    return ResumeListResponse(
        code=0,
        data=result.get("data")
    )


@router.get("/{resume_id}", response_model=ResumeResponse)
async def get_resume(
    resume_id: int,
    request: Request,
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(auth_required),
):
    """获取简历详情"""
    user_id = int(user.get("user_id", 0))

    result = await resume_service.get_resume(
        db=db,
        resume_id=resume_id,
        user_id=user_id
    )

    if result.get("code") != 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"code": result.get("code", 1), "message": result.get("message", "简历不存在")}
        )

    return ResumeResponse(code=0, data=result.get("data"))


@router.post("", response_model=ResumeResponse)
async def create_resume(
    req: ResumeCreateRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(auth_required),
):
    """创建简历"""
    user_id = int(user.get("user_id", 0))

    # 解析 JSON 字段
    personal_info = json.loads(req.personal_info) if req.personal_info else {}
    education = json.loads(req.education) if req.education else []
    work_experience = json.loads(req.work_experience) if req.work_experience else []
    projects = json.loads(req.projects) if req.projects else []
    skills = json.loads(req.skills) if req.skills else []
    awards = json.loads(req.awards) if req.awards else []
    languages = json.loads(req.languages) if req.languages else []

    result = await resume_service.create_resume(
        db=db,
        user_id=user_id,
        title=req.title or "我的简历",
        theme_id=req.theme_id or 0,
        resume_type=req.resume_type or "full",
        personal_info=personal_info,
        education=education,
        work_experience=work_experience,
        projects=projects,
        skills=skills,
        awards=awards,
        languages=languages,
    )

    if result.get("code") != 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"code": result.get("code", 1), "message": result.get("message", "创建简历失败")}
        )

    return ResumeResponse(code=0, data=result.get("data"))


@router.post("/import", response_model=ResumeImportResponse)
async def import_resume(
    request: Request,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(auth_required),
):
    """从 PDF 导入简历"""
    user_id = int(user.get("user_id", 0))

    # 验证文件类型
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"code": 1, "message": "请上传 PDF 格式的文件"}
        )

    # 读取文件内容
    content = await file.read()

    # 检查文件大小 (10MB)
    if len(content) > 10 * 1024 * 1024:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"code": 1, "message": "文件大小不能超过 10MB"}
        )

    # 解析 PDF
    parser = ResumePDFParser()
    parsed, err_msg = parser.parse_pdf(content)

    if err_msg:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"code": 1, "message": err_msg}
        )

    # 转换为字典格式
    parsed_dict = parser.to_dict(parsed)

    # 创建简历
    result = await resume_service.create_resume(
        db=db,
        user_id=user_id,
        title=f"{parsed_dict['personal_info'].get('name', '新简历')}的简历",
        theme_id=0,
        resume_type="full",
        personal_info=parsed_dict["personal_info"],
        education=parsed_dict["education"],
        work_experience=parsed_dict["work_experience"],
        projects=parsed_dict["projects"],
        skills=parsed_dict["skills"],
        awards=parsed_dict["awards"],
        languages=parsed_dict["languages"],
    )

    if result.get("code") != 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"code": result.get("code", 1), "message": result.get("message", "导入失败")}
        )

    return ResumeImportResponse(
        code=0,
        message="导入成功",
        data={
            "resume": result.get("data"),
            "raw_text": parsed.raw_text,
            "parsed": {
                "personal_info": parsed.personal_info,
                "education": parsed.education,
                "work_experience": parsed.work_experience,
                "projects": parsed.projects,
                "skills": parsed.skills,
                "awards": parsed.awards,
                "languages": parsed.languages,
            }
        }
    )


@router.put("/{resume_id}", response_model=ResumeResponse)
async def update_resume(
    resume_id: int,
    req: ResumeUpdateRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(auth_required),
):
    """更新简历"""
    user_id = int(user.get("user_id", 0))

    # 构建更新参数
    update_kwargs = {}
    if req.title is not None:
        update_kwargs["title"] = req.title
    if req.theme_id is not None:
        update_kwargs["theme_id"] = req.theme_id
    if req.resume_type is not None:
        update_kwargs["resume_type"] = req.resume_type
    if req.status is not None:
        update_kwargs["status"] = req.status
    if req.is_default is not None:
        update_kwargs["is_default"] = req.is_default

    # 解析 JSON 字段
    if req.personal_info is not None:
        update_kwargs["personal_info"] = json.loads(req.personal_info)
    if req.education is not None:
        update_kwargs["education"] = json.loads(req.education)
    if req.work_experience is not None:
        update_kwargs["work_experience"] = json.loads(req.work_experience)
    if req.projects is not None:
        update_kwargs["projects"] = json.loads(req.projects)
    if req.skills is not None:
        update_kwargs["skills"] = json.loads(req.skills)
    if req.awards is not None:
        update_kwargs["awards"] = json.loads(req.awards)
    if req.languages is not None:
        update_kwargs["languages"] = json.loads(req.languages)

    result = await resume_service.update_resume(
        db=db,
        resume_id=resume_id,
        user_id=user_id,
        **update_kwargs
    )

    if result.get("code") != 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"code": result.get("code", 1), "message": result.get("message", "简历不存在")}
        )

    return ResumeResponse(code=0, data=result.get("data"))


@router.delete("/{resume_id}", response_model=DeleteResponse)
async def delete_resume(
    resume_id: int,
    request: Request,
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(auth_required),
):
    """删除简历"""
    user_id = int(user.get("user_id", 0))

    result = await resume_service.delete_resume(
        db=db,
        resume_id=resume_id,
        user_id=user_id
    )

    if result.get("code") != 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"code": result.get("code", 1), "message": result.get("message", "简历不存在")}
        )

    return DeleteResponse(code=0, message="deleted successfully")


@router.post("/{resume_id}/share", response_model=ShareResponse)
async def enable_share(
    resume_id: int,
    request: Request,
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(auth_required),
):
    """启用简历分享"""
    user_id = int(user.get("user_id", 0))

    result = await resume_service.enable_share(
        db=db,
        resume_id=resume_id,
        user_id=user_id
    )

    if result.get("code") != 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"code": result.get("code", 1), "message": result.get("message", "简历不存在")}
        )

    return ShareResponse(code=0, data=result.get("data"))


@router.delete("/{resume_id}/share")
async def disable_share(
    resume_id: int,
    request: Request,
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(auth_required),
):
    """禁用简历分享"""
    user_id = int(user.get("user_id", 0))

    result = await resume_service.disable_share(
        db=db,
        resume_id=resume_id,
        user_id=user_id
    )

    if result.get("code") != 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"code": result.get("code", 1), "message": result.get("message", "简历不存在")}
        )

    return {"code": 0, "message": "分享已取消"}


@router.post("/optimize")
async def optimize_content(
    req: OptimizeRequest,
    request: Request,
    user: dict = Depends(auth_required),
):
    """优化单条简历内容"""
    try:
        if not req.content or len(req.content.strip()) == 0:
            return {"code": 1, "message": "内容不能为空"}

        if len(req.content) > 5000:
            return {"code": 1, "message": "内容不能超过 5000 字"}

        result = await optimize_single_content(
            content=req.content,
            content_type=req.type,
            optimize_type="all"
        )

        if result.get("success"):
            return {
                "code": 0,
                "message": "优化成功",
                "data": {
                    "original": result.get("original", ""),
                    "optimized": result.get("optimized", ""),
                    "changes": result.get("changes", [])
                }
            }
        else:
            return {
                "code": 1,
                "message": result.get("error", "优化失败"),
                "data": {
                    "original": result.get("original", ""),
                    "optimized": result.get("original", ""),
                    "changes": []
                }
            }

    except Exception as e:
        return {"code": 1, "message": f"优化失败: {str(e)}"}


@router.post("/optimize-full")
async def optimize_full(
    req: OptimizeFullRequest,
    request: Request,
    user: dict = Depends(auth_required),
):
    """一键优化整份简历"""
    try:
        if not req.resume_data:
            return {"code": 1, "message": "简历数据不能为空"}

        result = await optimize_full_resume(req.resume_data)

        if result.get("success"):
            return {
                "code": 0,
                "message": "优化成功",
                "data": {
                    "optimized": result.get("optimized", {}),
                    "summary": result.get("summary", [])
                }
            }
        else:
            return {
                "code": 1,
                "message": result.get("error", "优化失败"),
                "data": {
                    "optimized": req.resume_data,
                    "summary": []
                }
            }

    except Exception as e:
        return {"code": 1, "message": f"优化失败: {str(e)}"}
