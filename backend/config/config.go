package config

import (
	"fmt"
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

type Config struct {
	DBHost          string
	DBPort          string
	DBUser          string
	DBPassword      string
	DBName          string
	JWTSecret       string
	JWTExpireHours  int
	ServerPort      string
	GinMode         string
	AllowedOrigins  string
	UploadDir       string
	MaxUploadSizeMB int
}

var cfg Config

const defaultAllowedOrigins = "https://www.ledarise.com"

func Load() {
	_ = godotenv.Load()

	cfg = Config{
		DBHost:          getEnv("DB_HOST", "127.0.0.1"),
		DBPort:          getEnv("DB_PORT", "3306"),
		DBUser:          getEnv("DB_USER", "root"),
		DBPassword:      getEnv("DB_PASSWORD", "jason6688"),
		DBName:          getEnv("DB_NAME", "ledarise_db"),
		JWTSecret:       getEnv("JWT_SECRET", "change_me_in_production"),
		JWTExpireHours:  getEnvInt("JWT_EXPIRE_HOURS", 24),
		ServerPort:      getEnv("SERVER_PORT", "8080"),
		GinMode:         getEnv("GIN_MODE", "debug"),
		AllowedOrigins:  getEnv("ALLOWED_ORIGINS", defaultAllowedOrigins),
		UploadDir:       getEnv("UPLOAD_DIR", "./uploads"),
		MaxUploadSizeMB: getEnvInt("MAX_UPLOAD_SIZE_MB", 50),
	}
}

func Get() *Config { return &cfg }

func (c *Config) DSN() string {
	return fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local",
		c.DBUser, c.DBPassword, c.DBHost, c.DBPort, c.DBName)
}

func (c *Config) DSNWithoutDB() string {
	return fmt.Sprintf("%s:%s@tcp(%s:%s)/?charset=utf8mb4&parseTime=True&loc=Local",
		c.DBUser, c.DBPassword, c.DBHost, c.DBPort)
}

func getEnv(key, def string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return def
}

func getEnvInt(key string, def int) int {
	if v := os.Getenv(key); v != "" {
		if i, err := strconv.Atoi(v); err == nil {
			return i
		}
	}
	return def
}
