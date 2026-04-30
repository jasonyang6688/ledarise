package middleware

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"ledarise-backend/utils"
)

func Auth() gin.HandlerFunc {
	return func(c *gin.Context) {
		header := c.GetHeader("Authorization")
		if !strings.HasPrefix(header, "Bearer ") {
			utils.Error(c, http.StatusUnauthorized, "missing token")
			c.Abort()
			return
		}
		claims, err := utils.ParseToken(strings.TrimPrefix(header, "Bearer "))
		if err != nil {
			utils.Error(c, http.StatusUnauthorized, "invalid token")
			c.Abort()
			return
		}
		c.Set("user_id", claims.UserID)
		c.Set("role", claims.Role)
		c.Next()
	}
}
