const mysql = require("mysql2");

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "T1Usa_COT!!",
  database: "StudentPantryDB"
});

module.exports = pool.promise();