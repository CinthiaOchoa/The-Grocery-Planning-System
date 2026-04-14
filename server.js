const express = require("express");
const cors = require("cors");
const pool = require("./db");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend is running");
});

app.get("/test-db", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM student");
    res.json(rows);
  } catch (error) {
    console.error("REAL DB ERROR:", error);
    res.status(500).json({
      error: "DB connection failed",
      details: error.message,
      code: error.code
    });
  }
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});