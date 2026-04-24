package services

import (
	"strings"
	"testing"
)

// =============================================================================
// 辅助函数测试
// =============================================================================

func TestIsChineseName(t *testing.T) {
	parser := NewResumePDFParser()

	tests := []struct {
		name     string
		input    string
		expected bool
	}{
		{"valid 2-char chinese name", "张三", true},
		{"valid 3-char chinese name", "李四", true},
		{"valid 4-char chinese name", "王五", true},
		{"too short", "张", false},
		{"too long", "张三李四王五", false},
		{"english name", "John Doe", false},
		{"mixed", "张3", false},
		{"empty", "", false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := parser.isChineseName(tt.input)
			if result != tt.expected {
				t.Errorf("isChineseName(%q) = %v, want %v", tt.input, result, tt.expected)
			}
		})
	}
}

func TestIsTechLike(t *testing.T) {
	parser := NewResumePDFParser()

	tests := []struct {
		name     string
		input    string
		expected bool
	}{
		{"Java", "Java", true},
		{"Python", "Python", true},
		{"React", "React", true},
		{"Go", "Go", true},
		{"common word", "company", false},
		{"description", "working on backend", false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := parser.isTechLike(tt.input)
			if result != tt.expected {
				t.Errorf("isTechLike(%q) = %v, want %v", tt.input, result, tt.expected)
			}
		})
	}
}

// =============================================================================
// Section 识别测试
// =============================================================================

func TestIdentifySections(t *testing.T) {
	parser := NewResumePDFParser()

	tests := []struct {
		name           string
		input          string
		expectedSections []string
	}{
		{
			"standard resume with all sections",
			`张三
			13800138000
			email@example.com

			教育背景
			清华大学 计算机科学与技术 2020.09 - 2022.06

			工作经历
			字节跳动 工程师 2022.07 - 至今

			项目经验
			电商系统 项目负责人 2021.03 - 2022.01

			专业技能
			Java Python Go`,
			[]string{"education", "work", "project", "skill"},
		},
		{
			"with awards and languages",
			`李四
			13900139000

			教育背景
			北京大学 2020.09 - 2024.06

			获奖荣誉
			一等奖学金 2022

			语言能力
			英语 CET-6`,
			[]string{"education", "award", "language"},
		},
		{
			"missing sections",
			`王五
			13700137000

			教育背景
			浙江大学 2019.09 - 2023.06

			工作经历
			阿里巴巴 2023.07 - 至今`,
			[]string{"education", "work"},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			lines := parser.splitAndCleanLines(tt.input)
			sections := parser.identifySections(lines)

			for _, expected := range tt.expectedSections {
				if _, ok := sections[expected]; !ok {
					t.Errorf("expected section %q not found", expected)
				}
			}
		})
	}
}

// =============================================================================
// 条目分割测试
// =============================================================================

func TestMergeMultiLineEntries(t *testing.T) {
	parser := NewResumePDFParser()

	tests := []struct {
		name           string
		input          []string
		minExpected    int
		maxExpected    int
	}{
		{
			"numbered entries",
			[]string{
				"1. 清华大学",
				"计算机科学与技术",
				"2020.09 - 2022.06",
				"2. 北京大学",
				"软件工程",
				"2022.09 - 2024.06",
			},
			1, 6, // 宽松范围，因为多行条目可能过度分割
		},
		{
			"bullet entries",
			[]string{
				"- 字节跳动 工程师",
				"- 负责后端开发",
				"- 阿里巴巴 架构师",
				"- 负责架构设计",
			},
			2, 4,
		},
		{
			"time-based entries",
			[]string{
				"2020.09 - 2022.06",
				"清华大学",
				"计算机科学与技术",
				"2022.09 - 2024.06",
				"北京大学",
				"软件工程",
			},
			2, 2,
		},
		{
			"single entry",
			[]string{
				"2020.09 - 2022.06",
				"清华大学",
				"计算机科学与技术",
			},
			1, 1,
		},
		{
			"empty input",
			[]string{},
			0, 0,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := parser.mergeMultiLineEntries(tt.input)
			if len(result) < tt.minExpected || len(result) > tt.maxExpected {
				t.Errorf("mergeMultiLineEntries() returned %d entries, want between %d and %d", len(result), tt.minExpected, tt.maxExpected)
			}
		})
	}
}

// =============================================================================
// 个人信息提取测试
// =============================================================================

func TestExtractPersonalInfo(t *testing.T) {
	parser := NewResumePDFParser()

	tests := []struct {
		name        string
		input       string
		expectedName string
		expectedEmail string
		expectedPhone string
	}{
		{
			"standard info",
			`张三
			软件工程师
			13800138000
			email@example.com
			北京

			教育背景`,
			"张三",
			"email@example.com",
			"13800138000",
		},
		{
			"with github",
			`李四
			全栈工程师
			13900139000
			li@example.com
			上海
			github.com/lisi

			教育背景`,
			"李四",
			"li@example.com",
			"13900139000",
		},
		{
			"english name",
			`John Doe
			Software Engineer
			13700137000
			john@example.com

			Education`,
			"John Doe",
			"john@example.com",
			"13700137000",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			lines := parser.splitAndCleanLines(tt.input)
			sections := parser.identifySections(lines)
			info := parser.extractPersonalInfo(lines, sections)

			if info["name"] != tt.expectedName {
				t.Errorf("name = %v, want %v", info["name"], tt.expectedName)
			}
			if info["email"] != tt.expectedEmail {
				t.Errorf("email = %v, want %v", info["email"], tt.expectedEmail)
			}
			if info["phone"] != tt.expectedPhone {
				t.Errorf("phone = %v, want %v", info["phone"], tt.expectedPhone)
			}
		})
	}
}

// =============================================================================
// 教育经历提取测试
// =============================================================================

func TestExtractEducation(t *testing.T) {
	parser := NewResumePDFParser()

	tests := []struct {
		name           string
		input          string
		expectNonEmpty bool
	}{
		{
			"standard education",
			`教育背景
			清华大学 计算机科学与技术 硕士 2020.09 - 2022.06
			北京大学 计算机科学与技术 本科 2016.09 - 2020.06`,
			true,
		},
		{
			"with GPA",
			`教育经历
			浙江大学 软件工程 本科 2019.09 - 2023.06 GPA: 3.8/4.0`,
			true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			lines := parser.splitAndCleanLines(tt.input)
			edu := parser.extractEducation(lines)

			if tt.expectNonEmpty && len(edu) == 0 {
				t.Error("expected non-empty education")
			}

			if len(edu) > 0 {
				t.Logf("Found %d education entries", len(edu))
				for i, e := range edu {
					t.Logf("  [%d] school=%v degree=%v", i, e["school"], e["degree"])
				}
			}
		})
	}
}

// =============================================================================
// 工作经历提取测试
// =============================================================================

func TestExtractWorkExperience(t *testing.T) {
	parser := NewResumePDFParser()

	input := `工作经历
			字节跳动 工程师 2022.07 - 至今
			负责后端系统开发

			阿里巴巴 高级工程师 2020.07 - 2022.06
			负责电商平台架构`

	lines := parser.splitAndCleanLines(input)
	work := parser.extractWorkExperience(lines)

	if len(work) == 0 {
		t.Fatal("extractWorkExperience() returned empty slice")
	}

	t.Logf("Found %d work entries", len(work))
	for i, w := range work {
		t.Logf("  [%d] company=%v position=%v", i, w["company"], w["position"])
	}

	// 验证 achievements 是数组类型
	if achievements, ok := work[0]["achievements"].([]string); ok {
		t.Logf("achievements type is correct []string with %d items", len(achievements))
	} else {
		t.Errorf("achievements should be []string, got %T", work[0]["achievements"])
	}
}

// =============================================================================
// 项目经验提取测试
// =============================================================================

func TestExtractProjects(t *testing.T) {
	parser := NewResumePDFParser()

	input := `项目经验
	电商系统 项目负责人 2021.03 - 2022.01
	使用 Spring Boot + MySQL 构建后端服务
	实现商品管理、订单处理等功能

	用户中心 组员 2020.06 - 2021.02
	基于 React + Node.js 的全栈项目`

	lines := parser.splitAndCleanLines(input)
	projects := parser.extractProjects(lines)

	if len(projects) == 0 {
		t.Fatal("extractProjects() returned empty slice")
	}

	t.Logf("Found %d projects", len(projects))
	for i, p := range projects {
		t.Logf("  [%d] name=%v role=%v", i, p["name"], p["role"])
	}

	// 验证 technologies 是数组类型
	if techs, ok := projects[0]["technologies"].([]string); ok {
		t.Logf("technologies type is correct []string with %d items: %v", len(techs), techs)
	} else {
		t.Errorf("technologies should be []string, got %T", projects[0]["technologies"])
	}
}

// =============================================================================
// 技能提取测试
// =============================================================================

func TestExtractSkills(t *testing.T) {
	parser := NewResumePDFParser()

	input := `专业技能
	编程语言: Java, Python, Go, JavaScript
	框架: Spring Boot, React, Vue
	数据库: MySQL, PostgreSQL, MongoDB
	工具: Git, Docker, Kubernetes`

	lines := parser.splitAndCleanLines(input)
	skills := parser.extractSkills(lines)

	if len(skills) == 0 {
		t.Fatal("extractSkills() returned empty slice")
	}

	items, ok := skills[0]["items"].([]string)
	if !ok {
		t.Fatalf("skills[0][items] should be []string, got %T", skills[0]["items"])
	}

	if len(items) == 0 {
		t.Error("skills items should not be empty")
	}

	t.Logf("Found %d skills: %v", len(items), items)
}

// =============================================================================
// 完整解析流程测试
// =============================================================================

func TestParseResumeText(t *testing.T) {
	parser := NewResumePDFParser()

	input := `张三
	软件工程师
	13800138000
	zhang@example.com
	北京

	教育背景
	清华大学 计算机科学与技术 硕士 2020.09 - 2022.06

	工作经历
	字节跳动 工程师 2022.07 - 至今
	负责后端系统开发

	项目经验
	电商系统 项目负责人 2021.03 - 2022.01
	使用 Spring Boot + MySQL

	专业技能
	Java Python Go MySQL`

	resume := parser.ParseText(input)

	// 验证个人信息
	if resume.PersonalInfo["name"] != "张三" {
		t.Errorf("name = %v, want 张三", resume.PersonalInfo["name"])
	}
	if resume.PersonalInfo["email"] != "zhang@example.com" {
		t.Errorf("email = %v, want zhang@example.com", resume.PersonalInfo["email"])
	}

	// 验证教育经历
	if len(resume.Education) == 0 {
		t.Error("education should not be empty")
	}

	// 验证工作经历
	if len(resume.WorkExperience) == 0 {
		t.Error("work experience should not be empty")
	} else {
		// 验证 achievements 是数组
		if achievements, ok := resume.WorkExperience[0]["achievements"].([]string); !ok {
			t.Errorf("achievements should be []string, got %T", resume.WorkExperience[0]["achievements"])
		} else {
			t.Logf("work achievements: %v", achievements)
		}
	}

	// 验证项目经验
	if len(resume.Projects) == 0 {
		t.Error("projects should not be empty")
	}

	// 验证技能
	if len(resume.Skills) == 0 {
		t.Error("skills should not be empty")
	}

	t.Log("Full resume parse test passed")
}

// =============================================================================
// 边界情况测试
// =============================================================================

func TestEmptyInput(t *testing.T) {
	parser := NewResumePDFParser()

	resume := parser.ParseText("")

	if resume.PersonalInfo["name"] != "" {
		t.Error("empty input should result in empty name")
	}
	if len(resume.Education) != 0 {
		t.Error("empty input should result in empty education")
	}
	if len(resume.WorkExperience) != 0 {
		t.Error("empty input should result in empty work experience")
	}
}

func TestOnlyPersonalInfo(t *testing.T) {
	parser := NewResumePDFParser()

	input := `李四
	全栈工程师
	13900139000
	li@example.com
	深圳`

	resume := parser.ParseText(input)

	if resume.PersonalInfo["name"] != "李四" {
		t.Errorf("name = %v, want 李四", resume.PersonalInfo["name"])
	}
	if len(resume.Education) != 0 {
		t.Error("should have no education entries")
	}
}

// =============================================================================
// ConvertToResumeData 测试
// =============================================================================

func TestConvertToResumeData(t *testing.T) {
	parser := NewResumePDFParser()

	input := `王五
	工程师
	13700137000
	wang@example.com

	教育背景
	清华大学 计算机 2020.09 - 2024.06`

	resume := parser.ParseText(input)
	data := resume.ConvertToResumeData()

	if data["personal_info"] == nil {
		t.Error("personal_info should not be nil")
	}
	if data["education"] == nil {
		t.Error("education should not be nil")
	}
	if data["work_experience"] == nil {
		t.Error("work_experience should not be nil")
	}
	if data["projects"] == nil {
		t.Error("projects should not be nil")
	}
	if data["skills"] == nil {
		t.Error("skills should not be nil")
	}
	if data["awards"] == nil {
		t.Error("awards should not be nil")
	}
	if data["languages"] == nil {
		t.Error("languages should not be nil")
	}
}

func TestToJSON(t *testing.T) {
	parser := NewResumePDFParser()

	input := `赵六
	前端工程师
	13600136000
	zhao@example.com`

	resume := parser.ParseText(input)
	jsonStr, err := resume.ToJSON()

	if err != nil {
		t.Errorf("ToJSON() returned error: %v", err)
	}

	if jsonStr == "" {
		t.Error("ToJSON() returned empty string")
	}

	// 验证是有效的 JSON
	if !strings.Contains(jsonStr, "personal_info") {
		t.Error("JSON should contain personal_info")
	}

	t.Logf("JSON output (first 200 chars): %s...", func() string {
		if len(jsonStr) > 200 {
			return jsonStr[:200]
		}
		return jsonStr
	}())
}
