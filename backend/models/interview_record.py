"""
面试记录模型
"""
from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey, func, JSON
from database import Base


class InterviewRecord(Base):
    """面试记录表"""
    __tablename__ = "interview_records"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    resume_id = Column(Integer, ForeignKey("resumes.id"), nullable=True)

    # 面试基本信息
    session_id = Column(String(100), unique=True, nullable=False, index=True)
    job_position = Column(String(200), nullable=True)
    resume_title = Column(String(200), nullable=True)

    # 问题统计
    total_questions = Column(Integer, default=0)

    # 每道题的回答和评分
    answers = Column(JSON, default=list)  # [{"question": "", "answer": "", "score": 8, "evaluation": ""}, ...]

    # 最终评分 (1-5星)
    overall_score = Column(Integer, default=0)

    # 总结
    summary = Column(Text, nullable=True)

    # 状态
    status = Column(String(20), default="in_progress")  # in_progress, completed

    # 时间戳
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())