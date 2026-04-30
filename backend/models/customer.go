package models

import "time"

type Customer struct {
	ID           uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	Name         string    `gorm:"size:100;not null;index:idx_name_phone" json:"name"`
	Email        string    `gorm:"size:100;index" json:"email"`
	Phone        string    `gorm:"size:30;index:idx_name_phone" json:"phone"`
	Country      string    `gorm:"size:50" json:"country"`
	PasswordHash string    `gorm:"size:255" json:"-"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`

	Addresses []Address `gorm:"foreignKey:CustomerID" json:"addresses,omitempty"`
}
