"""
AI 服务模块 - 简历优化功能
与 Go 版本的 ai.go 保持一致
"""
import json
import httpx
from typing import Optional, Dict, Any, List
from config import settings


class AIService:
    """AI 简历优化服务"""

    def __init__(self):
        self.api_url = settings.ANTHROPIC_BASE_URL
        self.api_key = settings.ANTHROPIC_API_KEY
        self.model = "MiniMax-M2.5"
        self.temperature = 0.7
        self.max_tokens = 4096

    def _build_prompt(self, content: str, optim_type: str, target: str = "") -> str:
        """构建提示词

        Args:
            content: 简历内容
            optim_type: 优化类型 (improve/translate/keywords)
            target: 目标语言 (en/zh)
        """
        if optim_type == "translate":
            if target == "en":
                return f"""请将以下简历内容翻译成专业的英文简历，要求：
1. 使用地道的英文表达
2. 保留中文原文的专业术语
3. 按照英文简历的格式习惯调整

简历内容：
{content}"""
            else:
                return f"""请将以下英文简历翻译成中文，要求：
1. 使用专业的中文表达
2. 保留技术术语的英文原词

简历内容：
{content}"""
        elif optim_type == "keywords":
            return f"""请分析以下简历，提取并补充可能遗漏的关键词（特别是技术关键词），这些关键词应该能帮助简历通过ATS系统。请列出需要添加的关键词，并说明原因。

简历内容：
{content}"""
        else:  # improve
            return f"""请优化以下简历，要求：
1. 使用强有力的动词描述成就
2. 量化工作成果（使用具体数字）
3. 突出技术能力和业务价值
4. 保持简洁专业
5. 检查并修正语法错误

简历内容：
{content}"""

    async def _call_api(self, prompt: str) -> str:
        """调用 MiniMax API

        Args:
            prompt: 提示词

        Returns:
            API 返回的优化内容
        """
        if not self.api_key:
            raise ValueError("ANTHROPIC_API_KEY not set")

        messages = [
            {
                "role": "system",
                "content": "你是一个专业的简历优化助手，擅长帮助程序员优化简历。你需要优化简历内容，使其更专业、更有吸引力。注意：1. 使用强有力的动词开头 2. 量化成果 3. 突出技术能力 4. 保持简洁专业"
            },
            {
                "role": "user",
                "content": prompt
            }
        ]

        request_data = {
            "model": self.model,
            "messages": messages,
            "temperature": self.temperature,
            "max_tokens": self.max_tokens
        }

        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.api_key}"
        }

        async with httpx.AsyncClient(timeout=60.0) as client:
            try:
                response = await client.post(
                    self.api_url,
                    json=request_data,
                    headers=headers
                )

                if response.status_code != 200:
                    error_msg = f"API error: {response.status_code} - {response.text}"
                    raise Exception(error_msg)

                result = response.json()

                # 解析 MiniMax API 响应格式
                if "choices" in result and len(result["choices"]) > 0:
                    return result["choices"][0]["message"]["content"]
                elif "choices" in result and len(result["choices"]) == 0:
                    raise Exception("no response from AI")
                else:
                    # 兼容其他可能的响应格式
                    if "text" in result:
                        return result["text"]
                    raise Exception(f"unexpected response format: {result}")

            except httpx.TimeoutException:
                raise Exception("API request timeout")
            except httpx.RequestError as e:
                raise Exception(f"API request failed: {str(e)}")

    async def optimize_resume(
        self,
        resume_data: Dict[str, Any],
        optim_type: str = "improve",
        target: str = ""
    ) -> Dict[str, Any]:
        """优化简历

        Args:
            resume_data: 简历数据（字典格式）
            optim_type: 优化类型
                - improve: 优化简历内容（默认）
                - translate: 翻译简历
                - keywords: 提取/补充关键词
            target: 目标语言（translate 时使用，en 或 zh）

        Returns:
            优化结果字典，包含：
            - success: 是否成功
            - content: 优化后的内容（成功时）
            - error: 错误信息（失败时）
        """
        try:
            # 将简历数据转换为 JSON 字符串
            if isinstance(resume_data, dict):
                content = json.dumps(resume_data, ensure_ascii=False, indent=2)
            else:
                content = str(resume_data)

            # 构建提示词
            prompt = self._build_prompt(content, optim_type, target)

            # 调用 API 获取优化结果
            result = await self._call_api(prompt)

            return {
                "success": True,
                "content": result,
                "type": optim_type
            }

        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "type": optim_type
            }

    async def optimize_resume_from_json(
        self,
        resume_json: str,
        optim_type: str = "improve",
        target: str = ""
    ) -> Dict[str, Any]:
        """从 JSON 字符串优化简历

        Args:
            resume_json: 简历 JSON 字符串
            optim_type: 优化类型
            target: 目标语言

        Returns:
            优化结果
        """
        try:
            # 验证 JSON 格式
            resume_data = json.loads(resume_json)
            return await self.optimize_resume(resume_data, optim_type, target)
        except json.JSONDecodeError as e:
            return {
                "success": False,
                "error": f"Invalid JSON format: {str(e)}",
                "type": optim_type
            }

    async def generate_interview_questions(
        self,
        resume_data: Dict[str, Any],
        job_position: Optional[str] = None,
        question_count: int = 5
    ) -> Dict[str, Any]:
        """生成面试问题

        Args:
            resume_data: 简历数据
            job_position: 目标职位
            question_count: 生成问题数量

        Returns:
            {"code": 0, "message": "", "data": {"questions": [...]}}
        """
        if not self.api_key:
            return {"code": 1, "message": "AI 服务未配置", "data": None}

        try:
            prompt = self._build_interview_prompt(resume_data, job_position, question_count)
            response = await self._call_ai(prompt)

            return {
                "code": 0,
                "message": "问题生成成功",
                "data": {
                    "questions": self._parse_questions(response),
                }
            }
        except Exception as e:
            return {"code": 1, "message": f"问题生成失败: {str(e)}", "data": None}

    async def evaluate_answer(
        self,
        question: str,
        answer: str,
        resume_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """评估面试回答

        Args:
            question: 面试问题
            answer: 回答内容
            resume_data: 简历数据

        Returns:
            {"code": 0, "message": "", "data": {"evaluation": "...", "score": N, "suggestions": [...]}}
        """
        if not self.api_key:
            return {"code": 1, "message": "AI 服务未配置", "data": None}

        try:
            prompt = self._build_evaluation_prompt(question, answer, resume_data)
            response = await self._call_ai(prompt)

            return {
                "code": 0,
                "message": "评估成功",
                "data": {
                    "evaluation": response,
                    "score": self._extract_score(response),
                    "suggestions": [],
                }
            }
        except Exception as e:
            return {"code": 1, "message": f"评估失败: {str(e)}", "data": None}

    async def interview_conversation(
        self,
        resume_data: Dict[str, Any],
        conversation_history: List[Dict[str, str]],
        job_position: Optional[str] = None
    ) -> Dict[str, Any]:
        """面试对话（多轮）

        Args:
            resume_data: 简历数据
            conversation_history: 对话历史 [{"role": "user"/"assistant", "content": "..."}]
            job_position: 目标职位

        Returns:
            {"code": 0, "message": "", "data": {"reply": "...", "next_question": "..."}}
        """
        if not self.api_key:
            return {"code": 1, "message": "AI 服务未配置", "data": None}

        try:
            prompt = self._build_conversation_prompt(
                resume_data,
                conversation_history,
                job_position
            )
            response = await self._call_ai(prompt)

            return {
                "code": 0,
                "message": "",
                "data": {
                    "reply": response,
                    "next_question": self._extract_next_question(response),
                }
            }
        except Exception as e:
            return {"code": 1, "message": f"对话失败: {str(e)}", "data": None}

    async def _call_ai(self, prompt: str) -> str:
        """调用 AI API（用于面试功能）"""
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }

        payload = {
            "model": self.model,
            "messages": [
                {"role": "user", "content": prompt}
            ],
            "temperature": self.temperature,
            "max_tokens": self.max_tokens,
        }

        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                self.api_url,
                headers=headers,
                json=payload
            )

        if response.status_code != 200:
            raise Exception(f"API 调用失败: {response.status_code} - {response.text}")

        result = response.json()
        return result.get("choices", [{}])[0].get("message", {}).get("content", "")

    def _build_interview_prompt(
        self,
        resume_data: Dict[str, Any],
        job_position: Optional[str],
        question_count: int
    ) -> str:
        """构建面试问题生成提示"""
        position_text = f"\n目标职位: {job_position}" if job_position else ""

        return f"""你是一位专业的面试官。请根据以下简历生成面试问题。

简历内容:
{json.dumps(resume_data, ensure_ascii=False, indent=2)}
{position_text}

请生成 {question_count} 个面试问题，包括:
1. 针对简历内容的深入提问
2. 技术能力相关问题
3. 项目经验相关问题
4. 情景行为问题

每个问题请说明考察要点。

请用中文回复。"""

    def _build_evaluation_prompt(
        self,
        question: str,
        answer: str,
        resume_data: Dict[str, Any]
    ) -> str:
        """构建回答评估提示"""
        return f"""你是一位专业的面试官。请评估以下面试回答。

问题: {question}

回答: {answer}

简历摘要:
- 姓名: {resume_data.get('personal_info', {}).get('name', '未知')}
- 职位: {resume_data.get('personal_info', {}).get('title', '未知')}
- 教育: {[e.get('school', '') for e in resume_data.get('education', [])]}
- 经验: {[w.get('company', '') for w in resume_data.get('work_experience', [])]}

请评估:
1. 回答的相关性和准确性
2. 表达能力和逻辑性
3. 与简历描述的匹配度
4. 需要改进的地方

请用中文回复，并给出评分(1-10分)。"""

    def _build_conversation_prompt(
        self,
        resume_data: Dict[str, Any],
        conversation_history: List[Dict[str, str]],
        job_position: Optional[str]
    ) -> str:
        """构建对话提示"""
        position_text = f"\n目标职位: {job_position}" if job_position else ""

        history_text = "\n".join([
            f"{'面试官' if msg['role'] == 'assistant' else '候选人'}: {msg['content']}"
            for msg in conversation_history[-5:]  # 只取最近5轮
        ])

        return f"""你是一位专业的面试官，正在对候选人进行面试。

简历摘要:
- 姓名: {resume_data.get('personal_info', {}).get('name', '未知')}
- 职位: {resume_data.get('personal_info', {}).get('title', '未知')}
- 教育: {[e.get('school', '') for e in resume_data.get('education', [])]}
- 经验: {[w.get('company', '') for w in resume_data.get('work_experience', [])]}
- 技能: {[s.get('category', '') for s in resume_data.get('skills', [])]}
{position_text}

对话历史:
{history_text}

请继续面试，可以:
1. 基于简历内容深入提问
2. 对候选人的回答进行点评
3. 提出下一个问题

请用中文回复。"""

    def _parse_questions(self, response: str) -> List[Dict[str, str]]:
        """解析 AI 返回的问题列表"""
        questions = []
        lines = response.split("\n")

        current_question = None
        current_focus = []

        for line in lines:
            line = line.strip()
            if not line:
                continue

            # 检测问题行
            if any(line.startswith(f"{i}.") for i in range(1, 20)):
                if current_question:
                    questions.append({
                        "question": current_question,
                        "focus": " ".join(current_focus)
                    })
                # 提取问题内容（去掉序号）
                parts = line.split(".", 1)
                if len(parts) > 1:
                    current_question = parts[1].strip()
                    current_focus = []
            elif current_question and "考察" in line:
                # 提取考察要点
                focus = line.replace("考察", "").replace("要点", "").strip(":-： ")
                current_focus.append(focus)

        if current_question:
            questions.append({
                "question": current_question,
                "focus": " ".join(current_focus)
            })

        return questions

    def _extract_score(self, response: str) -> int:
        """从评估回复中提取评分"""
        import re

        # 尝试匹配 "评分: 8分" 或 "评分 8" 等格式
        patterns = [
            r'评分[:：]\s*(\d+)',
            r'得分[:：]\s*(\d+)',
            r'(\d+)\s*/\s*10',
            r'(\d+)\s*分',
        ]

        for pattern in patterns:
            match = re.search(pattern, response)
            if match:
                score = int(match.group(1))
                if 1 <= score <= 10:
                    return score

        return 5  # 默认评分

    def _extract_next_question(self, response: str) -> str:
        """从对话回复中提取下一个问题"""
        lines = response.split("\n")

        for line in lines:
            line = line.strip()
            # 查找问题标记
            if "问题" in line and "?" in line:
                # 提取问题部分
                if ":" in line:
                    parts = line.split(":", 1)
                    if len(parts) > 1:
                        return parts[1].strip()
                return line

        # 如果没有找到明确的问题，返回最后一段话
        non_empty_lines = [l.strip() for l in lines if l.strip()]
        if non_empty_lines:
            return non_empty_lines[-1]

        return ""


# 全局单例
ai_service = AIService()


async def optimize_resume(
    resume_data: Dict[str, Any],
    optim_type: str = "improve",
    target: str = ""
) -> Dict[str, Any]:
    """便捷函数：优化简历

    与 Go 版本的 OptimizeWithAI 函数对应
    """
    return await ai_service.optimize_resume(resume_data, optim_type, target)