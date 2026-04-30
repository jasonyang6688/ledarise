package middleware

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"ledarise-backend/models"
	"ledarise-backend/utils"
)

func RequireSuperAdmin() gin.HandlerFunc {
	return func(c *gin.Context) {
		role, _ := c.Get("role")
		if role != models.RoleSuperAdmin {
			utils.Error(c, http.StatusForbidden, "super_admin required")
			c.Abort()
			return
		}
		c.Next()
	}
}
