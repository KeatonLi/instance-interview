package handlers

import (
	"net/http"
	"strconv"

	"resume-ai-backend/internal/models"
	"resume-ai-backend/internal/services"

	"github.com/gin-gonic/gin"
)

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
