"""
PDF 生成服务 - 使用 ReportLab 生成高质量简历 PDF
支持矢量字体和精确排版
"""
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib.colors import HexColor, white, black
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT
from reportlab.pdfbase.pdfmetrics import stringWidth
import os

# 检查字体文件是否存在
FONT_PATH = os.path.join(os.path.dirname(__file__), '..', 'fonts', 'NotoSansCJKsc-Regular.otf')
FONT_BOLD_PATH = os.path.join(os.path.dirname(__file__), '..', 'fonts', 'NotoSansCJKsc-Bold.otf')

DEFAULT_FONT = 'Helvetica'
DEFAULT_FONT_BOLD = 'Helvetica-Bold'

# 尝试注册中文字体
try:
    if os.path.exists(FONT_PATH) and os.path.exists(FONT_BOLD_PATH):
        from reportlab.pdfbase.ttfonts import TTFError
        try:
            pdfmetrics.registerFont(TTFont('NotoSansSC', FONT_PATH))
            pdfmetrics.registerFont(TTFont('NotoSansSC-Bold', FONT_BOLD_PATH))
            DEFAULT_FONT = 'NotoSansSC'
            DEFAULT_FONT_BOLD = 'NotoSansSC-Bold'
            print("中文字体加载成功")
        except TTFError as e:
            print(f"字体格式不支持，使用内置字体: {e}")
        except Exception as e:
            print(f"字体加载失败，使用内置字体: {e}")
except ImportError:
    pass

# 颜色定义
COLORS = {
    'header_bg': HexColor('#1a1a2e'),
    'header_text': white,
    'accent': HexColor('#4f46e5'),
    'text': HexColor('#1e293b'),
    'text_light': HexColor('#475569'),
    'border': HexColor('#e2e8f0'),
    'bg_light': HexColor('#f8fafc'),
}


def create_styles():
    """创建样式"""
    styles = getSampleStyleSheet()

    styles.add(ParagraphStyle(
        name='Name',
        fontName=DEFAULT_FONT_BOLD,
        fontSize=22,
        textColor=white,
        spaceAfter=4,
    ))

    styles.add(ParagraphStyle(
        name='ResumeTitle',
        fontName=DEFAULT_FONT,
        fontSize=11,
        textColor=HexColor('#a5b4fc'),
        spaceAfter=8,
    ))

    styles.add(ParagraphStyle(
        name='Contact',
        fontName=DEFAULT_FONT,
        fontSize=9,
        textColor=HexColor('#94a3b8'),
        spaceAfter=2,
    ))

    styles.add(ParagraphStyle(
        name='SectionTitle',
        fontName=DEFAULT_FONT_BOLD,
        fontSize=13,
        textColor=COLORS['text'],
        spaceBefore=12,
        spaceAfter=6,
        borderPadding=(0, 0, 4, 0),
    ))

    styles.add(ParagraphStyle(
        name='ItemTitle',
        fontName=DEFAULT_FONT_BOLD,
        fontSize=10,
        textColor=COLORS['text'],
        spaceAfter=2,
    ))

    styles.add(ParagraphStyle(
        name='ItemSub',
        fontName=DEFAULT_FONT,
        fontSize=9,
        textColor=COLORS['accent'],
        spaceAfter=2,
    ))

    styles.add(ParagraphStyle(
        name='ItemDate',
        fontName=DEFAULT_FONT,
        fontSize=8,
        textColor=HexColor('#94a3b8'),
        alignment=TA_RIGHT,
    ))

    styles.add(ParagraphStyle(
        name='ItemDesc',
        fontName=DEFAULT_FONT,
        fontSize=9,
        textColor=COLORS['text_light'],
        spaceAfter=4,
        leading=14,
    ))

    styles.add(ParagraphStyle(
        name='Achievement',
        fontName=DEFAULT_FONT,
        fontSize=8,
        textColor=HexColor('#64748b'),
        spaceAfter=2,
        leftIndent=12,
    ))

    styles.add(ParagraphStyle(
        name='Summary',
        fontName=DEFAULT_FONT,
        fontSize=9,
        textColor=COLORS['text_light'],
        leading=14,
        spaceAfter=6,
    ))

    styles.add(ParagraphStyle(
        name='TechTag',
        fontName=DEFAULT_FONT,
        fontSize=7,
        textColor=COLORS['accent'],
        backColor=HexColor('#eef2ff'),
        borderPadding=(2, 4, 2, 4),
        spaceAfter=2,
    ))

    return styles


def format_date(date_str: str) -> str:
    """格式化日期"""
    if not date_str:
        return ''
    try:
        from datetime import datetime
        date = datetime.strptime(date_str, '%Y-%m')
        return f"{date.year}.{date.month:02d}"
    except:
        return date_str


def generate_resume_pdf(resume_data: dict, filename: str = 'resume') -> bytes:
    """
    生成简历 PDF

    Args:
        resume_data: 简历数据
        filename: 文件名（不含扩展名）

    Returns:
        PDF 文件的字节数据
    """
    from io import BytesIO

    buffer = BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        leftMargin=15*mm,
        rightMargin=15*mm,
        topMargin=10*mm,
        bottomMargin=10*mm,
    )

    styles = create_styles()
    story = []

    # 解析数据
    personal_info = resume_data.get('personalInfo', {}) or {}
    work_experience = resume_data.get('workExperience', []) or []
    projects = resume_data.get('projects', []) or []
    education = resume_data.get('education', []) or []
    skills = resume_data.get('skills', []) or []
    awards = resume_data.get('awards', []) or []
    languages = resume_data.get('languages', []) or []

    # ========== 头部 ==========
    header_data = [
        [Paragraph(personal_info.get('name', 'Your Name') or 'Your Name', styles['Name'])],
        [Paragraph(personal_info.get('title', '') or '', styles['ResumeTitle'])],
    ]

    # 联系信息
    contact_parts = []
    if personal_info.get('email'):
        contact_parts.append(personal_info['email'])
    if personal_info.get('phone'):
        contact_parts.append(personal_info['phone'])
    if personal_info.get('location'):
        contact_parts.append(personal_info['location'])
    if personal_info.get('github'):
        contact_parts.append(personal_info['github'])

    if contact_parts:
        header_data.append([Paragraph(' • '.join(contact_parts), styles['Contact'])])

    header_table = Table(header_data, colWidths=[180*mm])
    header_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), COLORS['header_bg']),
        ('PADDING', (0, 0), (-1, -1), 8*mm),
        ('TOPPADDING', (0, 0), (-1, 0), 6*mm),
        ('BOTTOMPADDING', (0, -1), (-1, -1), 6*mm),
        ('LEFTPADDING', (0, 0), (-1, -1), 6*mm),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6*mm),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))

    story.append(header_table)
    story.append(Spacer(1, 6*mm))

    # ========== 个人简介 ==========
    if personal_info.get('summary'):
        story.append(Paragraph('About Me', styles['SectionTitle']))
        story.append(HRFlowable(width='100%', thickness=2, color=COLORS['accent'], spaceAfter=4))
        story.append(Paragraph(personal_info['summary'], styles['Summary']))

    # ========== 工作经历 ==========
    if work_experience:
        story.append(Paragraph('Experience', styles['SectionTitle']))
        story.append(HRFlowable(width='100%', thickness=2, color=COLORS['accent'], spaceAfter=4))

        for exp in work_experience:
            # 标题行
            date_str = f"{format_date(exp.get('startDate', ''))} - {'Present' if exp.get('current') else format_date(exp.get('endDate', ''))}"
            title_content = Paragraph(f"<b>{exp.get('position', '')}</b>", styles['ItemTitle'])
            date_content = Paragraph(date_str, styles['ItemDate'])
            title_table = Table([[title_content, date_content]], colWidths=[130*mm, 50*mm])
            title_table.setStyle(TableStyle([
                ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ]))
            story.append(title_table)

            # 公司
            if exp.get('company'):
                story.append(Paragraph(exp.get('company', ''), styles['ItemSub']))

            # 描述
            if exp.get('description'):
                story.append(Paragraph(exp.get('description', ''), styles['ItemDesc']))

            # 成就
            for achievement in (exp.get('achievements') or []):
                if achievement:
                    story.append(Paragraph(f"▸ {achievement}", styles['Achievement']))

            story.append(Spacer(1, 4*mm))

    # ========== 项目经验 ==========
    if projects:
        story.append(Paragraph('Projects', styles['SectionTitle']))
        story.append(HRFlowable(width='100%', thickness=2, color=COLORS['accent'], spaceAfter=4))

        for project in projects:
            # 标题行
            date_str = f"{format_date(project.get('startDate', ''))} - {'Present' if project.get('current') else format_date(project.get('endDate', ''))}"
            title_content = Paragraph(f"<b>{project.get('name', '')}</b>", styles['ItemTitle'])
            date_content = Paragraph(date_str, styles['ItemDate'])
            title_table = Table([[title_content, date_content]], colWidths=[130*mm, 50*mm])
            title_table.setStyle(TableStyle([
                ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ]))
            story.append(title_table)

            # 角色
            if project.get('role'):
                story.append(Paragraph(project.get('role', ''), styles['ItemSub']))

            # 描述
            if project.get('description'):
                story.append(Paragraph(project.get('description', ''), styles['ItemDesc']))

            # 技术栈
            technologies = project.get('technologies') or []
            if technologies:
                tech_text = '  '.join(technologies)
                tech_style = ParagraphStyle(
                    name='TechTag',
                    fontName=DEFAULT_FONT,
                    fontSize=7,
                    textColor=COLORS['accent'],
                    backColor=HexColor('#eef2ff'),
                    borderPadding=(2, 4, 2, 4),
                    spaceAfter=2,
                )
                story.append(Paragraph(tech_text, tech_style))

            story.append(Spacer(1, 4*mm))

    # ========== 教育背景 ==========
    if education:
        story.append(Paragraph('Education', styles['SectionTitle']))
        story.append(HRFlowable(width='100%', thickness=2, color=COLORS['accent'], spaceAfter=4))

        for edu in education:
            # 标题行
            date_str = f"{format_date(edu.get('startDate', ''))} - {format_date(edu.get('endDate', ''))}"
            degree_field = edu.get('degree', '')
            if edu.get('field'):
                degree_field += f" • {edu['field']}"
            title_content = Paragraph(f"<b>{edu.get('school', '')}</b>", styles['ItemTitle'])
            date_content = Paragraph(date_str, styles['ItemDate'])
            title_table = Table([[title_content, date_content]], colWidths=[130*mm, 50*mm])
            title_table.setStyle(TableStyle([
                ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ]))
            story.append(title_table)

            if degree_field:
                story.append(Paragraph(degree_field, styles['ItemSub']))

            if edu.get('gpa'):
                story.append(Paragraph(f"GPA: {edu['gpa']}", styles['ItemDesc']))

            story.append(Spacer(1, 4*mm))

    # ========== 技能 ==========
    if skills:
        story.append(Paragraph('Skills', styles['SectionTitle']))
        story.append(HRFlowable(width='100%', thickness=2, color=COLORS['accent'], spaceAfter=4))

        for skill in skills:
            category = skill.get('category', '')
            items = skill.get('items', []) or []
            if items:
                items_text = ', '.join(items)
                if category:
                    story.append(Paragraph(f"<b>{category}:</b> {items_text}", styles['ItemDesc']))
                else:
                    story.append(Paragraph(items_text, styles['ItemDesc']))

    # ========== 荣誉奖项 ==========
    if awards:
        story.append(Paragraph('Awards', styles['SectionTitle']))
        story.append(HRFlowable(width='100%', thickness=2, color=COLORS['accent'], spaceAfter=4))

        for award in awards:
            date_str = format_date(award.get('date', ''))
            title_content = Paragraph(f"<b>{award.get('title', '')}</b>", styles['ItemTitle'])
            date_content = Paragraph(date_str, styles['ItemDate'])
            title_table = Table([[title_content, date_content]], colWidths=[130*mm, 50*mm])
            title_table.setStyle(TableStyle([
                ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ]))
            story.append(title_table)

            if award.get('organization'):
                story.append(Paragraph(f"• {award.get('organization', '')}", styles['ItemSub']))

            if award.get('description'):
                story.append(Paragraph(award.get('description', ''), styles['ItemDesc']))

            story.append(Spacer(1, 4*mm))

    # ========== 语言 ==========
    if languages:
        story.append(Paragraph('Languages', styles['SectionTitle']))
        story.append(HRFlowable(width='100%', thickness=2, color=COLORS['accent'], spaceAfter=4))

        lang_parts = []
        for lang in languages:
            if lang.get('name'):
                level = lang.get('level', '')
                if level:
                    lang_parts.append(f"{lang['name']} - {level}")
                else:
                    lang_parts.append(lang['name'])

        if lang_parts:
            story.append(Paragraph('  '.join(lang_parts), styles['ItemDesc']))

    # 生成 PDF
    doc.build(story)
    pdf_data = buffer.getvalue()
    buffer.close()

    return pdf_data
