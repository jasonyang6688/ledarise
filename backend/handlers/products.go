package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"ledarise-backend/database"
	"ledarise-backend/models"
	"ledarise-backend/utils"
)

func parsePage(c *gin.Context) (int, int) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	size, _ := strconv.Atoi(c.DefaultQuery("page_size", "20"))
	if page < 1 {
		page = 1
	}
	if size < 1 || size > 200 {
		size = 20
	}
	return page, size
}

func ListProducts(c *gin.Context) {
	db := database.DB
	page, size := parsePage(c)

	keyword := c.Query("keyword")
	status := c.Query("status")
	category := c.Query("category")

	q := db.Model(&models.Product{})
	if keyword != "" {
		like := "%" + keyword + "%"
		q = q.Where("name LIKE ? OR sku LIKE ?", like, like)
	}
	if status != "" {
		q = q.Where("status = ?", status)
	}
	if category != "" {
		q = q.Where("category = ?", category)
	}

	var total int64
	q.Count(&total)

	var products []models.Product
	q.Preload("Images").
		Order("id ASC").
		Limit(size).Offset((page - 1) * size).
		Find(&products)

	utils.Page(c, products, total, page, size)
}

func GetProduct(c *gin.Context) {
	db := database.DB
	id := c.Param("id")

	var product models.Product
	if err := db.Preload("Images").First(&product, id).Error; err != nil {
		utils.Error(c, http.StatusNotFound, "product not found")
		return
	}
	utils.Success(c, product)
}

func CreateProduct(c *gin.Context) {
	db := database.DB

	var product models.Product
	if err := c.ShouldBindJSON(&product); err != nil {
		utils.Error(c, http.StatusBadRequest, err.Error())
		return
	}

	// Check SKU uniqueness
	var existing models.Product
	if err := db.Where("sku = ?", product.SKU).First(&existing).Error; err == nil {
		utils.Error(c, http.StatusConflict, "SKU already exists")
		return
	}

	if err := db.Create(&product).Error; err != nil {
		utils.Error(c, http.StatusInternalServerError, err.Error())
		return
	}
	utils.Success(c, product)
}

func UpdateProduct(c *gin.Context) {
	db := database.DB
	id := c.Param("id")

	var product models.Product
	if err := db.First(&product, id).Error; err != nil {
		utils.Error(c, http.StatusNotFound, "product not found")
		return
	}

	var body map[string]interface{}
	if err := c.ShouldBindJSON(&body); err != nil {
		utils.Error(c, http.StatusBadRequest, err.Error())
		return
	}

	// Disallow SKU change
	delete(body, "sku")
	delete(body, "SKU")

	if err := db.Model(&product).Updates(body).Error; err != nil {
		utils.Error(c, http.StatusInternalServerError, err.Error())
		return
	}
	db.Preload("Images").First(&product, id)
	utils.Success(c, product)
}

func DeleteProduct(c *gin.Context) {
	db := database.DB
	id := c.Param("id")

	var product models.Product
	if err := db.First(&product, id).Error; err != nil {
		utils.Error(c, http.StatusNotFound, "product not found")
		return
	}
	db.Delete(&product)
	utils.Success(c, gin.H{"deleted": true})
}

func BatchDeleteProducts(c *gin.Context) {
	db := database.DB

	var body struct {
		IDs []uint `json:"ids"`
	}
	if err := c.ShouldBindJSON(&body); err != nil || len(body.IDs) == 0 {
		utils.Error(c, http.StatusBadRequest, "ids required")
		return
	}
	db.Where("id IN ?", body.IDs).Delete(&models.Product{})
	utils.Success(c, gin.H{"deleted": len(body.IDs)})
}

func UploadProductImage(c *gin.Context) {
	utils.Error(c, http.StatusNotImplemented, "not implemented")
}

func DeleteProductImage(c *gin.Context) {
	utils.Error(c, http.StatusNotImplemented, "not implemented")
}
