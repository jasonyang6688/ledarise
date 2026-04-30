package models

type OrderItem struct {
	ID          uint    `gorm:"primaryKey;autoIncrement" json:"id"`
	OrderID     uint    `gorm:"not null;index" json:"order_id"`
	ProductID   *uint   `json:"product_id"`
	SKU         string  `gorm:"size:100;not null" json:"sku"`
	ProductName string  `gorm:"size:200" json:"product_name"`
	Price       float64 `gorm:"not null" json:"price"`
	Quantity    int     `gorm:"not null;default:1" json:"quantity"`
	Subtotal    float64 `gorm:"not null" json:"subtotal"`

	Product *Product `gorm:"foreignKey:ProductID" json:"product,omitempty"`
}
