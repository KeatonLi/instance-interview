-- =====================================================
-- Resume AI Backend Database Schema (MySQL)
-- =====================================================
--
-- Project: Resume AI
-- Description: AI-powered resume builder for programmers
-- Database: MySQL 8.0+
--
-- =====================================================

-- 创建数据库
CREATE DATABASE IF NOT EXISTS resume_ai
    DEFAULT CHARACTER SET utf8mb4
    DEFAULT COLLATE utf8mb4_unicode_ci;

USE resume_ai;

-- =====================================================
-- Table: users (用户表)
-- =====================================================
CREATE TABLE IF NOT EXISTS `users` (
    `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT '用户ID',
    `username` varchar(100) NOT NULL COMMENT '用户名（登录用）',
    `email` varchar(255) DEFAULT NULL COMMENT '邮箱',
    `password` varchar(255) NOT NULL COMMENT '密码（加密存储）',
    `nickname` varchar(100) DEFAULT NULL COMMENT '昵称',
    `avatar` varchar(500) DEFAULT NULL COMMENT '头像URL',
    `phone` varchar(50) DEFAULT NULL COMMENT '手机号',
    `status` varchar(20) DEFAULT 'active' COMMENT '状态: active-激活, inactive-未激活',
    `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted_at` datetime DEFAULT NULL COMMENT '软删除时间',

    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_users_username` (`username`),
    UNIQUE KEY `uk_users_email` (`email`),
    KEY `idx_users_status` (`status`),
    KEY `idx_users_deleted_at` (`deleted_at`)

) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  DEFAULT COLLATE=utf8mb4_unicode_ci
  COMMENT='用户表';

-- =====================================================
-- Table: resumes (简历表)
-- =====================================================
CREATE TABLE IF NOT EXISTS `resumes` (
    `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT '简历ID',
    `user_id` bigint unsigned NOT NULL COMMENT '所属用户ID',
    `title` varchar(255) NOT NULL COMMENT '简历标题',
    `theme_id` int DEFAULT 0 COMMENT '模板ID',
    `resume_type` varchar(50) DEFAULT 'full' COMMENT '简历类型:
        full-完整版,
        simple-简洁版,
        project-manager-项目经理,
        frontend-前端工程师,
        backend-后端工程师,
        fullstack-全栈工程师',
    `is_default` tinyint(1) DEFAULT 0 COMMENT '是否为默认简历: 0-否, 1-是',
    `status` varchar(20) DEFAULT 'draft' COMMENT '简历状态: draft-草稿, published-已发布',

    -- JSON 字段存储详细简历内容
    `personal_info` json DEFAULT NULL COMMENT '个人基本信息 (JSON对象)',
    `education` json DEFAULT NULL COMMENT '教育经历 (JSON数组)',
    `work_experience` json DEFAULT NULL COMMENT '工作经历 (JSON数组)',
    `projects` json DEFAULT NULL COMMENT '项目经验 (JSON数组)',
    `skills` json DEFAULT NULL COMMENT '技能列表 (JSON数组)',
    `awards` json DEFAULT NULL COMMENT '奖项荣誉 (JSON数组)',
    `languages` json DEFAULT NULL COMMENT '语言能力 (JSON数组)',

    `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted_at` datetime DEFAULT NULL COMMENT '软删除时间',

    PRIMARY KEY (`id`),
    KEY `idx_resumes_user_id` (`user_id`),
    KEY `idx_resumes_status` (`status`),
    KEY `idx_resumes_is_default` (`is_default`),
    KEY `idx_resumes_deleted_at` (`deleted_at`),

    CONSTRAINT `fk_resumes_user`
        FOREIGN KEY (`user_id`)
        REFERENCES `users` (`id`)
        ON DELETE CASCADE
        ON UPDATE RESTRICT

) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  DEFAULT COLLATE=utf8mb4_unicode_ci
  COMMENT='简历表';

-- =====================================================
-- Sample Data (示例数据)
-- =====================================================

-- 插入测试用户 (密码: 123456)
INSERT INTO `users` (`username`, `email`, `password`, `nickname`, `status`)
VALUES ('demo', 'demo@example.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5EH', '演示用户', 'active');

-- 插入示例简历
INSERT INTO `resumes` (`user_id`, `title`, `theme_id`, `resume_type`, `is_default`, `status`, `personal_info`, `skills`)
VALUES
(
    1,
    '高级后端工程师',
    0,
    'backend',
    1,
    'published',
    -- Personal Info JSON
    '{
        "name": "张三",
        "title": "高级后端工程师",
        "email": "zhangsan@example.com",
        "phone": "13800138000",
        "location": "北京",
        "github": "https://github.com/zhangsan",
        "linkedin": "https://linkedin.com/in/zhangsan",
        "summary": "5年+后端开发经验，擅长Go语言，微服务架构设计。"
    }',
    -- Skills JSON
    '[
        {"category": "编程语言", "level": "精通", "items": ["Go", "Python", "Java", "Node.js"]},
        {"category": "框架", "level": "精通", "items": ["Gin", "Spring Boot", "Express"]},
        {"category": "数据库", "level": "熟练", "items": ["MySQL", "Redis", "MongoDB", "PostgreSQL"]},
        {"category": "工具", "level": "熟练", "items": ["Docker", "Kubernetes", "Git", "Linux"]}
    ]'
);

-- =====================================================
-- JSON Field Structure Reference (JSON字段结构参考)
-- =====================================================

/*
-- personal_info (个人基本信息)
{
    "name": "姓名",
    "title": "职位",
    "email": "邮箱",
    "phone": "电话",
    "location": "所在地",
    "linkedin": "LinkedIn URL",
    "github": "GitHub URL",
    "website": "个人网站",
    "summary": "个人简介"
}

-- education (教育经历) - JSON Array
[
    {
        "id": "唯一标识",
        "school": "学校名称",
        "degree": "学位",
        "field": "专业",
        "startDate": "开始时间",
        "endDate": "结束时间",
        "gpa": "GPA",
        "description": "描述"
    }
]

-- workExperience (工作经历) - JSON Array
[
    {
        "id": "唯一标识",
        "company": "公司名称",
        "position": "职位",
        "location": "工作地点",
        "startDate": "开始时间",
        "endDate": "结束时间",
        "current": false,
        "description": "工作描述",
        "achievements": ["成就1", "成就2"]
    }
]

-- projects (项目经验) - JSON Array
[
    {
        "id": "唯一标识",
        "name": "项目名称",
        "role": "担任角色",
        "startDate": "开始时间",
        "endDate": "结束时间",
        "current": false,
        "description": "项目描述",
        "technologies": ["技术栈1", "技术栈2"],
        "link": "项目链接",
        "demoLink": "演示链接",
        "highlights": ["亮点1", "亮点2"]
    }
]

-- skills (技能列表) - JSON Array
[
    {
        "id": "唯一标识",
        "category": "技能类别",
        "level": "熟练度",
        "items": ["技能项1", "技能项2"]
    }
]

-- awards (奖项荣誉) - JSON Array
[
    {
        "id": "唯一标识",
        "title": "奖项名称",
        "organization": "颁奖机构",
        "date": "获奖日期",
        "description": "描述"
    }
]

-- languages (语言能力) - JSON Array
[
    {
        "id": "唯一标识",
        "name": "语言名称",
        "level": "熟练度"
    }
]
*/
