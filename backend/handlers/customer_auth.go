package handlers

import (
	"errors"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
	"ledarise-backend/database"
	"ledarise-backend/models"
	"ledarise-backend/utils"
)

type customerRegisterRequest struct {
	Name     string `json:"name" binding:"required,min=2"`
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
	Phone    string `json:"phone"`
}

type customerLoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

func customerPayload(c *models.Customer, token string) gin.H {
	return gin.H{
		"token": token,
		"user": gin.H{
			"id":      c.ID,
			"name":    c.Name,
			"email":   c.Email,
			"phone":   c.Phone,
			"country": c.Country,
			"role":    "customer",
		},
	}
}

// CustomerRegister creates a new storefront account.
func CustomerRegister(ctx *gin.Context) {
	var req customerRegisterRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		utils.Error(ctx, http.StatusBadRequest, err.Error())
		return
	}
	email := strings.ToLower(strings.TrimSpace(req.Email))

	var existing models.Customer
	err := database.DB.Where("email = ?", email).First(&existing).Error
	if err == nil && existing.PasswordHash != "" {
		utils.Error(ctx, http.StatusConflict, "email already registered")
		return
	}
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		utils.Error(ctx, http.StatusInternalServerError, "lookup failed")
		return
	}

	hash, hashErr := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if hashErr != nil {
		utils.Error(ctx, http.StatusInternalServerError, "hash failed")
		return
	}

	if existing.ID != 0 {
		// Customer record was created by an order import — attach credentials.
		updates := map[string]interface{}{
			"name":          req.Name,
			"email":         email,
			"password_hash": string(hash),
		}
		if req.Phone != "" {
			updates["phone"] = req.Phone
		}
		if err := database.DB.Model(&existing).Updates(updates).Error; err != nil {
			utils.Error(ctx, http.StatusInternalServerError, "update failed")
			return
		}
		existing.Name = req.Name
		existing.Email = email
		token, _ := utils.GenerateToken(existing.ID, "customer")
		utils.Success(ctx, customerPayload(&existing, token))
		return
	}

	cust := models.Customer{
		Name:         req.Name,
		Email:        email,
		Phone:        req.Phone,
		PasswordHash: string(hash),
	}
	if err := database.DB.Create(&cust).Error; err != nil {
		utils.Error(ctx, http.StatusInternalServerError, "create failed")
		return
	}
	token, _ := utils.GenerateToken(cust.ID, "customer")
	utils.Success(ctx, customerPayload(&cust, token))
}

// CustomerLogin authenticates a storefront customer.
func CustomerLogin(ctx *gin.Context) {
	var req customerLoginRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		utils.Error(ctx, http.StatusBadRequest, err.Error())
		return
	}
	email := strings.ToLower(strings.TrimSpace(req.Email))

	var cust models.Customer
	if err := database.DB.Where("email = ?", email).First(&cust).Error; err != nil {
		utils.Error(ctx, http.StatusUnauthorized, "invalid credentials")
		return
	}
	if cust.PasswordHash == "" {
		utils.Error(ctx, http.StatusUnauthorized, "account not registered")
		return
	}
	if err := bcrypt.CompareHashAndPassword([]byte(cust.PasswordHash), []byte(req.Password)); err != nil {
		utils.Error(ctx, http.StatusUnauthorized, "invalid credentials")
		return
	}
	token, err := utils.GenerateToken(cust.ID, "customer")
	if err != nil {
		utils.Error(ctx, http.StatusInternalServerError, "token failed")
		return
	}
	utils.Success(ctx, customerPayload(&cust, token))
}

// CustomerMe returns the authenticated customer's profile.
func CustomerMe(ctx *gin.Context) {
	role, _ := ctx.Get("role")
	if role != "customer" {
		utils.Error(ctx, http.StatusForbidden, "not a customer account")
		return
	}
	userID, _ := ctx.Get("user_id")
	var cust models.Customer
	if err := database.DB.First(&cust, userID).Error; err != nil {
		utils.Error(ctx, http.StatusNotFound, "customer not found")
		return
	}
	utils.Success(ctx, gin.H{
		"id":      cust.ID,
		"name":    cust.Name,
		"email":   cust.Email,
		"phone":   cust.Phone,
		"country": cust.Country,
		"role":    "customer",
	})
}
