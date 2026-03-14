package main

import (
	"log"

	"resume-ai-backend/internal/config"
	"resume-ai-backend/internal/handlers"
	"resume-ai-backend/internal/models"
	"resume-ai-backend/internal/middleware"

	"github.com/gin-gonic/gin"
)

func main() {
	// 加载配置
	cfg := config.Load()

	// 初始化数据库
	models.InitDB(cfg)

	// 创建 Gin 引擎
	r := gin.Default()

	// 中间件
	r.Use(middleware.Cors())
	r.Use(gin.Logger())
	r.Use(gin.Recovery())

	// 静态文件服务
	r.Static("/static", "./static")

	// API 路由
	api := r.Group("/api/v1")
	{
		// 简历相关接口
		resumes := api.Group("/resumes")
		{
			resumes.GET("", handlers.GetResumes)
			resumes.GET("/:id", handlers.GetResume)
			resumes.POST("", handlers.CreateResume)
			resumes.PUT("/:id", handlers.UpdateResume)
			resumes.DELETE("/:id", handlers.DeleteResume)
		}

		// AI 优化接口
		api.POST("/optimize", handlers.OptimizeResume)
	}

	// 健康检查
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	// 获取端口
	port := cfg.Port

	log.Printf("Server starting on port %s", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
