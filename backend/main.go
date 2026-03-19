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

	// 初始化 handlers
	authHandler := &handlers.AuthHandler{}

	// API 路由
	api := r.Group("/api/v1")
	{
		// 公开接口 - 用户认证
		auth := api.Group("/auth")
		{
			auth.POST("/register", authHandler.Register)
			auth.POST("/login", authHandler.Login)
			auth.POST("/guest", authHandler.GuestLogin) // 游客登录
		}

		// 需要认证的接口
		protected := api.Group("")
		protected.Use(middleware.AuthRequired())
		{
			// 用户相关
			authMe := protected.Group("/auth")
			{
				authMe.GET("/me", authHandler.GetCurrentUser)
				authMe.PUT("/profile", authHandler.UpdateProfile)
				authMe.PUT("/password", authHandler.ChangePassword)
			}

			// 简历相关接口
			resumes := protected.Group("/resumes")
			{
				resumes.GET("", handlers.GetResumes)
				resumes.GET("/:id", handlers.GetResume)
				resumes.POST("", handlers.CreateResume)
				resumes.POST("/import", handlers.ImportResume) // PDF 导入简历
				resumes.PUT("/:id", handlers.UpdateResume)
				resumes.DELETE("/:id", handlers.DeleteResume)
			}
		}
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
