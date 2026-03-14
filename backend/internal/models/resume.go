package models

import (
	"time"

	"resume-ai-backend/internal/config"

	"github.com/glebarez/sqlite"
	"gorm.io/gorm"
)

var db *gorm.DB

type User struct {
	ID           uint           `json:"id" gorm:"primaryKey"`
	Username     string         `json:"username" gorm:"size:100;uniqueIndex;not null"`
	Email        string         `json:"email" gorm:"size:255;uniqueIndex"`
	Password     string         `json:"-" gorm:"size:255;not null"`
	Nickname     string         `json:"nickname" gorm:"size:100"`
	Avatar       string         `json:"avatar" gorm:"size:500"`
	Phone        string         `json:"phone" gorm:"size:50"`
	Status       string         `json:"status" gorm:"size:20;default:'active'"` // active, inactive
	CreatedAt    time.Time      `json:"created_at"`
	UpdatedAt    time.Time      `json:"updated_at"`
	DeletedAt    gorm.DeletedAt `json:"-" gorm:"index"`
	Resumes      []Resume       `json:"resumes" gorm:"foreignKey:UserID"`
}

type Resume struct {
	ID             uint           `json:"id" gorm:"primaryKey"`
	UserID         uint           `json:"user_id" gorm:"index;not null"`
	Title          string         `json:"title" gorm:"size:255;not null"`
	ResumeType     string         `json:"resume_type" gorm:"size:50;default:'full'"` // full, simple, project-manager, frontend, backend, fullstack
	IsDefault      bool           `json:"is_default" gorm:"default:false"`
	Status         string         `json:"status" gorm:"size:20;default:'draft'"` // draft, published
	PersonalInfo   string         `json:"personal_info" gorm:"type:json"`       // JSON: 个人基本信息
	Education      string         `json:"education" gorm:"type:json"`            // JSON: 教育经历数组
	WorkExperience string         `json:"work_experience" gorm:"type:json"`       // JSON: 工作经历数组
	Projects       string         `json:"projects" gorm:"type:json"`             // JSON: 项目经验数组
	Skills         string         `json:"skills" gorm:"type:json"`               // JSON: 技能数组
	Awards         string         `json:"awards" gorm:"type:json"`               // JSON: 奖项数组
	Languages      string         `json:"languages" gorm:"type:json"`            // JSON: 语言能力数组
	CreatedAt      time.Time      `json:"created_at"`
	UpdatedAt      time.Time      `json:"updated_at"`
	DeletedAt      gorm.DeletedAt `json:"-" gorm:"index"`

	User User `json:"user,omitempty" gorm:"foreignKey:UserID"`
}

func InitDB(cfg *config.Config) {
	var err error

	db, err = gorm.Open(sqlite.Open(cfg.DBPath), &gorm.Config{})
	if err != nil {
		panic("failed to connect database: " + err.Error())
	}

	err = db.AutoMigrate(
		&User{},
		&Resume{},
	)
	if err != nil {
		panic("failed to migrate database: " + err.Error())
	}
}

func GetDB() *gorm.DB {
	return db
}

/*
================================================================================
DDL 语句 (MySQL 版本)
================================================================================

-- 用户表
CREATE TABLE `users` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `username` varchar(100) NOT NULL COMMENT '用户名',
  `email` varchar(255) DEFAULT NULL COMMENT '邮箱',
  `password` varchar(255) NOT NULL COMMENT '密码',
  `nickname` varchar(100) DEFAULT NULL COMMENT '昵称',
  `avatar` varchar(500) DEFAULT NULL COMMENT '头像URL',
  `phone` varchar(50) DEFAULT NULL COMMENT '手机号',
  `status` varchar(20) DEFAULT 'active' COMMENT '状态: active/inactive',
  `created_at` datetime(3) DEFAULT NULL,
  `updated_at` datetime(3) DEFAULT NULL,
  `deleted_at` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_users_username` (`username`),
  UNIQUE KEY `idx_users_email` (`email`),
  KEY `idx_users_deleted_at` (`deleted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- 简历表
CREATE TABLE `resumes` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL COMMENT '用户ID',
  `title` varchar(255) NOT NULL COMMENT '简历标题',
  `resume_type` varchar(50) DEFAULT 'full' COMMENT '简历类型: full/简单/project-manager/frontend/backend/fullstack',
  `is_default` tinyint(1) DEFAULT 0 COMMENT '是否为默认简历',
  `status` varchar(20) DEFAULT 'draft' COMMENT '状态: draft/published',
  `personal_info` json DEFAULT NULL COMMENT '个人基本信息(JSON)',
  `education` json DEFAULT NULL COMMENT '教育经历(JSON数组)',
  `work_experience` json DEFAULT NULL COMMENT '工作经历(JSON数组)',
  `projects` json DEFAULT NULL COMMENT '项目经验(JSON数组)',
  `skills` json DEFAULT NULL COMMENT '技能(JSON数组)',
  `awards` json DEFAULT NULL COMMENT '奖项(JSON数组)',
  `languages` json DEFAULT NULL COMMENT '语言能力(JSON数组)',
  `created_at` datetime(3) DEFAULT NULL,
  `updated_at` datetime(3) DEFAULT NULL,
  `deleted_at` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_resumes_user_id` (`user_id`),
  KEY `idx_resumes_deleted_at` (`deleted_at`),
  CONSTRAINT `fk_resumes_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='简历表';

================================================================================
*/

func CreateUser(user *User) error {
	return db.Create(user).Error
}

func GetUserByID(id uint) (*User, error) {
	var user User
	err := db.First(&user, id).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func GetUserByUsername(username string) (*User, error) {
	var user User
	err := db.Where("username = ?", username).First(&user).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func GetUserByEmail(email string) (*User, error) {
	var user User
	err := db.Where("email = ?", email).First(&user).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func UpdateUser(user *User) error {
	return db.Save(user).Error
}

func DeleteUser(id uint) error {
	return db.Delete(&User{}, id).Error
}

func CreateResume(resume *Resume) error {
	return db.Create(resume).Error
}

func GetResumeByID(id uint) (*Resume, error) {
	var resume Resume
	err := db.Preload("User").First(&resume, id).Error
	if err != nil {
		return nil, err
	}
	return &resume, nil
}

func GetResumesByUserID(userID uint) ([]Resume, error) {
	var resumes []Resume
	err := db.Where("user_id = ?", userID).Order("is_default DESC, updated_at DESC").Find(&resumes).Error
	return resumes, err
}

func GetDefaultResumeByUserID(userID uint) (*Resume, error) {
	var resume Resume
	err := db.Where("user_id = ? AND is_default = ?", userID, true).First(&resume).Error
	if err != nil {
		return nil, err
	}
	return &resume, nil
}

func UpdateResume(resume *Resume) error {
	return db.Save(resume).Error
}

func DeleteResume(id uint) error {
	return db.Delete(&Resume{}, id).Error
}

func SetDefaultResume(userID, resumeID uint) error {
	return db.Transaction(func(tx *gorm.DB) error {
		tx.Model(&Resume{}).Where("user_id = ?", userID).Update("is_default", false)
		return tx.Model(&Resume{}).Where("id = ? AND user_id = ?", resumeID, userID).Update("is_default", true).Error
	})
}
