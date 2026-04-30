package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"ledarise-backend/database"
	"ledarise-backend/models"
	"ledarise-backend/utils"
)

type CustomerWithStats struct {
	models.Customer
	OrderCount int64   `json:"orders"`
	OrderTotal float64 `json:"total"`
}

func ListCustomers(c *gin.Context) {
	db := database.DB
	page, size := parsePage(c)

	keyword := c.Query("keyword")
	country := c.Query("country")

	q := db.Model(&models.Customer{})
	if keyword != "" {
		like := "%" + keyword + "%"
		q = q.Where("name LIKE ? OR email LIKE ?", like, like)
	}
	if country != "" {
		q = q.Where("country = ?", country)
	}

	var total int64
	q.Count(&total)

	var customers []models.Customer
	q.Order("id ASC").
		Limit(size).Offset((page - 1) * size).
		Find(&customers)

	// Enrich with order stats
	result := make([]CustomerWithStats, 0, len(customers))
	for _, cust := range customers {
		var orderCount int64
		var orderTotal float64
		db.Model(&models.Order{}).Where("customer_id = ?", cust.ID).Count(&orderCount)
		db.Model(&models.Order{}).Where("customer_id = ?", cust.ID).
			Select("COALESCE(SUM(grand_total), 0)").Scan(&orderTotal)
		result = append(result, CustomerWithStats{
			Customer:   cust,
			OrderCount: orderCount,
			OrderTotal: orderTotal,
		})
	}

	utils.Page(c, result, total, page, size)
}

func GetCustomer(c *gin.Context) {
	db := database.DB
	id := c.Param("id")

	var customer models.Customer
	if err := db.Preload("Addresses").First(&customer, id).Error; err != nil {
		utils.Error(c, http.StatusNotFound, "customer not found")
		return
	}

	var orders []models.Order
	db.Where("customer_id = ?", customer.ID).
		Preload("OrderItems").
		Preload("OrderItems.Product").
		Order("created_at DESC").
		Limit(20).
		Find(&orders)

	utils.Success(c, gin.H{
		"customer": customer,
		"orders":   orders,
	})
}

func UpdateCustomer(c *gin.Context) {
	db := database.DB
	id := c.Param("id")

	var customer models.Customer
	if err := db.First(&customer, id).Error; err != nil {
		utils.Error(c, http.StatusNotFound, "customer not found")
		return
	}

	var body map[string]interface{}
	if err := c.ShouldBindJSON(&body); err != nil {
		utils.Error(c, http.StatusBadRequest, err.Error())
		return
	}

	if err := db.Model(&customer).Updates(body).Error; err != nil {
		utils.Error(c, http.StatusInternalServerError, err.Error())
		return
	}
	utils.Success(c, customer)
}
