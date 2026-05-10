# AI 提示词设计文档

> 本文档记录简历大师项目中 AI 提示词的设计方案，包括模拟面试和简历优化两个场景。

## 一、提示词设计原则

1. **角色设定**：明确 AI 的身份（资深面试官/专业简历优化专家）
2. **背景信息**：提供足够的候选人信息，确保回答有针对性
3. **输出格式**：统一 JSON 格式，便于解析和处理
4. **评分标准**：清晰、可量化，便于评估回答质量

---

## 二、模拟面试提示词

### 2.1 面试问题生成提示词

**文件位置**: `backend/routers/interview.py` - `_build_interview_prompt()`

**设计要点**:
- 角色：资深技术面试官，10年以上经验
- 问题类型分配：技术深度(30%)、项目实战(40%)、场景行为(20%)、职业规划(10%)
- 每个问题包含：type, question, focus, difficulty, key_points, standard_answer, scoring, follow_up_questions

**提示词结构**:
```
## 候选人背景
- 姓名、技术栈、工作经历、项目经验、教育背景

## 问题生成要求
- 问题类型分配比例
- 技术题/项目题生成策略

## 输出格式
- JSON 格式，包含完整的问题结构

## 注意事项
- 只返回 JSON，不要其他内容
```

**输出 JSON 结构**:
```json
{
    "questions": [
        {
            "type": "technical|project|behavior|career",
            "question": "问题内容",
            "focus": "考察要点",
            "difficulty": "easy|medium|hard",
            "key_points": ["回答要点1", "要点2", "要点3"],
            "standard_answer": "标准答案（200-400字）",
            "scoring": {
                "excellent": "9-10分标准",
                "good": "7-8分标准",
                "fair": "5-6分标准"
            },
            "follow_up_questions": ["追问1", "追问2"]
        }
    ]
}
```

---

### 2.2 回答评估提示词

**文件位置**: `backend/routers/interview.py` - `_build_evaluation_prompt()`

**设计要点**:
- 四维度打分：相关性(25分)、技术深度(25分)、逻辑性(25分)、深度广度(25分)
- 结合候选人背景评估
- 给出具体优点、不足和改进建议

**提示词结构**:
```
## 面试问题
## 候选人回答
## 候选人背景（姓名、职位、技术栈）

## 评估维度
- 相关性：是否切中问题核心
- 技术深度：能否准确描述技术细节
- 逻辑性：表达是否清晰有条理
- 深度广度：是否有独到见解

## 评分标准（90-100分到60分以下）

## 输出格式
- JSON 格式，包含总分和各维度分数
```

**输出 JSON 结构**:
```json
{
    "total_score": 85,
    "dimension_scores": {
        "relevance": {"score": 22, "max": 25, "comment": "简短评语"},
        "technical_depth": {"score": 20, "max": 25, "comment": "简短评语"},
        "logic": {"score": 23, "max": 25, "comment": "简短评语"},
        "breadth": {"score": 20, "max": 25, "comment": "简短评语"}
    },
    "strengths": ["优点1", "优点2"],
    "weaknesses": ["不足1", "不足2"],
    "improvement_tips": ["建议1", "建议2"],
    "detailed_feedback": "详细的逐点评语（100-200字）"
}
```

---

### 2.3 标准答案生成提示词

**文件位置**: `backend/routers/interview.py` - `_build_standard_answer_prompt()`

**设计要点**:
- 结合候选人背景生成针对性答案
- 详细的回答框架
- 包含评分标准和追问方向

**输出 JSON 结构**:
```json
{
    "answer_framework": "回答框架说明（100字左右）",
    "sample_answer": "参考答案（200-400字）",
    "scoring": {
        "excellent": "9-10分标准描述",
        "good": "7-8分标准描述",
        "fair": "5-6分标准描述",
        "poor": "<5分标准描述"
    },
    "follow_up_questions": ["追问1", "追问2", "追问3"]
}
```

---

## 三、简历优化提示词

### 3.1 单条内容优化提示词

**文件位置**: `backend/services/ai_service.py` - `optimize_single_content()`

**设计要点**:
- 针对不同内容类型（工作经历/项目经验/教育背景/荣誉奖项）有专门策略
- 优化类型：措辞(wording)、关键词(keywords)、量化(quantify)、综合(all)
- 输出包含优化后的内容和具体的优化点

**内容类型配置**:

| 类型 | 重点关注 | 优化策略 |
|------|---------|---------|
| work_experience | 职责、成就、技术贡献 | 突出个人贡献，量化成果，STAR法则 |
| project | 项目亮点、个人角色、技术实现 | 突出项目难点和个人创新 |
| education | 学术成就、专业相关课程 | 简化学历描述，突出相关部分 |
| award | 奖项级别、获奖难度、竞争人数 | 突出奖项含金量，量化竞争规模 |

**优化类型配置**:

| 类型 | 优化指令 |
|------|---------|
| wording | 使用强动词、避免弱化词、删除冗余、50字以内 |
| keywords | 添加技术关键词、提升ATS通过率、使用行业术语 |
| quantify | 量化成果、使用数字、对比差异、数据放前面 |
| all | 综合上述所有方面 |

**输出 JSON 结构**:
```json
{
    "optimized": "优化后的内容（保持原有格式）",
    "changes": [
        {"type": "wording|quantify|keywords", "before": "原文", "after": "修改后", "reason": "原因"}
    ],
    "tips": ["后续改进建议1", "建议2"]
}
```

---

### 3.2 整体简历优化提示词

**文件位置**: `backend/services/ai_service.py` - `optimize_full_resume()`

**设计要点**:
- 整体优化策略：STAR法则、量化成果、关键词增强
- 针对每个部分有专门的优化方法
- 输出包含优化后的完整简历和优化摘要

**各部分优化策略**:

**工作经历**:
- 使用 STAR 法则描述
- 强动词开头（主导、负责、设计、实现）
- 量化成果（提升50%性能，服务100万用户）
- 按重要程度排序

**项目经验**:
- 突出项目亮点和个人贡献
- 包含技术栈、规模、成果
- 用数据说话
- 说明个人在项目中的角色

**教育背景**:
- 突出与职位相关的课程和项目
- 简化学历描述，重点放在技术能力

**技能描述**:
- 按精通/熟悉/了解分层
- 添加热门技术关键词
- 突出与目标职位的匹配度

**输出 JSON 结构**:
```json
{
    "optimized": {
        "personal_info": {},
        "work_experience": [{"company": "", "position": "", "description": "", "achievements": []}],
        "projects": [{"name": "", "role": "", "description": "", "technologies": [], "highlights": []}],
        "education": [{"school": "", "degree": "", "field": "", "description": ""}],
        "skills": ["技能1（精通）", "技能2（熟悉）"],
        "awards": [{"title": "", "description": ""}]
    },
    "summary": ["优化摘要1", "优化摘要2", "优化摘要3"],
    "overall_improvement": "整体改进说明（50字以内）"
}
```

---

### 3.3 翻译提示词

**文件位置**: `backend/services/ai_service.py` - `_build_prompt()` (optim_type=translate)

**设计要点**:
- 中译英：地道英文表达，保留专业术语
- 英译中：专业中文表达，保留技术术语英文原词

---

### 3.4 关键词优化提示词

**文件位置**: `backend/services/ai_service.py` - `_build_prompt()` (optim_type=keywords)

**设计要点**:
- 分析现有关键词
- 识别缺失的关键技术词
- 补充职位描述中常见的关键词

**输出 JSON 结构**:
```json
{
    "current_keywords": ["现有关键词1", "关键词2"],
    "missing_keywords": ["缺失关键词1", "关键词2"],
    "suggestions": ["补充建议1", "建议2"]
}
```

---

## 四、提示词维护指南

### 4.1 如何调整提示词

1. **定位文件**:
   - 面试提示词：`backend/routers/interview.py`
   - 简历优化提示词：`backend/services/ai_service.py`

2. **找到对应函数**:
   - 面试问题：`_build_interview_prompt()`
   - 回答评估：`_build_evaluation_prompt()`
   - 标准答案：`_build_standard_answer_prompt()`
   - 简历优化：`optimize_single_content()`, `optimize_full_resume()`

3. **修改后测试**:
   - 确保返回的 JSON 格式正确
   - 测试边界情况（空内容、超长内容）

### 4.2 常见问题排查

| 问题 | 可能原因 | 解决方案 |
|------|---------|---------|
| AI 返回非 JSON | 提示词不够明确 | 添加 "只返回 JSON，不要其他内容" |
| 评分不准确 | 评分标准不够清晰 | 细化评分描述，增加具体示例 |
| 内容不够量化 | 优化指令不够强调量化 | 在提示词中增加 "量化成果，使用具体数字" |

---

## 五、版本历史

| 版本 | 日期 | 修改内容 |
|------|------|---------|
| v1.0 | 2026-05-10 | 初始版本，包含面试和简历优化两套提示词 |