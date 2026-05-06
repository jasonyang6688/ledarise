package handlers

import (
	"fmt"
	"math/rand"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"ledarise-backend/database"
	"ledarise-backend/models"
	"ledarise-backend/utils"
)

func PublicListProducts(c *gin.Context) {
	db := database.DB
	page, size := parsePage(c)

	category := c.Query("category")
	keyword := c.Query("keyword")
	color := c.Query("color")
	minPriceStr := c.Query("min_price")
	maxPriceStr := c.Query("max_price")
	sortBy := c.DefaultQuery("sort", "newest")

	q := db.Model(&models.Product{}).Where("status = ?", models.ProductStatusPublished)
	if like, ok := productKeywordLike(keyword); ok {
		q = q.Where("name LIKE ? OR sku LIKE ?", like, like)
	}
	if category != "" {
		q = q.Where("category = ?", category)
	}
	if color != "" {
		q = q.Where("color = ?", color)
	}
	if minPriceStr != "" {
		if minPrice, err := strconv.ParseFloat(minPriceStr, 64); err == nil {
			q = q.Where("price >= ?", minPrice)
		}
	}
	if maxPriceStr != "" {
		if maxPrice, err := strconv.ParseFloat(maxPriceStr, 64); err == nil {
			q = q.Where("price <= ?", maxPrice)
		}
	}

	switch sortBy {
	case "price_asc":
		q = q.Order("price ASC")
	case "price_desc":
		q = q.Order("price DESC")
	case "best_seller":
		q = q.Order("sales DESC")
	default: // newest
		q = q.Order("id DESC")
	}

	var total int64
	q.Count(&total)

	var products []models.Product
	q.Preload("Images").
		Limit(size).Offset((page - 1) * size).
		Find(&products)

	utils.Page(c, products, total, page, size)
}

func PublicGetProduct(c *gin.Context) {
	db := database.DB
	id := c.Param("id")

	var product models.Product
	if err := db.Preload("Images").
		Where("status = ?", models.ProductStatusPublished).
		First(&product, id).Error; err != nil {
		utils.Error(c, http.StatusNotFound, "product not found")
		return
	}
	utils.Success(c, product)
}

type PublicOrderItemInput struct {
	ProductID uint `json:"product_id"`
	Quantity  int  `json:"quantity"`
}

type PublicOrderInput struct {
	CustomerName   string                 `json:"customer_name"`
	CustomerPhone  string                 `json:"customer_phone"`
	CustomerEmail  string                 `json:"customer_email"`
	ShippingMethod string                 `json:"shipping_method"`
	ShipAddress    string                 `json:"ship_address"`
	ShipCity       string                 `json:"ship_city"`
	ShipState      string                 `json:"ship_state"`
	ShipZip        string                 `json:"ship_zip"`
	ShipCountry    string                 `json:"ship_country"`
	Note           string                 `json:"note"`
	Items          []PublicOrderItemInput `json:"items"`
}

func PublicCreateOrder(c *gin.Context) {
	db := database.DB

	var input PublicOrderInput
	if err := c.ShouldBindJSON(&input); err != nil {
		utils.Error(c, http.StatusBadRequest, err.Error())
		return
	}

	if len(input.Items) == 0 {
		utils.Error(c, http.StatusBadRequest, "items required")
		return
	}

	// Find or create customer by phone + name
	var customer models.Customer
	result := db.Where("phone = ? AND name = ?", input.CustomerPhone, input.CustomerName).
		First(&customer)
	if result.Error != nil {
		// Create new customer
		customer = models.Customer{
			Name:    input.CustomerName,
			Phone:   input.CustomerPhone,
			Email:   input.CustomerEmail,
			Country: input.ShipCountry,
		}
		if err := db.Create(&customer).Error; err != nil {
			utils.Error(c, http.StatusInternalServerError, "failed to create customer")
			return
		}
	}

	// Compute shipping cost server-side
	var shippingAmount float64
	shippingMethod := input.ShippingMethod
	switch shippingMethod {
	case "Express Shipping":
		shippingAmount = 45
	default:
		shippingMethod = "Standard Shipping"
		shippingAmount = 25
	}

	// Build order items and compute subtotal
	var subtotal float64
	type resolvedItem struct {
		product  models.Product
		quantity int
	}
	resolvedItems := make([]resolvedItem, 0, len(input.Items))
	for _, item := range input.Items {
		var prod models.Product
		if err := db.First(&prod, item.ProductID).Error; err != nil {
			utils.Error(c, http.StatusBadRequest, fmt.Sprintf("product %d not found", item.ProductID))
			return
		}
		qty := item.Quantity
		if qty <= 0 {
			qty = 1
		}
		subtotal += prod.Price * float64(qty)
		resolvedItems = append(resolvedItems, resolvedItem{product: prod, quantity: qty})
	}

	// Free shipping if subtotal >= 300
	if subtotal >= 300 {
		shippingAmount = 0
	}

	grandTotal := subtotal + shippingAmount

	// Generate order_no: PO + 9 random digits
	orderNo := fmt.Sprintf("PO%09d", rand.Intn(1000000000))

	custID := customer.ID
	order := models.Order{
		OrderNo:        orderNo,
		CustomerID:     &custID,
		Status:         models.OrderStatusPending,
		Subtotal:       subtotal,
		ShippingAmount: shippingAmount,
		Discount:       0,
		GrandTotal:     grandTotal,
		ShippingMethod: shippingMethod,
		ShipName:       input.CustomerName,
		ShipPhone:      input.CustomerPhone,
		ShipAddress:    input.ShipAddress,
		ShipCity:       input.ShipCity,
		ShipState:      input.ShipState,
		ShipZip:        input.ShipZip,
		ShipCountry:    input.ShipCountry,
		Note:           input.Note,
	}

	if err := db.Create(&order).Error; err != nil {
		utils.Error(c, http.StatusInternalServerError, "failed to create order")
		return
	}

	for _, ri := range resolvedItems {
		prodID := ri.product.ID
		oi := models.OrderItem{
			OrderID:     order.ID,
			ProductID:   &prodID,
			SKU:         ri.product.SKU,
			ProductName: ri.product.Name,
			Price:       ri.product.Price,
			Quantity:    ri.quantity,
			Subtotal:    ri.product.Price * float64(ri.quantity),
		}
		db.Create(&oi)
	}

	// Reload with items
	db.Preload("OrderItems").Preload("OrderItems.Product").First(&order, order.ID)

	utils.Success(c, order)
}

func PublicGetOrderByNo(c *gin.Context) {
	db := database.DB
	orderNo := c.Param("order_no")

	var order models.Order
	if err := db.Preload("Customer").
		Preload("OrderItems").
		Preload("OrderItems.Product").
		Where("order_no = ?", orderNo).
		First(&order).Error; err != nil {
		utils.Error(c, http.StatusNotFound, "order not found")
		return
	}
	utils.Success(c, order)
}
