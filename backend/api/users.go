package api

import (
	"context"
	"database/sql"
	"errors"
	"net/http"
	"time"

	"geist/db"

	"github.com/gin-gonic/gin"
	"github.com/uptrace/bun"
)

type User struct {
	bun.BaseModel `bun:"table:users,alias:u"`

	ID        int64     `bun:",pk,autoincrement" json:"id"`
	Name      string    `json:"name"`
	Email     string    `json:"email"`
	CreatedAt time.Time `bun:",nullzero,default:current_timestamp" json:"createdAt"`
}

// einmal beim Start aufrufen → erstellt Tabelle, wenn nicht da
func InitUserModel(ctx context.Context) error {
	_, err := db.DB.NewCreateTable().
		Model((*User)(nil)).
		IfNotExists().
		Exec(ctx)
	return err
}

func RegisterUserRoutes(r *gin.RouterGroup) {
	r.GET("/", listUsers)
	r.POST("/", createUser)
	r.GET("/:id", getUser)
}

func listUsers(c *gin.Context) {
	ctx := c.Request.Context()
	var users []User

	if err := db.DB.NewSelect().Model(&users).Order("id ASC").Scan(ctx); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, users)
}

func createUser(c *gin.Context) {
	var in struct {
		Name  string `json:"name" binding:"required"`
		Email string `json:"email" binding:"required,email"`
	}

	if err := c.ShouldBindJSON(&in); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	user := User{
		Name:      in.Name,
		Email:     in.Email,
		CreatedAt: time.Now(),
	}

	ctx := c.Request.Context()
	if _, err := db.DB.NewInsert().Model(&user).Exec(ctx); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, user)
}

func getUser(c *gin.Context) {
	id := c.Param("id")

	var user User
	ctx := c.Request.Context()

	if err := db.DB.NewSelect().Model(&user).Where("id = ?", id).Scan(ctx); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		}
		return
	}

	c.JSON(http.StatusOK, user)
}
