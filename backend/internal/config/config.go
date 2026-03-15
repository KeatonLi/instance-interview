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
		Port:       getEnv("PORT", "8082"),
		DBHost:     getEnv("DB_HOST", "111.231.107.210"),
		DBPort:     getEnv("DB_PORT", "13306"),
		DBUser:     getEnv("DB_USER", "interview"),
		DBPassword: getEnv("DB_PASSWORD", "interviewSQL"),
		DBName:     getEnv("DB_NAME", "interview"),
		MinimaxAPI: getEnv("MINIMAX_API_URL", "https://api.minimax.chat/v1/text/chatcompletion_v2"),
		MinimaxKey: getEnv("MINIMAX_API_KEY", ""),
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
