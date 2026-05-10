"""
模拟面试路由

API 端点:
POST /api/v1/interview/start - 开始面试（基于简历生成问题）
POST /api/v1/interview/answer - 提交回答并获取评估
POST /api/v1/interview/next - 获取下一个问题
GET /api/v1/interview/records - 获取面试记录列表
GET /api/v1/interview/records/:id - 获取面试记录详情
"""
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
import json
import time

from database import get_db
from middleware.auth import auth_required
from models.interview_record import InterviewRecord

router = APIRouter(prefix="/api/v1/interview", tags=["面试"])


class InterviewStartRequest(BaseModel):
    """开始面试请求"""
    resume_id: int = Field(..., description="简历ID")
    job_position: Optional[str] = Field(None, description="目标职位")
    question_count: int = Field(5, ge=1, le=20, description="问题数量")


class InterviewAnswerRequest(BaseModel):
    """回答问题请求"""
    session_id: str = Field(..., description="会话ID")
    question_index: int = Field(0, description="问题索引")
    answer: str = Field(..., description="回答内容")


class InterviewQuestion(BaseModel):
    """面试问题"""
    id: int
    question: str
    focus: str  # 考察要点
    standard_answer: Optional[str] = None  # 标准答案（后续给出）


class InterviewStartResponse(BaseModel):
    """开始面试响应"""
    code: int = 0
    message: str = "面试已开始"
    data: Optional[Dict[str, Any]] = None


# 模拟数据存储（生产环境应使用数据库）
_interview_sessions: Dict[str, Dict[str, Any]] = {}


@router.post("/start", response_model=InterviewStartResponse)
async def start_interview(
    req: InterviewStartRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(auth_required),
):
    """开始模拟面试

    基于简历生成面试问题
    """
    from services.ai_service import ai_service
    from services import resume_service

    user_id = int(user.get("user_id", 0))

    # 获取简历数据
    result = await resume_service.get_resume(
        db=db,
        resume_id=req.resume_id,
        user_id=user_id
    )

    if result.get("code") != 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"code": 1, "message": "简历不存在"}
        )

    resume_data = result.get("data", {})

    # 解析 JSON 字段
    personal_info = {}
    work_experience = []
    projects = []
    education = []
    skills = []

    try:
        if resume_data.get("personal_info"):
            personal_info = json.loads(resume_data["personal_info"])
        if resume_data.get("work_experience"):
            work_experience = json.loads(resume_data["work_experience"])
        if resume_data.get("projects"):
            projects = json.loads(resume_data["projects"])
        if resume_data.get("education"):
            education = json.loads(resume_data["education"])
        if resume_data.get("skills"):
            skills = json.loads(resume_data["skills"])
    except json.JSONDecodeError:
        pass

    # 构建简历数据字典
    resume_dict = {
        "personal_info": personal_info,
        "work_experience": work_experience,
        "projects": projects,
        "education": education,
        "skills": skills,
    }

    # 生成面试问题
    try:
        prompt = _build_interview_prompt(resume_dict, req.job_position, req.question_count)
        response = await ai_service._call_api(prompt)

        # 解析问题
        questions = _parse_interview_questions(response, req.question_count)

        # 创建会话
        session_id = f"{user_id}_{req.resume_id}_{int(time.time())}"
        _interview_sessions[session_id] = {
            "user_id": user_id,
            "resume_id": req.resume_id,
            "resume_data": resume_dict,
            "job_position": req.job_position,
            "questions": questions,
            "current_index": 0,
            "answers": [],
            "db_record_id": None,  # 后续会更新
        }

        # 保存面试记录到数据库
        record = InterviewRecord(
            user_id=user_id,
            resume_id=req.resume_id,
            session_id=session_id,
            job_position=req.job_position,
            resume_title=resume_data.get("title", "简历"),
            total_questions=len(questions),
            overall_score=0,
            status="in_progress",
        )
        db.add(record)
        await db.commit()
        await db.refresh(record)

        # 更新会话中的记录ID
        _interview_sessions[session_id]["db_record_id"] = record.id

        return {
            "code": 0,
            "message": "面试已开始",
            "data": {
                "session_id": session_id,
                "resume_title": resume_data.get("title", "简历"),
                "question_count": len(questions),
                "current_question": questions[0] if questions else None,
                "job_position": req.job_position,
            }
        }

    except Exception as e:
        return {
            "code": 1,
            "message": f"面试启动失败: {str(e)}",
            "data": None
        }


@router.post("/answer")
async def submit_answer(
    req: InterviewAnswerRequest,
    user: dict = Depends(auth_required),
    db: AsyncSession = Depends(get_db),
):
    """提交回答并获取评估

    返回回答评估、标准答案和改进建议
    """
    from services.ai_service import ai_service

    session_id = req.session_id
    answer = req.answer
    question_index = req.question_index

    if not session_id or session_id not in _interview_sessions:
        return {"code": 1, "message": "会话不存在或已过期", "data": None}

    session = _interview_sessions[session_id]

    if question_index >= len(session["questions"]):
        return {"code": 1, "message": "问题已回答完毕", "data": None}

    current_q = session["questions"][question_index]

    # 生成评估和标准答案
    try:
        prompt = _build_evaluation_prompt(
            current_q["question"],
            answer,
            session["resume_data"]
        )
        evaluation = await ai_service._call_api(prompt)

        # 生成标准答案
        standard_prompt = _build_standard_answer_prompt(
            current_q["question"],
            session["resume_data"]
        )
        standard_answer = await ai_service._call_api(standard_prompt)

        # 提取评分
        score = _extract_score(evaluation)

        # 保存回答到数据库
        if session.get("db_record_id"):
            result = await db.execute(
                select(InterviewRecord).where(InterviewRecord.id == session["db_record_id"])
            )
            record = result.scalar_one_or_none()
            if record:
                answers_list = record.answers or []
                answers_list.append({
                    "question": current_q["question"],
                    "focus": current_q["focus"],
                    "answer": answer,
                    "score": score,
                    "evaluation": evaluation,
                    "standard_answer": standard_answer,
                })
                record.answers = answers_list
                await db.commit()

        return {
            "code": 0,
            "message": "评估完成",
            "data": {
                "question": current_q["question"],
                "focus": current_q["focus"],
                "your_answer": answer,
                "evaluation": evaluation,
                "score": score,
                "standard_answer": standard_answer,
                "has_next": question_index + 1 < len(session["questions"]),
                "next_index": question_index + 1 if question_index + 1 < len(session["questions"]) else None,
            }
        }

    except Exception as e:
        return {"code": 1, "message": f"评估失败: {str(e)}", "data": None}


@router.post("/next")
async def get_next_question(
    request: Request,
    user: dict = Depends(auth_required),
    db: AsyncSession = Depends(get_db),
):
    """获取下一个问题"""
    body = await request.json()
    session_id = body.get("session_id")
    current_index = body.get("current_index", 0)

    if not session_id or session_id not in _interview_sessions:
        return {"code": 1, "message": "会话不存在或已过期", "data": None}

    session = _interview_sessions[session_id]

    if current_index >= len(session["questions"]):
        # 计算最终评分（转换为5星制）
        overall_score = 0
        if session.get("db_record_id"):
            result = await db.execute(
                select(InterviewRecord).where(InterviewRecord.id == session["db_record_id"])
            )
            record = result.scalar_one_or_none()
            if record:
                # 计算最终评分（转换为5星制）
                total_score = 0
                answers_list = record.answers or []
                for ans in answers_list:
                    total_score += ans.get("score", 0)
                avg_score = total_score / len(answers_list) if answers_list else 7
                # 转换为5星制：10分制 -> 5星
                overall_score = round(avg_score / 2)

                record.status = "completed"
                record.overall_score = overall_score
                record.summary = f"共{len(session['questions'])}题，平均得分{avg_score:.1f}/10"
                await db.commit()

        return {
            "code": 0,
            "message": "面试已完成",
            "data": {
                "completed": True,
                "total": len(session["questions"]),
                "overall_score": overall_score,
                "summary": _generate_summary(session),
            }
        }

    next_q = session["questions"][current_index]

    return {
        "code": 0,
        "message": "",
        "data": {
            "current_index": current_index,
            "total": len(session["questions"]),
            "question": next_q,
            "completed": current_index >= len(session["questions"]),
        }
    }


@router.get("/history/{session_id}")
async def get_interview_history(
    session_id: str,
    request: Request,
    user: dict = Depends(auth_required),
):
    """获取面试历史"""
    if session_id not in _interview_sessions:
        return {"code": 1, "message": "会话不存在", "data": None}

    session = _interview_sessions[session_id]

    return {
        "code": 0,
        "message": "",
        "data": {
            "resume_title": session.get("resume_title", "简历"),
            "job_position": session.get("job_position"),
            "total_questions": len(session["questions"]),
            "answered": len(session["answers"]),
            "questions": session["questions"],
        }
    }


@router.get("/records")
async def get_interview_records(
    request: Request,
    user: dict = Depends(auth_required),
    db: AsyncSession = Depends(get_db),
):
    """获取面试记录列表"""
    user_id = int(user.get("user_id", 0))

    result = await db.execute(
        select(InterviewRecord)
        .where(InterviewRecord.user_id == user_id)
        .order_by(desc(InterviewRecord.created_at))
    )
    records = result.scalars().all()

    return {
        "code": 0,
        "message": "",
        "data": [
            {
                "id": r.id,
                "resume_title": r.resume_title,
                "job_position": r.job_position,
                "total_questions": r.total_questions,
                "overall_score": r.overall_score,
                "status": r.status,
                "created_at": r.created_at.isoformat() if r.created_at else None,
            }
            for r in records
        ]
    }


@router.get("/records/{record_id}")
async def get_interview_record(
    record_id: int,
    request: Request,
    user: dict = Depends(auth_required),
    db: AsyncSession = Depends(get_db),
):
    """获取面试记录详情"""
    user_id = int(user.get("user_id", 0))

    result = await db.execute(
        select(InterviewRecord).where(
            InterviewRecord.id == record_id,
            InterviewRecord.user_id == user_id
        )
    )
    record = result.scalar_one_or_none()

    if not record:
        return {"code": 1, "message": "记录不存在", "data": None}

    return {
        "code": 0,
        "message": "",
        "data": {
            "id": record.id,
            "session_id": record.session_id,
            "resume_title": record.resume_title,
            "job_position": record.job_position,
            "total_questions": record.total_questions,
            "overall_score": record.overall_score,
            "answers": record.answers or [],
            "summary": record.summary,
            "status": record.status,
            "created_at": record.created_at.isoformat() if record.created_at else None,
        }
    }


def _build_interview_prompt(
    resume_data: Dict[str, Any],
    job_position: Optional[str],
    question_count: int
) -> str:
    """构建面试问题生成提示

    设计原则：
    1. 问题类型覆盖：技术深度、项目实战、场景行为、职业规划
    2. 问题要结合候选人的真实背景，不能泛泛而谈
    3. 每个问题包含：标准答案、评分标准、追问方向
    """
    import json

    personal = resume_data.get("personal_info", {})
    work_exp = resume_data.get("work_experience", [])
    projects = resume_data.get("projects", [])
    education = resume_data.get("education", [])
    skills = resume_data.get("skills", [])

    # 提取技能关键词
    skill_text = ""
    if skills:
        for s in skills[:5]:
            if isinstance(s, dict):
                skill_text += f"- {s.get('category', '')}: {s.get('items', [])}\n"

    # 格式化工作经历
    work_exp_text = ""
    for w in work_exp:
        company = w.get('company', '')
        position = w.get('position', '')
        description = w.get('description', '')
        achievements = w.get('achievements', [])
        work_exp_text += f"- {company} | {position}\n  描述: {description}\n  成就: {', '.join(achievements)}\n"

    # 格式化项目经验
    projects_text = ""
    for p in projects:
        name = p.get('name', '')
        role = p.get('role', '')
        tech = p.get('technologies', [])
        description = p.get('description', '')
        projects_text += f"- {name} | {role}\n  技术: {', '.join(tech)}\n  描述: {description}\n"

    position_text = f"\n目标职位: {job_position}" if job_position else "目标职位: 未指定"

    return f"""你是一位资深技术面试官，拥有10年以上互联网公司面试经验。你正在为候选人进行模拟面试。

## 候选人背景
- 姓名: {personal.get('name', '未知')}
- 目标职位: {job_position or '未指定'}
- 技术栈:
{skill_text or '暂无'}

## 工作经历
{work_exp_text or '暂无'}

## 项目经验
{projects_text or '暂无'}

## 教育背景
{', '.join([e.get('school', '') + ' ' + e.get('degree', '') for e in education[:3]]) or '暂无'}

---

## 问题生成要求

请根据候选人的背景，生成 {question_count} 个专业的技术面试问题。

### 问题类型分配（必须覆盖）
1. **技术深度题** (30%) - 考察对技术的理解深度，从简历中的技术栈出发
2. **项目实战题** (40%) - 考察项目经验的真实性和深度，结合简历中的项目
3. **场景行为题** (20%) - 考察解决问题的能力和团队协作（STAR法则场景）
4. **离职动机/职业规划题** (10%) - 考察求职动机和稳定性

### 技术题生成策略
- 针对每项核心技术栈，生成1-2道深度问题
- 从简历中提到的技术点挖掘追问
- 问题要有区分度，能看出候选人的真实水平

### 项目题生成策略
- 从简历中选取2-3个最有价值的项目
- 围绕项目中的难点、技术决策、团队协作提问
- 使用 STAR 法则设定场景（Situation, Task, Action, Result）

---

## 输出格式（严格按 JSON 返回，不要有其他内容）

{{
    "questions": [
        {{
            "type": "technical|project|behavior|career",
            "question": "问题内容",
            "focus": "考察要点/面试官关注点",
            "difficulty": "easy|medium|hard",
            "key_points": ["回答要点1", "回答要点2", "回答要点3"],
            "standard_answer": "标准答案（200-400字，包含回答框架和参考示例）",
            "scoring": {{
                "excellent": "9-10分：完整回答所有要点，有深度和独到见解",
                "good": "7-8分：回答大部分要点，有一定深度",
                "fair": "5-6分：只能回答基本要点，缺乏深度"
            }},
            "follow_up_questions": ["追问方向1", "追问方向2"]
        }}
    ]
}}

---

## 注意事项
1. 问题要结合候选人的真实经历，从简历内容出发
2. 技术问题要有明确的技术关键词作为判分标准
3. 标准答案要专业、详细，具有实际参考价值
4. 所有问题必须用中文
5. 只返回 JSON，不要有任何其他内容"""


def _build_evaluation_prompt(
    question: str,
    answer: str,
    resume_data: Dict[str, Any]
) -> str:
    """构建回答评估提示

    设计原则：
    1. 多维度打分：相关性、技术深度、逻辑性、深度广度
    2. 结合候选人背景评估
    3. 给出具体改进建议
    """
    personal = resume_data.get("personal_info", {})
    skills = resume_data.get("skills", [])
    work_exp = resume_data.get("work_experience", [])

    # 提取技能关键词
    skill_text = ""
    if skills:
        for s in skills[:3]:
            if isinstance(s, dict):
                skill_text += f"- {s.get('category', '')}: {s.get('items', [])}\n"

    return f"""你是一位资深技术面试官，拥有10年以上互联网公司面试经验。你正在评估候选人的面试回答。

## 面试问题
{question}

## 候选人回答
{answer}

## 候选人背景
- 姓名: {personal.get('name', '未知')}
- 目标职位: {personal.get('title', '未知')}
- 技术栈:
{skill_text or '暂无'}

---

## 评估维度（每项必须打分）

### 1. 相关性 (0-25分)
- 回答是否切中问题核心
- 有没有跑题或答非所问

### 2. 技术深度 (0-25分)
- 能否准确描述技术细节
- 是否有实际经验支撑
- 能否举一反三

### 3. 逻辑性 (0-25分)
- 表达是否清晰有条理
- 回答框架是否合理（STAR法则）
- 前后是否一致

### 4. 深度广度 (0-25分)
- 是否有独到见解
- 能否触类旁通
- 展现的技术视野

---

## 评分标准
- 90-100分：回答完美，展现深厚的技术功底和项目经验，表达清晰有条理
- 80-89分：回答完整，有一定深度，逻辑清晰
- 70-79分：基本正确，但深度不够或表达欠清晰
- 60-69分：只能回答部分要点，缺乏深度
- 60分以下：跑题或答非所问，技术理解有严重偏差

---

## 输出格式（严格按 JSON 返回，不要有其他内容）

{{
    "total_score": N,
    "dimension_scores": {{
        "relevance": {{"score": N, "max": 25, "comment": "简短评语"}},
        "technical_depth": {{"score": N, "max": 25, "comment": "简短评语"}},
        "logic": {{"score": N, "max": 25, "comment": "简短评语"}},
        "breadth": {{"score": N, "max": 25, "comment": "简短评语"}}
    }},
    "strengths": ["优点1", "优点2"],
    "weaknesses": ["不足1", "不足2"],
    "improvement_tips": ["改进建议1", "改进建议2"],
    "detailed_feedback": "详细的逐点评语（100-200字）"
}}

---

## 注意事项
1. 评分要客观公正，结合候选人背景
2. 优点和不足要具体，不能泛泛而谈
3. 改进建议要可操作，有针对性
4. 只返回 JSON，不要有任何其他内容"""


def _build_standard_answer_prompt(
    question: str,
    resume_data: Dict[str, Any]
) -> str:
    """构建标准答案生成提示

    设计原则：
    1. 结合候选人背景生成针对性答案
    2. 详细的回答框架和评分标准
    3. 提供追问方向
    """
    personal = resume_data.get("personal_info", {})
    work_exp = resume_data.get("work_experience", [])
    projects = resume_data.get("projects", [])

    # 格式化工作经历
    work_exp_text = ""
    for w in work_exp[:3]:
        company = w.get('company', '')
        position = w.get('position', '')
        work_exp_text += f"- {company} | {position}\n"

    # 格式化项目
    projects_text = ""
    for p in projects[:3]:
        name = p.get('name', '')
        role = p.get('role', '')
        tech = p.get('technologies', [])
        projects_text += f"- {name} ({role}) | 技术: {', '.join(tech)}\n"

    return f"""你是一位资深技术面试官，拥有10年以上的面试官经验。你正在为面试问题生成标准答案参考。

## 面试问题
{question}

## 候选人背景
- 目标职位: {personal.get('title', '未知')}
- 技术栈: {personal.get('summary', '')[:200]}

## 工作经历
{work_exp_text or '暂无'}

## 项目经验
{projects_text or '暂无'}

---

## 标准答案要求

请生成一份详细、专业的标准答案，包含以下内容：

### 1. 回答框架
- 开场：简述自己的理解（约20字）
- 主体：分点回答，每个要点要详细展开
- 结尾：总结或延伸（约50字）

### 2. 参考答案示例
提供一段完整的参考回答（200-400字），包含：
- 实际的技术细节
- 真实的项目经验
- 可落地的解决方案

### 3. 评分标准
- **优秀 (9-10分)**：回答完整且有深度，包含具体技术细节和项目案例，表达清晰有条理
- **良好 (7-8分)**：回答基本完整，有一定深度，但缺乏具体案例或表达不够清晰
- **及格 (5-6分)**：只能回答基本要点，缺乏深度和具体案例支撑
- **不及格 (<5分)**：跑题、技术理解错误、无法回答

### 4. 追问方向
列出2-3个可能的追问方向，帮助面试官深入考察

---

## 输出格式（严格按 JSON 返回，不要有其他内容）

{{
    "answer_framework": "回答框架说明（100字左右）",
    "sample_answer": "参考答案（200-400字）",
    "scoring": {{
        "excellent": "9-10分标准描述",
        "good": "7-8分标准描述",
        "fair": "5-6分标准描述",
        "poor": "<5分标准描述"
    }},
    "follow_up_questions": ["追问1", "追问2", "追问3"]
}}

---

## 注意事项
1. 答案要结合候选人的实际背景，不能泛泛而谈
2. 技术细节要准确、真实
3. 要有实操性，不是理论空谈
4. 只返回 JSON，不要有任何其他内容"""


def _parse_interview_questions(response: str, count: int) -> List[Dict[str, str]]:
    """解析 AI 返回的问题列表

    支持新格式：
    {
        "questions": [
            {
                "type": "technical|project|behavior|career",
                "question": "问题内容",
                "focus": "考察要点",
                "difficulty": "easy|medium|hard",
                "key_points": ["要点1", "要点2"],
                "standard_answer": "标准答案",
                "scoring": {...},
                "follow_up_questions": ["追问1", "追问2"]
            }
        ]
    }
    """
    import json
    import re

    # 尝试解析 JSON
    json_str = response.strip()
    if json_str.startswith("```"):
        json_str = re.sub(r'^```json\s*', '', json_str, flags=re.MULTILINE)
        json_str = re.sub(r'\s*```$', '', json_str, flags=re.MULTILINE)

    try:
        data = json.loads(json_str)
        questions = data.get("questions", [])
        if questions:
            return [
                {
                    "type": q.get("type", "technical"),
                    "question": q.get("question", ""),
                    "focus": q.get("focus", "综合能力"),
                    "difficulty": q.get("difficulty", "medium"),
                    "key_points": q.get("key_points", []),
                    "standard_answer": q.get("standard_answer", ""),
                    "scoring": q.get("scoring", {}),
                    "follow_up_questions": q.get("follow_up_questions", []),
                }
                for q in questions[:count]
            ]
    except json.JSONDecodeError:
        pass

    # 备用解析：按行分割（旧格式兼容）
    questions = []
    lines = response.split("\n")

    current_q = None
    current_type = "technical"
    current_focus = ""
    current_answer = ""
    current_difficulty = "medium"
    current_key_points = []
    current_follow_ups = []

    for line in lines:
        line = line.strip()
        if not line:
            continue

        # 检测问题行（数字开头）
        num_match = re.match(r'^(\d+)[\.、：:]\s*(.+)$', line)
        if num_match:
            if current_q:
                questions.append({
                    "type": current_type,
                    "question": current_q,
                    "focus": current_focus or "综合能力",
                    "difficulty": current_difficulty,
                    "key_points": current_key_points,
                    "standard_answer": current_answer or "参考简历内容回答",
                    "scoring": {},
                    "follow_up_questions": current_follow_ups,
                })

            current_q = num_match.group(2)
            current_type = "technical"
            current_focus = ""
            current_answer = ""
            current_difficulty = "medium"
            current_key_points = []
            current_follow_ups = []
        elif current_q:
            if "考察" in line or "要点" in line:
                current_focus = line.replace("考察", "").replace("要点", "").strip(":-： ")
            elif "难度" in line:
                if "简单" in line or "easy" in line.lower():
                    current_difficulty = "easy"
                elif "困难" in line or "hard" in line.lower():
                    current_difficulty = "hard"
                else:
                    current_difficulty = "medium"
            elif current_answer:
                current_answer += "\n" + line
            elif len(line) > 20:  # 可能是答案的一部分
                current_answer = line

    if current_q:
        questions.append({
            "type": current_type,
            "question": current_q,
            "focus": current_focus or "综合能力",
            "difficulty": current_difficulty,
            "key_points": current_key_points,
            "standard_answer": current_answer or "参考简历内容回答",
            "scoring": {},
            "follow_up_questions": current_follow_ups,
        })

    return questions[:count] if questions else [{"type": "behavior", "question": "请介绍一下你自己以及你的项目经验", "focus": "表达能力", "difficulty": "medium", "key_points": [], "standard_answer": "简要介绍自己的背景、技术栈和代表项目经验", "scoring": {}, "follow_up_questions": []}]


def _extract_score(evaluation: str) -> int:
    """从评估中提取评分"""
    import re

    patterns = [
        r'评分[:：]\s*(\d+)',
        r'得分[:：]\s*(\d+)',
        r'(\d+)\s*/\s*10',
        r'(\d+)\s*分',
        r'综合评分[:：]\s*(\d+)',
    ]

    for pattern in patterns:
        match = re.search(pattern, evaluation)
        if match:
            score = int(match.group(1))
            if 1 <= score <= 10:
                return score

    return 7  # 默认评分


def _generate_summary(session: Dict[str, Any]) -> Dict[str, Any]:
    """生成面试总结"""
    total = len(session["questions"])
    answered = len(session.get("answers", []))

    return {
        "total_questions": total,
        "answered_questions": answered,
        "session_duration": "约15分钟",
        "overall_score": 7,  # 简化处理
        "recommendation": "建议继续完善项目经验的描述",
    }