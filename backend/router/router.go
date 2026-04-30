package router

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"ledarise-backend/handlers"
	"ledarise-backend/middleware"
)

func New() *gin.Engine {
	r := gin.New()
	r.Use(middleware.CORS())
	r.Use(middleware.Logger())

	r.GET("/healthz", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	// Public routes
	v1 := r.Group("/api/v1")
	{
		v1.POST("/auth/login", handlers.Login)
		v1.POST("/customer/register", handlers.CustomerRegister)
		v1.POST("/customer/login", handlers.CustomerLogin)
		v1.GET("/products", handlers.PublicListProducts)
		v1.GET("/products/:id", handlers.PublicGetProduct)
		v1.POST("/orders", handlers.PublicCreateOrder)
		v1.GET("/orders/:order_no", handlers.PublicGetOrderByNo)
	}

	// Customer routes (JWT required, role=customer)
	customer := r.Group("/api/v1/customer")
	customer.Use(middleware.Auth())
	{
		customer.GET("/me", handlers.CustomerMe)
	}

	// Admin routes (JWT required)
	admin := r.Group("/api/admin")
	admin.Use(middleware.Auth())
	{
		admin.GET("/me", handlers.Me)

		// Dashboard
		admin.GET("/dashboard/stats", handlers.DashboardStats)
		admin.GET("/dashboard/revenue-trend", handlers.RevenueTrend)
		admin.GET("/dashboard/country-dist", handlers.CountryDist)
		admin.GET("/dashboard/recent-orders", handlers.RecentOrders)

		// Products
		admin.GET("/products", handlers.ListProducts)
		admin.POST("/products", handlers.CreateProduct)
		admin.DELETE("/products/batch", handlers.BatchDeleteProducts)
		admin.GET("/products/:id", handlers.GetProduct)
		admin.PUT("/products/:id", handlers.UpdateProduct)
		admin.DELETE("/products/:id", handlers.DeleteProduct)
		admin.POST("/products/:id/images", handlers.UploadProductImage)
		admin.DELETE("/products/:id/images/:image_id", handlers.DeleteProductImage)

		// Orders
		admin.GET("/orders", handlers.ListOrders)
		admin.GET("/orders/export", handlers.ExportOrders)
		admin.POST("/orders/import", handlers.ImportOrders)
		admin.GET("/orders/import/:task_id", handlers.GetImportStatus)
		admin.GET("/orders/:id", handlers.GetOrder)
		admin.PUT("/orders/:id/status", handlers.UpdateOrderStatus)
		admin.PUT("/orders/:id/note", handlers.UpdateOrderNote)

		// Customers
		admin.GET("/customers", handlers.ListCustomers)
		admin.GET("/customers/:id", handlers.GetCustomer)
		admin.PUT("/customers/:id", handlers.UpdateCustomer)

		// Admin users (super_admin only)
		users := admin.Group("/users")
		users.Use(middleware.RequireSuperAdmin())
		{
			users.GET("", handlers.ListAdminUsers)
			users.POST("", handlers.CreateAdminUser)
			users.PUT("/:id", handlers.UpdateAdminUser)
			users.PUT("/:id/password", handlers.UpdateAdminUserPassword)
			users.PUT("/:id/status", handlers.UpdateAdminUserStatus)
		}
	}

	return r
}
