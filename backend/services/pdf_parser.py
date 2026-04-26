"""
PDF 简历解析器 - 从 Go 版本移植
使用 pdfplumber 进行 PDF 解析
"""
import io
import re
import json
import time
import pdfplumber
from typing import Optional, Dict, Any, List, Tuple
from dataclasses import dataclass, field


@dataclass
class ParsedResume:
    """解析后的简历数据结构"""
    personal_info: Dict[str, Any] = field(default_factory=dict)
    education: List[Dict[str, Any]] = field(default_factory=list)
    work_experience: List[Dict[str, Any]] = field(default_factory=list)
    projects: List[Dict[str, Any]] = field(default_factory=list)
    skills: List[Dict[str, Any]] = field(default_factory=list)
    awards: List[Dict[str, Any]] = field(default_factory=list)
    languages: List[Dict[str, Any]] = field(default_factory=list)
    raw_text: str = ""


class PDFParser:
    """PDF 解析基础类"""

    @staticmethod
    def extract_text_from_pdf(file_bytes: bytes) -> str:
        """从 PDF 提取文本"""
        text_parts = []

        with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
            if len(pdf.pages) == 0:
                return ""
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text_parts.append(page_text)

        return "\n".join(text_parts)


class ResumePDFParser:
    """
    简历 PDF 解析器
    从 Go 版本移植，逻辑完全一致
    """

    def __init__(self):
        # Section 标题关键词
        self.edu_titles = [
            "教育背景", "教育经历", "学历背景", "Education", "EDUCATION",
        ]
        self.work_titles = [
            "工作经历", "工作经验", "实习经历", "Employment", "WORK EXPERIENCE", "职业经历",
        ]
        self.proj_titles = [
            "项目经验", "项目经历", "项目背景", "Projects", "PROJECT EXPERIENCE",
        ]
        self.skill_titles = [
            "专业技能", "技能特长", "技术能力", "技能证书", "Skills", "SKILLS", "技术栈",
        ]
        self.award_titles = [
            "获奖荣誉", "荣誉奖项", "Awards", "AWARDS",
        ]
        self.lang_titles = [
            "语言能力", "Languages", "LANGUAGES",
        ]

        # 常见词汇表 (用于过滤技术栈)
        self.common_words = {
            "the": True, "and": True, "for": True, "are": True, "but": True, "not": True,
            "you": True, "all": True, "can": True, "had": True, "her": True, "was": True,
            "one": True, "our": True, "out": True, "day": True, "get": True, "has": True,
            "him": True, "his": True, "how": True, "its": True, "may": True, "new": True,
            "now": True, "old": True, "see": True, "two": True, "way": True, "who": True,
            "boy": True, "did": True, "she": True, "use": True, "your": True, "each": True,
            "this": True, "that": True, "with": True, "from": True, "they": True, "will": True,
            "been": True, "have": True, "more": True, "when": True, "year": True, "than": True,
            "公司": True, "工作": True, "负责": True, "管理": True, "项目": True, "经验": True,
            "开发": True, "设计": True, "实现": True, "优化": True, "维护": True, "参与": True,
            "主要": True, "完成": True, "获得": True, "提升": True, "进行": True, "包括": True,
        }

        # 正则表达式
        self._init_regexps()

    def _init_regexps(self):
        """初始化正则表达式"""
        # 时间范围: 2020.09 - 2022.06, 至今, 现在, current, present
        self.time_range_re = re.compile(
            r'(\d{4}[年\.\-/]\d{1,2}[月]?\s*[-–~至]\s*\d{4}[年\.\-/]\d{1,2}[月]?|至今|现在|current|present)',
            re.IGNORECASE
        )

        # 单独时间: 2020.09 或 2020年9月
        self.single_time_re = re.compile(
            r'(\d{4}[年\.\-/]\d{1,2}[月]?|至今|现在)',
            re.IGNORECASE
        )

        # 时间分割符
        self.time_splitter_re = re.compile(r'[-–~至]')

        # 邮箱
        self.email_re = re.compile(r'[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}')

        # 手机号 (中国)
        self.phone_re = re.compile(r'1[3-9]\d{9}|1[3-9]\d[\s\-]?\d{4}[\s\-]?\d{4}')

        # 学位
        self.degree_re = re.compile(
            r'(?:博士|硕士|本科|学士|专科|MBA|PhD|博士研究生|硕士研究生|大学)',
            re.IGNORECASE
        )

        # 学校关键词
        self.school_re = re.compile(r'(?:大学|学院|学校|技术学院|职业学院)')

        # 公司关键词
        self.company_re = re.compile(
            r'(?:公司|集团|科技|有限|企业|工作室|机构)'
        )

        # 职位关键词
        self.position_re = re.compile(
            r'(?:工程师|设计师|经理|总监|架构师|负责人|主管|专员|实习生|'
            r'Analyst|Consultant|Engineer|Developer|Designer|Manager|Director|VP|Chief)',
            re.IGNORECASE
        )

        # 技术栈
        self.tech_re = re.compile(r'([A-Za-z0-9+#.\\-]{2,30})')

    def generate_id(self) -> str:
        """生成唯一ID"""
        return str(int(time.time() * 1000000))

    def parse_pdf(self, file_bytes: bytes) -> Tuple[Optional[ParsedResume], str]:
        """
        解析 PDF 文件
        返回: (parsed_resume, error_message)
        """
        try:
            # 验证 PDF 格式
            if len(file_bytes) < 4 or file_bytes[:4] != b'%PDF':
                return None, "文件不是有效的 PDF 格式"

            raw_text = PDFParser.extract_text_from_pdf(file_bytes)
            if not raw_text:
                return None, "无法从 PDF 中提取文本内容"

            result = self.parse_text(raw_text)
            result.raw_text = raw_text
            return result, ""
        except Exception as e:
            return None, f"PDF 解析失败: {str(e)}"

    def parse_text(self, text: str) -> ParsedResume:
        """解析文本内容"""
        resume = ParsedResume()

        # 1. 按行分割并清洗
        lines = self._split_and_clean_lines(text)

        # 2. 识别各个 section 的边界
        sections = self._identify_sections(lines)

        # 3. 提取个人信息
        resume.personal_info = self._extract_personal_info(lines, sections)

        # 4. 提取教育经历
        if "education" in sections:
            section = sections["education"]
            resume.education = self._extract_education(lines[section[0]:section[1]])

        # 5. 提取工作经历
        if "work" in sections:
            section = sections["work"]
            resume.work_experience = self._extract_work_experience(lines[section[0]:section[1]])

        # 6. 提取项目经验
        if "project" in sections:
            section = sections["project"]
            resume.projects = self._extract_projects(lines[section[0]:section[1]])

        # 7. 提取技能
        if "skill" in sections:
            section = sections["skill"]
            resume.skills = self._extract_skills(lines[section[0]:section[1]])

        # 8. 提取荣誉奖项
        if "award" in sections:
            section = sections["award"]
            resume.awards = self._extract_awards(lines[section[0]:section[1]])

        # 9. 提取语言能力
        if "language" in sections:
            section = sections["language"]
            resume.languages = self._extract_languages(lines[section[0]:section[1]])

        return resume

    def _split_and_clean_lines(self, text: str) -> List[str]:
        """分割并清洗行"""
        lines = text.split("\n")
        clean_lines = []

        for line in lines:
            trimmed = line.strip()
            if trimmed:
                clean_lines.append(trimmed)

        return clean_lines

    def _identify_sections(self, lines: List[str]) -> Dict[str, Tuple[int, int]]:
        """
        识别各个 section 的起止位置
        返回: {"section_name": (start_index, end_index), ...}
        """
        sections = {}

        # Section 标题列表
        all_titles = {
            "education": self.edu_titles,
            "work": self.work_titles,
            "project": self.proj_titles,
            "skill": self.skill_titles,
            "award": self.award_titles,
            "language": self.lang_titles,
        }

        # 优先级
        priority_map = {
            "education": 50,
            "work": 60,
            "project": 70,
            "skill": 40,
            "award": 30,
            "language": 20,
        }

        found_sections = []

        for i, line in enumerate(lines):
            trimmed = line.strip()
            if len(trimmed) < 3:
                continue

            upper_line = trimmed.upper()

            for sec_type, titles in all_titles.items():
                if sec_type in sections:
                    continue

                for title in titles:
                    upper_title = title.upper()
                    if upper_title in upper_line and len(title) >= 4:
                        # 检查是否是干净的标题行
                        if self._is_clean_section_title(trimmed, title):
                            found_sections.append({
                                "key": sec_type,
                                "index": i,
                                "title_len": len(title),
                                "priority": priority_map[sec_type],
                            })
                            break

        # 按 index 排序
        found_sections.sort(key=lambda x: (x["index"], -x["priority"]))

        # 设置每个 section 的 start 和 end
        for i, info in enumerate(found_sections):
            start = info["index"] + 1  # 从标题的下一行开始
            if i < len(found_sections) - 1:
                end = found_sections[i + 1]["index"]
            else:
                end = len(lines)
            sections[info["key"]] = (start, end)

        return sections

    def _is_clean_section_title(self, line: str, title: str) -> bool:
        """判断是否是一个干净的 section 标题行"""
        trimmed = line.strip()
        upper_line = trimmed.upper()
        upper_title = title.upper()

        if upper_title not in upper_line:
            return False

        # 找到标题在行中的位置
        idx = upper_line.find(upper_title)
        if idx < 0:
            return False

        # 检查标题前后的字符
        before_idx = idx - 1
        after_idx = idx + len(title)

        # 标题前如果有字符，必须是分隔符
        if before_idx >= 0:
            before_char = trimmed[before_idx]
            if before_char not in " 　::":
                return False

        # 标题后如果有字符，必须是分隔符或结束
        if after_idx < len(trimmed):
            after_char = trimmed[after_idx]
            if after_char not in " 　::\t":
                return False

        # 去掉标题后的内容
        after_title = trimmed[after_idx:].strip()

        # 干净的标题：后面没有内容，或者只有很少的标点/空格
        if len(after_title) > 10:
            return False

        # 标题本身长度应该占行的大部分
        if len(trimmed) > len(title) * 4:
            return False

        # 关键改进：如果行只包含"教育"+"经历"这种组合，但标题是"教育背景"
        # 说明是误匹配，检查关键词的相似度
        # 如果标题是4个字，行也是4-5字，且高度重合，认为是有效的标题
        if len(title) >= 4 and len(trimmed) >= len(title) - 1 and len(trimmed) <= len(title) + 3:
            return True

        return True

    def _extract_personal_info(
        self,
        lines: List[str],
        sections: Dict[str, Tuple[int, int]]
    ) -> Dict[str, Any]:
        """提取个人信息"""
        info = {
            "name": "",
            "title": "",
            "email": "",
            "phone": "",
            "location": "",
            "github": "",
            "linkedin": "",
            "website": "",
            "summary": "",
        }

        # 找出第一个 section 的开始位置
        first_section_start = len(lines)
        for sec_type, (start, end) in sections.items():
            if start > 0 and start < first_section_start:
                first_section_start = start

        # 取 section 之前的行作为个人信息区
        # 关键：如果firstSectionStart太小（比如<5），可能section识别错误，扩展搜索范围
        personal_lines = lines[:first_section_start]
        if len(personal_lines) < 5 and len(lines) > 10:
            extend_to = 15
            if first_section_start > 0 and first_section_start < extend_to:
                extend_to = first_section_start
            personal_lines = lines[:min(extend_to, len(lines))]

        personal_text = "\n".join(personal_lines)

        # 提取邮箱
        email_match = self.email_re.search(personal_text)
        if email_match:
            info["email"] = email_match.group()

        # 提取手机号
        phone_match = self.phone_re.search(personal_text)
        if phone_match:
            phone = phone_match.group()
            info["phone"] = phone.replace(" ", "").replace("-", "")

        # 提取 GitHub
        github_re = re.compile(r'(?:github\.com/|github:)\s*([a-zA-Z0-9_-]+)', re.IGNORECASE)
        github_match = github_re.search(personal_text)
        if github_match:
            info["github"] = "github.com/" + github_match.group(1)

        # 提取 LinkedIn
        linkedin_re = re.compile(r'(?:linkedin\.com/in/|linkedin:)\s*([a-zA-Z0-9_-]+)', re.IGNORECASE)
        linkedin_match = linkedin_re.search(personal_text)
        if linkedin_match:
            info["linkedin"] = "linkedin.com/in/" + linkedin_match.group(1)

        # 提取网站
        website_re = re.compile(r'(?:https?://)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(/[^\s]*)?')
        website_match = website_re.search(personal_text)
        if website_match and not self.email_re.match(website_match.group()):
            info["website"] = website_match.group()

        # section 标题关键词 (用于排除)
        section_keywords = ["教育", "工作", "项目", "技能", "获奖", "荣誉", "语言", "实习", "经历", "背景", "经验"]

        # 提取姓名
        for i, line in enumerate(personal_lines):
            if i > 15:
                break
            trimmed = line.strip()
            if 2 <= len(trimmed) <= 20:
                # 排除看起来像 section 标题的行
                is_section_title = False
                for kw in section_keywords:
                    if kw in trimmed and len(trimmed) < 10:
                        is_section_title = True
                        break

                if is_section_title:
                    continue

                if self._is_chinese_name(trimmed):
                    info["name"] = trimmed
                    break

                # 英文名
                if re.match(r'^[A-Z][a-z]+(\s+[A-Z][a-z]+)+$', trimmed):
                    info["name"] = trimmed
                    break

        # 提取职位/头衔
        for line in personal_lines:
            trimmed = line.strip()
            if 5 < len(trimmed) < 60:
                if self.position_re.search(trimmed):
                    info["title"] = trimmed
                    break

        # 提取个人简介
        summary_lines = []
        for line in personal_lines:
            trimmed = line.strip()
            if 50 < len(trimmed) < 500:
                if "@" not in trimmed and not self.phone_re.match(trimmed):
                    summary_lines.append(trimmed)

        if summary_lines:
            info["summary"] = " ".join(summary_lines)

        # 提取所在地
        location_re = re.compile(
            r'(?:北京|上海|广州|深圳|杭州|南京|武汉|成都|西安|苏州|天津|重庆|香港|澳门|台湾|[省市县区][^\s]{2,10})'
        )
        location_match = location_re.search(personal_text)
        if location_match:
            info["location"] = location_match.group()

        return info

    def _is_chinese_name(self, s: str) -> bool:
        """判断字符串是否是中文姓名"""
        if len(s) < 2 or len(s) > 4:
            return False

        for char in s:
            if not ('\u4e00' <= char <= '\u9fa5'):
                return False

        return True

    def _is_meaningful_line(self, line: str) -> bool:
        """判断行是否有意义（不是纯标点）"""
        trimmed = line.strip()
        if not trimmed:
            return False

        # 纯标点符号
        if re.match(r'^[，、。；：""''（）【】《》\-\*•·○◇■\s]+$', trimmed):
            return False

        return True

    def _is_valid_bullet(self, trimmed: str) -> bool:
        """判断列表符号是否有效（后面有内容才是真列表）"""
        for prefix in ["-", "•", "*", "·", "○", "◇", "■"]:
            if trimmed.startswith(prefix):
                after = trimmed[len(prefix):].strip()
                return len(after) > 0
        return False

    def _is_likely_title_line(self, line: str) -> bool:
        """判断是否可能是标题行（保守版）"""
        trimmed = line.strip()

        # 太短的不可能是标题
        if len(trimmed) < 4:
            return False

        # 太长的也不是标题（标题一般比较短）
        if len(trimmed) > 30:
            return False

        # 已经是列表项的不是标题
        if re.match(r'^[-\*•·]', trimmed):
            return False

        # 包含时间的是描述，不是标题
        if self.time_range_re.match(trimmed) or self.single_time_re.match(trimmed):
            return False

        # 包含邮箱或电话的不是标题
        if self.email_re.match(trimmed) or self.phone_re.match(trimmed):
            return False

        # 包含"描述"、"介绍"、"职责"等关键词的是描述，不是标题
        desc_keywords = ["描述", "介绍", "职责", "说明", "项目", "架构", "亮点"]
        for kw in desc_keywords:
            if kw in trimmed and len(trimmed) < 15:
                return False

        # 纯中文标题判断（4-20个字符，主要是中文）
        chinese_count = sum(1 for c in trimmed if '\u4e00' <= c <= '\u9fa5')
        if chinese_count >= 3 and chinese_count / len(trimmed) > 0.6:
            # 额外检查：标题不应该包含太多技术词汇
            tech_count = sum(1 for c in trimmed if (c.isalnum() and not c.isascii()))
            # 如果有太多英文字符，可能不是标题
            if tech_count > 5:
                return False
            return True

        return False

    def _is_likely_project_name(self, line: str) -> bool:
        """判断是否可能是项目名"""
        trimmed = line.strip()

        if len(trimmed) < 3 or len(trimmed) > 50:
            return False

        # 跳过时间
        if self.time_range_re.match(trimmed) or self.single_time_re.match(trimmed):
            return False

        # 跳过列表符号
        if re.match(r'^[-\*•·\d]+', trimmed):
            return False

        # 跳过包含技术栈的行（描述）
        if self.tech_re.match(trimmed) and ("使用" in trimmed or "基于" in trimmed or "采用" in trimmed):
            return False

        # 跳过太技术性的行
        if ":" in trimmed and self.tech_re.match(trimmed):
            return False

        # 包含项目相关的词
        if "项目" in trimmed or "系统" in trimmed or "平台" in trimmed or "产品" in trimmed:
            return True

        return False

    def _extract_around_keyword(self, text: str, keywords: List[str]) -> str:
        """提取关键词周围的内容"""
        for kw in keywords:
            idx = text.find(kw)
            if idx == -1:
                continue
            # 往前找最多30个字符
            start = idx - 30
            if start < 0:
                start = 0
            # 往后找最多50个字符
            end = idx + len(kw) + 50
            if end > len(text):
                end = len(text)
            result = text[start:end].strip()
            if result:
                return result
        return ""

    def _merge_multi_line_entries(self, lines: List[str]) -> List[List[str]]:
        """智能合并多行条目（重写版，增强鲁棒性）"""
        # 过滤掉无意义的行（纯标点）
        meaningful_lines = []
        for line in lines:
            if self._is_meaningful_line(line):
                meaningful_lines.append(line.strip())

        entries = []
        current_entry = []
        last_was_bullet_or_number = False

        for line in meaningful_lines:
            trimmed = line

            # 检测各种模式
            is_numbered = bool(re.match(r'^\d+[.、．、:：]', trimmed))
            is_bullet = self._is_valid_bullet(trimmed)
            is_time_start = bool(
                self.time_range_re.match(trimmed) or self.single_time_re.match(trimmed)
            )
            is_company_or_school = bool(
                self.school_re.search(trimmed) or self.company_re.search(trimmed)
            )
            is_position = bool(self.position_re.search(trimmed))

            # 判断是否是新条目
            is_new_entry = False

            if is_numbered:
                is_new_entry = True
            elif is_bullet:
                is_new_entry = True
            elif is_time_start:
                if not current_entry:
                    is_new_entry = True
                elif last_was_bullet_or_number:
                    is_new_entry = False  # 时间跟在序号后面，不算新条目
                elif is_company_or_school or is_position:
                    is_new_entry = False  # 公司/职位行合并
                elif self._is_likely_title_line(trimmed) and len(current_entry) >= 2:
                    is_new_entry = True
                else:
                    is_new_entry = True
            elif not current_entry:
                is_new_entry = True

            # 保存当前条目并开始新的
            if is_new_entry and current_entry:
                entries.append(current_entry)
                current_entry = []

            current_entry.append(trimmed)
            last_was_bullet_or_number = is_numbered or is_bullet

        # 添加最后一个条目
        if current_entry:
            entries.append(current_entry)

        if not entries and meaningful_lines:
            entries.append(meaningful_lines)

        return entries

    def _parse_time_range(self, time_str: str, target: dict):
        """解析时间范围字符串"""
        if time_str in ("至今", "现在", "current", "present"):
            target["current"] = True
            target["end_date"] = ""
            return

        times = self.time_splitter_re.split(time_str)
        if len(times) >= 1:
            target["start_date"] = times[0].strip()
        if len(times) >= 2:
            end_time = times[1].strip()
            if end_time in ("至今", "现在", "current", "present"):
                target["current"] = True
                target["end_date"] = ""
            else:
                target["end_date"] = end_time

    def _collect_description(self, entry: List[str], target: dict):
        """收集描述内容"""
        desc_lines = []

        for line in entry:
            trimmed = line.strip()
            if not trimmed:
                continue

            # 跳过时间行
            if self.time_range_re.match(trimmed) or self.single_time_re.match(trimmed):
                continue

            # 跳过条目名称行
            if target.get("name") and target["name"] in trimmed:
                continue

            # 跳过公司名行
            if target.get("company") and target["company"] in trimmed:
                continue

            # 跳过职位名行
            if target.get("position") and target["position"] in trimmed:
                continue

            # 跳过太短的行（除非是列表项）
            if len(trimmed) < 10 and not re.match(r'^[-\*•·]', trimmed):
                continue

            # 跳过太长的行（可能被OCR错误合并的）
            if len(trimmed) > 1000:
                continue

            desc_lines.append(trimmed)

        if desc_lines:
            target["description"] = "\n".join(desc_lines)

    def _extract_achievements(self, entry: List[str], target: dict):
        """提取成就列表"""
        achievements = []
        description_lines = []

        for line in entry:
            trimmed = line.strip()
            if not trimmed:
                continue

            # 跳过时间行
            if self.time_range_re.match(trimmed) or self.single_time_re.match(trimmed):
                continue

            # 跳过公司名行
            if target.get("company") and target["company"] in trimmed:
                continue

            # 跳过职位名行
            if target.get("position") and target["position"] in trimmed:
                continue

            # 以列表符号开头的行 -> 作为成就
            if re.match(r'^[-\*•·]', trimmed):
                achievement = re.sub(r'^[-\*•·]', '', trimmed).strip()
                if achievement:
                    achievements.append(achievement)
                continue

            # 其他行 -> 作为描述
            if 10 <= len(trimmed) < 500:
                description_lines.append(trimmed)

        if achievements:
            target["achievements"] = achievements
        if description_lines:
            target["description"] = "\n".join(description_lines)

    def _extract_education(self, section_lines: List[str]) -> List[Dict[str, Any]]:
        """提取教育经历"""
        education = []

        if not section_lines:
            return education

        # 智能合并多行条目
        merged_entries = self._merge_multi_line_entries(section_lines)

        for entry in merged_entries:
            entry_text = " ".join(entry)

            edu = {
                "id": self.generate_id(),
                "school": "",
                "degree": "",
                "field": "",
                "start_date": "",
                "end_date": "",
                "gpa": "",
                "description": "",
            }

            # 提取学校名（改进：支持更长的名称）
            school_pattern = re.compile(
                r'([^\s，。、]{2,30}(?:大学|学院|学校|技术学院|职业学院|Graduate School|Institute))'
            )
            school_match = school_pattern.search(entry_text)
            if school_match:
                edu["school"] = school_match.group(1)
            else:
                # 备用：查找包含学校关键词的完整片段
                school_part = self._extract_around_keyword(entry_text, ["大学", "学院", "学校"])
                if school_part:
                    edu["school"] = school_part

            # 提取学位
            degree_pattern = re.compile(r'(博士|硕士|本科|学士|专科|MBA|PhD|博士研究生|硕士研究生|大学)')
            degree_match = degree_pattern.search(entry_text)
            if degree_match:
                edu["degree"] = degree_match.group(1)

            # 提取时间范围
            time_match = self.time_range_re.search(entry_text)
            if time_match:
                self._parse_time_range(time_match.group(1), edu)
            else:
                single_match = self.single_time_re.search(entry_text)
                if single_match:
                    edu["start_date"] = single_match.group(1)

            # 提取专业
            major_pattern = re.compile(
                r'(?:专业|系|主修)[:：]?\s*([^\s，。、；;]+)|([^\s，。、；;]+(?:科学|工程|技术|经济|管理|文学|法学|教育|艺术|学))$'
            )
            major_match = major_pattern.search(entry_text)
            if major_match:
                for m in major_match.groups():
                    if m:
                        edu["field"] = m
                        break

            # 提取 GPA
            gpa_re = re.compile(r'GPA[:：]?\s*(\d+\.?\d*)')
            gpa_match = gpa_re.search(entry_text)
            if gpa_match:
                edu["gpa"] = gpa_match.group(1)

            # 收集描述
            self._collect_description(entry, edu)

            if edu["school"]:
                education.append(edu)

        return education

    def _extract_work_experience(self, section_lines: List[str]) -> List[Dict[str, Any]]:
        """提取工作经历"""
        experiences = []

        if not section_lines:
            return experiences

        merged_entries = self._merge_multi_line_entries(section_lines)

        for entry in merged_entries:
            entry_text = " ".join(entry)

            exp = {
                "id": self.generate_id(),
                "company": "",
                "position": "",
                "start_date": "",
                "end_date": "",
                "current": False,
                "description": "",
                "achievements": [],
            }

            # 提取公司名
            company_pattern = re.compile(
                r'（([^）]+)）|([^\s-]{2,30}(?:公司|集团|科技|有限|企业|工作室|机构|Inc|LLC|Corp))'
            )
            company_match = company_pattern.search(entry_text)
            if company_match:
                for m in company_match.groups():
                    if m:
                        exp["company"] = m
                        break
            if not exp["company"]:
                company_part = self._extract_around_keyword(entry_text, ["公司", "集团", "科技", "有限", "企业"])
                if company_part:
                    exp["company"] = company_part

            # 提取职位
            position_pattern = re.compile(
                r'[-–—]\s*([^-]+)|((?:(?:高级|中级|初级|资深|著名)?.{0,15}(?:工程师|设计师|经理|总监|架构师|负责人|主管|专员|实习生|Analyst|Consultant|Engineer|Developer|Designer|Manager|Director)))'
            )
            position_match = position_pattern.search(entry_text)
            if position_match:
                for m in position_match.groups():
                    if m:
                        exp["position"] = m.strip()
                        break
            if not exp["position"]:
                position_part = self._extract_around_keyword(entry_text, [
                    "工程师", "设计师", "经理", "总监", "实习生",
                    "Analyst", "Engineer", "Developer", "Designer", "Manager"
                ])
                if position_part:
                    exp["position"] = position_part

            # 提取时间范围
            time_match = self.time_range_re.search(entry_text)
            if time_match:
                self._parse_time_range(time_match.group(1), exp)

            # 提取成就/描述
            self._extract_achievements(entry, exp)

            if exp["company"] or exp["position"]:
                experiences.append(exp)

        return experiences

    def _extract_projects(self, section_lines: List[str]) -> List[Dict[str, Any]]:
        """提取项目经验"""
        projects = []

        if not section_lines:
            return projects

        merged_entries = self._merge_multi_line_entries(section_lines)

        for entry in merged_entries:
            entry_text = " ".join(entry)

            proj = {
                "id": self.generate_id(),
                "name": "",
                "role": "",
                "start_date": "",
                "end_date": "",
                "current": False,
                "description": "",
                "technologies": [],
                "link": "",
            }

            # 提取项目名
            project_pattern = re.compile(r'([^-\n]{2,30}[^-\s])[-\s]+[^:：\n]{2,50}')
            project_match = project_pattern.search(entry_text)
            if project_match:
                proj["name"] = project_match.group(1).strip()

            # 如果没匹配到，尝试从行中找项目名
            if not proj["name"]:
                for line in entry:
                    trimmed = line.strip()
                    if self._is_likely_project_name(trimmed):
                        proj["name"] = trimmed
                        break

            # 提取角色
            role_pattern = re.compile(
                r'[-–—]\s*([^\n-]{2,20})(?:$|\n)|(?:团队负责人|负责人|组长|组员|成员|项目经理)'
            )
            role_match = role_pattern.search(entry_text)
            if role_match:
                for m in role_match.groups():
                    if m:
                        proj["role"] = m.strip()
                        break

            if not proj["role"]:
                if "负责人" in entry_text:
                    proj["role"] = "团队负责人"
                elif "组长" in entry_text:
                    proj["role"] = "组长"
                elif "组员" in entry_text or "成员" in entry_text:
                    proj["role"] = "组员"

            # 提取时间
            time_match = self.time_range_re.search(entry_text)
            if time_match:
                self._parse_time_range(time_match.group(1), proj)

            # 提取技术栈
            tech_matches = self.tech_re.findall(entry_text)
            seen = set()
            techs = []
            for t in tech_matches:
                t_lower = t.lower()
                if t_lower not in self.common_words and len(t) >= 2 and t not in seen:
                    seen.add(t)
                    techs.append(t)
            proj["technologies"] = techs

            # 提取链接
            link_re = re.compile(r'(?:https?://)?(?:github\.com|gitee\.com|gitlab\.com)[/\w.-]+')
            link_match = link_re.search(entry_text)
            if link_match:
                proj["link"] = link_match.group()
                if not proj["link"].startswith("http"):
                    proj["link"] = "https://" + proj["link"]

            # 收集描述
            self._collect_description(entry, proj)

            if proj["name"]:
                projects.append(proj)

        return projects

    def _extract_skills(self, section_lines: List[str]) -> List[Dict[str, Any]]:
        """提取技能"""
        skills = []

        if not section_lines:
            return skills

        # 技术关键词库
        tech_keywords = [
            "Java", "Python", "Go", "Golang", "JavaScript", "TypeScript", "C++", "C#", "PHP", "Ruby", "Swift", "Kotlin",
            "React", "Vue", "Angular", "Node.js", "Node", "Next.js", "Express", "Django", "Flask", "Spring", "Spring Boot",
            "MySQL", "PostgreSQL", "MongoDB", "Redis", "Elasticsearch", "SQLite", "Oracle",
            "Docker", "Kubernetes", "K8s", "AWS", "Azure", "GCP", "阿里云", "腾讯云", "华为云",
            "Git", "GitHub", "GitLab", "Linux", "Nginx", "Apache", "Kafka", "RabbitMQ", "Zookeeper",
            "TensorFlow", "PyTorch", "Pandas", "NumPy", "Scikit-learn", "Keras",
            "HTML", "CSS", "SASS", "LESS", "Tailwind", "Bootstrap",
            "REST", "GraphQL", "gRPC", "WebSocket", "TCP/IP", "HTTP", "DNS",
            "敏捷", "Scrum", "Kanban", "DevOps", "CI/CD", "TDD", "BDD",
            "Machine Learning", "Deep Learning", "NLP", "Computer Vision",
            "Microservices", "Serverless", "Blockchain", "AI", "LLM",
        ]

        skill_text = " ".join(section_lines)
        found_skills = set()

        for tech in tech_keywords:
            tech_re = re.compile(r'\b' + re.escape(tech) + r'\b', re.IGNORECASE)
            if tech_re.search(skill_text):
                found_skills.add(tech)

        if found_skills:
            skills.append({
                "id": self.generate_id(),
                "category": "技能",
                "items": list(found_skills),
            })

        return skills

    def _extract_awards(self, section_lines: List[str]) -> List[Dict[str, Any]]:
        """提取荣誉奖项"""
        awards = []

        if not section_lines:
            return awards

        merged_entries = self._merge_multi_line_entries(section_lines)

        for entry in merged_entries:
            entry_text = " ".join(entry)

            award = {
                "id": self.generate_id(),
                "title": "",
                "organization": "",
                "date": "",
                "description": "",
            }

            # 提取奖项名称
            award_pattern = re.compile(
                r'([^,\n]{2,50}(?:奖|奖学金|冠军|第一名|一等奖|二等奖|三等奖|优秀|荣誉))'
            )
            award_match = award_pattern.search(entry_text)
            if award_match:
                award["title"] = award_match.group(1)

            # 如果没匹配到，使用第一行作为标题
            if not award["title"] and entry:
                award["title"] = entry[0].strip()

            # 提取时间
            time_match = self.time_range_re.search(entry_text)
            if time_match:
                award["date"] = time_match.group(1)
            else:
                single_match = self.single_time_re.search(entry_text)
                if single_match:
                    award["date"] = single_match.group(1)

            # 提取组织
            org_pattern = re.compile(r'(?:由|颁发|授予)([^,\n]{2,20})')
            org_match = org_pattern.search(entry_text)
            if org_match:
                award["organization"] = org_match.group(1)

            # 描述
            self._collect_description(entry, award)

            if award["title"]:
                awards.append(award)

        return awards

    def _extract_languages(self, section_lines: List[str]) -> List[Dict[str, Any]]:
        """提取语言能力"""
        languages = []

        if not section_lines:
            return languages

        merged_entries = self._merge_multi_line_entries(section_lines)

        for entry in merged_entries:
            entry_text = " ".join(entry)

            lang = {
                "id": self.generate_id(),
                "name": "",
                "level": "",
            }

            # 提取语言名称
            lang_pattern = re.compile(
                r'(中文|英语|日语|韩语|法语|德语|西班牙语|葡萄牙语|俄语|阿拉伯语|CET-|TOEFL|IELTS|TOEIC)'
            )
            lang_match = lang_pattern.search(entry_text)
            if lang_match:
                lang["name"] = lang_match.group(1)

            # 提取熟练度
            level_pattern = re.compile(
                r'(?:精通|熟练|良好|一般|流利|native|fluent|professional|working)',
                re.IGNORECASE
            )
            level_match = level_pattern.search(entry_text)
            if level_match:
                lang["level"] = level_match.group()

            if lang["name"]:
                languages.append(lang)

        return languages

    def to_dict(self, parsed: ParsedResume) -> Dict[str, Any]:
        """转换为字典格式"""
        return {
            "personal_info": parsed.personal_info,
            "education": parsed.education,
            "work_experience": parsed.work_experience,
            "projects": parsed.projects,
            "skills": parsed.skills,
            "awards": parsed.awards,
            "languages": parsed.languages,
            "raw_text": parsed.raw_text,
        }

    def to_json(self, parsed: ParsedResume) -> str:
        """转换为 JSON 字符串"""
        data = self.to_dict(parsed)
        return json.dumps(data, ensure_ascii=False, indent=2)


# =============================================================================
# 导出函数（保持向后兼容）
# =============================================================================

def parse_pdf(file_bytes: bytes) -> Tuple[Optional[ParsedResume], str]:
    """解析 PDF 文件"""
    parser = ResumePDFParser()
    return parser.parse_pdf(file_bytes)


def parse_text(text: str) -> ParsedResume:
    """解析文本"""
    parser = ResumePDFParser()
    return parser.parse_text(text)