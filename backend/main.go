package main

import (
	"context"

	"geist/api"
	"geist/db"

	"github.com/gin-gonic/gin"
)

func main() {
	db.InitDB()

	if err := api.InitUserModel(context.Background()); err != nil {
		panic(err)
	}

	r := gin.Default()
	r.SetTrustedProxies(nil)

	apiGroup := r.Group("/api")
	api.RegisterUserRoutes(apiGroup.Group("/users"))

	r.Run(":8881")
}
