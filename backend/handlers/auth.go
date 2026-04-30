package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
	"ledarise-backend/database"
	"ledarise-backend/models"
	"ledarise-backend/utils"
)

type loginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

func Login(c *gin.Context) {
	var req loginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Error(c, http.StatusBadRequest, err.Error())
		return
	}

	var user models.AdminUser
	if err := database.DB.Where("email = ?", req.Email).First(&user).Error; err != nil {
		utils.Error(c, http.StatusUnauthorized, "invalid credentials")
		return
	}

	if !user.IsActive {
		utils.Error(c, http.StatusUnauthorized, "account disabled")
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password)); err != nil {
		utils.Error(c, http.StatusUnauthorized, "invalid credentials")
		return
	}

	token, err := utils.GenerateToken(user.ID, user.Role)
	if err != nil {
		utils.Error(c, http.StatusInternalServerError, "failed to generate token")
		return
	}

	utils.Success(c, gin.H{
		"token": token,
		"user": gin.H{
			"id":       user.ID,
			"username": user.Username,
			"email":    user.Email,
			"role":     user.Role,
		},
	})
}

func Me(c *gin.Context) {
	userID, _ := c.Get("user_id")
	var user models.AdminUser
	if err := database.DB.First(&user, userID).Error; err != nil {
		utils.Error(c, http.StatusNotFound, "user not found")
		return
	}
	utils.Success(c, gin.H{
		"id":       user.ID,
		"username": user.Username,
		"email":    user.Email,
		"role":     user.Role,
	})
}
