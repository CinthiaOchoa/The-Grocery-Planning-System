const express = require("express");
const cors = require("cors");
const pool = require("./db");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/test-db", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT 1 AS test");
    res.json({
      ok: true,
      message: "Database connected",
      rows
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error.message
    });
  }
});

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const [rows] = await pool.query(
      "SELECT * FROM student WHERE email = ? AND password = ?",
      [email, password]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error("Login route error:", error);
    res.status(500).json({
      error: error.message
    });
  }
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
app.put("/api/students/:id", async (req, res) => {
  const { id } = req.params;
  const {
    name,
    email,
    password,
    budget_per_week,
    zip_code,
    profile_picture_url,
    theme_preference
  } = req.body;

  try {
    const [result] = await pool.query(
      `UPDATE student
       SET name = ?, email = ?, password = ?, budget_per_week = ?, zip_code = ?, profile_picture_url = ?, theme_preference = ?
       WHERE student_id = ?`,
      [
        name,
        email,
        password,
        budget_per_week,
        zip_code,
        profile_picture_url,
        theme_preference,
        id
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Student not found" });
    }

    const [updatedRows] = await pool.query(
      "SELECT * FROM student WHERE student_id = ?",
      [id]
    );

    res.json(updatedRows[0]);
  } catch (error) {
    console.error("Update student error:", error);
    res.status(500).json({ error: error.message });
  }
});