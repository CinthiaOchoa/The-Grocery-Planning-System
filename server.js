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
// ======================
// STUDENT ROUTES
// ======================
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

function initSettingsPage() {
  requireAuth();
  cacheElements();
  bindEvents();
  initializeState();
  loadCurrentStudentUI();
  loadFrontendSettings();
}

app.post("/api/students", async (req, res) => {
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
    const [existing] = await pool.query(
      "SELECT * FROM student WHERE email = ?",
      [email]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        message: "A student with that email already exists"
      });
    }

    const [result] = await pool.query(
      `INSERT INTO student
       (name, email, password, budget_per_week, zip_code, profile_picture_url, theme_preference)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        email,
        password,
        budget_per_week || null,
        zip_code || null,
        profile_picture_url || null,
        theme_preference || "light"
      ]
    );

    const [newStudentRows] = await pool.query(
      "SELECT * FROM student WHERE student_id = ?",
      [result.insertId]
    );

    res.status(201).json(newStudentRows[0]);
  } catch (error) {
    console.error("Create student error:", error);
    res.status(500).json({ error: error.message });
  }
});

// GET student by ID
app.get("/api/students/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await pool.query(
      "SELECT * FROM student WHERE student_id = ?",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error("Error fetching student:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ======================
// STORE ROUTES
// ======================

// GET all stores
app.get("/api/stores", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM store");
    res.json(rows);
  } catch (error) {
    console.error("Get stores error:", error);
    res.status(500).json({ error: error.message });
  }
});

// CREATE store
app.post("/api/stores", async (req, res) => {
  const { storeId, name, address } = req.body;

  try {
    const [existing] = await pool.query(
      "SELECT * FROM store WHERE store_id = ?",
      [storeId]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        message: "Store with that ID already exists"
      });
    }

    await pool.query(
      "INSERT INTO store (store_id, name, address) VALUES (?, ?, ?)",
      [storeId, name, address]
    );

    const [rows] = await pool.query(
      "SELECT * FROM store WHERE store_id = ?",
      [storeId]
    );

    res.status(201).json(rows[0]);
  } catch (error) {
    console.error("Create store error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});