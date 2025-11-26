package db

import (
	"database/sql"

	"github.com/uptrace/bun"
	"github.com/uptrace/bun/dialect/sqlitedialect"
	"github.com/uptrace/bun/driver/sqliteshim"
)

var DB *bun.DB

func InitDB() {
	sqldb, err := sql.Open(sqliteshim.ShimName, "file:geist.db?cache=shared&mode=rwc")
	if err != nil {
		panic(err)
	}

	DB = bun.NewDB(sqldb, sqlitedialect.New())
}
