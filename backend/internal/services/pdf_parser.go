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
	// 使用 defer recover 捕获所有可能的 panic
	defer func() {
		if r := recover(); r != nil {
			parseErr = fmt.Errorf("PDF 解析 panic: %v", r)
			result = nil
		}
	}()

	// 读取 PDF 内容
	buf := new(bytes.Buffer)
	if _, err := buf.ReadFrom(file); err != nil {
		return nil, fmt.Errorf("读取文件失败: %w", err)
	}

	// 检查文件是否为空
	if buf.Len() == 0 {
		return nil, fmt.Errorf("文件内容为空")
	}

	// 检查是否看起来像 PDF（PDF 文件以 %PDF- 开头）
	pdfBytes := buf.Bytes()
	if len(pdfBytes) < 4 || string(pdfBytes[:4]) != "%PDF" {
		return nil, fmt.Errorf("文件不是有效的 PDF 格式")
	}

	// 使用 ledongthuc/pdf 解析 PDF
	pdfReader, err := pdf.NewReader(bytes.NewReader(pdfBytes), int64(buf.Len()))
	if err != nil {
		return nil, fmt.Errorf("解析 PDF 失败: %w", err)
	}

	var fullText strings.Builder

	// 遍历所有页面提取文本
	numPages := pdfReader.NumPage()
	if numPages == 0 {
		return nil, fmt.Errorf("PDF 中没有页面")
	}

	for pageNum := 1; pageNum <= numPages; pageNum++ {
		page := pdfReader.Page(pageNum)

		// 获取页面文本
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

// parseResumeStructure 解析简历文本结构
func parseResumeStructure(text string) *ParsedResume {
	resume := &ParsedResume{
		PersonalInfo:   make(map[string]interface{}),
		Education:      make([]map[string]interface{}, 0),
		WorkExperience: make([]map[string]interface{}, 0),
		Projects:       make([]map[string]interface{}, 0),
		Skills:         make([]map[string]interface{}, 0),
	}
	
	// 清理文本
	text = cleanText(text)
	lines := strings.Split(text, "\n")
	
	// 提取个人信息（通常在开头）
	resume.PersonalInfo = extractPersonalInfo(lines, text)
	
	// 提取教育经历
	resume.Education = extractEducation(text)
	
	// 提取工作经历
	resume.WorkExperience = extractWorkExperience(text)
	
	// 提取项目经验
	resume.Projects = extractProjects(text)
	
	// 提取技能
	resume.Skills = extractSkills(text)
	
	return resume
}

// cleanText 清理文本
func cleanText(text string) string {
	// 移除多余空白（换行、制表符等替换为空格）
	re := regexp.MustCompile(`[[:space:]]+`)
	text = re.ReplaceAllString(text, " ")

	// 移除特殊字符但保留基本标点和中文标点
	re2 := regexp.MustCompile(`[^\w\s\-,.@/:，。、；：""''（）《》【】]`)
	text = re2.ReplaceAllString(text, " ")

	return strings.TrimSpace(text)
}

// extractPersonalInfo 提取个人信息
func extractPersonalInfo(lines []string, fullText string) map[string]interface{} {
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
	
	// 提取邮箱
	emailRe := regexp.MustCompile(`[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}`)
	if email := emailRe.FindString(fullText); email != "" {
		info["email"] = email
	}
	
	// 提取手机号（中国）
	phoneRe := regexp.MustCompile(`1[3-9]\d{2}[\s\-]?\d{4}[\s\-]?\d{4}`)
	if phone := phoneRe.FindString(fullText); phone != "" {
		info["phone"] = phone
	}
	
	// 提取 GitHub
	githubRe := regexp.MustCompile(`(?:github\.com/|github:)\s*([a-zA-Z0-9_-]+)`)
	if matches := githubRe.FindStringSubmatch(fullText); len(matches) > 1 {
		info["github"] = "github.com/" + matches[1]
	}
	
	// 提取 LinkedIn
	linkedinRe := regexp.MustCompile(`(?:linkedin\.com/in/|linkedin:)\s*([a-zA-Z0-9_-]+)`)
	if matches := linkedinRe.FindStringSubmatch(fullText); len(matches) > 1 {
		info["linkedin"] = "linkedin.com/in/" + matches[1]
	}
	
	// 尝试提取姓名（通常在简历开头）
	for i, line := range lines {
		if i > 5 {
			break
		}
		line = strings.TrimSpace(line)
		// 姓名通常是较短的行，不包含数字和特殊字符
		if len(line) >= 2 && len(line) <= 20 && 
		   !strings.Contains(line, "@") && 
		   !strings.Contains(line, "http") &&
		   !regexp.MustCompile(`^\d`).MatchString(line) {
			// 可能是姓名
			if info["name"] == "" && isLikelyName(line) {
				info["name"] = line
			}
		}
	}
	
	// 提取职位/头衔
	titleKeywords := []string{"工程师", "开发", "经理", "总监", "架构师", "负责人", "Engineer", "Developer", "Manager"}
	for _, line := range lines[:min(10, len(lines))] {
		for _, keyword := range titleKeywords {
			if strings.Contains(line, keyword) && len(line) < 50 {
				info["title"] = strings.TrimSpace(line)
				break
			}
		}
		if info["title"] != "" {
			break
		}
	}
	
	// 提取个人简介（通常是前几行中的长文本）
	for _, line := range lines[:min(20, len(lines))] {
		line = strings.TrimSpace(line)
		if len(line) > 50 && len(line) < 300 {
			// 可能是个人简介
			info["summary"] = line
			break
		}
	}
	
	return info
}

// isLikelyName 判断是否可能是姓名
func isLikelyName(s string) bool {
	// 中文姓名通常是 2-4 个汉字
	if regexp.MustCompile(`^[\x{4e00}-\x{9fa5}]{2,4}$`).MatchString(s) {
		return true
	}
	// 英文姓名
	if regexp.MustCompile(`^[A-Za-z\s\.]+$`).MatchString(s) && len(s) < 30 {
		return true
	}
	return false
}

// extractEducation 提取教育经历
func extractEducation(text string) []map[string]interface{} {
	var education []map[string]interface{}

	// 查找教育相关内容（不使用 lookahead）
	// 匹配从"教育"到"工作/项目/技能"之前的内容
	eduPattern := regexp.MustCompile(`(?i)(?:教育|学历|Education|Academic)[\s\S]*?`)
	endPattern := regexp.MustCompile(`(?i)(?:工作|经验|Experience|Work|项目|Project|技能|Skills)`)

	if match := eduPattern.FindStringIndex(text); len(match) > 0 {
		start := match[0]
		end := len(text)
		// 找到工作/项目/技能等关键词的位置
		if endMatch := endPattern.FindStringIndex(text[start:]); len(endMatch) > 0 {
			end = start + endMatch[0]
		}
		matchStr := text[start:end]

		// 提取学校
		schoolRe := regexp.MustCompile(`([\x{4e00}-\x{9fa5}]{2,}(?:大学|学院|学校)|[A-Za-z\s]+(?:University|College|Institute|School))`)
		schools := schoolRe.FindAllString(matchStr, -1)

		for _, school := range schools {
			edu := map[string]interface{}{
				"id":        generateID(),
				"school":    strings.TrimSpace(school),
				"degree":    extractDegree(matchStr),
				"field":     "",
				"startDate": "",
				"endDate":   "",
				"gpa":       "",
			}
			education = append(education, edu)
		}
	}

	// 如果没有找到，尝试用通用模式
	if len(education) == 0 {
		uniRe := regexp.MustCompile(`([\x{4e00}-\x{9fa5}]{2,}(?:大学|学院))`)
		universities := uniRe.FindAllString(text, -1)

		for _, uni := range universities {
			// 去重
			found := false
			for _, e := range education {
				if e["school"] == uni {
					found = true
					break
				}
			}
			if !found {
				education = append(education, map[string]interface{}{
					"id":        generateID(),
					"school":    uni,
					"degree":    "",
					"field":     "",
					"startDate": "",
					"endDate":   "",
				})
			}
		}
	}

	return education
}

// extractDegree 提取学位
func extractDegree(text string) string {
	degrees := []string{"博士", "硕士", "本科", "学士", "MBA", "PhD", "Master", "Bachelor"}
	for _, degree := range degrees {
		if strings.Contains(text, degree) {
			return degree
		}
	}
	return ""
}

// extractWorkExperience 提取工作经历
func extractWorkExperience(text string) []map[string]interface{} {
	var experiences []map[string]interface{}

	// 工作关键词（不使用 lookahead）
	workPattern := regexp.MustCompile(`(?i)(?:工作|经验|Experience|Work)[\s\S]*?`)
	endPattern := regexp.MustCompile(`(?i)(?:项目|Project|教育|Education|技能|Skills)`)

	if match := workPattern.FindStringIndex(text); len(match) > 0 {
		start := match[0]
		end := len(text)
		if endMatch := endPattern.FindStringIndex(text[start:]); len(endMatch) > 0 {
			end = start + endMatch[0]
		}
		matchStr := text[start:end]

		// 提取公司名
		companyRe := regexp.MustCompile(`([\x{4e00}-\x{9fa5}]{2,}(?:公司|集团|科技)|[A-Za-z\s]+(?:Inc|Corp|Ltd|Company|Co\.))`)
		companies := companyRe.FindAllString(matchStr, -1)

		for _, company := range companies {
			exp := map[string]interface{}{
				"id":           generateID(),
				"company":      strings.TrimSpace(company),
				"position":     "",
				"startDate":    "",
				"endDate":      "",
				"current":      false,
				"description":  "",
				"achievements": []string{},
			}
			experiences = append(experiences, exp)
		}
	}

	return experiences
}

// extractProjects 提取项目经验
func extractProjects(text string) []map[string]interface{} {
	var projects []map[string]interface{}

	// 项目关键词（不使用 lookahead）
	projPattern := regexp.MustCompile(`(?i)(?:项目|Project)[\s\S]*?`)
	endPattern := regexp.MustCompile(`(?i)(?:技能|Skills|工作|Experience|教育|Education)`)

	if match := projPattern.FindStringIndex(text); len(match) > 0 {
		start := match[0]
		end := len(text)
		if endMatch := endPattern.FindStringIndex(text[start:]); len(endMatch) > 0 {
			end = start + endMatch[0]
		}
		matchStr := text[start:end]

		// 简单提取项目名称（基于数字列表）
		projRe := regexp.MustCompile(`(?:\d+[\.、]|\-|\*)\s*([^\n]{2,30})`)
		matches := projRe.FindAllStringSubmatch(matchStr, -1)

		for _, m := range matches {
			if len(m) > 1 {
				proj := map[string]interface{}{
					"id":           generateID(),
					"name":         strings.TrimSpace(m[1]),
					"role":         "",
					"startDate":    "",
					"endDate":      "",
					"current":      false,
					"description":  "",
					"technologies": []string{},
					"link":         "",
				}
				projects = append(projects, proj)
			}
		}
	}
	
	return projects
}

// extractSkills 提取技能
func extractSkills(text string) []map[string]interface{} {
	var skills []map[string]interface{}
	
	// 常见技术关键词
	techKeywords := []string{
		"Java", "Python", "Go", "Golang", "JavaScript", "TypeScript", "C++", "C#", "PHP", "Ruby",
		"React", "Vue", "Angular", "Node.js", "Next.js", "Express", "Django", "Spring",
		"MySQL", "PostgreSQL", "MongoDB", "Redis", "Elasticsearch",
		"Docker", "Kubernetes", "K8s", "AWS", "阿里云", "腾讯云",
		"Git", "Linux", "Nginx", "Kafka", "RabbitMQ",
	}
	
	foundSkills := make(map[string]bool)
	
	for _, tech := range techKeywords {
		if strings.Contains(text, tech) && !foundSkills[tech] {
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
			"category": "技术栈",
			"items":    skillItems,
		})
	}
	
	return skills
}

// generateID 生成简单 ID
func generateID() string {
	return fmt.Sprintf("%d", time.Now().UnixNano())
}

// min 返回较小值
func min(a, b int) int {
	if a < b {
		return a
	}
	return b
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
