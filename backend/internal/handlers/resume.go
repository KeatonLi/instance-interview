package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"
	"strings"

	"resume-ai-backend/internal/models"
	"resume-ai-backend/internal/services"

	"github.com/gin-gonic/gin"
)

// toJSONString 将数据转换为 JSON 字符串
func toJSONString(data interface{}) string {
	if data == nil {
		return "{}"
	}

	switch v := data.(type) {
	case map[string]interface{}:
		if len(v) == 0 {
			return "{}"
		}
	case []map[string]interface{}:
		if len(v) == 0 {
			return "[]"
		}
	case []interface{}:
		if len(v) == 0 {
			return "[]"
		}
	}

	bytes, _ := json.Marshal(data)
	return string(bytes)
}

func GetResumes(c *gin.Context) {
	userID, ok := GetCurrentUserID(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	resumes, err := models.GetResumesByUserID(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code": 0,
		"data": gin.H{
			"list":      resumes,
			"total":     len(resumes),
			"page":      1,
			"page_size": 10,
		},
	})
}

func GetResume(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}

	resume, err := models.GetResumeByID(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "resume not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code": 0,
		"data": resume,
	})
}

func CreateResume(c *gin.Context) {
	var req struct {
		Title      string `json:"title"`
		ResumeType string `json:"resume_type"`
		UserID     uint   `json:"user_id"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if req.Title == "" {
		req.Title = "我的简历"
	}
	if req.ResumeType == "" {
		req.ResumeType = "full"
	}

	resume := &models.Resume{
		Title:          req.Title,
		ResumeType:     req.ResumeType,
		UserID:         req.UserID,
		Status:         "draft",
		PersonalInfo:   "{}",    // JSON 对象
		Education:      "[]",    // JSON 数组
		WorkExperience: "[]",
		Projects:       "[]",
		Skills:         "[]",
		Awards:         "[]",
		Languages:      "[]",
	}

	if err := models.CreateResume(resume); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code": 0,
		"data": resume,
	})
}

func UpdateResume(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}

	resume, err := models.GetResumeByID(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "resume not found"})
		return
	}

	var req struct {
		Title          string `json:"title"`
		ThemeID        *int   `json:"theme_id"`
		ResumeType     string `json:"resume_type"`
		Status         string `json:"status"`
		IsDefault      *bool  `json:"is_default"`
		PersonalInfo   string `json:"personal_info"`
		Education      string `json:"education"`
		WorkExperience string `json:"work_experience"`
		Projects       string `json:"projects"`
		Skills         string `json:"skills"`
		Awards         string `json:"awards"`
		Languages      string `json:"languages"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if req.Title != "" {
		resume.Title = req.Title
	}
	if req.ThemeID != nil {
		resume.ThemeID = *req.ThemeID
	}
	if req.ResumeType != "" {
		resume.ResumeType = req.ResumeType
	}
	if req.Status != "" {
		resume.Status = req.Status
	}
	if req.PersonalInfo != "" {
		resume.PersonalInfo = req.PersonalInfo
	}
	if req.Education != "" {
		resume.Education = req.Education
	}
	if req.WorkExperience != "" {
		resume.WorkExperience = req.WorkExperience
	}
	if req.Projects != "" {
		resume.Projects = req.Projects
	}
	if req.Skills != "" {
		resume.Skills = req.Skills
	}
	if req.Awards != "" {
		resume.Awards = req.Awards
	}
	if req.Languages != "" {
		resume.Languages = req.Languages
	}

	if req.IsDefault != nil && *req.IsDefault {
		models.SetDefaultResume(resume.UserID, resume.ID)
	}

	if err := models.UpdateResume(resume); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code": 0,
		"data": resume,
	})
}

func DeleteResume(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}

	if err := models.DeleteResume(uint(id)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code":    0,
		"message": "deleted successfully",
	})
}

func OptimizeResume(c *gin.Context) {
	var req struct {
		Content string `json:"content" binding:"required"`
		Type    string `json:"type"`
		Target  string `json:"target"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	result, err := services.OptimizeWithAI(req.Content, req.Type, req.Target)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code": 0,
		"data": gin.H{
			"result": result,
		},
	})
}

// ImportResume 从 PDF 导入简历
func ImportResume(c *gin.Context) {
	userID, ok := GetCurrentUserID(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	// 获取上传的文件
	file, header, err := c.Request.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "请上传文件"})
		return
	}
	defer file.Close()

	// 检查文件后缀
	if !strings.HasSuffix(strings.ToLower(header.Filename), ".pdf") {
		c.JSON(http.StatusBadRequest, gin.H{"error": "请上传 PDF 格式的文件"})
		return
	}

	// 检查文件大小 (最大 10MB)
	if header.Size > 10*1024*1024 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "文件大小不能超过 10MB"})
		return
	}

	// 解析 PDF
	parsedResume, err := services.ParsePDF(file)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "PDF 解析失败: " + err.Error()})
		return
	}

	// 转换为 JSON 字符串
	resumeData := parsedResume.ConvertToResumeData()

	// 创建新简历
	resume := &models.Resume{
		Title:          "导入的简历",
		ResumeType:     "full",
		UserID:         userID,
		Status:         "draft",
		PersonalInfo:   toJSONString(resumeData["personal_info"]),
		Education:      toJSONString(resumeData["education"]),
		WorkExperience: toJSONString(resumeData["work_experience"]),
		Projects:       toJSONString(resumeData["projects"]),
		Skills:         toJSONString(resumeData["skills"]),
		Awards:         "[]",
		Languages:      "[]",
	}

	// 使用解析出的姓名作为标题
	if personalInfo, ok := resumeData["personal_info"].(map[string]interface{}); ok {
		if name, ok := personalInfo["name"].(string); ok && name != "" {
			resume.Title = name + "的简历"
		}
	}

	if err := models.CreateResume(resume); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "保存简历失败: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code":    0,
		"message": "导入成功",
		"data": gin.H{
			"resume":   resume,
			"raw_text": parsedResume.RawText,
			"parsed":   resumeData,
		},
	})
}
