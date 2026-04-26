"""
Resume 模型 - 与 Go 版本的 Resume 表结构一致
"""
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey, func
from sqlalchemy.dialects.mysql import JSON
from database import Base


class Resume(Base):
    """简历表"""
    __tablename__ = "resumes"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String(200), default="我的简历")
    theme_id = Column(Integer, default=0)
    resume_type = Column(String(50), default="full")
    is_default = Column(Boolean, default=False)
    status = Column(String(20), default="draft")

    # 简历各部分内容 (JSON 格式存储)
    personal_info = Column(JSON, default=dict)
    education = Column(JSON, default=list)
    work_experience = Column(JSON, default=list)
    projects = Column(JSON, default=list)
    skills = Column(JSON, default=list)
    awards = Column(JSON, default=list)
    languages = Column(JSON, default=list)

    # 分享功能
    share_token = Column(String(100), unique=True, nullable=True, index=True)
    share_expires_at = Column(DateTime, nullable=True)

    # 时间戳
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
