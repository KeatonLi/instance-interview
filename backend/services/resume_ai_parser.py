"""
AI 简历解析服务 — LLM 驱动的结构化提取

使用 MiniMax M2.5 将 PDF 原始文本转为结构化 JSON。
与 ai_service 的简历优化功能共用同一套 API 配置和能力。
"""
import json
import re
from services.ai_service import AIService


RESUME_EXTRACTION_PROMPT = """你是一位顶级简历解析专家。请从以下 PDF 提取的原始文本中，精确提取简历结构化信息。

## 提取规则

### personalInfo
- name: 姓名（中文 2-4 字；英文保留空格和大小写，如 "Zhang Wei"）
- title: 职位头衔（如"高级前端工程师"）
- email: 邮箱地址
- phone: 手机号（11 位，去除空格和横线）
- location: 所在城市（如"北京"、"上海"）
- github: GitHub 主页（如 "github.com/xxx"）
- linkedin: LinkedIn 主页
- website: 个人网站
- summary: 个人简介/自我评价（完整段落）

### education[]
每条包含：school(学校全名)、degree(学位)、field(专业)、startDate(YYYY-MM)、endDate(YYYY-MM)、gpa
- 学位标准化：本科/硕士/博士/学士/MBA/PhD

### workExperience[]
每条包含：company(公司全名)、position(职位)、startDate(YYYY-MM)、endDate(YYYY-MM，空字符串表示至今)、current(bool)、description(工作描述)、achievements[](成就列表)
- 日期格式统一为 YYYY-MM
- 如果写"至今"/"Present"/"现在"，则 endDate 为空字符串，current 为 true
- achievements 应提取以列表符号（-、▸、•）开头的行，或描述中量化成果的句子

### projects[]
每条包含：name(项目名)、role(角色)、startDate、endDate、current、description、technologies[](技术栈列表)、link

### skills[]
每条包含：category(分类名，如"前端"/"后端"/"数据库")、items[](该分类下的技能列表)

### awards[]
每条包含：title(奖项名)、organization(颁发机构)、date(YYYY-MM)、description

### languages[]
每条包含：name(语言名)、level(水平，如"母语"/"CET-6"/"IELTS 7.0")

## 输出格式
严格返回以下 JSON 结构，不要任何其他内容：
```json
{
  "personalInfo": {"name":"","title":"","email":"","phone":"","location":"","github":"","linkedin":"","website":"","summary":""},
  "education": [],
  "workExperience": [],
  "projects": [],
  "skills": [],
  "awards": [],
  "languages": []
}
```

## 注意事项
1. 空字段返回空字符串 ""，空数组返回 []，不要返回 null
2. 日期如只有年份，补全为 YYYY-01
3. 如果文本中不存在某类信息，对应数组留空
4. 技术栈关键词保留原始大小写（如 React、iOS、Node.js）
5. 中文简历的 section 标题可能有多种写法（如"教育背景"/"教育经历"/"学习经历"），请识别语义

## 原始文本
{raw_text}

只返回 JSON："""


class AIResumeParser:
    """AI 驱动的简历解析器，复用 AIService 的 LLM 能力"""

    def __init__(self):
        self.ai = AIService()

    async def parse(self, raw_text: str) -> dict:
        """调用 LLM 提取简历结构化数据"""
        # 截断过长文本（MiniMax 上下文约 8K tokens，约 6000 中文字）
        if len(raw_text) > 6000:
            raw_text = raw_text[:6000]

        prompt = RESUME_EXTRACTION_PROMPT.replace("{raw_text}", raw_text)

        content = await self.ai.chat(
            messages=[
                {
                    "role": "system",
                    "content": "你是一位顶级的简历解析专家。你的任务是从简历文本中精确提取结构化信息。无论输入文本的格式如何不规范，你都能准确理解语义并提取关键字段。只返回 JSON，不要任何解释。"
                },
                {"role": "user", "content": prompt}
            ],
            temperature=0.1,   # 低温度确保稳定结构化输出
            max_tokens=8192,   # 完整简历需要较大输出
            timeout=120.0,
        )

        # 从 LLM 回复中提取 JSON（有时会被包裹在 ```json ... ``` 中）
        json_match = re.search(r'```(?:json)?\s*\n?([\s\S]*?)\n?```', content)
        if json_match:
            json_str = json_match.group(1)
        else:
            start = content.find('{')
            end = content.rfind('}')
            if start >= 0 and end > start:
                json_str = content[start:end + 1]
            else:
                raise RuntimeError(f"AI 返回内容无法识别 JSON 格式: {content[:300]}")

        try:
            parsed = json.loads(json_str)
        except json.JSONDecodeError as e:
            raise RuntimeError(f"AI 返回的 JSON 解析失败: {e}\n内容: {json_str[:300]}")

        try:
            normalized = self._normalize(parsed)
        except Exception as e:
            raise RuntimeError(f"数据规范化失败: {e}\n原始: {json.dumps(parsed, ensure_ascii=False)[:300]}")

        return normalized

    def _normalize(self, data: dict) -> dict:
        """规范化数据结构，确保所有字段存在且格式正确"""
        pi = data.get("personalInfo") or data.get("personal_info") or {}
        we = data.get("workExperience") or data.get("work_experience") or []
        return {
            "personalInfo": self._norm_personal(pi),
            "education": self._norm_list(data.get("education") or []),
            "workExperience": self._norm_list(we),
            "projects": self._norm_list(data.get("projects") or []),
            "skills": self._norm_skills(data.get("skills") or []),
            "awards": self._norm_list(data.get("awards") or []),
            "languages": self._norm_list(data.get("languages") or []),
        }

    def _norm_personal(self, info) -> dict:
        fields = ["name", "title", "email", "phone", "location", "github", "linkedin", "website", "summary"]
        result = {}
        for f in fields:
            val = info.get(f, "") if isinstance(info, dict) else ""
            result[f] = str(val) if val and val is not None else ""
        # 中英文名空格处理：中文名去掉空格（"李 明"→"李明"），英文名保留（"Li Ming"）
        if result.get("name"):
            name = result["name"]
            if any('一' <= c <= '鿿' for c in name):
                name = name.replace(" ", "")
            result["name"] = name.strip()
        return result

    def _norm_list(self, items: list) -> list:
        if not items:
            return []
        result = []
        for item in items:
            if isinstance(item, dict):
                normalized = {}
                for k, v in item.items():
                    normalized[k] = v if v is not None else ([] if k in ("achievements", "technologies", "items") else "")
                result.append(normalized)
        return result

    def _norm_skills(self, skills: list) -> list:
        if not skills:
            return []
        result = []
        for s in skills:
            if isinstance(s, dict):
                result.append({
                    "category": str(s.get("category", "")),
                    "items": s.get("items", []) if isinstance(s.get("items"), list) else [],
                })
            elif isinstance(s, str):
                result.append({"category": "", "items": [s]})
        return result


async def parse_resume_with_ai(raw_text: str) -> dict:
    """便捷函数：使用 AI 解析简历文本"""
    parser = AIResumeParser()
    return await parser.parse(raw_text)
