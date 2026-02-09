package config

import (
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	Port          string
	MongoURI      string
	RedisHost     string
	RedisPort     string
	RedisPassword string
	RedisTLS      bool
	JWTSecret     string
	ResendAPIKey  string
}

func LoadConfig() *Config {
	// Try loading multiple env files. The first one found takes precedence if using Overload,
	// but standard Load doesn't overwrite.
	// We want local .env to override root .env, so we load local first?
	// Actually godotenv.Load() won't overwrite existing env vars.
	// So we should just try loading them.
	// Common pattern: Load local, then root.
	
	_ = godotenv.Load(".env")
	_ = godotenv.Load("../../.env.development.local")
	_ = godotenv.Load("../../.env")
	
	// No strict error handling here as we fallback to os environment variables
	
	return &Config{
		Port:          getEnv("AUTH_SERVICE_PORT", "3007"),
		MongoURI:      getEnv("MONGO_URI", "mongodb://localhost:27017"),
		RedisHost:     getEnv("REDIS_HOST", "localhost"),
		RedisPort:     getEnv("REDIS_PORT", "6379"),
		RedisPassword: getEnv("REDIS_PASSWORD", ""),
		RedisTLS:      getEnv("REDIS_TLS", "false") == "true",
		JWTSecret:     getEnv("JWT_SECRET", "default_secret"),
		ResendAPIKey:  getEnv("RESEND_API_KEY", ""),
	}
}

func getEnv(key, fallback string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return fallback
}
