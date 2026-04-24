package services

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"regexp"
	"strings"
	"time"

	"github.com/ledongthuc/pdf"
)

// =============================================================================
// ResumePDFParser - 简历PDF解析器类
// =============================================================================

// ResumePDFParser 简历PDF解析器
type ResumePDFParser struct {
	// 正则表达式缓存
	timeRangeRe    *regexp.Regexp
	singleTimeRe   *regexp.Regexp
	timeSplitterRe *regexp.Regexp
	emailRe        *regexp.Regexp
	phoneRe        *regexp.Regexp
	degreeRe       *regexp.Regexp
	schoolRe       *regexp.Regexp
	companyRe      *regexp.Regexp
	positionRe     *regexp.Regexp
	techRe         *regexp.Regexp

	// Section标题关键词
	eduTitles   []string
	workTitles  []string
	projTitles  []string
	skillTitles []string
	awardTitles []string
	langTitles  []string

	// 常见词汇表
	commonWords map[string]bool
}

// NewResumePDFParser 创建新的简历解析器实例
func NewResumePDFParser() *ResumePDFParser {
	p := &ResumePDFParser{
		eduTitles: []string{
			"教育背景", "教育经历", "学历背景", "Education", "EDUCATION", "教育",
		},
		workTitles: []string{
			"工作经历", "工作经验", "工作经历", "实习经历", "Employment", "WORK EXPERIENCE", "职业经历",
		},
		projTitles: []string{
			"项目经验", "项目经历", "项目背景", "Projects", "PROJECT", "项目",
		},
		skillTitles: []string{
			"专业技能", "技能特长", "技术能力", "技能证书", "Skills", "SKILLS", "技术栈",
		},
		awardTitles: []string{
			"获奖荣誉", "荣誉奖项", "奖项", "Awards", "AWARDS", "获得奖项",
		},
		langTitles: []string{
			"语言能力", "语言", "Languages", "LANGUAGES",
		},
		commonWords: map[string]bool{
			"the": true, "and": true, "for": true, "are": true, "but": true, "not": true,
			"you": true, "all": true, "can": true, "had": true, "her": true, "was": true,
			"one": true, "our": true, "out": true, "day": true, "get": true, "has": true,
			"him": true, "his": true, "how": true, "its": true, "may": true, "new": true,
			"now": true, "old": true, "see": true, "two": true, "way": true, "who": true,
			"boy": true, "did": true, "she": true, "use": true, "your": true, "each": true,
			"this": true, "that": true, "with": true, "from": true, "they": true, "will": true,
			"been": true, "have": true, "more": true, "when": true, "year": true, "than": true,
			"公司": true, "工作": true, "负责": true, "管理": true, "项目": true, "经验": true,
			"开发": true, "设计": true, "实现": true, "优化": true, "维护": true, "参与": true,
			"主要": true, "完成": true, "获得": true, "提升": true, "进行": true, "包括": true,
		},
	}

	// 初始化正则表达式
	p.initRegexps()

	return p
}

// initRegexps 初始化所有正则表达式
func (p *ResumePDFParser) initRegexps() {
	// 时间范围：支持多种格式
	// 2020.09 - 2022.06, 2020年9月-2022年6月, 2020/09 - 2022/06, 至今, 现在, current, present
	p.timeRangeRe = regexp.MustCompile(`(\d{4}[年\.\-/]\d{1,2}[月]?\s*[-–~至]\s*\d{4}[年\.\-/]\d{1,2}[月]?|至今|现在|current|present)`)

	// 单独时间：2020.09 或 2020年9月
	p.singleTimeRe = regexp.MustCompile(`(\d{4}[年\.\-/]\d{1,2}[月]?|至今|现在)`)

	// 时间分割符
	p.timeSplitterRe = regexp.MustCompile(`[-–~至]`)

	// 邮箱
	p.emailRe = regexp.MustCompile(`[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}`)

	// 手机号（中国）- 支持多种格式
	p.phoneRe = regexp.MustCompile(`1[3-9]\d{9}|1[3-9]\d[\s\-]?\d{4}[\s\-]?\d{4}`)

	// 学位
	p.degreeRe = regexp.MustCompile(`(?:博士|硕士|本科|学士|专科|MBA|PhD|博士研究生|硕士研究生|大学)`)

	// 学校关键词
	p.schoolRe = regexp.MustCompile(`(?:大学|学院|学校|技术学院|职业学院)`)

	// 公司关键词
	p.companyRe = regexp.MustCompile(`(?:公司|集团|科技|有限|企业|工作室|机构)`)

	// 职位关键词
	p.positionRe = regexp.MustCompile(`(?:工程师|设计师|经理|总监|架构师|负责人|主管|专员|实习生|Analyst|Consultant|Engineer|Developer|Designer|Manager|Director|VP|Chief)`)

	// 技术栈
	p.techRe = regexp.MustCompile(`([A-Za-z0-9+#.\\-]{2,30})`)
}

// =============================================================================
// ParsedResume - 解析结果数据结构
// =============================================================================

// ParsedResume 解析后的简历数据结构
type ParsedResume struct {
	PersonalInfo   map[string]interface{}   `json:"personal_info"`
	Education     []map[string]interface{} `json:"education"`
	WorkExperience []map[string]interface{} `json:"work_experience"`
	Projects      []map[string]interface{} `json:"projects"`
	Skills        []map[string]interface{} `json:"skills"`
	Awards        []map[string]interface{} `json:"awards"`
	Languages     []map[string]interface{} `json:"languages"`
	RawText       string                   `json:"raw_text"`
}

// =============================================================================
// 公开方法
// =============================================================================

// ParsePDF 解析 PDF 文件并提取简历信息
func (p *ResumePDFParser) ParsePDF(file io.Reader) (result *ParsedResume, parseErr error) {
	defer func() {
		if r := recover(); r != nil {
			parseErr = fmt.Errorf("PDF 解析 panic: %v", r)
			result = nil
		}
	}()

	buf := new(bytes.Buffer)
	if _, err := buf.ReadFrom(file); err != nil {
		return nil, fmt.Errorf("读取文件失败: %w", err)
	}

	if buf.Len() == 0 {
		return nil, fmt.Errorf("文件内容为空")
	}

	pdfBytes := buf.Bytes()
	if len(pdfBytes) < 4 || string(pdfBytes[:4]) != "%PDF" {
		return nil, fmt.Errorf("文件不是有效的 PDF 格式")
	}

	pdfReader, err := pdf.NewReader(bytes.NewReader(pdfBytes), int64(buf.Len()))
	if err != nil {
		return nil, fmt.Errorf("解析 PDF 失败: %w", err)
	}

	var fullText strings.Builder
	numPages := pdfReader.NumPage()
	if numPages == 0 {
		return nil, fmt.Errorf("PDF 中没有页面")
	}

	for pageNum := 1; pageNum <= numPages; pageNum++ {
		page := pdfReader.Page(pageNum)
		text, err := page.GetPlainText(nil)
		if err != nil {
			continue
		}
		fullText.WriteString(text)
		fullText.WriteString("\n")
	}

	rawText := fullText.String()
	if rawText == "" {
		return nil, fmt.Errorf("无法从 PDF 中提取文本内容")
	}

	// 使用解析器解析简历
	parsed := p.parseResumeStructure(rawText)
	parsed.RawText = rawText

	return parsed, nil
}

// ParseText 直接解析文本内容
func (p *ResumePDFParser) ParseText(text string) *ParsedResume {
	return p.parseResumeStructure(text)
}

// =============================================================================
// 内部解析方法
// =============================================================================

// sectionBoundary 标识一个section的起止位置
type sectionBoundary struct {
	start int
	end   int
}

// parseResumeStructure 解析简历文本结构
func (p *ResumePDFParser) parseResumeStructure(text string) *ParsedResume {
	log.Printf("========== PDF 解析开始 ==========")

	resume := &ParsedResume{
		PersonalInfo:   make(map[string]interface{}),
		Education:     make([]map[string]interface{}, 0),
		WorkExperience: make([]map[string]interface{}, 0),
		Projects:      make([]map[string]interface{}, 0),
		Skills:        make([]map[string]interface{}, 0),
		Awards:        make([]map[string]interface{}, 0),
		Languages:     make([]map[string]interface{}, 0),
	}

	// 1. 按行分割并清洗
	lines := p.splitAndCleanLines(text)
	log.Printf("【分行】共 %d 行", len(lines))

	// 2. 识别各个section的边界
	sections := p.identifySections(lines)
	log.Printf("【Section识别】")
	if len(sections) == 0 {
		log.Printf("  (未识别到任何 section)")
	}
	for name, bound := range sections {
		log.Printf("  %s: [%d:%d] (%d行)", name, bound.start, bound.end, bound.end-bound.start)
	}

	// 3. 提取个人信息
	resume.PersonalInfo = p.extractPersonalInfo(lines, sections)
	log.Printf("【个人信息】name=%s, title=%s, phone=%s, email=%s",
		resume.PersonalInfo["name"], resume.PersonalInfo["title"],
		resume.PersonalInfo["phone"], resume.PersonalInfo["email"])

	// 4. 提取教育经历
	if eduSection, ok := sections["education"]; ok && eduSection.start < eduSection.end {
		resume.Education = p.extractEducation(lines[eduSection.start:eduSection.end])
	}
	log.Printf("【教育】提取到 %d 条", len(resume.Education))

	// 5. 提取工作经历
	if workSection, ok := sections["work"]; ok && workSection.start < workSection.end {
		resume.WorkExperience = p.extractWorkExperience(lines[workSection.start:workSection.end])
	}
	log.Printf("【工作】提取到 %d 条", len(resume.WorkExperience))

	// 6. 提取项目经验
	if projSection, ok := sections["project"]; ok && projSection.start < projSection.end {
		resume.Projects = p.extractProjects(lines[projSection.start:projSection.end])
	}
	log.Printf("【项目】提取到 %d 条", len(resume.Projects))

	// 7. 提取技能
	if skillSection, ok := sections["skill"]; ok && skillSection.start < skillSection.end {
		resume.Skills = p.extractSkills(lines[skillSection.start:skillSection.end])
	}
	log.Printf("【技能】提取到 %d 个分类", len(resume.Skills))

	// 8. 提取荣誉奖项
	if awardSection, ok := sections["award"]; ok && awardSection.start < awardSection.end {
		resume.Awards = p.extractAwards(lines[awardSection.start:awardSection.end])
	}
	log.Printf("【奖项】提取到 %d 条", len(resume.Awards))

	// 9. 提取语言能力
	if langSection, ok := sections["language"]; ok && langSection.start < langSection.end {
		resume.Languages = p.extractLanguages(lines[langSection.start:langSection.end])
	}
	log.Printf("【语言】提取到 %d 条", len(resume.Languages))

	log.Printf("========== PDF 解析完成 ==========")
	return resume
}

// splitAndCleanLines 分割并清洗行
func (p *ResumePDFParser) splitAndCleanLines(text string) []string {
	lines := strings.Split(text, "\n")
	var cleanLines []string

	for _, line := range lines {
		trimmed := strings.TrimSpace(line)
		if trimmed != "" {
			cleanLines = append(cleanLines, trimmed)
		}
	}

	return cleanLines
}

// isCleanSectionTitle 判断是否是一个"干净"的section标题行
// 干净的标题行：除了标题关键词外，没有太多其他内容
func (p *ResumePDFParser) isCleanSectionTitle(line string, title string) bool {
	trimmed := strings.TrimSpace(line)
	upperLine := strings.ToUpper(trimmed)
	upperTitle := strings.ToUpper(title)

	// 标题必须在行中
	if !strings.Contains(upperLine, upperTitle) {
		return false
	}

	// 关键改进：必须是完整匹配，而不是部分匹配
	// 例如："教育经历" 包含 "教育背景" 中的 "教育"，但不是完整匹配
	// 我们需要检查是否是完整的标题（在词边界上）

	// 找到标题在行中的位置
	idx := strings.Index(upperLine, upperTitle)
	if idx < 0 {
		return false
	}

	// 检查标题前后的字符，确保是完整的词
	beforeIdx := idx - 1
	afterIdx := idx + len(title)

	// 标题前如果有字符，必须是分隔符（空格、冒号等）
	if beforeIdx >= 0 {
		beforeChar := string(trimmed[beforeIdx])
		if beforeChar != " " && beforeChar != "：" && beforeChar != ":" && beforeChar != "　" { // 全角空格
			// 前面不是分隔符，可能是包含关系
			return false
		}
	}

	// 标题后如果有字符，必须是分隔符或结束
	if afterIdx < len(trimmed) {
		afterChar := string(trimmed[afterIdx])
		if afterChar != " " && afterChar != "：" && afterChar != ":" && afterChar != "　" && afterChar != "\t" {
			// 后面不是分隔符，可能是包含关系
			return false
		}
	}

	// 去掉标题后的内容
	afterTitle := strings.TrimSpace(trimmed[afterIdx:])

	// 干净的标题：后面没有内容，或者只有很少的标点/空格
	if len(afterTitle) > 10 {
		return false
	}

	// 标题本身长度应该占行的大部分（宽松一点，4倍以内）
	if len(trimmed) > len(title)*4 {
		return false
	}

	// 关键改进：如果行只包含"教育"+"经历"这种组合，但标题是"教育背景"
	// 说明是误匹配，检查关键词的相似度
	// 如果标题是4个字，行也是4-5字，且高度重合，认为是有效的标题
	if len(title) >= 4 && len(trimmed) >= len(title)-1 && len(trimmed) <= len(title)+3 {
		return true
	}

	return true
}

// identifySections 识别各个section的起止位置
func (p *ResumePDFParser) identifySections(lines []string) map[string]sectionBoundary {
	sections := make(map[string]sectionBoundary)

	type sectionInfo struct {
		key      string
		index    int
		titleLen int
		priority int
	}

	var sectionInfos []sectionInfo

	// 优先级定义（数字越大优先级越高）
	priorityMap := map[string]int{
		"education": 50,
		"work":      60,
		"project":   70,
		"skill":     40,
		"award":     30,
		"language":  20,
	}

	// 扩展的section标题列表 - 按优先级排序（更具体的在前）
	allTitles := map[string][]string{
		"education": {
			"教育背景", "教育经历", "学历背景", "Education", "EDUCATION",
		},
		"work": {
			"工作经历", "工作经验", "实习经历", "Employment", "WORK EXPERIENCE", "职业经历",
		},
		"project": {
			"项目经验", "项目经历", "项目背景", "Projects", "PROJECT EXPERIENCE",
		},
		"skill": {
			"专业技能", "技能特长", "技术能力", "技能证书", "Skills", "SKILLS", "技术栈",
		},
		"award": {
			"获奖荣誉", "荣誉奖项", "Awards", "AWARDS",
		},
		"language": {
			"语言能力", "Languages", "LANGUAGES",
		},
	}

	for i, line := range lines {
		trimmed := strings.TrimSpace(line)
		if len(trimmed) < 3 {
			continue
		}

		upperLine := strings.ToUpper(trimmed)

		// 检查每个section类型
		for secType, titles := range allTitles {
			// 如果这个section还没找到
			if sections[secType].start == 0 {
				for _, title := range titles {
					upperTitle := strings.ToUpper(title)

					// 必须完整匹配（在词边界上）
					if !strings.Contains(upperLine, upperTitle) {
						continue
					}

					// 检查标题长度是否合理（避免单个字被匹配）
					if len(title) < 4 {
						continue
					}

					// 检查是否是干净的标题行
					if p.isCleanSectionTitle(trimmed, title) {
						sectionInfos = append(sectionInfos, sectionInfo{
							key:      secType,
							index:    i,
							titleLen: len(title),
							priority: priorityMap[secType],
						})
						break
					}
				}
			}
		}
	}

	// 按index排序，相同index时按优先级排序
	for i := 0; i < len(sectionInfos)-1; i++ {
		for j := i + 1; j < len(sectionInfos); j++ {
			if sectionInfos[j].index < sectionInfos[i].index ||
				(sectionInfos[j].index == sectionInfos[i].index && sectionInfos[j].priority > sectionInfos[i].priority) {
				sectionInfos[i], sectionInfos[j] = sectionInfos[j], sectionInfos[i]
			}
		}
	}

	// 设置每个section的start和end
	for i, info := range sectionInfos {
		bound := sectionBoundary{
			start: info.index + 1, // 从标题的下一行开始
		}

		// 如果不是最后一个section，end是下一个section的start
		if i < len(sectionInfos)-1 {
			bound.end = sectionInfos[i+1].index
		} else {
			// 最后一个section到文本末尾
			bound.end = len(lines)
		}
		sections[info.key] = bound
	}

	log.Printf("  【Section识别-详细】:")
	for i, info := range sectionInfos {
		log.Printf("    [%d] %s: 行%d, 优先级%d", i, info.key, info.index, info.priority)
	}

	return sections
}

// =============================================================================
// 个人信息提取
// =============================================================================

// extractPersonalInfo 提取个人信息
func (p *ResumePDFParser) extractPersonalInfo(lines []string, sections map[string]sectionBoundary) map[string]interface{} {
	info := map[string]interface{}{
		"name":     "",
		"title":    "",
		"email":    "",
		"phone":    "",
		"location": "",
		"github":   "",
		"linkedin": "",
		"website":  "",
		"summary":  "",
	}

	// 找出第一个section的开始位置
	firstSectionStart := len(lines)
	for _, section := range sections {
		if section.start > 0 && section.start < firstSectionStart {
			firstSectionStart = section.start
		}
	}

	// 取section之前的行作为个人信息区
	// 关键：如果firstSectionStart太小（比如<5），可能section识别错误，扩展搜索范围
	personalLines := lines[:firstSectionStart]
	if len(personalLines) < 5 && len(lines) > 10 {
		// 扩展到前15行或第一个明显的section之前
		extendTo := 15
		if firstSectionStart > 0 && firstSectionStart < extendTo {
			extendTo = firstSectionStart
		}
		personalLines = lines[:min(extendTo, len(lines))]
	}
	personalText := strings.Join(personalLines, "\n")

	// 提取邮箱
	if email := p.emailRe.FindString(personalText); email != "" {
		info["email"] = email
	}

	// 提取手机号
	if phone := p.phoneRe.FindString(personalText); phone != "" {
		cleanPhone := strings.ReplaceAll(strings.ReplaceAll(phone, " ", ""), "-", "")
		info["phone"] = cleanPhone
	}

	// 提取GitHub
	githubRe := regexp.MustCompile(`(?:github\.com/|github:)\s*([a-zA-Z0-9_-]+)`)
	if matches := githubRe.FindStringSubmatch(personalText); len(matches) > 1 {
		info["github"] = "github.com/" + matches[1]
	}

	// 提取LinkedIn
	linkedinRe := regexp.MustCompile(`(?:linkedin\.com/in/|linkedin:)\s*([a-zA-Z0-9_-]+)`)
	if matches := linkedinRe.FindStringSubmatch(personalText); len(matches) > 1 {
		info["linkedin"] = "linkedin.com/in/" + matches[1]
	}

	// 提取网站
	websiteRe := regexp.MustCompile(`(?:https?://)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(/[^\s]*)?`)
	if matches := websiteRe.FindStringSubmatch(personalText); len(matches) > 0 && !p.emailRe.MatchString(matches[0]) {
		info["website"] = matches[0]
	}

	// section标题关键词（用于排除）
	sectionKeywords := []string{"教育", "工作", "项目", "技能", "获奖", "荣誉", "语言", "实习", "经历", "背景", "经验"}

	// 提取姓名
	for i, line := range personalLines {
		if i > 15 {
			break
		}
		trimmed := strings.TrimSpace(line)
		if len(trimmed) >= 2 && len(trimmed) <= 20 {
			// 排除看起来像section标题的行
			isSectionTitle := false
			for _, kw := range sectionKeywords {
				if strings.Contains(trimmed, kw) && len(trimmed) < 10 {
					isSectionTitle = true
					break
				}
			}
			if isSectionTitle {
				continue
			}

			if p.isChineseName(trimmed) {
				info["name"] = trimmed
				break
			}
			if regexp.MustCompile(`^[A-Z][a-z]+(\s+[A-Z][a-z]+)+$`).MatchString(trimmed) {
				info["name"] = trimmed
				break
			}
		}
	}

	// 提取职位/头衔
	for _, line := range personalLines {
		trimmed := strings.TrimSpace(line)
		if len(trimmed) > 5 && len(trimmed) < 60 {
			if p.positionRe.MatchString(trimmed) {
				info["title"] = trimmed
				break
			}
		}
	}

	// 提取个人简介
	var summaryLines []string
	for _, line := range personalLines {
		trimmed := strings.TrimSpace(line)
		if len(trimmed) > 50 && len(trimmed) < 500 {
			if !strings.Contains(trimmed, "@") && !p.phoneRe.MatchString(trimmed) {
				summaryLines = append(summaryLines, trimmed)
			}
		}
	}
	if len(summaryLines) > 0 {
		info["summary"] = strings.Join(summaryLines, " ")
	}

	// 提取所在地
	locationRe := regexp.MustCompile(`(?:北京|上海|广州|深圳|杭州|南京|武汉|成都|西安|苏州|天津|重庆|香港|澳门|台湾|[省市县区][^\s]{2,10})`)
	if loc := locationRe.FindString(personalText); loc != "" {
		info["location"] = loc
	}

	return info
}

// =============================================================================
// 教育经历提取
// =============================================================================

// extractEducation 提取教育经历
func (p *ResumePDFParser) extractEducation(sectionLines []string) []map[string]interface{} {
	var education []map[string]interface{}

	if len(sectionLines) == 0 {
		return education
	}

	// 智能合并多行条目
	mergedEntries := p.mergeMultiLineEntries(sectionLines)

	for _, entry := range mergedEntries {
		entryText := strings.Join(entry, " ")

		edu := map[string]interface{}{
			"id":          p.generateID(),
			"school":      "",
			"degree":      "",
			"field":       "",
			"startDate":   "",
			"endDate":     "",
			"gpa":         "",
			"description": "",
		}

		// 提取学校名（改进：支持更长的名称）
		schoolPattern := regexp.MustCompile(`([^\s，。、]{2,30}(?:大学|学院|学校|技术学院|职业学院|Graduate School|Institute))`)
		if schoolMatch := schoolPattern.FindStringSubmatch(entryText); len(schoolMatch) > 1 {
			edu["school"] = schoolMatch[1]
		} else {
			// 备用：查找包含学校关键词的完整片段
			schoolPart := p.extractAroundKeyword(entryText, []string{"大学", "学院", "学校"})
			if schoolPart != "" {
				edu["school"] = schoolPart
			}
		}

		// 提取学位
		degreePattern := regexp.MustCompile(`(博士|硕士|本科|学士|专科|MBA|PhD|博士研究生|硕士研究生|大学)`)
		if degreeMatch := degreePattern.FindString(entryText); degreeMatch != "" {
			edu["degree"] = degreeMatch
		}

		// 提取时间范围
		if timeMatch := p.timeRangeRe.FindStringSubmatch(entryText); len(timeMatch) > 1 {
			p.parseTimeRange(timeMatch[1], edu)
		} else if singleMatch := p.singleTimeRe.FindStringSubmatch(entryText); len(singleMatch) > 1 {
			edu["startDate"] = singleMatch[1]
		}

		// 提取专业
		majorPattern := regexp.MustCompile(`(?:专业|系|主修)[:：]?\s*([^\s，。、；;]+)|([^\s，。、；;]+(?:科学|工程|技术|经济|管理|文学|法学|教育|艺术|学))$`)
		if majorMatch := majorPattern.FindStringSubmatch(entryText); len(majorMatch) > 0 {
			for _, m := range majorMatch[1:] {
				if m != "" {
					edu["field"] = m
					break
				}
			}
		}

		// 提取GPA
		gpaRe := regexp.MustCompile(`GPA[:：]?\s*(\d+\.?\d*)`)
		if gpaMatch := gpaRe.FindStringSubmatch(entryText); len(gpaMatch) > 1 {
			edu["gpa"] = gpaMatch[1]
		}

		// 描述：收集剩余的有效行
		p.collectDescription(entry, edu)

		// 只有当有学校时才添加
		if edu["school"] != "" {
			education = append(education, edu)
		}
	}

	return education
}

// =============================================================================
// 工作经历提取
// =============================================================================

// extractWorkExperience 提取工作经历
func (p *ResumePDFParser) extractWorkExperience(sectionLines []string) []map[string]interface{} {
	var experiences []map[string]interface{}

	if len(sectionLines) == 0 {
		return experiences
	}

	// 智能合并多行条目
	mergedEntries := p.mergeMultiLineEntries(sectionLines)

	for _, entry := range mergedEntries {
		entryText := strings.Join(entry, " ")

		exp := map[string]interface{}{
			"id":           p.generateID(),
			"company":      "",
			"position":     "",
			"startDate":    "",
			"endDate":      "",
			"current":      false,
			"description": "",
			"achievements": []string{},
		}

		// 提取公司名
		companyPattern := regexp.MustCompile(`（([^）]+)）|([^\s-]{2,30}(?:公司|集团|科技|有限|企业|工作室|机构|Inc|LLC|Corp))`)
		if companyMatch := companyPattern.FindStringSubmatch(entryText); len(companyMatch) > 0 {
			for _, m := range companyMatch[1:] {
				if m != "" {
					exp["company"] = m
					break
				}
			}
		}
		if exp["company"] == "" {
			companyPart := p.extractAroundKeyword(entryText, []string{"公司", "集团", "科技", "有限", "企业"})
			if companyPart != "" {
				exp["company"] = companyPart
			}
		}

		// 提取职位
		positionPattern := regexp.MustCompile(`[-–—]\s*([^-\n]{2,30})|(^(?:(?:高级|中级|初级|资深|著名)?(.{0,15}(?:工程师|设计师|经理|总监|架构师|负责人|主管|专员|实习生|Analyst|Consultant|Engineer|Developer|Designer|Manager|Director))))$`)
		if positionMatch := positionPattern.FindStringSubmatch(entryText); len(positionMatch) > 0 {
			for _, m := range positionMatch[1:] {
				if m != "" {
					exp["position"] = strings.TrimSpace(m)
					break
				}
			}
		}
		if exp["position"] == "" {
			positionPart := p.extractAroundKeyword(entryText, []string{"工程师", "设计师", "经理", "总监", "实习生", "Analyst", "Engineer", "Developer", "Designer", "Manager"})
			if positionPart != "" {
				exp["position"] = positionPart
			}
		}

		// 提取时间范围
		if timeMatch := p.timeRangeRe.FindStringSubmatch(entryText); len(timeMatch) > 1 {
			p.parseTimeRange(timeMatch[1], exp)
		}

		// 提取成就/描述
		p.extractAchievements(entry, exp)

		// 只有当有公司或职位时才添加
		if exp["company"] != "" || exp["position"] != "" {
			experiences = append(experiences, exp)
		}
	}

	return experiences
}

// =============================================================================
// 项目经验提取
// =============================================================================

// extractProjects 提取项目经验
func (p *ResumePDFParser) extractProjects(sectionLines []string) []map[string]interface{} {
	var projects []map[string]interface{}

	if len(sectionLines) == 0 {
		return projects
	}

	// 智能合并多行条目
	mergedEntries := p.mergeMultiLineEntries(sectionLines)

	for _, entry := range mergedEntries {
		entryText := strings.Join(entry, " ")

		proj := map[string]interface{}{
			"id":           p.generateID(),
			"name":         "",
			"role":         "",
			"startDate":    "",
			"endDate":      "",
			"current":      false,
			"description":  "",
			"technologies": []string{},
			"link":         "",
		}

		// 提取项目名
		projectPattern := regexp.MustCompile(`([^-\n]{2,30}[^-\s])[-\s]+[^:：\n]{2,50}`)
		if projectMatch := projectPattern.FindStringSubmatch(entryText); len(projectMatch) > 1 {
			proj["name"] = strings.TrimSpace(projectMatch[1])
		}

		// 如果没匹配到，尝试从行中找项目名
		if proj["name"] == "" {
			for _, line := range entry {
				trimmed := strings.TrimSpace(line)
				if p.isLikelyProjectName(trimmed) {
					proj["name"] = trimmed
					break
				}
			}
		}

		// 提取角色
		rolePattern := regexp.MustCompile(`[-–—]\s*([^-\n]{2,20})(?:$|\n)|(?:团队负责人|负责人|组长|组员|成员|项目经理)`)
		if roleMatch := rolePattern.FindStringSubmatch(entryText); len(roleMatch) > 1 {
			for _, m := range roleMatch[1:] {
				if m != "" {
					proj["role"] = strings.TrimSpace(m)
					break
				}
			}
		}
		if proj["role"] == "" {
			if strings.Contains(entryText, "负责人") {
				proj["role"] = "团队负责人"
			} else if strings.Contains(entryText, "组长") {
				proj["role"] = "组长"
			} else if strings.Contains(entryText, "组员") || strings.Contains(entryText, "成员") {
				proj["role"] = "组员"
			}
		}

		// 提取时间
		if timeMatch := p.timeRangeRe.FindStringSubmatch(entryText); len(timeMatch) > 1 {
			p.parseTimeRange(timeMatch[1], proj)
		}

		// 提取技术栈
		techMatches := p.techRe.FindAllString(entryText, -1)
		var techs []string
		seen := make(map[string]bool)
		for _, t := range techMatches {
			if !p.commonWords[strings.ToLower(t)] && len(t) >= 2 && !seen[t] {
				seen[t] = true
				techs = append(techs, t)
			}
		}
		proj["technologies"] = techs

		// 提取链接
		linkRe := regexp.MustCompile(`(?:https?://)?(?:github\.com|gitee\.com|gitlab\.com)[/\w.-]+`)
		if linkMatch := linkRe.FindString(entryText); linkMatch != "" {
			proj["link"] = linkMatch
			if !strings.HasPrefix(proj["link"].(string), "http") {
				proj["link"] = "https://" + proj["link"].(string)
			}
		}

		// 提取描述
		p.collectDescription(entry, proj)

		// 只有当有项目名时才添加
		if proj["name"] != "" {
			projects = append(projects, proj)
		}
	}

	return projects
}

// =============================================================================
// 技能提取
// =============================================================================

// extractSkills 提取技能
func (p *ResumePDFParser) extractSkills(sectionLines []string) []map[string]interface{} {
	var skills []map[string]interface{}

	if len(sectionLines) == 0 {
		return skills
	}

	// 技术关键词库
	techKeywords := []string{
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
	}

	skillText := strings.Join(sectionLines, " ")
	foundSkills := make(map[string]bool)

	for _, tech := range techKeywords {
		techRe := regexp.MustCompile(`\b` + regexp.QuoteMeta(tech) + `\b`)
		if techRe.MatchString(skillText) {
			foundSkills[tech] = true
		}
	}

	if len(foundSkills) > 0 {
		skillItems := make([]string, 0, len(foundSkills))
		for skill := range foundSkills {
			skillItems = append(skillItems, skill)
		}

		skills = append(skills, map[string]interface{}{
			"id":       p.generateID(),
			"category": "技能",
			"items":    skillItems,
		})
	}

	return skills
}

// =============================================================================
// 荣誉奖项提取
// =============================================================================

// extractAwards 提取荣誉奖项
func (p *ResumePDFParser) extractAwards(sectionLines []string) []map[string]interface{} {
	var awards []map[string]interface{}

	if len(sectionLines) == 0 {
		return awards
	}

	mergedEntries := p.mergeMultiLineEntries(sectionLines)

	for _, entry := range mergedEntries {
		entryText := strings.Join(entry, " ")

		award := map[string]interface{}{
			"id":          p.generateID(),
			"title":       "",
			"organization": "",
			"date":        "",
			"description": "",
		}

		// 提取奖项名称
		awardPattern := regexp.MustCompile(`([^,\n]{2,50}(?:奖|奖学金|冠军|第一名|一等奖|二等奖|三等奖|优秀|荣誉))`)
		if awardMatch := awardPattern.FindStringSubmatch(entryText); len(awardMatch) > 1 {
			award["title"] = awardMatch[1]
		}

		// 如果没匹配到，使用第一行作为标题
		if award["title"] == "" && len(entry) > 0 {
			award["title"] = strings.TrimSpace(entry[0])
		}

		// 提取时间
		if timeMatch := p.timeRangeRe.FindStringSubmatch(entryText); len(timeMatch) > 1 {
			award["date"] = timeMatch[1]
		} else if singleMatch := p.singleTimeRe.FindStringSubmatch(entryText); len(singleMatch) > 1 {
			award["date"] = singleMatch[1]
		}

		// 提取组织
		orgPattern := regexp.MustCompile(`(?:由|颁发|授予)([^,\n]{2,20})`)
		if orgMatch := orgPattern.FindStringSubmatch(entryText); len(orgMatch) > 1 {
			award["organization"] = orgMatch[1]
		}

		// 描述
		p.collectDescription(entry, award)

		if award["title"] != "" {
			awards = append(awards, award)
		}
	}

	return awards
}

// =============================================================================
// 语言能力提取
// =============================================================================

// extractLanguages 提取语言能力
func (p *ResumePDFParser) extractLanguages(sectionLines []string) []map[string]interface{} {
	var languages []map[string]interface{}

	if len(sectionLines) == 0 {
		return languages
	}

	mergedEntries := p.mergeMultiLineEntries(sectionLines)

	for _, entry := range mergedEntries {
		entryText := strings.Join(entry, " ")

		lang := map[string]interface{}{
			"id":    p.generateID(),
			"name":  "",
			"level": "",
		}

		// 提取语言名称
		langPattern := regexp.MustCompile(`(中文|英语|日语|韩语|法语|德语|西班牙语|葡萄牙语|俄语|阿拉伯语|CET-|TOEFL|IELTS|TOEIC)`)
		if langMatch := langPattern.FindStringSubmatch(entryText); len(langMatch) > 1 {
			lang["name"] = langMatch[1]
		}

		// 提取熟练度
		levelPattern := regexp.MustCompile(`(?:精通|熟练|良好|一般|流利|native|fluent|professional|working)`)
		if levelMatch := levelPattern.FindString(entryText); levelMatch != "" {
			lang["level"] = levelMatch
		}

		if lang["name"] != "" {
			languages = append(languages, lang)
		}
	}

	return languages
}

// =============================================================================
// 辅助方法
// =============================================================================

// isValidBullet 判断列表符号是否有效（后面有内容才是真列表）
func isValidBullet(trimmed string) bool {
	// 去掉列表符号后必须有内容
	for _, prefix := range []string{"-", "•", "*", "·", "○", "◇", "■"} {
		if strings.HasPrefix(trimmed, prefix) {
			after := strings.TrimSpace(strings.TrimPrefix(trimmed, prefix))
			return len(after) > 0
		}
	}
	return false
}

// isMeaningfulLine 判断行是否有意义（不是纯标点）
func isMeaningfulLine(line string) bool {
	trimmed := strings.TrimSpace(line)
	if len(trimmed) == 0 {
		return false
	}

	// 纯标点符号
	if matched, _ := regexp.MatchString(`^[，、。；：""''（）【】《》\-\*•·○◇■\s]+$`, trimmed); matched {
		return false
	}

	return true
}

// mergeMultiLineEntries 智能合并多行条目（重写版，增强鲁棒性）
func (p *ResumePDFParser) mergeMultiLineEntries(lines []string) [][]string {
	// 过滤掉无意义的行（纯标点）
	meaningfulLines := make([]string, 0, len(lines))
	for _, line := range lines {
		if isMeaningfulLine(line) {
			meaningfulLines = append(meaningfulLines, strings.TrimSpace(line))
		}
	}

	var entries [][]string
	var currentEntry []string
	var lastWasBulletOrNumber bool

	for _, line := range meaningfulLines {
		trimmed := line

		// 检测各种模式
		isNumbered := regexp.MustCompile(`^\d+[.、．、:：]`).MatchString(trimmed)
		isBullet := isValidBullet(trimmed)
		isTimeStart := p.timeRangeRe.MatchString(trimmed) || p.singleTimeRe.MatchString(trimmed)
		isCompanyOrSchool := p.schoolRe.MatchString(trimmed) || p.companyRe.MatchString(trimmed)
		isPosition := p.positionRe.MatchString(trimmed)

		// 判断是否是新条目
		isNewEntry := false

		if isNumbered {
			isNewEntry = true
		} else if isBullet {
			isNewEntry = true
		} else if isTimeStart {
			if len(currentEntry) == 0 {
				isNewEntry = true
			} else if lastWasBulletOrNumber {
				isNewEntry = false // 时间跟在序号后面，不算新条目
			} else if isCompanyOrSchool || isPosition {
				isNewEntry = false // 公司/职位行合并
			} else if p.isLikelyTitleLine(trimmed) && len(currentEntry) >= 2 {
				isNewEntry = true
			} else {
				isNewEntry = true
			}
		} else if len(currentEntry) == 0 {
			isNewEntry = true
		}

		// 保存当前条目并开始新的
		if isNewEntry && len(currentEntry) > 0 {
			entries = append(entries, currentEntry)
			currentEntry = []string{}
		}

		currentEntry = append(currentEntry, trimmed)
		lastWasBulletOrNumber = isNumbered || isBullet
	}

	// 添加最后一个条目
	if len(currentEntry) > 0 {
		entries = append(entries, currentEntry)
	}

	if len(entries) == 0 && len(meaningfulLines) > 0 {
		entries = append(entries, meaningfulLines)
	}

	log.Printf("    【条目分割】%d行 → %d条目", len(meaningfulLines), len(entries))
	return entries
}

// isLikelyTitleLine 判断是否可能是标题行（保守版）
func (p *ResumePDFParser) isLikelyTitleLine(line string) bool {
	trimmed := strings.TrimSpace(line)

	// 太短的不可能是标题
	if len(trimmed) < 4 {
		return false
	}

	// 太长的也不是标题（标题一般比较短）
	if len(trimmed) > 30 {
		return false
	}

	// 已经是列表项的不是标题
	if regexp.MustCompile(`^[-\*•·]`).MatchString(trimmed) {
		return false
	}

	// 包含时间的是描述，不是标题
	if p.timeRangeRe.MatchString(trimmed) || p.singleTimeRe.MatchString(trimmed) {
		return false
	}

	// 包含邮箱或电话的不是标题
	if p.emailRe.MatchString(trimmed) || p.phoneRe.MatchString(trimmed) {
		return false
	}

	// 包含"描述"、"介绍"、"职责"等关键词的是描述，不是标题
	descKeywords := []string{"描述", "介绍", "职责", "说明", "项目", "架构", "职责", "亮点", "职责"}
	for _, kw := range descKeywords {
		if strings.Contains(trimmed, kw) && len(trimmed) < 15 {
			return false
		}
	}

	// 纯中文标题判断（4-20个字符，主要是中文）
	// 统计中文字符比例
	chineseCount := 0
	for _, r := range trimmed {
		if r >= 0x4e00 && r <= 0x9fa5 {
			chineseCount++
		}
	}

	// 如果中文字符占比超过60%，且长度合适，可能是标题
	if chineseCount >= 3 && float64(chineseCount)/float64(len(trimmed)) > 0.6 {
		// 额外检查：标题不应该包含太多技术词汇
		techCount := 0
		for _, r := range trimmed {
			if (r >= 'a' && r <= 'z') || (r >= 'A' && r <= 'Z') || (r >= '0' && r <= '9') {
				techCount++
			}
		}
		// 如果有太多英文字符，可能不是标题
		if techCount > 5 {
			return false
		}
		return true
	}

	return false
}

// isLikelyProjectName 判断是否可能是项目名
func (p *ResumePDFParser) isLikelyProjectName(line string) bool {
	trimmed := strings.TrimSpace(line)

	if len(trimmed) < 3 || len(trimmed) > 50 {
		return false
	}

	// 跳过时间
	if p.timeRangeRe.MatchString(trimmed) || p.singleTimeRe.MatchString(trimmed) {
		return false
	}

	// 跳过列表符号
	if regexp.MustCompile(`^[-\*•·\d]+`).MatchString(trimmed) {
		return false
	}

	// 跳过包含技术栈的行（描述）
	if p.techRe.MatchString(trimmed) && strings.Contains(trimmed, "使用") || strings.Contains(trimmed, "基于") || strings.Contains(trimmed, "采用") {
		return false
	}

	// 跳过太技术性的行
	if strings.Contains(trimmed, ":") && p.techRe.MatchString(trimmed) {
		return false
	}

	// 包含项目相关的词
	if strings.Contains(trimmed, "项目") || strings.Contains(trimmed, "系统") || strings.Contains(trimmed, "平台") || strings.Contains(trimmed, "产品") {
		return true
	}

	return false
}

// isTechLike 判断是否像技术栈
func (p *ResumePDFParser) isTechLike(s string) bool {
	techs := []string{"Java", "Python", "Go", "JS", "TS", "React", "Vue", "Node", "SQL", "AWS", "Docker", "K8s"}
	for _, t := range techs {
		if strings.Contains(s, t) {
			return true
		}
	}
	return false
}

// extractAroundKeyword 提取关键词周围的内容
func (p *ResumePDFParser) extractAroundKeyword(text string, keywords []string) string {
	for _, kw := range keywords {
		idx := strings.Index(text, kw)
		if idx == -1 {
			continue
		}
		// 往前找最多30个字符
		start := idx - 30
		if start < 0 {
			start = 0
		}
		// 往后找最多50个字符
		end := idx + len(kw) + 50
		if end > len(text) {
			end = len(text)
		}
		result := strings.TrimSpace(text[start:end])
		if result != "" {
			return result
		}
	}
	return ""
}

// parseTimeRange 解析时间范围字符串
func (p *ResumePDFParser) parseTimeRange(timeStr string, target map[string]interface{}) {
	if timeStr == "至今" || timeStr == "现在" || timeStr == "current" || timeStr == "present" {
		target["current"] = true
		target["endDate"] = ""
		return
	}

	// 分割时间范围
	times := p.timeSplitterRe.Split(timeStr, 2)
	if len(times) >= 1 {
		target["startDate"] = strings.TrimSpace(times[0])
	}
	if len(times) >= 2 {
		endTime := strings.TrimSpace(times[1])
		if endTime == "至今" || endTime == "现在" || endTime == "current" || endTime == "present" {
			target["current"] = true
			target["endDate"] = ""
		} else {
			target["endDate"] = endTime
		}
	}
}

// collectDescription 收集描述内容
func (p *ResumePDFParser) collectDescription(entry []string, target map[string]interface{}) {
	var descLines []string

	for _, line := range entry {
		trimmed := strings.TrimSpace(line)
		if trimmed == "" {
			continue
		}

		// 跳过时间行
		if p.timeRangeRe.MatchString(trimmed) || p.singleTimeRe.MatchString(trimmed) {
			continue
		}

		// 跳过条目名称行（如果是的话）
		if name, ok := target["name"].(string); ok && name != "" && strings.Contains(trimmed, name) {
			continue
		}

		// 跳过公司名行
		if company, ok := target["company"].(string); ok && company != "" && strings.Contains(trimmed, company) {
			continue
		}

		// 跳过职位名行
		if position, ok := target["position"].(string); ok && position != "" && strings.Contains(trimmed, position) {
			continue
		}

		// 跳过太短的行（除非是列表项）
		if len(trimmed) < 10 && !regexp.MustCompile(`^[-\*•·]`).MatchString(trimmed) {
			continue
		}

		// 跳过太长的行（可能被OCR错误合并的）
		if len(trimmed) > 1000 {
			continue
		}

		descLines = append(descLines, trimmed)
	}

	if len(descLines) > 0 {
		target["description"] = strings.Join(descLines, "\n")
	}
}

// extractAchievements 提取成就列表（修复：字符串转数组）
func (p *ResumePDFParser) extractAchievements(entry []string, target map[string]interface{}) {
	var achievements []string
	var descriptionLines []string

	for _, line := range entry {
		trimmed := strings.TrimSpace(line)
		if trimmed == "" {
			continue
		}

		// 跳过时间行
		if p.timeRangeRe.MatchString(trimmed) || p.singleTimeRe.MatchString(trimmed) {
			continue
		}

		// 跳过公司名行
		if company, ok := target["company"].(string); ok && company != "" && strings.Contains(trimmed, company) {
			continue
		}

		// 跳过职位名行
		if position, ok := target["position"].(string); ok && position != "" && strings.Contains(trimmed, position) {
			continue
		}

		// 以列表符号开头的行 → 作为成就
		if regexp.MustCompile(`^[-\*•·]`).MatchString(trimmed) {
			achievement := strings.TrimPrefix(trimmed, "-")
			achievement = strings.TrimPrefix(achievement, "*")
			achievement = strings.TrimPrefix(achievement, "•")
			achievement = strings.TrimPrefix(achievement, "·")
			achievement = strings.TrimSpace(achievement)
			if len(achievement) > 0 {
				achievements = append(achievements, achievement)
			}
			continue
		}

		// 其他行 → 作为描述
		if len(trimmed) >= 10 && len(trimmed) < 500 {
			descriptionLines = append(descriptionLines, trimmed)
		}
	}

	// 成就和描述分开存储
	if len(achievements) > 0 {
		target["achievements"] = achievements
	}
	if len(descriptionLines) > 0 {
		target["description"] = strings.Join(descriptionLines, "\n")
	}
}

// isChineseName 判断字符串是否是中文姓名
func (p *ResumePDFParser) isChineseName(s string) bool {
	// 将字符串转换为 rune 切片以正确计算字符数
	runes := []rune(s)
	if len(runes) < 2 || len(runes) > 4 {
		return false
	}
	for _, r := range runes {
		if r < 0x4e00 || r > 0x9fa5 {
			return false
		}
	}
	return true
}

// generateID 生成简单ID
func (p *ResumePDFParser) generateID() string {
	return fmt.Sprintf("%d", time.Now().UnixNano())
}

// =============================================================================
// 兼容性和转换方法
// =============================================================================

// ConvertToResumeData 将解析结果转换为前端使用的格式
func (p *ParsedResume) ConvertToResumeData() map[string]interface{} {
	return map[string]interface{}{
		"personal_info":    p.PersonalInfo,
		"education":        p.Education,
		"work_experience":  p.WorkExperience,
		"projects":        p.Projects,
		"skills":          p.Skills,
		"awards":          p.Awards,
		"languages":       p.Languages,
		"raw_text":        p.RawText,
	}
}

// ToJSON 转换为 JSON 字符串
func (p *ParsedResume) ToJSON() (string, error) {
	data := p.ConvertToResumeData()
	bytes, err := json.MarshalIndent(data, "", "  ")
	if err != nil {
		return "", err
	}
	return string(bytes), nil
}

// =============================================================================
// 导出函数（保持向后兼容）
// =============================================================================

// ParsePDF 解析 PDF 文件
func ParsePDF(file io.Reader) (*ParsedResume, error) {
	parser := NewResumePDFParser()
	return parser.ParsePDF(file)
}

// ParsePDFFile 解析 PDF 文件（兼容旧API）
func ParsePDFFile(file io.Reader) (*ParsedResume, error) {
	return ParsePDF(file)
}

// ParseResumeText 解析文本（兼容旧API）
func ParseResumeText(text string) *ParsedResume {
	parser := NewResumePDFParser()
	return parser.ParseText(text)
}