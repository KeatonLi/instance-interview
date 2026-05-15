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

        设计原则：
        1. 针对不同内容类型有专门的优化策略
        2. 强调量化、关键词、专业表达
        3. 输出格式统一为 JSON

        Args:
            content: 简历内容
            optim_type: 优化类型 (improve/translate/keywords)
            target: 目标语言 (en/zh)
        """
        if optim_type == "translate":
            if target == "en":
                return f"""你是一位专业的英文简历翻译专家。请将以下中文简历翻译成专业的英文简历。

## 翻译要求
1. 使用地道的英文表达，符合英文简历格式习惯
2. 保留中文原文的专业术语（如技术名词、公司名称）
3. 适当调整语序，使其更符合英文表达逻辑
4. 保持简洁，每行不超过两行

## 简历内容
{content}

## 输出格式（严格按 JSON 返回）
{{
    "translated": "翻译后的英文简历内容",
    "notes": ["注意事项1", "注意事项2"]
}}

只返回 JSON，不要有其他内容。"""
            else:
                return f"""你是一位专业的中文简历翻译专家。请将以下英文简历翻译成专业的中文简历。

## 翻译要求
1. 使用专业的中文表达，符合中文简历格式习惯
2. 保留技术术语的英文原词（如技术框架、开源项目）
3. 适当调整语序，使其更符合中文表达逻辑
4. 保持简洁，每行不超过两行

## 简历内容
{content}

## 输出格式（严格按 JSON 返回）
{{
    "translated": "翻译后的中文简历内容",
    "notes": ["注意事项1", "注意事项2"]
}}

只返回 JSON，不要有其他内容。"""
        elif optim_type == "keywords":
            return f"""你是一位专业的 ATS 简历优化专家。请分析以下简历，提取并补充可能遗漏的关键词。

## ATS 关键词优化要求
1. 分析现有简历内容，识别缺失的关键技术词
2. 添加职位描述中常见的关键词（如 React, TypeScript, Node.js 等）
3. 补充常见的软技能关键词（如团队协作、项目管理）
4. 确保关键词自然融入内容，不要堆砌

## 简历内容
{content}

## 输出格式（严格按 JSON 返回）
{{
    "current_keywords": ["现有关键词1", "现有关键词2"],
    "missing_keywords": ["缺失关键词1", "缺失关键词2"],
    "suggestions": ["补充建议1", "补充建议2"]
}}

只返回 JSON，不要有其他内容。"""
        else:  # improve
            return f"""你是一位专业的简历优化专家，擅长帮助程序员提升简历质量。你有10年以上互联网行业 HR 和技术面试官经验。

## 简历内容
{content}

---

## 优化要求

### 1. 措辞优化
- 使用强有力的动词开头（如：主导、负责、设计、实现、优化、构建）
- 避免弱化词（如：参与、协助、了解、熟悉）
- 删除冗余词汇，保留核心信息

### 2. 成就量化
- 量化工作成果（使用具体数字和百分比）
- 突出业绩和贡献
- 对比改进前后的差异

### 3. 关键词增强
- 添加技术关键词，提升 ATS 系统通过率
- 突出核心技术能力
- 使用行业标准术语

### 4. 专业表达
- 使用专业的中文表达
- 保持简洁，每条描述控制在50字以内
- 数据和成果放前面

---

## 输出格式（严格按 JSON 返回）

{{
    "optimized": "优化后的内容",
    "improvements": [
        {{"type": "wording|quantify|keywords", "before": "原文", "after": "修改后", "reason": "原因"}}
    ]
}}

只返回 JSON，不要有其他内容。"""

    async def chat(
        self,
        messages: List[Dict[str, str]],
        temperature: float = 0.7,
        max_tokens: int = 4096,
        timeout: float = 120.0,
    ) -> str:
        """通用 LLM 调用（MiniMax M2.5，OpenAI 兼容格式）

        Args:
            messages: [{"role":"system","content":"..."}, {"role":"user","content":"..."}]
            temperature: 生成温度
            max_tokens: 最大 token 数
            timeout: 超时秒数

        Returns:
            LLM 回复的文本内容
        """
        if not self.api_key:
            raise ValueError("ANTHROPIC_API_KEY 未配置，请在 .env 中设置")

        request_data = {
            "model": self.model,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens
        }

        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.api_key}"
        }

        async with httpx.AsyncClient(timeout=timeout) as client:
            response = await client.post(
                self.api_url,
                json=request_data,
                headers=headers
            )

            if response.status_code != 200:
                error_msg = f"MiniMax API error: HTTP {response.status_code} - {response.text[:300]}"
                raise RuntimeError(error_msg)

            result = response.json()
            if "choices" in result and len(result["choices"]) > 0:
                return result["choices"][0]["message"]["content"]
            elif "choices" in result and len(result["choices"]) == 0:
                raise RuntimeError("MiniMax 返回空响应")
            else:
                raise RuntimeError(f"Unexpected API response: {result}")

    async def _call_api(self, prompt: str) -> str:
        """内部方法：简历优化专用 LLM 调用（保持向后兼容）"""
        return await self.chat(
            messages=[
                {
                    "role": "system",
                    "content": "你是一个专业的简历优化助手，擅长帮助程序员优化简历。你需要优化简历内容，使其更专业、更有吸引力。注意：1. 使用强有力的动词开头 2. 量化成果 3. 突出技术能力 4. 保持简洁专业"
                },
                {"role": "user", "content": prompt}
            ],
            temperature=self.temperature,
            max_tokens=self.max_tokens,
            timeout=60.0,
        )

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


async def optimize_single_content(
    content: str,
    content_type: str,
    optimize_type: str = "all"
) -> Dict[str, Any]:
    """优化单条简历内容

    Args:
        content: 要优化的内容文本
        content_type: 内容类型 (work_experience, project, education, award)
        optimize_type: 优化类型 (wording, keywords, quantify, all)

    Returns:
        {
            "original": str,  # 原文
            "optimized": str, # 优化后内容
            "changes": List[str] # 优化点说明
        }
    """
    # 内容类型配置
    type_config = {
        "work_experience": {
            "label": "工作经历",
            "focus": "职责、成就、技术贡献",
            "strategy": "突出个人贡献，量化成果，使用STAR法则描述"
        },
        "project": {
            "label": "项目经验",
            "focus": "项目亮点、个人角色、技术实现",
            "strategy": "突出项目难点和个人创新，使用技术术语"
        },
        "education": {
            "label": "教育背景",
            "focus": "学术成就、专业相关课程",
            "strategy": "简化学历描述，突出与职位相关的部分"
        },
        "award": {
            "label": "荣誉奖项",
            "focus": "奖项级别、获奖难度、竞争人数",
            "strategy": "突出奖项含金量，量化竞争规模"
        },
    }

    config = type_config.get(content_type, {
        "label": "简历内容",
        "focus": "内容优化",
        "strategy": "专业、简洁、有吸引力"
    })

    # 优化类型配置
    optimize_config = {
        "wording": {
            "title": "措辞优化",
            "instructions": [
                "使用强有力的动词开头（主导、负责、设计、实现、优化、构建）",
                "避免弱化词（参与、协助、了解、熟悉）",
                "删除冗余词汇，保留核心信息",
                "每条描述控制在50字以内"
            ]
        },
        "keywords": {
            "title": "关键词增强",
            "instructions": [
                "添加技术关键词，提升ATS通过率",
                "突出核心技术能力（React, Node.js, Python等）",
                "使用行业标准术语",
                "避免堆砌关键词"
            ]
        },
        "quantify": {
            "title": "成就量化",
            "instructions": [
                "量化工作成果（使用具体数字和百分比）",
                "突出业绩和贡献（如：提升50%性能）",
                "对比改进前后的差异",
                "数据放前面，成果放明显位置"
            ]
        },
        "all": {
            "title": "综合优化",
            "instructions": [
                "措辞优化：使用强动词，专业简洁",
                "关键词增强：添加技术关键词，提升ATS通过率",
                "成就量化：量化成果，突出业绩",
                "数据和成果放前面"
            ]
        },
    }

    opt_cfg = optimize_config.get(optimize_type, optimize_config["all"])

    prompt = f"""你是一位专业的简历优化专家，擅长帮助程序员提升简历质量。你有10年以上互联网行业 HR 和技术面试官经验。

## 优化任务
优化以下 {config['label']} 的描述。

## 内容类型
{config['label']} - 重点关注：{config['focus']}

## 优化策略
{config['strategy']}

## 优化类型
{opt_cfg['title']}

## 优化指令
{" ".join(opt_cfg['instructions'])}

## 原始内容
---
{content}
---

## 输出格式（严格按 JSON 返回，不要有其他内容）

{{
    "optimized": "优化后的内容（保持原有格式，用换行分隔多条）",
    "changes": [
        {{"type": "wording|quantify|keywords", "before": "原文片段", "after": "修改后片段", "reason": "修改原因"}}
    ],
    "tips": ["后续改进建议1", "后续改进建议2"]
}}

---

## 注意事项
1. 优化后的内容要保持原意，不能添加虚假信息
2. 每条 changes 说明一个具体的优化点
3. 量化数据要合理，不要夸大
4. 只返回 JSON，不要有 markdown 代码块或任何其他内容"""

    try:
        result = await ai_service._call_api(prompt)

        # 尝试解析 JSON
        import re
        # 去除可能的 markdown 代码块
        json_str = result.strip()
        if json_str.startswith("```"):
            json_str = re.sub(r'^```json\s*', '', json_str, flags=re.MULTILINE)
            json_str = re.sub(r'\s*```$', '', json_str, flags=re.MULTILINE)

        optimized_data = json.loads(json_str)

        return {
            "success": True,
            "original": content,
            "optimized": optimized_data.get("optimized", content),
            "changes": optimized_data.get("changes", [])
        }

    except json.JSONDecodeError as e:
        # JSON 解析失败，返回原文作为优化结果
        return {
            "success": True,
            "original": content,
            "optimized": content,
            "changes": ["内容已保留，未做修改"]
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "original": content,
            "optimized": content,
            "changes": []
        }


async def optimize_full_resume(resume_data: Dict[str, Any]) -> Dict[str, Any]:
    """一键优化整份简历

    Args:
        resume_data: 完整的简历数据

    Returns:
        {
            "optimized": dict,  # 优化后的简历数据
            "summary": List[str] # 优化摘要
        }
    """
    # 提取各部分数据
    personal_info = resume_data.get("personal_info", {})
    work_experience = resume_data.get("work_experience", [])
    projects = resume_data.get("projects", [])
    education = resume_data.get("education", [])
    skills = resume_data.get("skills", [])
    awards = resume_data.get("awards", [])

    # 构建 prompt
    prompt = f"""你是一位专业的简历优化专家，擅长帮助程序员提升简历质量。你有10年以上互联网行业 HR 和技术面试官经验。

## 简历数据

### 个人信息
姓名: {personal_info.get('name', '')}
职位: {personal_info.get('title', '')}
简介: {personal_info.get('summary', '')}

### 工作经历
{json.dumps(work_experience, ensure_ascii=False, indent=2)}

### 项目经验
{json.dumps(projects, ensure_ascii=False, indent=2)}

### 教育背景
{json.dumps(education, ensure_ascii=False, indent=2)}

### 技能
{json.dumps(skills, ensure_ascii=False, indent=2)}

### 荣誉奖项
{json.dumps(awards, ensure_ascii=False, indent=2)}

---

## 优化策略

### 工作经历优化
- 使用 STAR 法则描述（Situation, Task, Action, Result）
- 开头用强动词，突出个人贡献（主导、负责、设计、实现）
- 量化成果，使用具体数字（如：提升50%性能，服务100万用户）
- 按重要程度排序，最重要的放前面

### 项目经验优化
- 突出项目亮点和个人贡献
- 包含技术栈、规模、成果
- 用数据说话（如：处理日均1000万请求）
- 说明个人在项目中的角色和价值

### 教育背景优化
- 突出与职位相关的课程和项目
- 简化学历描述，重点放在技术能力上
- 研究生可简化学历，本科以上保留

### 技能描述优化
- 按精通/熟悉/了解分层
- 添加热门技术关键词
- 突出与目标职位的匹配度

---

## 输出格式（严格按 JSON 返回，不要有其他内容）

{{
    "optimized": {{
        "personal_info": {personal_info.get('name', '')} 的个人信息,
        "work_experience": [
            {{
                "company": "公司名",
                "position": "职位",
                "description": "优化后的描述（STAR法则）",
                "achievements": ["成就1（量化）", "成就2（量化）"]
            }}
        ],
        "projects": [
            {{
                "name": "项目名",
                "role": "角色",
                "description": "优化后的描述",
                "technologies": ["技术栈"],
                "highlights": ["亮点1（量化）", "亮点2"]
            }}
        ],
        "education": [
            {{
                "school": "学校名",
                "degree": "学位",
                "field": "专业",
                "description": "优化后的描述（突出相关课程和项目）"
            }}
        ],
        "skills": ["技能1（精通）", "技能2（熟悉）", "技能3"],
        "awards": [
            {{
                "title": "奖项名",
                "description": "优化后的描述（量化竞争规模）"
            }}
        ]
    }},
    "summary": [
        "优化摘要1（如：工作经历量化了成果）",
        "优化摘要2（如：项目经验突出了技术亮点）",
        "优化摘要3（如：技能补充了热门关键词）"
    ],
    "overall_improvement": "整体改进说明（50字以内）"
}}

---

## 注意事项
1. 只优化有内容的部分，空内容保持原样
2. 不要添加虚假信息或夸大成就
3. 返回完整格式的 JSON
4. 只返回 JSON，不要有 markdown 代码块或任何其他内容"""

    try:
        result = await ai_service._call_api(prompt)

        # 尝试解析 JSON
        import re
        json_str = result.strip()
        if json_str.startswith("```"):
            json_str = re.sub(r'^```json\s*', '', json_str, flags=re.MULTILINE)
            json_str = re.sub(r'\s*```$', '', json_str, flags=re.MULTILINE)

        optimized_data = json.loads(json_str)

        return {
            "success": True,
            "optimized": optimized_data.get("optimized", resume_data),
            "summary": optimized_data.get("summary", ["已完成简历优化"])
        }

    except json.JSONDecodeError as e:
        return {
            "success": False,
            "error": f"JSON 解析失败: {str(e)}",
            "optimized": resume_data,
            "summary": ["优化失败，保持原样"]
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "optimized": resume_data,
            "summary": ["优化失败，保持原样"]
        }