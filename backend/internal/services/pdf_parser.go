package services

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"regexp"
	"strings"
	"time"

	"github.com/ledongthuc/pdf"
)

// ParsedResume 解析后的简历数据结构
type ParsedResume struct {
	PersonalInfo   map[string]interface{}   `json:"personal_info"`
	Education      []map[string]interface{} `json:"education"`
	WorkExperience []map[string]interface{} `json:"work_experience"`
	Projects       []map[string]interface{} `json:"projects"`
	Skills         []map[string]interface{} `json:"skills"`
	RawText        string                   `json:"raw_text"`
}

// ParsePDF 解析 PDF 文件并提取简历信息
func ParsePDF(file io.Reader) (result *ParsedResume, parseErr error) {
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

	// 解析简历结构
	parsed := parseResumeStructure(rawText)
	parsed.RawText = rawText

	return parsed, nil
}

// sectionBoundary 标识一个section的起止位置
type sectionBoundary struct {
	start int
	end   int
}

// sectionTitle section标题的关键词
var (
	// 教育section关键词（按优先级排序）
	eduTitles = []string{"教育背景", "教育经历", "学历背景", "Education", "EDUCATION"}
	// 工作section关键词
	workTitles = []string{"工作经历", "工作经验", "工作经历", "实习经历", "Employment", "WORK EXPERIENCE"}
	// 项目section关键词
	projTitles = []string{"项目经验", "项目经历", "项目背景", "Projects", "PROJECT"}
	// 技能section关键词
	skillTitles = []string{"专业技能", "技能特长", "技术能力", "技能证书", "Skills", "SKILLS", "技术栈"}
	// 个人信息section关键词
	aboutTitles = []string{"个人信息", "个人简介", "基本信息", "个人概述", "About", "PROFILE"}
)

// sectionPatterns 各section的正则模式
var (
	// 时间范围模式：2020.09 - 2022.06 或 2020年9月 - 2022年6月 或 2020/09 - 2022/06
	timeRangeRe = regexp.MustCompile(`(\d{4}[年\.\-/]\d{1,2}?\s*[-–~]\s*\d{4}[年\.\-/]?\d{0,2}?|至今|现在|current|present)`)
	// 单独时间模式：2020.09 或 2020年9月
	singleTimeRe = regexp.MustCompile(`(\d{4}[年\.\-/]\d{1,2}?|至今|现在)`)
	// 邮箱模式
	emailRe = regexp.MustCompile(`[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}`)
	// 手机号模式（中国）
	phoneRe = regexp.MustCompile(`1[3-9]\d{9}|(?:1[3-9]\d[\s\-]?\d{4}[\s\-]?\d{4})`)
	// 学位模式
	degreeRe = regexp.MustCompile(`(?:博士|硕士|本科|学士|专科|MBA|PhD|博士研究生|硕士研究生|大学)`)
	// 学校模式 - 简单匹配大学/学院/学校关键词
	schoolRe = regexp.MustCompile(`(?:大学|学院|学校)`)
	// 公司模式 - 简单匹配公司相关关键词
	companyRe = regexp.MustCompile(`(?:公司|集团|科技|有限|企业)`)
	// 职位模式
	positionRe = regexp.MustCompile(`(?:工程师|设计师|经理|总监|架构师|负责人|主管|专员|Analyst|Consultant|Engineer|Developer|Designer|Manager|Director)`)
	// 技术栈模式
	techRe = regexp.MustCompile(`([A-Za-z0-9+#\.\-]{2,30})`)
)

// parseResumeStructure 解析简历文本结构
func parseResumeStructure(text string) *ParsedResume {
	resume := &ParsedResume{
		PersonalInfo:   make(map[string]interface{}),
		Education:      make([]map[string]interface{}, 0),
		WorkExperience: make([]map[string]interface{}, 0),
		Projects:       make([]map[string]interface{}, 0),
		Skills:         make([]map[string]interface{}, 0),
	}

	// 1. 先按行分割，保留结构信息
	lines := strings.Split(text, "\n")
	var cleanLines []string
	for _, line := range lines {
		trimmed := strings.TrimSpace(line)
		if trimmed != "" {
			cleanLines = append(cleanLines, trimmed)
		}
	}

	// 2. 识别各个section的边界
	sections := identifySections(cleanLines)

	// 3. 提取个人信息（简历开头，section之外的部分）
	resume.PersonalInfo = extractPersonalInfoV2(cleanLines, sections)

	// 4. 提取教育经历
	if eduSection, ok := sections["education"]; ok {
		resume.Education = extractEducationV2(cleanLines[eduSection.start:eduSection.end], cleanLines)
	}

	// 5. 提取工作经历
	if workSection, ok := sections["work"]; ok {
		resume.WorkExperience = extractWorkExperienceV2(cleanLines[workSection.start:workSection.end])
	}

	// 6. 提取项目经验
	if projSection, ok := sections["project"]; ok {
		resume.Projects = extractProjectsV2(cleanLines[projSection.start:projSection.end])
	}

	// 7. 提取技能
	if skillSection, ok := sections["skill"]; ok {
		resume.Skills = extractSkillsV2(cleanLines[skillSection.start:skillSection.end])
	}

	return resume
}

// identifySections 识别各个section的起止位置
func identifySections(lines []string) map[string]sectionBoundary {
	sections := make(map[string]sectionBoundary)

	// 遍历所有行，找到section标题
	for i, line := range lines {
		upperLine := strings.ToUpper(line)

		// 跳过太短的行（不可能是section标题）
		if len(line) < 4 {
			continue
		}

		// 识别教育section
		if sections["education"].start == 0 {
			for _, title := range eduTitles {
				if strings.Contains(upperLine, strings.ToUpper(title)) {
					sections["education"] = sectionBoundary{start: i + 1, end: len(lines)}
					break
				}
			}
		}

		// 识别工作section
		if sections["work"].start == 0 {
			for _, title := range workTitles {
				if strings.Contains(upperLine, strings.ToUpper(title)) {
					sections["work"] = sectionBoundary{start: i + 1, end: len(lines)}
					break
				}
			}
		}

		// 识别项目section
		if sections["project"].start == 0 {
			for _, title := range projTitles {
				if strings.Contains(upperLine, strings.ToUpper(title)) {
					sections["project"] = sectionBoundary{start: i + 1, end: len(lines)}
					break
				}
			}
		}

		// 识别技能section
		if sections["skill"].start == 0 {
			for _, title := range skillTitles {
				if strings.Contains(upperLine, strings.ToUpper(title)) {
					sections["skill"] = sectionBoundary{start: i + 1, end: len(lines)}
					break
				}
			}
		}
	}

	// 根据section顺序调整end位置
	// 如果某个后续section开始了，当前section的end应该是那个section的start
	type sectionName struct {
		key   string
		start int
	}
	var sectionStarts []sectionName

	for key, section := range sections {
		if section.start > 0 {
			sectionStarts = append(sectionStarts, sectionName{key, section.start})
		}
	}

	// 按start位置排序
	for i := 0; i < len(sectionStarts)-1; i++ {
		for j := i + 1; j < len(sectionStarts); j++ {
			if sectionStarts[j].start < sectionStarts[i].start {
				sectionStarts[i], sectionStarts[j] = sectionStarts[j], sectionStarts[i]
			}
		}
	}

	// 更新每个section的end为下一个section的start
	for i, sn := range sectionStarts {
		if i < len(sectionStarts)-1 {
			bound := sections[sn.key]
			bound.end = sectionStarts[i+1].start
			sections[sn.key] = bound
		}
	}

	return sections
}

// extractPersonalInfoV2 提取个人信息（改进版）
func extractPersonalInfoV2(lines []string, sections map[string]sectionBoundary) map[string]interface{} {
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

	// 合并所有在sections之前的行作为个人信息区
	var personalLines []string
	if len(lines) > 0 {
		firstSectionStart := len(lines)
		for _, section := range sections {
			if section.start > 0 && section.start < firstSectionStart {
				firstSectionStart = section.start
			}
		}
		personalLines = lines[:firstSectionStart]
	}

	personalText := strings.Join(personalLines, "\n")

	// 提取邮箱
	if email := emailRe.FindString(personalText); email != "" {
		info["email"] = email
	}

	// 提取手机号
	if phone := phoneRe.FindString(personalText); phone != "" {
		// 清理手机号中的空白字符
		cleanPhone := strings.ReplaceAll(phone, " ", "")
		cleanPhone = strings.ReplaceAll(cleanPhone, "-", "")
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

	// 提取姓名（更智能的方式）
	// 姓名通常在第一行，且是2-4个汉字或英文名
	for i, line := range personalLines {
		if i > 10 { // 只看前10行
			break
		}
		trimmed := strings.TrimSpace(line)
		if len(trimmed) < 20 && len(trimmed) >= 2 {
			// 检查是否是中文姓名（2-4个汉字）
			if isChineseName(trimmed) {
				info["name"] = trimmed
				break
			}
			// 检查是否是英文姓名
			if regexp.MustCompile(`^[A-Z][a-z]+(\s+[A-Z][a-z]+)+$`).MatchString(trimmed) {
				info["name"] = trimmed
				break
			}
		}
	}

	// 提取职位/头衔
	for _, line := range personalLines {
		trimmed := strings.TrimSpace(line)
		if len(trimmed) > 5 && len(trimmed) < 50 {
			// 包含职位关键词
			if positionRe.MatchString(trimmed) {
				info["title"] = trimmed
				break
			}
		}
	}

	// 提取个人简介
	var summaryLines []string
	for _, line := range personalLines {
		trimmed := strings.TrimSpace(line)
		// 简介通常比较长，50-300字符
		if len(trimmed) > 50 && len(trimmed) < 400 {
			// 不包含联系方式的特征
			if !strings.Contains(trimmed, "@") && !regexp.MustCompile(`1[3-9]\d{9}`).MatchString(trimmed) {
				summaryLines = append(summaryLines, trimmed)
			}
		}
	}
	if len(summaryLines) > 0 {
		info["summary"] = strings.Join(summaryLines, " ")
	}

	return info
}

// extractEducationV2 提取教育经历（改进版）
func extractEducationV2(sectionLines []string, allLines []string) []map[string]interface{} {
	var education []map[string]interface{}

	if len(sectionLines) == 0 {
		return education
	}

	// 按时间或学校来分割条目
	entries := splitByTimeOrTitle(sectionLines)

	for _, entry := range entries {
		entryText := strings.Join(entry, " ")

		edu := map[string]interface{}{
			"id":        generateID(),
			"school":    "",
			"degree":    "",
			"field":     "",
			"startDate": "",
			"endDate":   "",
			"gpa":       "",
			"description": "",
		}

		// 提取学校
		if schoolMatch := schoolRe.FindString(entryText); schoolMatch != "" {
			edu["school"] = schoolMatch
		}

		// 提取学位
		if degreeMatch := degreeRe.FindString(entryText); degreeMatch != "" {
			edu["degree"] = degreeMatch
		}

		// 提取时间
		timeMatch := timeRangeRe.FindStringSubmatch(entryText)
		if len(timeMatch) > 1 {
			timeStr := timeMatch[1]
			times := strings.Split(timeStr, "-")
			if len(times) >= 1 {
				edu["startDate"] = strings.TrimSpace(times[0])
			}
			if len(times) >= 2 {
				edu["endDate"] = strings.TrimSpace(times[1])
			}
		}

		// 提取专业
		majorRe := regexp.MustCompile(`(?:专业|系)`)
		if majorMatch := majorRe.FindString(entryText); majorMatch != "" {
			edu["field"] = majorMatch
		}

		// 提取GPA
		gpaRe := regexp.MustCompile(`GPA[:：]?\s*(\d+\.?\d*)`)
		if gpaMatch := gpaRe.FindStringSubmatch(entryText); len(gpaMatch) > 1 {
			edu["gpa"] = gpaMatch[1]
		}

		// 只有当有学校时才添加
		if edu["school"] != "" {
			education = append(education, edu)
		}
	}

	return education
}

// extractWorkExperienceV2 提取工作经历（改进版）
func extractWorkExperienceV2(sectionLines []string) []map[string]interface{} {
	var experiences []map[string]interface{}

	if len(sectionLines) == 0 {
		return experiences
	}

	// 按时间分割条目
	entries := splitByTimeOrTitle(sectionLines)

	for _, entry := range entries {
		entryText := strings.Join(entry, " ")
		entryLines := entry

		exp := map[string]interface{}{
			"id":           generateID(),
			"company":      "",
			"position":     "",
			"startDate":    "",
			"endDate":      "",
			"current":      false,
			"description":  "",
			"achievements": []string{},
		}

		// 提取公司
		if companyMatch := companyRe.FindString(entryText); companyMatch != "" {
			exp["company"] = companyMatch
		}

		// 提取职位
		if positionMatch := positionRe.FindString(entryText); positionMatch != "" {
			exp["position"] = positionMatch
		}

		// 提取时间
		timeMatch := timeRangeRe.FindStringSubmatch(entryText)
		if len(timeMatch) > 1 {
			timeStr := timeMatch[1]
			times := strings.Split(timeStr, "-")
			if len(times) >= 1 {
				exp["startDate"] = strings.TrimSpace(times[0])
			}
			if len(times) >= 2 {
				endTime := strings.TrimSpace(times[1])
				if endTime == "至今" || endTime == "现在" || endTime == "current" || endTime == "present" {
					exp["current"] = true
					exp["endDate"] = ""
				} else {
					exp["endDate"] = endTime
				}
			}
		}

		// 提取描述（通常是时间/公司/职位之后的内容）
		// 收集所有非时间、非公司、非职位的行作为描述
		var descLines []string
		for _, line := range entryLines {
			trimmed := strings.TrimSpace(line)
			if trimmed == "" {
				continue
			}
			// 跳过时间、公司、职位行
			if timeRangeRe.MatchString(trimmed) || companyRe.MatchString(trimmed) || positionRe.MatchString(trimmed) {
				continue
			}
			// 跳过太短或太长的行
			if len(trimmed) > 10 && len(trimmed) < 500 {
				descLines = append(descLines, trimmed)
			}
		}
		if len(descLines) > 0 {
			exp["description"] = strings.Join(descLines, "\n")
		}

		// 只有当有公司时才添加
		if exp["company"] != "" {
			experiences = append(experiences, exp)
		}
	}

	return experiences
}

// extractProjectsV2 提取项目经验（改进版）
func extractProjectsV2(sectionLines []string) []map[string]interface{} {
	var projects []map[string]interface{}

	if len(sectionLines) == 0 {
		return projects
	}

	// 按条目分割（通常以数字序号或项目标题开始）
	entries := splitByTimeOrTitle(sectionLines)

	for _, entry := range entries {
		entryText := strings.Join(entry, " ")
		entryLines := entry

		proj := map[string]interface{}{
			"id":           generateID(),
			"name":         "",
			"role":         "",
			"startDate":    "",
			"endDate":      "",
			"current":      false,
			"description":  "",
			"technologies": []string{},
			"link":         "",
		}

		// 提取项目名称
		// 项目名通常是比较独特的名称，2-20个字符
		for _, line := range entryLines {
			trimmed := strings.TrimSpace(line)
			// 跳过时间
			if timeRangeRe.MatchString(trimmed) {
				continue
			}
			// 项目名通常不以列表符号开头
			if len(trimmed) >= 2 && len(trimmed) <= 30 {
				// 检查是否是角色
				if positionRe.MatchString(trimmed) {
					proj["role"] = trimmed
					continue
				}
				// 否则可能是项目名
				if proj["name"] == "" && !strings.HasPrefix(trimmed, "-") && !strings.HasPrefix(trimmed, "*") {
					// 过滤掉明显的描述性文字
					if !regexp.MustCompile(`^[\d.、．]+$`).MatchString(trimmed) {
						proj["name"] = trimmed
					}
				}
			}
		}

		// 提取时间
		timeMatch := timeRangeRe.FindStringSubmatch(entryText)
		if len(timeMatch) > 1 {
			timeStr := timeMatch[1]
			times := strings.Split(timeStr, "-")
			if len(times) >= 1 {
				proj["startDate"] = strings.TrimSpace(times[0])
			}
			if len(times) >= 2 {
				endTime := strings.TrimSpace(times[1])
				if endTime == "至今" || endTime == "现在" {
					proj["current"] = true
				} else {
					proj["endDate"] = endTime
				}
			}
		}

		// 提取技术栈
		techMatches := techRe.FindAllString(entryText, -1)
		var techs []string
		for _, t := range techMatches {
			// 过滤掉常见非技术词汇
			if !isCommonWord(t) && len(t) >= 2 {
				techs = append(techs, t)
			}
		}
		// 去重
		seen := make(map[string]bool)
		var uniqueTechs []string
		for _, t := range techs {
			if !seen[t] {
				seen[t] = true
				uniqueTechs = append(uniqueTechs, t)
			}
		}
		proj["technologies"] = uniqueTechs

		// 提取描述
		var descLines []string
		for _, line := range entryLines {
			trimmed := strings.TrimSpace(line)
			if trimmed == "" || len(trimmed) < 10 {
				continue
			}
			// 跳过时间、项目名、角色
			if timeRangeRe.MatchString(trimmed) || trimmed == proj["name"] {
				continue
			}
			descLines = append(descLines, trimmed)
		}
		if len(descLines) > 0 {
			proj["description"] = strings.Join(descLines, "\n")
		}

		// 只有当有项目名时才添加
		if proj["name"] != "" {
			projects = append(projects, proj)
		}
	}

	return projects
}

// extractSkillsV2 提取技能（改进版）
func extractSkillsV2(sectionLines []string) []map[string]interface{} {
	var skills []map[string]interface{}

	if len(sectionLines) == 0 {
		return skills
	}

	// 技术关键词
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
	}

	skillText := strings.Join(sectionLines, " ")
	foundSkills := make(map[string]bool)

	for _, tech := range techKeywords {
		// 使用单词边界匹配
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
			"id":       generateID(),
			"category": "技能",
			"items":    skillItems,
		})
	}

	return skills
}

// splitByTimeOrTitle 按时间或标题分割条目
func splitByTimeOrTitle(lines []string) [][]string {
	var entries [][]string
	var currentEntry []string

	for _, line := range lines {
		trimmed := strings.TrimSpace(line)

		// 检测是否是新的条目开始
		isNewEntry := false

		// 1. 以时间开头（新条目）
		if timeRangeRe.MatchString(trimmed) || singleTimeRe.MatchString(trimmed) {
			// 如果当前条目为空，继续
			if len(currentEntry) > 0 {
				// 检查时间是否在条目中间（比如描述中提到时间）
				isNewEntry = true
			}
		}

		// 2. 以数字序号开头
		if regexp.MustCompile(`^\d+[.、．]`).MatchString(trimmed) {
			isNewEntry = true
		}

		// 3. 以列表符号开头
		if strings.HasPrefix(trimmed, "-") || strings.HasPrefix(trimmed, "•") || strings.HasPrefix(trimmed, "*") || strings.HasPrefix(trimmed, "·") {
			isNewEntry = true
		}

		if isNewEntry && len(currentEntry) > 0 {
			entries = append(entries, currentEntry)
			currentEntry = []string{}
		}

		currentEntry = append(currentEntry, trimmed)
	}

	// 添加最后一个条目
	if len(currentEntry) > 0 {
		entries = append(entries, currentEntry)
	}

	// 如果没有分割出条目，把所有行作为一个条目
	if len(entries) == 0 && len(lines) > 0 {
		entries = append(entries, lines)
	}

	return entries
}

// isCommonWord 判断是否为常见非技术词汇
func isCommonWord(word string) bool {
	commonWords := map[string]bool{
		"the": true, "and": true, "for": true, "are": true, "but": true, "not": true,
		"you": true, "all": true, "can": true, "had": true, "her": true, "was": true,
		"one": true, "our": true, "out": true, "day": true, "get": true, "has": true,
		"him": true, "his": true, "how": true, "its": true, "may": true, "new": true,
		"now": true, "old": true, "see": true, "two": true, "way": true, "who": true,
		"boy": true, "did": true, "she": true, "use": true, "your": true, "each": true,
		"this": true, "that": true, "with": true, "from": true, "they": true, "will": true,
		"been": true, "have": true, "more": true, "when": true, "year": true, "than": true,
		// 中文常见词
		"公司": true, "工作": true, "负责": true, "管理": true, "项目": true, "经验": true,
		"开发": true, "设计": true, "实现": true, "优化": true, "维护": true, "参与": true,
		"主要": true, "完成": true, "获得": true, "提升": true, "进行": true, "包括": true,
	}
	return commonWords[strings.ToLower(word)]
}

// isChineseName 判断字符串是否是中文姓名（2-4个汉字）
func isChineseName(s string) bool {
	if len(s) < 2 || len(s) > 4 {
		return false
	}
	for _, r := range s {
		if r < 0x4e00 || r > 0x9fa5 {
			return false
		}
	}
	return true
}

// generateID 生成简单 ID
func generateID() string {
	return fmt.Sprintf("%d", time.Now().UnixNano())
}

// ConvertToResumeData 将解析结果转换为前端使用的 ResumeData 格式
func (p *ParsedResume) ConvertToResumeData() map[string]interface{} {
	return map[string]interface{}{
		"personal_info":    p.PersonalInfo,
		"education":        p.Education,
		"work_experience":  p.WorkExperience,
		"projects":         p.Projects,
		"skills":           p.Skills,
		"awards":           []map[string]interface{}{},
		"languages":        []map[string]interface{}{},
		"raw_text":         p.RawText,
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
