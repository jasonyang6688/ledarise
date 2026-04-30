package handlers

import (
	"fmt"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"ledarise-backend/database"
	"ledarise-backend/models"
	"ledarise-backend/utils"
)

type DashboardStatsResp struct {
	TotalOrders    int64   `json:"total_orders"`
	TotalRevenue   float64 `json:"total_revenue"`
	TotalCustomers int64   `json:"total_customers"`
	TotalSkus      int64   `json:"total_skus"`
	AvgOrder       float64 `json:"avg_order"`
	OrdersToday    int64   `json:"orders_today"`
	RevenueToday   float64 `json:"revenue_today"`
	ShippingRevenue float64 `json:"shipping_revenue"`
}

func DashboardStats(c *gin.Context) {
	db := database.DB

	var totalOrders int64
	db.Model(&models.Order{}).Count(&totalOrders)

	var totalRevenue float64
	db.Model(&models.Order{}).Where("status = ?", models.OrderStatusComplete).
		Select("COALESCE(SUM(grand_total), 0)").Scan(&totalRevenue)

	var totalCustomers int64
	db.Model(&models.Customer{}).Count(&totalCustomers)

	var totalSkus int64
	db.Model(&models.Product{}).Count(&totalSkus)

	var avgOrder float64
	if totalOrders > 0 {
		avgOrder = totalRevenue / float64(totalOrders)
	}

	today := time.Now().Format("2006-01-02")
	var ordersToday int64
	db.Model(&models.Order{}).Where("DATE(purchased_at) = ?", today).Count(&ordersToday)

	var revenueToday float64
	db.Model(&models.Order{}).Where("DATE(purchased_at) = ?", today).
		Select("COALESCE(SUM(grand_total), 0)").Scan(&revenueToday)

	var shippingRevenue float64
	db.Model(&models.Order{}).Where("status = ?", models.OrderStatusComplete).
		Select("COALESCE(SUM(shipping_amount), 0)").Scan(&shippingRevenue)

	utils.Success(c, DashboardStatsResp{
		TotalOrders:    totalOrders,
		TotalRevenue:   totalRevenue,
		TotalCustomers: totalCustomers,
		TotalSkus:      totalSkus,
		AvgOrder:       avgOrder,
		OrdersToday:    ordersToday,
		RevenueToday:   revenueToday,
		ShippingRevenue: shippingRevenue,
	})
}

type RevenueTrendPoint struct {
	Date     string  `json:"date"`
	Total    float64 `json:"total"`
	Orders   int64   `json:"orders"`
	Shipping float64 `json:"shipping"`
}

func RevenueTrend(c *gin.Context) {
	db := database.DB

	daysStr := c.DefaultQuery("days", "30")
	days, err := strconv.Atoi(daysStr)
	if err != nil || days <= 0 {
		days = 30
	}

	since := time.Now().AddDate(0, 0, -days+1)
	sinceStr := since.Format("2006-01-02")

	type rawRow struct {
		D        string  `gorm:"column:d"`
		Total    float64 `gorm:"column:total"`
		Orders   int64   `gorm:"column:orders"`
		Shipping float64 `gorm:"column:shipping"`
	}

	var rows []rawRow
	db.Raw(`SELECT DATE(purchased_at) as d, COALESCE(SUM(grand_total),0) as total, COUNT(*) as orders, COALESCE(SUM(shipping_amount),0) as shipping
		FROM orders
		WHERE purchased_at >= ?
		GROUP BY DATE(purchased_at)
		ORDER BY d`, sinceStr).Scan(&rows)

	// Build map for quick lookup
	rowMap := make(map[string]rawRow, len(rows))
	for _, r := range rows {
		rowMap[r.D] = r
	}

	// Pad missing days with zeros
	result := make([]RevenueTrendPoint, 0, days)
	for i := days - 1; i >= 0; i-- {
		d := time.Now().AddDate(0, 0, -i)
		key := d.Format("2006-01-02")
		label := fmt.Sprintf("%02d-%02d", d.Month(), d.Day())
		pt := RevenueTrendPoint{Date: label}
		if r, ok := rowMap[key]; ok {
			pt.Total = r.Total
			pt.Orders = r.Orders
			pt.Shipping = r.Shipping
		}
		result = append(result, pt)
	}

	utils.Success(c, result)
}

type CountryDistEntry struct {
	Code    string  `json:"code"`
	Name    string  `json:"name"`
	Flag    string  `json:"flag"`
	Orders  int64   `json:"orders"`
	Revenue float64 `json:"revenue"`
	Share   float64 `json:"share"`
}

var countryMeta = map[string]struct {
	code string
	name string
	flag string
}{
	"United States":  {code: "US", name: "United States", flag: "🇺🇸"},
	"United Kingdom": {code: "GB", name: "United Kingdom", flag: "🇬🇧"},
	"Germany":        {code: "DE", name: "Germany", flag: "🇩🇪"},
}

func CountryDist(c *gin.Context) {
	db := database.DB

	type rawRow struct {
		ShipCountry string  `gorm:"column:ship_country"`
		Orders      int64   `gorm:"column:orders"`
		Revenue     float64 `gorm:"column:revenue"`
	}

	var rows []rawRow
	db.Raw(`SELECT ship_country, COUNT(*) as orders, COALESCE(SUM(grand_total),0) as revenue
		FROM orders
		WHERE ship_country != ''
		GROUP BY ship_country`).Scan(&rows)

	var totalOrders int64
	for _, r := range rows {
		totalOrders += r.Orders
	}

	result := make([]CountryDistEntry, 0, len(rows))
	for _, r := range rows {
		meta, ok := countryMeta[r.ShipCountry]
		if !ok {
			meta.code = r.ShipCountry
			meta.name = r.ShipCountry
			meta.flag = ""
		}
		share := 0.0
		if totalOrders > 0 {
			share = float64(r.Orders) / float64(totalOrders) * 100
		}
		result = append(result, CountryDistEntry{
			Code:    meta.code,
			Name:    meta.name,
			Flag:    meta.flag,
			Orders:  r.Orders,
			Revenue: r.Revenue,
			Share:   share,
		})
	}

	utils.Success(c, result)
}

type RecentOrderEntry struct {
	ID             uint    `json:"id"`
	OrderNo        string  `json:"order_no"`
	CustomerName   string  `json:"customer_name"`
	GrandTotal     float64 `json:"grand_total"`
	Status         string  `json:"status"`
	ShippingMethod string  `json:"shipping_method"`
	PurchasedAt    string  `json:"purchased_at"`
}

func RecentOrders(c *gin.Context) {
	db := database.DB

	var orders []models.Order
	db.Preload("Customer").
		Order("created_at DESC").
		Limit(10).
		Find(&orders)

	result := make([]RecentOrderEntry, 0, len(orders))
	for _, o := range orders {
		customerName := ""
		if o.Customer != nil {
			customerName = o.Customer.Name
		}
		purchasedAt := ""
		if o.PurchasedAt != nil {
			purchasedAt = o.PurchasedAt.Format("2006-01-02")
		}
		result = append(result, RecentOrderEntry{
			ID:             o.ID,
			OrderNo:        o.OrderNo,
			CustomerName:   customerName,
			GrandTotal:     o.GrandTotal,
			Status:         o.Status,
			ShippingMethod: o.ShippingMethod,
			PurchasedAt:    purchasedAt,
		})
	}

	utils.Success(c, result)
}
