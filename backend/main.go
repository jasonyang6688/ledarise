package main

import (
	"ledarise-backend/config"
	"ledarise-backend/database"
	"ledarise-backend/router"
)

func main() {
	config.Load()
	database.Init()
	r := router.New()
	r.Run(":" + config.Get().ServerPort)
}
