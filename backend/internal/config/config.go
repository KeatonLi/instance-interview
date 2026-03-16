package config

import (
	"fmt"
	"os"
)

type Config struct {
	Port        string
	DBHost      string
	DBPort      string
	DBUser      string
	DBPassword  string
	DBName      string
	MinimaxAPI  string
	MinimaxKey  string
}

func Load() *Config {
	return &Config{
		Port:       getEnv("RESUME_PORT", "8082"),
		DBHost:     getEnv("RESUME_DB_HOST", "localhost"),
		DBPort:     getEnv("RESUME_DB_PORT", "3306"),
		DBUser:     getEnv("RESUME_DB_USER", "root"),
		DBPassword: getEnv("RESUME_DB_PASSWORD", ""),
		DBName:     getEnv("RESUME_DB_NAME", "interview"),
		MinimaxAPI: getEnv("ANTHROPIC_BASE_URL", "https://api.minimax.chat/v1/text/chatcompletion_v2"),
		MinimaxKey: getEnv("ANTHROPIC_API_KEY", ""),
	}
}

func (c *Config) GetDSN() string {
	return fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local",
		c.DBUser, c.DBPassword, c.DBHost, c.DBPort, c.DBName)
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
