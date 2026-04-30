package models

import "time"

const (
	OrderStatusPending    = "pending"
	OrderStatusProcessing = "processing"
	OrderStatusComplete   = "complete"
	OrderStatusCancelled  = "cancelled"
)

type Order struct {
	ID             uint       `gorm:"primaryKey;autoIncrement" json:"id"`
	OrderNo        string     `gorm:"size:50;uniqueIndex;not null" json:"order_no"`
	CustomerID     *uint      `gorm:"index" json:"customer_id"`
	Status         string     `gorm:"size:20;not null;default:pending;index" json:"status"`
	Subtotal       float64    `gorm:"not null;default:0" json:"subtotal"`
	ShippingAmount float64    `gorm:"not null;default:0" json:"shipping_amount"`
	Discount       float64    `gorm:"not null;default:0" json:"discount"`
	GrandTotal     float64    `gorm:"not null;default:0" json:"grand_total"`
	ShippingMethod string     `gorm:"size:50" json:"shipping_method"`
	CouponCode     string     `gorm:"size:50" json:"coupon_code"`
	Note           string     `gorm:"type:text" json:"note"`
	ShipName       string     `gorm:"size:100" json:"ship_name"`
	ShipPhone      string     `gorm:"size:30" json:"ship_phone"`
	ShipAddress    string     `gorm:"size:255" json:"ship_address"`
	ShipCity       string     `gorm:"size:100" json:"ship_city"`
	ShipState      string     `gorm:"size:100" json:"ship_state"`
	ShipZip        string     `gorm:"size:100" json:"ship_zip"`
	ShipCountry    string     `gorm:"size:50" json:"ship_country"`
	PurchasedAt    *time.Time `gorm:"index" json:"purchased_at"`
	CreatedAt      time.Time  `json:"created_at"`
	UpdatedAt      time.Time  `json:"updated_at"`

	Customer   *Customer   `gorm:"foreignKey:CustomerID" json:"customer,omitempty"`
	OrderItems []OrderItem `gorm:"foreignKey:OrderID" json:"order_items,omitempty"`
}
