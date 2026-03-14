package config

import (
	"os"
)

type Config struct {
	Port        string
	DBPath      string
	MinimaxAPI  string
	MinimaxKey  string
}

func Load() *Config {
	return &Config{
		Port:       getEnv("PORT", "8082"),
		DBPath:     getEnv("DB_PATH", "./data/resumes.db"),
		MinimaxAPI: getEnv("MINIMAX_API_URL", "https://api.minimax.chat/v1/text/chatcompletion_v2"),
		MinimaxKey: getEnv("MINIMAX_API_KEY", ""),
	}
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
