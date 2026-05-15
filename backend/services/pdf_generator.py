"""
PDF 生成服务 - 使用 WeasyPrint (HTML+CSS) 生成高质量简历 PDF
支持 5 种模板主题
"""
import os
from io import BytesIO
from datetime import datetime
from weasyprint import HTML


FONT_DIR = os.path.join(os.path.dirname(__file__), '..', 'fonts')
FONT_PATH = os.path.join(FONT_DIR, 'NotoSansCJKsc-Regular.otf')
FONT_BOLD_PATH = os.path.join(FONT_DIR, 'NotoSansCJKsc-Bold.otf')
FONT_FAMILY = 'Noto Sans SC'

FONT_FACE_CSS = """
@font-face { font-family: 'Noto Sans SC'; src: url('file:///%s') format('opentype'); font-weight: normal; }
@font-face { font-family: 'Noto Sans SC'; src: url('file:///%s') format('opentype'); font-weight: bold; }
""" % (FONT_PATH, FONT_BOLD_PATH)


def format_date(date_str: str) -> str:
    if not date_str:
        return ''
    try:
        date = datetime.strptime(date_str, '%Y-%m')
        return f"{date.year}.{date.month:02d}"
    except ValueError:
        return date_str


def esc(text: str) -> str:
    if not text:
        return ''
    text = str(text)
    text = text.replace('&', '&amp;')
    text = text.replace('<', '&lt;')
    text = text.replace('>', '&gt;')
    text = text.replace('"', '&quot;')
    text = text.replace("'", '&#39;')
    return text


# ─── helpers ────────────────────────────────────────────────────────────────

def _contact_html(personal_info: dict, sep: str) -> str:
    items = []
    if personal_info.get('email'):
        items.append(f'<span>{esc(personal_info["email"])}</span>')
    if personal_info.get('phone'):
        items.append(f'<span>{esc(personal_info["phone"])}</span>')
    if personal_info.get('location'):
        items.append(f'<span>{esc(personal_info["location"])}</span>')
    html = f'<span class="sep">{esc(sep)}</span>'.join(items)
    if personal_info.get('github'):
        if html:
            html += f'<span class="sep">{esc(sep)}</span>'
        html += f'<span>{esc(personal_info["github"])}</span>'
    return html


def _build_work_items(work_experience: list) -> str:
    parts = []
    for exp in work_experience:
        date_str = f"{format_date(exp.get('startDate', ''))} - {'至今' if exp.get('current') else format_date(exp.get('endDate', ''))}"
        achievements = ''.join(f'<div class="achievement">▸ {esc(a)}</div>' for a in (exp.get('achievements') or []) if a)
        parts.append(f'''\
        <div class="item">
          <div class="item-header">
            <div><div class="item-title">{esc(exp.get("position", ""))}</div>
            {f'<div class="item-sub">{esc(exp["company"])}</div>' if exp.get('company') else ''}</div>
            <div class="item-date">{esc(date_str)}</div>
          </div>
          {f'<div class="item-desc">{esc(exp["description"])}</div>' if exp.get('description') else ''}
          {achievements}
        </div>''')
    return ''.join(parts)


def _build_edu_items(education: list) -> str:
    parts = []
    for edu in education:
        df = edu.get('degree', '')
        if edu.get('field'):
            df += f' · {esc(edu["field"])}'
        parts.append(f'''\
        <div class="item">
          <div class="item-header">
            <div class="item-title">{esc(edu.get("school", ""))}</div>
            <div class="item-date">{format_date(edu.get("startDate", ""))} - {format_date(edu.get("endDate", ""))}</div>
          </div>
          <div class="item-sub">{esc(df)}</div>
          {f'<div class="item-desc">GPA: {esc(edu["gpa"])}</div>' if edu.get('gpa') else ''}
        </div>''')
    return ''.join(parts)


def _build_project_items(projects: list) -> str:
    parts = []
    for p in projects:
        tech_html = ''
        techs = p.get('technologies') or []
        if techs:
            tags = ''.join(f'<span class="tech-tag">{esc(t)}</span>' for t in techs)
            tech_html = f'<div class="tech-tags">{tags}</div>'
        parts.append(f'''\
        <div class="item">
          <div class="item-header">
            <div><div class="item-title">{esc(p.get("name", ""))}</div>
            {f'<div class="item-sub">{esc(p["role"])}</div>' if p.get('role') else ''}</div>
            <div class="item-date">{format_date(p.get("startDate", ""))} - {'至今' if p.get('current') else format_date(p.get("endDate", ""))}</div>
          </div>
          {f'<div class="item-desc">{esc(p["description"])}</div>' if p.get('description') else ''}
          {tech_html}
        </div>''')
    return ''.join(parts)


def _build_skill_lines(skills: list, sep: str = '、') -> str:
    parts = []
    for s in skills:
        items = s.get('items', []) or []
        if not items:
            continue
        cat = s.get('category', '')
        items_html = sep.join(f'<span>{esc(i)}</span>' for i in items)
        if cat:
            parts.append(f'<div class="skill-row"><div class="skill-category">{esc(cat)}：</div><div class="skill-items">{items_html}</div></div>')
        else:
            parts.append(f'<div class="skill-row"><div class="skill-items">{items_html}</div></div>')
    return ''.join(parts)


def _build_award_items(awards: list) -> str:
    parts = []
    for a in awards:
        parts.append(f'''\
        <div class="award-row">
          <div>
            <div class="item-title">{esc(a.get("title", ""))}</div>
            {f'<div class="item-sub" style="margin-top:1pt;">• {esc(a["organization"])}</div>' if a.get('organization') else ''}
          </div>
          {f'<div class="item-date">{esc(format_date(a["date"]))}</div>' if a.get('date') else ''}
        </div>
        {f'<div class="item-desc" style="margin-bottom:4pt;padding-left:10pt;">{esc(a["description"])}</div>' if a.get('description') else ''}''')
    return ''.join(parts)


def _build_lang_tags(languages: list) -> str:
    tags = ''.join(f'<span class="lang-item">{esc(l["name"])} - {esc(l["level"])}</span>'
                   for l in languages if l.get('name') and l.get('level'))
    return f'<div class="lang-row">{tags}</div>' if tags else ''


# ═══════════════════════════════════════════════════════════════════════════
# Theme 0 — 经典商务 (Classic)
# 深色头部，蓝色强调色，左对齐标准排版
# ═══════════════════════════════════════════════════════════════════════════

_T0_CSS = """
@page { size:A4; margin:10mm 15mm; }
* { margin:0; padding:0; box-sizing:border-box; }
body { font-family:'Noto Sans SC',sans-serif; font-size:9pt; color:#374151; line-height:1.5; }
.header { background:#1e293b; padding:8mm 6mm; margin:-10mm -15mm 6mm -15mm; }
.header .name { font-size:22pt; font-weight:bold; color:#fff; margin-bottom:2pt; }
.header .title { font-size:11pt; color:#93c5fd; margin-bottom:6pt; }
.header .contact { font-size:9pt; color:#cbd5e1; }
.header .contact .sep { color:#64748b; }
.section { margin-bottom:14pt; }
.section-title { font-size:12pt; font-weight:bold; color:#1e2937; border-bottom:2pt solid #2563eb; padding-bottom:3pt; margin-bottom:8pt; }
.item { margin-bottom:8pt; padding-left:10pt; border-left:2pt solid #334155; }
.item-header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:1pt; }
.item-title { font-size:10pt; font-weight:bold; color:#1e2937; }
.item-sub { font-size:9pt; color:#2563eb; }
.item-date { font-size:8pt; color:#6b7280; white-space:nowrap; }
.item-desc { font-size:9pt; color:#6b7280; margin-top:2pt; }
.achievement { font-size:8pt; color:#6b7280; margin-top:1pt; padding-left:8pt; }
.tech-tags { margin-top:3pt; display:flex; flex-wrap:wrap; gap:3pt; }
.tech-tag { font-size:7pt; color:#1e40af; background:#dbeafe; padding:1pt 5pt; display:inline-block; }
.skill-row { margin-bottom:4pt; display:flex; align-items:flex-start; }
.skill-category { font-size:9pt; font-weight:bold; color:#4b5563; min-width:65pt; flex-shrink:0; }
.skill-items { font-size:9pt; color:#374151; }
.lang-row { display:flex; flex-wrap:wrap; gap:6pt; }
.lang-item { font-size:8pt; color:#374151; background:#f1f5f9; border:1pt solid #cbd5e1; padding:2pt 7pt; display:inline-block; }
.award-row { display:flex; justify-content:space-between; align-items:center; margin-bottom:4pt; padding-left:10pt; border-left:2pt solid #334155; }
.summary { font-size:9pt; color:#6b7280; line-height:1.6; }
"""

def _build_t0(resume_data: dict) -> str:
    pi = resume_data.get('personalInfo', {}) or {}
    we = resume_data.get('workExperience', []) or []
    pr = resume_data.get('projects', []) or []
    ed = resume_data.get('education', []) or []
    sk = resume_data.get('skills', []) or []
    aw = resume_data.get('awards', []) or []
    la = resume_data.get('languages', []) or []

    parts = []
    a = parts.append
    a('<div class="header">')
    a(f'<div class="name">{esc(pi.get("name", "Your Name"))}</div>')
    if pi.get('title'):
        a(f'<div class="title">{esc(pi["title"])}</div>')
    ch = _contact_html(pi, ' • ')
    if ch:
        a(f'<div class="contact">{ch}</div>')
    a('</div>')

    if pi.get('summary'):
        a(f'<div class="section"><div class="section-title">个人简介</div><div class="summary">{esc(pi["summary"])}</div></div>')

    if we:
        a(f'<div class="section"><div class="section-title">工作经历</div>{_build_work_items(we)}</div>')
    if pr:
        a(f'<div class="section"><div class="section-title">项目经验</div>{_build_project_items(pr)}</div>')
    if ed:
        a(f'<div class="section"><div class="section-title">教育背景</div>{_build_edu_items(ed)}</div>')
    if sk:
        a(f'<div class="section"><div class="section-title">专业技能</div>{_build_skill_lines(sk)}</div>')
    if aw:
        a(f'<div class="section"><div class="section-title">荣誉奖项</div>{_build_award_items(aw)}</div>')
    if la:
        a(f'<div class="section"><div class="section-title">语言能力</div>{_build_lang_tags(la)}</div>')

    return f'<!DOCTYPE html><html lang="zh-CN"><meta charset="utf-8"><style>{FONT_FACE_CSS}{_T0_CSS}</style><body>{"".join(parts)}</body></html>'


# ═══════════════════════════════════════════════════════════════════════════
# Theme 1 — 现代简约 (Minimalist)
# 白色头部，绿色强调色，居中对齐，无边框
# ═══════════════════════════════════════════════════════════════════════════

_T1_CSS = """
@page { size:A4; margin:10mm 14mm; }
* { margin:0; padding:0; box-sizing:border-box; }
body { font-family:'Noto Sans SC',sans-serif; font-size:9pt; color:#374151; line-height:1.6; text-align:center; }
.header { padding:6mm 0 4mm 0; }
.header .name { font-size:20pt; font-weight:300; color:#111827; letter-spacing:4pt; margin-bottom:4pt; }
.header .title { font-size:9pt; font-weight:300; color:#6b7280; letter-spacing:2pt; text-transform:uppercase; margin-bottom:6pt; }
.header .contact { font-size:8pt; color:#9ca3af; }
.header .contact .sep { color:#d1d5db; }
.section { margin-bottom:14pt; text-align:left; }
.section-title { font-size:10pt; font-weight:bold; color:#111827; text-align:center; letter-spacing:2pt; margin-bottom:8pt; padding-bottom:4pt; border-bottom:1pt solid #e5e7eb; }
.item { margin-bottom:8pt; }
.item-header { display:flex; justify-content:space-between; align-items:flex-start; }
.item-title { font-size:10pt; font-weight:600; color:#111827; }
.item-sub { font-size:9pt; color:#059669; }
.item-date { font-size:8pt; color:#9ca3af; white-space:nowrap; }
.item-desc { font-size:9pt; color:#374151; margin-top:2pt; }
.achievement { font-size:8pt; color:#9ca3af; margin-top:1pt; }
.tech-tags { margin-top:3pt; display:flex; flex-wrap:wrap; gap:4pt; }
.tech-tag { font-size:7pt; color:#059669; background:#d1fae5; padding:1pt 6pt; display:inline-block; }
.skill-row { margin-bottom:4pt; display:flex; align-items:flex-start; }
.skill-category { font-size:9pt; font-weight:bold; color:#374151; min-width:60pt; flex-shrink:0; }
.skill-items { font-size:9pt; color:#374151; }
.lang-row { display:flex; flex-wrap:wrap; gap:6pt; justify-content:center; }
.lang-item { font-size:8pt; color:#374151; background:#f9fafb; border:1pt solid #e5e7eb; padding:2pt 8pt; display:inline-block; }
.award-row { display:flex; justify-content:space-between; align-items:center; margin-bottom:4pt; }
.summary { font-size:9pt; color:#6b7280; line-height:1.6; }
.hr { border:none; border-top:1pt solid #f3f4f6; margin:2pt 0 6pt 0; }
"""

def _build_t1(resume_data: dict) -> str:
    pi = resume_data.get('personalInfo', {}) or {}
    we = resume_data.get('workExperience', []) or []
    pr = resume_data.get('projects', []) or []
    ed = resume_data.get('education', []) or []
    sk = resume_data.get('skills', []) or []
    aw = resume_data.get('awards', []) or []
    la = resume_data.get('languages', []) or []

    parts = []
    a = parts.append
    a('<div class="header">')
    a(f'<div class="name">{esc(pi.get("name", "Your Name"))}</div>')
    if pi.get('title'):
        a(f'<div class="title">{esc(pi["title"])}</div>')
    ch = _contact_html(pi, ' / ')
    if ch:
        a(f'<div class="contact">{ch}</div>')
    a('</div>')

    if pi.get('summary'):
        a(f'<div class="section"><div class="section-title">简介</div><div class="summary">{esc(pi["summary"])}</div></div>')

    if we:
        a(f'<div class="section"><div class="section-title">工作经历</div>{_build_work_items(we)}</div>')
    if pr:
        a(f'<div class="section"><div class="section-title">项目经验</div>{_build_project_items(pr)}</div>')
    if ed:
        a(f'<div class="section"><div class="section-title">教育背景</div>{_build_edu_items(ed)}</div>')
    if sk:
        a(f'<div class="section"><div class="section-title">专业技能</div>{_build_skill_lines(sk)}</div>')
    if aw:
        a(f'<div class="section"><div class="section-title">荣誉奖项</div>{_build_award_items(aw)}</div>')
    if la:
        a(f'<div class="section"><div class="section-title">语言能力</div>'
          f'<hr class="hr"/>{_build_lang_tags(la)}</div>')

    return f'<!DOCTYPE html><html lang="zh-CN"><meta charset="utf-8"><style>{FONT_FACE_CSS}{_T1_CSS}</style><body>{"".join(parts)}</body></html>'


# ═══════════════════════════════════════════════════════════════════════════
# Theme 2 — 现代渐变 (Gradient)
# 蓝紫渐变头部，紫色强调色，卡片式模块
# ═══════════════════════════════════════════════════════════════════════════

_T2_CSS = """
@page { size:A4; margin:10mm 14mm; }
* { margin:0; padding:0; box-sizing:border-box; }
body { font-family:'Noto Sans SC',sans-serif; font-size:9pt; color:#374151; line-height:1.5; background:#fff; }
.header { background:linear-gradient(135deg,#3b82f6,#8b5cf6); padding:8mm 6mm; margin:-10mm -14mm 6mm -14mm; text-align:center; }
.header .name { font-size:22pt; font-weight:bold; color:#fff; margin-bottom:2pt; }
.header .title { font-size:10pt; color:#bfdbfe; margin-bottom:6pt; }
.header .contact { font-size:8pt; color:#dbeafe; }
.header .contact .sep { color:#93c5fd; }
.section { margin-bottom:12pt; background:#fafaff; border:1pt solid #ede9fe; border-radius:4pt; padding:8pt 10pt; }
.section-title { font-size:11pt; font-weight:bold; color:#1f2937; margin-bottom:6pt; display:flex; align-items:center; gap:6pt; }
.section-title::before { content:''; display:inline-block; width:6pt; height:6pt; background:#8b5cf6; border-radius:50%; flex-shrink:0; }
.item { margin-bottom:7pt; }
.item-header { display:flex; justify-content:space-between; align-items:flex-start; }
.item-title { font-size:10pt; font-weight:bold; color:#1f2937; }
.item-sub { font-size:8pt; color:#8b5cf6; }
.item-date { font-size:7pt; color:#6b7280; white-space:nowrap; background:#f5f3ff; padding:1pt 5pt; }
.item-desc { font-size:8pt; color:#6b7280; margin-top:2pt; }
.achievement { font-size:8pt; color:#6b7280; margin-top:1pt; padding-left:8pt; }
.tech-tags { margin-top:3pt; display:flex; flex-wrap:wrap; gap:3pt; }
.tech-tag { font-size:7pt; color:#7c3aed; background:#ede9fe; padding:1pt 5pt; display:inline-block; }
.skill-row { margin-bottom:3pt; }
.skill-category { font-size:9pt; font-weight:bold; color:#4b5563; display:inline; }
.skill-items { font-size:9pt; color:#374151; display:inline; }
.lang-row { display:flex; flex-wrap:wrap; gap:5pt; }
.lang-item { font-size:7pt; color:#374151; background:#f5f3ff; border:1pt solid #c4b5fd; padding:2pt 7pt; display:inline-block; }
.award-row { display:flex; justify-content:space-between; align-items:center; margin-bottom:3pt; }
.summary { font-size:9pt; color:#6b7280; line-height:1.6; }
"""

def _build_t2(resume_data: dict) -> str:
    pi = resume_data.get('personalInfo', {}) or {}
    we = resume_data.get('workExperience', []) or []
    pr = resume_data.get('projects', []) or []
    ed = resume_data.get('education', []) or []
    sk = resume_data.get('skills', []) or []
    aw = resume_data.get('awards', []) or []
    la = resume_data.get('languages', []) or []

    parts = []
    a = parts.append
    a('<div class="header">')
    a(f'<div class="name">{esc(pi.get("name", "Your Name"))}</div>')
    if pi.get('title'):
        a(f'<div class="title">{esc(pi["title"])}</div>')
    ch = _contact_html(pi, ' • ')
    if ch:
        a(f'<div class="contact">{ch}</div>')
    a('</div>')

    if pi.get('summary'):
        a(f'<div class="section"><div class="section-title">个人简介</div><div class="summary">{esc(pi["summary"])}</div></div>')

    if we:
        a(f'<div class="section"><div class="section-title">工作经历</div>{_build_work_items(we)}</div>')
    if pr:
        a(f'<div class="section"><div class="section-title">项目经验</div>{_build_project_items(pr)}</div>')
    if ed:
        a(f'<div class="section"><div class="section-title">教育背景</div>{_build_edu_items(ed)}</div>')
    if sk:
        a(f'<div class="section"><div class="section-title">专业技能</div>{_build_skill_lines(sk)}</div>')
    if aw:
        a(f'<div class="section"><div class="section-title">荣誉奖项</div>{_build_award_items(aw)}</div>')
    if la:
        a(f'<div class="section"><div class="section-title">语言能力</div>{_build_lang_tags(la)}</div>')

    return f'<!DOCTYPE html><html lang="zh-CN"><meta charset="utf-8"><style>{FONT_FACE_CSS}{_T2_CSS}</style><body>{"".join(parts)}</body></html>'


# ═══════════════════════════════════════════════════════════════════════════
# Theme 3 — 时间线 (Timeline)
# 深色背景，青色强调色，左侧时间线
# ═══════════════════════════════════════════════════════════════════════════

_T3_CSS = """
@page { size:A4; margin:10mm 14mm; }
* { margin:0; padding:0; box-sizing:border-box; }
body { font-family:'Noto Sans SC',sans-serif; font-size:9pt; color:#e2e8f0; line-height:1.5; background:#0f172a; }
.header { padding:6mm 0 4mm 0; border-left:3pt solid #38bdf8; padding-left:10pt; margin-bottom:6mm; }
.header .name { font-size:20pt; font-weight:bold; color:#fff; margin-bottom:2pt; }
.header .title { font-size:10pt; color:#38bdf8; margin-bottom:4pt; }
.header .contact { font-size:8pt; color:#94a3b8; }
.header .contact .sep { color:#475569; }
.section { margin-bottom:14pt; }
.section-title { font-size:11pt; font-weight:bold; color:#f1f5f9; margin-bottom:6pt; padding-bottom:3pt; border-bottom:1pt solid #1e293b; }
.item { margin-bottom:8pt; padding-left:12pt; border-left:2pt solid #334155; position:relative; }
.item::before { content:''; position:absolute; left:-4pt; top:4pt; width:6pt; height:6pt; background:#38bdf8; border-radius:50%; }
.item-header { display:flex; justify-content:space-between; align-items:flex-start; }
.item-title { font-size:10pt; font-weight:bold; color:#f1f5f9; }
.item-sub { font-size:8pt; color:#38bdf8; }
.item-date { font-size:7pt; color:#fff; white-space:nowrap; background:#38bdf8; padding:1pt 5pt; }
.item-desc { font-size:8pt; color:#94a3b8; margin-top:2pt; }
.achievement { font-size:8pt; color:#94a3b8; margin-top:1pt; padding-left:8pt; }
.tech-tags { margin-top:3pt; display:flex; flex-wrap:wrap; gap:3pt; }
.tech-tag { font-size:7pt; color:#38bdf8; background:#0c4a6e; padding:1pt 5pt; display:inline-block; }
.skill-row { margin-bottom:3pt; }
.skill-category { font-size:9pt; font-weight:bold; color:#e2e8f0; display:inline; }
.skill-items { font-size:9pt; color:#e2e8f0; display:inline; }
.lang-row { display:flex; flex-wrap:wrap; gap:5pt; }
.lang-item { font-size:7pt; color:#e2e8f0; background:#1e293b; border:1pt solid #334155; padding:2pt 7pt; display:inline-block; }
.award-row { display:flex; justify-content:space-between; align-items:center; margin-bottom:4pt; padding-left:12pt; border-left:2pt solid #334155; }
.summary { font-size:9pt; color:#94a3b8; line-height:1.6; }
"""

def _build_t3(resume_data: dict) -> str:
    pi = resume_data.get('personalInfo', {}) or {}
    we = resume_data.get('workExperience', []) or []
    pr = resume_data.get('projects', []) or []
    ed = resume_data.get('education', []) or []
    sk = resume_data.get('skills', []) or []
    aw = resume_data.get('awards', []) or []
    la = resume_data.get('languages', []) or []

    parts = []
    a = parts.append
    a('<div class="header">')
    a(f'<div class="name">{esc(pi.get("name", "Your Name"))}</div>')
    if pi.get('title'):
        a(f'<div class="title">{esc(pi["title"])}</div>')
    ch = _contact_html(pi, ' • ')
    if ch:
        a(f'<div class="contact">{ch}</div>')
    a('</div>')

    if pi.get('summary'):
        a(f'<div class="section"><div class="section-title">个人简介</div><div class="summary">{esc(pi["summary"])}</div></div>')

    if we:
        a(f'<div class="section"><div class="section-title">工作经历</div>{_build_work_items(we)}</div>')
    if pr:
        a(f'<div class="section"><div class="section-title">项目经验</div>{_build_project_items(pr)}</div>')
    if ed:
        a(f'<div class="section"><div class="section-title">教育背景</div>{_build_edu_items(ed)}</div>')
    if sk:
        a(f'<div class="section"><div class="section-title">专业技能</div>{_build_skill_lines(sk)}</div>')
    if aw:
        a(f'<div class="section"><div class="section-title">荣誉奖项</div>{_build_award_items(aw)}</div>')
    if la:
        a(f'<div class="section"><div class="section-title">语言能力</div>{_build_lang_tags(la)}</div>')

    return f'<!DOCTYPE html><html lang="zh-CN"><meta charset="utf-8"><style>{FONT_FACE_CSS}{_T3_CSS}</style><body style="background:#0f172a;min-height:100%;padding:10mm 14mm;margin:0;">{"".join(parts)}</body></html>'


# ═══════════════════════════════════════════════════════════════════════════
# Theme 4 — 左侧边栏 (Sidebar)
# 左 160px 橙色侧边栏，右内容区
# ═══════════════════════════════════════════════════════════════════════════

_T4_CSS = """
@page { size:A4; margin:0; }
* { margin:0; padding:0; box-sizing:border-box; }
body { font-family:'Noto Sans SC',sans-serif; font-size:9pt; color:#374151; line-height:1.5; display:flex; min-height:297mm; }
.sidebar { width:160pt; background:#f97316; padding:8mm 5mm; color:#fff; flex-shrink:0; }
.sidebar .name { font-size:16pt; font-weight:bold; color:#fff; margin-bottom:2pt; }
.sidebar .title { font-size:8pt; color:#fed7aa; margin-bottom:4mm; }
.sidebar .contact-item { font-size:7pt; color:#ffedd5; margin-bottom:2pt; word-break:break-all; }
.sidebar .contact-label { font-size:6pt; color:#fdba74; text-transform:uppercase; letter-spacing:1pt; margin-top:4pt; }
.sidebar-section-title { font-size:8pt; font-weight:bold; color:#fff; letter-spacing:1pt; margin:4mm 0 2mm 0; padding-bottom:2pt; border-bottom:1pt solid rgba(255,255,255,0.3); }
.sidebar .skill-tag { font-size:7pt; color:#fff; background:rgba(255,255,255,0.15); padding:1pt 5pt; display:inline-block; margin:1pt; }
.sidebar .lang-item { font-size:7pt; color:#ffedd5; margin:1pt 0; }
.content { flex:1; padding:8mm 6mm; }
.content .section { margin-bottom:12pt; }
.content .section-title { font-size:11pt; font-weight:bold; color:#1f2937; padding-bottom:3pt; border-bottom:2pt solid #f97316; margin-bottom:6pt; }
.content .item { margin-bottom:7pt;}
.content .item-header { display:flex; justify-content:space-between; align-items:flex-start; }
.content .item-title { font-size:10pt; font-weight:bold; color:#1f2937; }
.content .item-sub { font-size:8pt; color:#ea580c; }
.content .item-date { font-size:7pt; color:#9ca3af; white-space:nowrap; }
.content .item-desc { font-size:8pt; color:#6b7280; margin-top:2pt; }
.content .achievement { font-size:8pt; color:#6b7280; margin-top:1pt; padding-left:8pt; }
.content .tech-tags { margin-top:2pt; display:flex; flex-wrap:wrap; gap:2pt; }
.content .tech-tag { font-size:7pt; color:#c2410c; background:#ffedd5; padding:1pt 5pt; display:inline-block; }
.content .summary { font-size:9pt; color:#6b7280; line-height:1.6; }
.content .award-row { margin-bottom:4pt; }
"""

def _build_t4(resume_data: dict) -> str:
    pi = resume_data.get('personalInfo', {}) or {}
    we = resume_data.get('workExperience', []) or []
    pr = resume_data.get('projects', []) or []
    ed = resume_data.get('education', []) or []
    sk = resume_data.get('skills', []) or []
    aw = resume_data.get('awards', []) or []
    la = resume_data.get('languages', []) or []

    # sidebar
    sb = []
    sb.append(f'<div class="name">{esc(pi.get("name", "Your Name"))}</div>')
    if pi.get('title'):
        sb.append(f'<div class="title">{esc(pi["title"])}</div>')

    sb.append('<div class="contact-label">联系方式</div>')
    for label, key in [('EMAIL', 'email'), ('PHONE', 'phone'), ('LOCATION', 'location'), ('GITHUB', 'github')]:
        if pi.get(key):
            sb.append(f'<div class="contact-item">{esc(pi[key])}</div>')

    if sk:
        sb.append('<div class="sidebar-section-title">专业技能</div>')
        for s in sk:
            for item in (s.get('items', []) or []):
                sb.append(f'<span class="skill-tag">{esc(item)}</span>')

    if la:
        sb.append('<div class="sidebar-section-title">语言能力</div>')
        for l in la:
            if l.get('name') and l.get('level'):
                sb.append(f'<div class="lang-item">{esc(l["name"])} — {esc(l["level"])}</div>')

    sidebar_html = ''.join(sb)

    # content
    ct = []
    a = ct.append

    if pi.get('summary'):
        a(f'<div class="section"><div class="section-title">个人简介</div><div class="summary">{esc(pi["summary"])}</div></div>')

    if we:
        a(f'<div class="section"><div class="section-title">工作经历</div>{_build_work_items(we)}</div>')
    if pr:
        a(f'<div class="section"><div class="section-title">项目经验</div>{_build_project_items(pr)}</div>')
    if ed:
        a(f'<div class="section"><div class="section-title">教育背景</div>{_build_edu_items(ed)}</div>')
    if aw:
        a(f'<div class="section"><div class="section-title">荣誉奖项</div>{_build_award_items(aw)}</div>')

    return f'''<!DOCTYPE html><html lang="zh-CN"><meta charset="utf-8">
    <style>{FONT_FACE_CSS}{_T4_CSS}</style>
    <body><div class="sidebar">{sidebar_html}</div><div class="content">{"".join(ct)}</div></body></html>'''


# ─── Theme dispatch ────────────────────────────────────────────────────────

_BUILDERS = [_build_t0, _build_t1, _build_t2, _build_t3, _build_t4]


def generate_resume_pdf(resume_data: dict, filename: str = 'resume', theme_id: int = 0) -> bytes:
    """
    生成简历 PDF (HTML+CSS -> WeasyPrint)

    Args:
        resume_data: 简历数据
        filename: 文件名（不含扩展名）
        theme_id: 模板主题 ID (0-4)

    Returns:
        PDF 文件的字节数据
    """
    builder = _BUILDERS[theme_id] if 0 <= theme_id < len(_BUILDERS) else _BUILDERS[0]
    html_str = builder(resume_data)
    buffer = BytesIO()
    HTML(string=html_str).write_pdf(buffer)
    pdf_data = buffer.getvalue()
    buffer.close()
    return pdf_data
