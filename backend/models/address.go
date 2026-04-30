package models

type Address struct {
	ID          uint   `gorm:"primaryKey;autoIncrement" json:"id"`
	CustomerID  uint   `gorm:"not null;index" json:"customer_id"`
	AddressLine string `gorm:"size:255" json:"address_line"`
	City        string `gorm:"size:100" json:"city"`
	State       string `gorm:"size:100" json:"state"`
	Zip         string `gorm:"size:100" json:"zip"`
	Country     string `gorm:"size:50" json:"country"`
	IsDefault   bool   `gorm:"default:false" json:"is_default"`
}
