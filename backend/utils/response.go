package utils

import (
	"github.com/gin-gonic/gin"
)

type Response struct {
	Code    int    `json:"code"`
	Message string `json:"message"`
	Data    any    `json:"data"`
}

type PageData struct {
	List     any   `json:"list"`
	Total    int64 `json:"total"`
	Page     int   `json:"page"`
	PageSize int   `json:"page_size"`
}

func Success(c *gin.Context, data any) {
	c.JSON(200, Response{200, "success", data})
}

func Page(c *gin.Context, list any, total int64, page, size int) {
	c.JSON(200, Response{200, "success", PageData{list, total, page, size}})
}

func Error(c *gin.Context, code int, msg string) {
	c.JSON(code, Response{code, msg, nil})
}
