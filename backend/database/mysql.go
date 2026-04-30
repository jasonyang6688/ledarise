package database

import (
	"database/sql"
	"fmt"
	"time"

	_ "github.com/go-sql-driver/mysql"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"golang.org/x/crypto/bcrypt"
	"ledarise-backend/config"
	"ledarise-backend/models"
)

var DB *gorm.DB

// waitForMySQL pings MySQL up to maxAttempts times with a delay between tries.
// Useful when the backend container starts before MySQL is fully ready.
func waitForMySQL(dsn string, maxAttempts int, delay time.Duration) (*sql.DB, error) {
	var lastErr error
	for i := 1; i <= maxAttempts; i++ {
		db, err := sql.Open("mysql", dsn)
		if err == nil {
			if pingErr := db.Ping(); pingErr == nil {
				return db, nil
			} else {
				lastErr = pingErr
				db.Close()
			}
		} else {
			lastErr = err
		}
		fmt.Printf("MySQL not ready (attempt %d/%d): %v\n", i, maxAttempts, lastErr)
		time.Sleep(delay)
	}
	return nil, fmt.Errorf("mysql unreachable after %d attempts: %w", maxAttempts, lastErr)
}

func Init() {
	cfg := config.Get()

	// Wait for MySQL + create DB if not exists
	db, err := waitForMySQL(cfg.DSNWithoutDB(), 30, 2*time.Second)
	if err != nil {
		panic(fmt.Sprintf("failed to connect mysql: %v", err))
	}
	_, err = db.Exec(fmt.Sprintf(
		"CREATE DATABASE IF NOT EXISTS `%s` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci",
		cfg.DBName,
	))
	if err != nil {
		panic(fmt.Sprintf("failed to create database: %v", err))
	}
	db.Close()

	DB, err = gorm.Open(mysql.Open(cfg.DSN()), &gorm.Config{})
	if err != nil {
		panic(fmt.Sprintf("failed to open gorm: %v", err))
	}

	if err := DB.AutoMigrate(
		&models.AdminUser{},
		&models.Customer{},
		&models.Address{},
		&models.Product{},
		&models.ProductImage{},
		&models.Order{},
		&models.OrderItem{},
	); err != nil {
		panic(fmt.Sprintf("automigrate failed: %v", err))
	}

	seedAdmin()
	//SeedData()
}

func seedAdmin() {
	var count int64
	DB.Model(&models.AdminUser{}).Count(&count)
	if count > 0 {
		return
	}
	hash, _ := bcrypt.GenerateFromPassword([]byte("admin123"), 12)
	admin := models.AdminUser{
		Username:     "admin",
		Email:        "admin@ledarise.com",
		PasswordHash: string(hash),
		Role:         models.RoleSuperAdmin,
		IsActive:     true,
	}
	DB.Create(&admin)
	fmt.Println("Seeded default admin: admin@ledarise.com / admin123")
}
