package handlers

import (
	"ledarise-backend/models"
	"ledarise-backend/utils"

	"github.com/gin-gonic/gin"
)

func ListAdminUsers(c *gin.Context) {
	utils.Page(c, []models.AdminUser{}, 0, 1, 20)
}

func CreateAdminUser(c *gin.Context) {
	utils.Error(c, 501, "not implemented")
}

func UpdateAdminUser(c *gin.Context) {
	utils.Error(c, 501, "not implemented")
}

func UpdateAdminUserPassword(c *gin.Context) {
	utils.Error(c, 501, "not implemented")
}

func UpdateAdminUserStatus(c *gin.Context) {
	utils.Error(c, 501, "not implemented")
}
