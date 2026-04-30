package models

import "time"

const (
	ProductStatusPublished = "published"
	ProductStatusDraft     = "draft"
)

type Product struct {
	ID            uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	Name          string    `gorm:"size:200;not null" json:"name"`
	SKU           string    `gorm:"size:100;uniqueIndex;not null" json:"sku"`
	Description   string    `gorm:"type:text" json:"description"`
	Price         float64   `gorm:"not null;default:0" json:"price"`
	OriginalPrice float64   `json:"original_price"`
	Category      string    `gorm:"size:50" json:"category"`
	Color         string    `gorm:"size:50" json:"color"`
	Length        string    `gorm:"size:50" json:"length"`
	Material      string    `gorm:"size:50" json:"material"`
	Stock         int       `gorm:"not null;default:0" json:"stock"`
	Status        string    `gorm:"size:20;not null;default:draft;index" json:"status"`
	Tone          string    `gorm:"size:20" json:"tone"`
	Accent        string    `gorm:"size:20" json:"accent"`
	Tagline       string    `gorm:"type:text" json:"tagline"`
	Sales         int       `gorm:"not null;default:0" json:"sales"`
	Rating        float64   `gorm:"not null;default:0" json:"rating"`
	Reviews       int       `gorm:"not null;default:0" json:"reviews"`
	Features      string    `gorm:"type:text" json:"features"` // JSON-encoded []string
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`

	Images []ProductImage `gorm:"foreignKey:ProductID" json:"images,omitempty"`
}

type ProductImage struct {
	ID        uint   `gorm:"primaryKey;autoIncrement" json:"id"`
	ProductID uint   `gorm:"not null;index" json:"product_id"`
	URL       string `gorm:"size:500;not null" json:"url"`
	SortOrder int    `gorm:"default:0" json:"sort_order"`
}
