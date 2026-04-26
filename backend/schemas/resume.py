"""
简历相关 Pydantic 模型 - 与 Go 版本入参出参一致
"""
from pydantic import BaseModel, Field
from typing import Optional, List, Any
from datetime import datetime


# ============ 请求模型 ============

class ResumeCreateRequest(BaseModel):
    """创建简历请求"""
    title: Optional[str] = "我的简历"
    theme_id: Optional[int] = 0
    resume_type: Optional[str] = "full"
    user_id: int  # 必填，与 Go 版本一致
    personal_info: Optional[str] = "{}"  # JSON 字符串
    education: Optional[str] = "[]"
    work_experience: Optional[str] = "[]"
    projects: Optional[str] = "[]"
    skills: Optional[str] = "[]"
    awards: Optional[str] = "[]"
    languages: Optional[str] = "[]"


class ResumeUpdateRequest(BaseModel):
    """更新简历请求"""
    title: Optional[str] = None
    theme_id: Optional[int] = None
    resume_type: Optional[str] = None
    status: Optional[str] = None
    is_default: Optional[bool] = None
    personal_info: Optional[str] = None
    education: Optional[str] = None
    work_experience: Optional[str] = None
    projects: Optional[str] = None
    skills: Optional[str] = None
    awards: Optional[str] = None
    languages: Optional[str] = None


# ============ 响应模型 ============

class ResumeBase(BaseModel):
    """简历基础字段"""
    id: int
    user_id: int
    title: str
    theme_id: int = 0
    resume_type: str = "full"
    is_default: bool = False
    status: str = "draft"
    personal_info: Any = {}
    education: Any = []
    work_experience: Any = []
    projects: Any = []
    skills: Any = []
    awards: Any = []
    languages: Any = []
    share_token: Optional[str] = None
    share_expires_at: Optional[datetime] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ResumeResponse(BaseModel):
    """简历响应"""
    code: int = 0
    data: ResumeBase


class ResumeListItem(BaseModel):
    """简历列表项（包含所有字段，与 Go 版本一致）"""
    id: int
    user_id: int
    title: str
    theme_id: int = 0
    resume_type: str = "full"
    is_default: bool = False
    status: str = "draft"
    # JSON 字符串字段
    personal_info: str = "{}"
    education: str = "[]"
    work_experience: str = "[]"
    projects: str = "[]"
    skills: str = "[]"
    awards: str = "[]"
    languages: str = "[]"
    share_token: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ResumeListData(BaseModel):
    """简历列表数据"""
    list: List[ResumeListItem]
    total: int
    page: int
    page_size: int


class ResumeListResponse(BaseModel):
    """简历列表响应"""
    code: int = 0
    data: ResumeListData


class ParsedResumeData(BaseModel):
    """解析后的简历数据"""
    personal_info: dict = {}
    education: List[dict] = []
    work_experience: List[dict] = []
    projects: List[dict] = []
    skills: List[dict] = []
    awards: List[dict] = []
    languages: List[dict] = []


class ImportData(BaseModel):
    """导入返回数据"""
    resume: ResumeBase
    raw_text: str
    parsed: ParsedResumeData


class ResumeImportResponse(BaseModel):
    """简历导入响应"""
    code: int = 0
    message: str = "导入成功"
    data: ImportData


class ShareResponse(BaseModel):
    """分享响应"""
    code: int = 0
    data: dict  # {share_token, share_url}


class DeleteResponse(BaseModel):
    """删除响应"""
    code: int = 0
    message: str = "deleted successfully"
