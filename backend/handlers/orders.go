package handlers

import (
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"ledarise-backend/config"
	"ledarise-backend/database"
	"ledarise-backend/models"
	"ledarise-backend/services"
	"ledarise-backend/utils"
)

var validOrderStatuses = map[string]bool{
	models.OrderStatusPending:    true,
	models.OrderStatusProcessing: true,
	models.OrderStatusComplete:   true,
	models.OrderStatusCancelled:  true,
}

func ListOrders(c *gin.Context) {
	db := database.DB
	page, size := parsePage(c)

	keyword := c.Query("keyword")
	status := c.Query("status")
	country := c.Query("country")
	startDate := c.Query("start_date")
	endDate := c.Query("end_date")
	sortBy := c.DefaultQuery("sort", "placed_desc")

	q := db.Model(&models.Order{})

	if keyword != "" {
		like := "%" + keyword + "%"
		// Join customers for name search
		q = q.Joins("LEFT JOIN customers ON customers.id = orders.customer_id").
			Where("orders.order_no LIKE ? OR customers.name LIKE ?", like, like)
	}
	if status != "" {
		q = q.Where("orders.status = ?", status)
	}
	if country != "" {
		q = q.Where("orders.ship_country = ?", country)
	}
	if startDate != "" {
		q = q.Where("orders.purchased_at >= ?", startDate)
	}
	if endDate != "" {
		q = q.Where("orders.purchased_at < ?", endDate+" 23:59:59")
	}

	var total int64
	q.Count(&total)

	var orders []models.Order
	orderClause := "orders.purchased_at DESC, orders.created_at DESC"
	if sortBy == "placed_asc" {
		orderClause = "orders.purchased_at ASC, orders.created_at ASC"
	}
	q.Preload("Customer").
		Preload("OrderItems").
		Preload("OrderItems.Product").
		Order(orderClause).
		Limit(size).Offset((page - 1) * size).
		Find(&orders)

	utils.Page(c, orders, total, page, size)
}

func GetOrder(c *gin.Context) {
	db := database.DB
	id := c.Param("id")

	var order models.Order
	if err := db.Preload("Customer").
		Preload("OrderItems").
		Preload("OrderItems.Product").
		First(&order, id).Error; err != nil {
		utils.Error(c, http.StatusNotFound, "order not found")
		return
	}
	utils.Success(c, order)
}

func UpdateOrderStatus(c *gin.Context) {
	db := database.DB
	id := c.Param("id")

	var body struct {
		Status string `json:"status"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		utils.Error(c, http.StatusBadRequest, err.Error())
		return
	}
	if !validOrderStatuses[body.Status] {
		utils.Error(c, http.StatusBadRequest, "invalid status")
		return
	}

	var order models.Order
	if err := db.First(&order, id).Error; err != nil {
		utils.Error(c, http.StatusNotFound, "order not found")
		return
	}

	db.Model(&order).Update("status", body.Status)
	utils.Success(c, gin.H{"updated": true})
}

func UpdateOrderNote(c *gin.Context) {
	db := database.DB
	id := c.Param("id")

	var body struct {
		Note string `json:"note"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		utils.Error(c, http.StatusBadRequest, err.Error())
		return
	}

	var order models.Order
	if err := db.First(&order, id).Error; err != nil {
		utils.Error(c, http.StatusNotFound, "order not found")
		return
	}

	db.Model(&order).Update("note", body.Note)
	utils.Success(c, gin.H{"updated": true})
}

func ExportOrders(c *gin.Context) {
	utils.Error(c, http.StatusNotImplemented, "not implemented")
}

func ImportOrders(c *gin.Context) {
	file, err := c.FormFile("file")
	if err != nil {
		utils.Error(c, http.StatusBadRequest, "file is required")
		return
	}

	if !strings.HasSuffix(strings.ToLower(file.Filename), ".xlsx") {
		utils.Error(c, http.StatusBadRequest, "only .xlsx files supported")
		return
	}

	maxBytes := int64(config.Get().MaxUploadSizeMB) * 1024 * 1024
	if file.Size > maxBytes {
		utils.Error(c, http.StatusBadRequest,
			fmt.Sprintf("file too large (max %dMB)", config.Get().MaxUploadSizeMB))
		return
	}

	uploadDir := config.Get().UploadDir
	if err := os.MkdirAll(uploadDir, 0755); err != nil {
		utils.Error(c, http.StatusInternalServerError, "failed to create upload dir")
		return
	}

	dst := filepath.Join(uploadDir, uuid.New().String()+".xlsx")
	if err := c.SaveUploadedFile(file, dst); err != nil {
		utils.Error(c, http.StatusInternalServerError, "failed to save file")
		return
	}

	taskID := services.StartImport(dst)
	utils.Success(c, gin.H{"task_id": taskID})
}

func GetImportStatus(c *gin.Context) {
	taskID := c.Param("task_id")
	progress, ok := services.GetImportProgress(taskID)
	if !ok {
		utils.Error(c, http.StatusNotFound, "task not found")
		return
	}
	utils.Success(c, progress)
}
