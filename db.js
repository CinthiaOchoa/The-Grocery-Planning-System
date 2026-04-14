const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: "127.0.0.1",
  port: 3306,
  user: "appuser",
  password: "password123",
  database: "StudentPantryDB",
  waitForConnections: true,
  connectionLimit: 10
});

module.exports = pool;