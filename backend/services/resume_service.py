"""
简历服务 - 与 Go 版本的 resume handlers 一致
"""
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc, asc, and_
from models.resume import Resume
from typing import Optional, Dict, Any, List, Tuple
from datetime import datetime, timedelta
import secrets
import json


def api_response(code: int = 0, message: str = "", data: Any = None) -> Dict[str, Any]:
    """统一 API 响应格式 - 与 Go 版本一致"""
    return {"code": code, "message": message, "data": data}


async def get_resumes(
    db: AsyncSession,
    user_id: int,
    search: Optional[str] = None,
    sort: str = "updated_at_desc",
    theme_id: Optional[int] = None,
    page: int = 1,
    page_size: int = 10,
) -> Dict[str, Any]:
    """
    获取简历列表

    参数:
        user_id: 用户ID
        search: 搜索关键词（匹配标题）
        sort: 排序方式 (updated_at_desc, created_at_desc, updated_at_asc, created_at_asc)
        theme_id: 主题ID过滤
        page: 页码
        page_size: 每页数量

    返回: {"code": 0, "message": "", "data": {"list": [...], "total": N, "page": N, "page_size": N}}
    """
    try:
        query = select(Resume).where(Resume.user_id == user_id)

        # 搜索（匹配标题）
        if search:
            query = query.where(Resume.title.like(f"%{search}%"))

        # 主题过滤
        if theme_id is not None:
            query = query.where(Resume.theme_id == theme_id)

        # 统计总数
        count_query = select(func.count()).select_from(query.subquery())
        count_result = await db.execute(count_query)
        total = count_result.scalar() or 0

        # 排序
        if sort == "updated_at_desc":
            query = query.order_by(desc(Resume.updated_at))
        elif sort == "created_at_desc":
            query = query.order_by(desc(Resume.created_at))
        elif sort == "updated_at_asc":
            query = query.order_by(asc(Resume.updated_at))
        elif sort == "created_at_asc":
            query = query.order_by(asc(Resume.created_at))
        else:
            query = query.order_by(desc(Resume.updated_at))

        # 分页
        offset = (page - 1) * page_size
        query = query.offset(offset).limit(page_size)

        result = await db.execute(query)
        resumes = result.scalars().all()

        # 构建响应数据 - 与 Go 版本一致，包含所有字段
        import json as json_module

        def to_json_str(val):
            if val is None:
                return "{}"
            if isinstance(val, str):
                return val
            return json_module.dumps(val) if isinstance(val, (dict, list)) else "{}"

        resume_list = []
        for r in resumes:
            resume_list.append({
                "id": r.id,
                "user_id": r.user_id,
                "title": r.title,
                "theme_id": r.theme_id,
                "resume_type": r.resume_type,
                "is_default": r.is_default,
                "status": r.status,
                # 与 Go 版本一致，包含所有 JSON 字符串字段
                "personal_info": to_json_str(r.personal_info),
                "education": to_json_str(r.education),
                "work_experience": to_json_str(r.work_experience),
                "projects": to_json_str(r.projects),
                "skills": to_json_str(r.skills),
                "awards": to_json_str(r.awards),
                "languages": to_json_str(r.languages),
                "share_token": r.share_token,
                "created_at": r.created_at.isoformat() if r.created_at else None,
                "updated_at": r.updated_at.isoformat() if r.updated_at else None,
            })

        return api_response(data={
            "list": resume_list,
            "total": total,
            "page": page,
            "page_size": page_size,
        })

    except Exception as e:
        return api_response(code=1, message=f"获取简历列表失败: {str(e)}")


async def get_resume(
    db: AsyncSession,
    resume_id: int,
    user_id: int,
) -> Dict[str, Any]:
    """
    获取简历详情

    参数:
        resume_id: 简历ID
        user_id: 用户ID（用于验证所有权）

    返回: {"code": 0, "message": "", "data": {...}}
    """
    try:
        result = await db.execute(
            select(Resume).where(
                and_(Resume.id == resume_id, Resume.user_id == user_id)
            )
        )
        resume = result.scalar_one_or_none()

        if resume is None:
            return api_response(code=1, message="简历不存在")

        return api_response(data=_resume_to_dict(resume))

    except Exception as e:
        return api_response(code=1, message=f"获取简历详情失败: {str(e)}")


async def create_resume(
    db: AsyncSession,
    user_id: int,
    title: str = "我的简历",
    theme_id: int = 0,
    resume_type: str = "full",
    personal_info: Optional[Dict] = None,
    education: Optional[List[Dict]] = None,
    work_experience: Optional[List[Dict]] = None,
    projects: Optional[List[Dict]] = None,
    skills: Optional[List[Dict]] = None,
    awards: Optional[List[Dict]] = None,
    languages: Optional[List[Dict]] = None,
) -> Dict[str, Any]:
    """
    创建简历

    参数:
        user_id: 用户ID
        title: 简历标题
        theme_id: 主题ID
        resume_type: 简历类型
        personal_info: 个人信息
        education: 教育经历
        work_experience: 工作经历
        projects: 项目经验
        skills: 技能
        awards: 获奖荣誉
        languages: 语言能力

    返回: {"code": 0, "message": "created successfully", "data": {...}}
    """
    try:
        resume = Resume(
            user_id=user_id,
            title=title,
            theme_id=theme_id,
            resume_type=resume_type,
            status="draft",
            personal_info=personal_info or {},
            education=education or [],
            work_experience=work_experience or [],
            projects=projects or [],
            skills=skills or [],
            awards=awards or [],
            languages=languages or [],
        )

        db.add(resume)
        await db.commit()
        await db.refresh(resume)

        return api_response(
            code=0,
            message="created successfully",
            data=_resume_to_dict(resume)
        )

    except Exception as e:
        await db.rollback()
        return api_response(code=1, message=f"创建简历失败: {str(e)}")


async def update_resume(
    db: AsyncSession,
    resume_id: int,
    user_id: int,
    title: Optional[str] = None,
    theme_id: Optional[int] = None,
    resume_type: Optional[str] = None,
    status: Optional[str] = None,
    is_default: Optional[bool] = None,
    personal_info: Optional[Dict] = None,
    education: Optional[List[Dict]] = None,
    work_experience: Optional[List[Dict]] = None,
    projects: Optional[List[Dict]] = None,
    skills: Optional[List[Dict]] = None,
    awards: Optional[List[Dict]] = None,
    languages: Optional[List[Dict]] = None,
) -> Dict[str, Any]:
    """
    更新简历

    参数:
        resume_id: 简历ID
        user_id: 用户ID（用于验证所有权）
        title: 简历标题
        theme_id: 主题ID
        resume_type: 简历类型
        status: 状态
        is_default: 是否默认
        personal_info: 个人信息
        education: 教育经历
        work_experience: 工作经历
        projects: 项目经验
        skills: 技能
        awards: 获奖荣誉
        languages: 语言能力

    返回: {"code": 0, "message": "updated successfully", "data": {...}}
    """
    try:
        # 验证简历存在且属于该用户
        result = await db.execute(
            select(Resume).where(
                and_(Resume.id == resume_id, Resume.user_id == user_id)
            )
        )
        resume = result.scalar_one_or_none()

        if resume is None:
            return api_response(code=1, message="简历不存在")

        # 如果设置为默认，先取消该用户的其他默认简历
        if is_default:
            result = await db.execute(
                select(Resume).where(
                    and_(
                        Resume.user_id == user_id,
                        Resume.is_default == True,
                        Resume.id != resume_id
                    )
                )
            )
            for r in result.scalars():
                r.is_default = False

        # 更新字段
        if title is not None:
            resume.title = title
        if theme_id is not None:
            resume.theme_id = theme_id
        if resume_type is not None:
            resume.resume_type = resume_type
        if status is not None:
            resume.status = status
        if is_default is not None:
            resume.is_default = is_default
        if personal_info is not None:
            resume.personal_info = personal_info
        if education is not None:
            resume.education = education
        if work_experience is not None:
            resume.work_experience = work_experience
        if projects is not None:
            resume.projects = projects
        if skills is not None:
            resume.skills = skills
        if awards is not None:
            resume.awards = awards
        if languages is not None:
            resume.languages = languages

        await db.commit()
        await db.refresh(resume)

        return api_response(
            code=0,
            message="updated successfully",
            data=_resume_to_dict(resume)
        )

    except Exception as e:
        await db.rollback()
        return api_response(code=1, message=f"更新简历失败: {str(e)}")


async def delete_resume(
    db: AsyncSession,
    resume_id: int,
    user_id: int,
) -> Dict[str, Any]:
    """
    删除简历

    参数:
        resume_id: 简历ID
        user_id: 用户ID（用于验证所有权）

    返回: {"code": 0, "message": "deleted successfully", "data": null}
    """
    try:
        result = await db.execute(
            select(Resume).where(
                and_(Resume.id == resume_id, Resume.user_id == user_id)
            )
        )
        resume = result.scalar_one_or_none()

        if resume is None:
            return api_response(code=1, message="简历不存在")

        await db.delete(resume)
        await db.commit()

        return api_response(code=0, message="deleted successfully")

    except Exception as e:
        await db.rollback()
        return api_response(code=1, message=f"删除简历失败: {str(e)}")


async def enable_share(
    db: AsyncSession,
    resume_id: int,
    user_id: int,
) -> Dict[str, Any]:
    """
    启用简历分享

    参数:
        resume_id: 简历ID
        user_id: 用户ID（用于验证所有权）

    返回: {"code": 0, "message": "", "data": {"share_token": "...", "share_url": "/shared/..."}}
    """
    try:
        result = await db.execute(
            select(Resume).where(
                and_(Resume.id == resume_id, Resume.user_id == user_id)
            )
        )
        resume = result.scalar_one_or_none()

        if resume is None:
            return api_response(code=1, message="简历不存在")

        # 生成新的分享 Token
        token = secrets.token_hex(16)
        expires_at = datetime.utcnow() + timedelta(days=30)

        resume.share_token = token
        resume.share_expires_at = expires_at

        await db.commit()

        return api_response(data={
            "share_token": token,
            "share_url": f"/shared/{token}",
            "expires_at": expires_at.isoformat(),
        })

    except Exception as e:
        await db.rollback()
        return api_response(code=1, message=f"启用分享失败: {str(e)}")


async def disable_share(
    db: AsyncSession,
    resume_id: int,
    user_id: int,
) -> Dict[str, Any]:
    """
    禁用简历分享

    参数:
        resume_id: 简历ID
        user_id: 用户ID（用于验证所有权）

    返回: {"code": 0, "message": "disabled successfully", "data": null}
    """
    try:
        result = await db.execute(
            select(Resume).where(
                and_(Resume.id == resume_id, Resume.user_id == user_id)
            )
        )
        resume = result.scalar_one_or_none()

        if resume is None:
            return api_response(code=1, message="简历不存在")

        resume.share_token = None
        resume.share_expires_at = None

        await db.commit()

        return api_response(code=0, message="disabled successfully")

    except Exception as e:
        await db.rollback()
        return api_response(code=1, message=f"禁用分享失败: {str(e)}")


async def get_resume_by_share_token(
    db: AsyncSession,
    token: str,
) -> Dict[str, Any]:
    """
    根据分享 Token 获取简历（公开接口，无需用户验证）

    参数:
        token: 分享Token

    返回: {"code": 0, "message": "", "data": {...}}
    """
    try:
        result = await db.execute(
            select(Resume).where(Resume.share_token == token)
        )
        resume = result.scalar_one_or_none()

        if resume is None:
            return api_response(code=1, message="简历不存在或分享已过期")

        # 检查是否过期
        if resume.share_expires_at and datetime.utcnow() > resume.share_expires_at:
            return api_response(code=1, message="简历分享已过期")

        return api_response(data=_resume_to_dict(resume))

    except Exception as e:
        return api_response(code=1, message=f"获取简历失败: {str(e)}")


def _resume_to_dict(resume: Resume) -> Dict[str, Any]:
    """将 Resume 模型转换为字典 - 与 Go 版本一致，返回 JSON 字符串"""
    import json as json_module

    def to_json_str(val):
        if val is None:
            return "{}"
        if isinstance(val, str):
            return val
        return json_module.dumps(val) if isinstance(val, (dict, list)) else "{}"

    return {
        "id": resume.id,
        "user_id": resume.user_id,
        "title": resume.title,
        "theme_id": resume.theme_id,
        "resume_type": resume.resume_type,
        "is_default": resume.is_default,
        "status": resume.status,
        # Go 版本返回 JSON 字符串，不是解析后的对象
        "personal_info": to_json_str(resume.personal_info),
        "education": to_json_str(resume.education),
        "work_experience": to_json_str(resume.work_experience),
        "projects": to_json_str(resume.projects),
        "skills": to_json_str(resume.skills),
        "awards": to_json_str(resume.awards),
        "languages": to_json_str(resume.languages),
        "share_token": resume.share_token,
        "share_expires_at": resume.share_expires_at.isoformat() if resume.share_expires_at else None,
        "created_at": resume.created_at.isoformat() if resume.created_at else None,
        "updated_at": resume.updated_at.isoformat() if resume.updated_at else None,
    }
