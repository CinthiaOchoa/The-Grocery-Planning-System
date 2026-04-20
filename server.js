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

// ======================
// PURCHASE ROUTES
// ======================

// GET purchases by store
app.get("/api/purchases/store/:storeId/student/:studentId", async (req, res) => {
  const { storeId, studentId } = req.params;

  try {
    const [rows] = await pool.query(
      "SELECT * FROM purchased_ingredient WHERE store_id = ? AND student_id = ?",
      [storeId, studentId]
    );

    res.json(rows);
  } catch (error) {
    console.error("Get purchases error:", error);
    res.status(500).json({ error: error.message });
  }
});

// CREATE purchase
app.post("/api/purchases", async (req, res) => {
  const {
    store_id,
    ingredient_id,
    student_id,
    date,
    price,
    quantity,
    unit
  } = req.body;

  try {
    const [result] = await pool.query(
      `INSERT INTO purchased_ingredient 
      (store_id, ingredient_id, student_id, date, price, quantity, unit)
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [store_id, ingredient_id, student_id, date, price, quantity, unit]
    );

    res.status(201).json({
      purchase_id: result.insertId || null,
      message: "Purchase created"
    });
  } catch (error) {
    console.error("Create purchase error:", error);
    res.status(500).json({ error: error.message });
  }
});

// ======================
// PURCHASE ROUTES
// ======================

// GET purchases by store + student
app.get("/api/purchases/store/:storeId/student/:studentId", async (req, res) => {
  const { storeId, studentId } = req.params;

  try {
    const [rows] = await pool.query(
      `SELECT *
       FROM purchased_ingredient
       WHERE store_id = ? AND student_id = ?
       ORDER BY date DESC, purchase_id DESC`,
      [storeId, studentId]
    );

    res.json(rows);
  } catch (error) {
    console.error("Get purchases error:", error);
    res.status(500).json({ error: error.message });
  }
});

// CREATE purchase
app.post("/api/purchases", async (req, res) => {
  const {
    store_id,
    ingredient_id,
    student_id,
    date,
    price,
    quantity,
    unit
  } = req.body;

  try {
    const [result] = await pool.query(
      `INSERT INTO purchased_ingredient
       (store_id, ingredient_id, student_id, date, price, quantity, unit)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [store_id, ingredient_id, student_id, date, price, quantity, unit]
    );

    const [rows] = await pool.query(
      "SELECT * FROM purchased_ingredient WHERE purchase_id = ?",
      [result.insertId]
    );

    res.status(201).json(rows[0]);
  } catch (error) {
    console.error("Create purchase error:", error);
    res.status(500).json({ error: error.message });
  }
});

// UPDATE purchase
app.put("/api/purchases/:purchaseId", async (req, res) => {
  const { purchaseId } = req.params;
  const {
    store_id,
    ingredient_id,
    student_id,
    date,
    price,
    quantity,
    unit
  } = req.body;

  try {
    const [result] = await pool.query(
      `UPDATE purchased_ingredient
       SET store_id = ?, ingredient_id = ?, student_id = ?, date = ?, price = ?, quantity = ?, unit = ?
       WHERE purchase_id = ?`,
      [store_id, ingredient_id, student_id, date, price, quantity, unit, purchaseId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Purchase not found" });
    }

    const [rows] = await pool.query(
      "SELECT * FROM purchased_ingredient WHERE purchase_id = ?",
      [purchaseId]
    );

    res.json(rows[0]);
  } catch (error) {
    console.error("Update purchase error:", error);
    res.status(500).json({ error: error.message });
  }
});

// ======================
// INGREDIENT ROUTES
// ======================
// CREATE ingredient
app.post("/api/ingredients", async (req, res) => {
  const {
    ingredient_id,
    name,
    category,
    protein,
    calories,
    nutrition_score,
    image_url,
    price
  } = req.body;

  try {
    const [existing] = await pool.query(
      "SELECT * FROM ingredients WHERE ingredient_id = ?",
      [ingredient_id]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        error: "Ingredient ID already exists"
      });
    }

    await pool.query(
      `INSERT INTO ingredients
       (ingredient_id, name, category, protein, calories, nutrition_score, image_url, price)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        ingredient_id,
        name,
        category,
        protein,
        calories,
        nutrition_score,
        image_url ?? null,
        price ?? null
      ]
    );

    const [rows] = await pool.query(
      "SELECT * FROM ingredients WHERE ingredient_id = ?",
      [ingredient_id]
    );

    res.status(201).json(rows[0]);
  } catch (error) {
    console.error("Create ingredient error:", error);
    res.status(500).json({ error: error.message });
  }
});
// GET all ingredients
app.get("/api/ingredients", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM ingredients ORDER BY ingredient_id");
    res.json(rows);
  } catch (error) {
    console.error("Get ingredients error:", error);
    res.status(500).json({ error: error.message });
  }
});

// UPDATE ingredient
app.put("/api/ingredients/:id", async (req, res) => {
  const { id } = req.params;
  const {
    name,
    category,
    protein,
    calories,
    nutrition_score
  } = req.body;

  try {
    const [result] = await pool.query(
      `UPDATE ingredients
       SET name = ?, category = ?, protein = ?, calories = ?, nutrition_score = ?
       WHERE ingredient_id = ?`,
      [name, category, protein, calories, nutrition_score, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Ingredient not found" });
    }

    const [rows] = await pool.query(
      "SELECT * FROM ingredients WHERE ingredient_id = ?",
      [id]
    );

    res.json(rows[0]);
  } catch (error) {
    console.error("Update ingredient error:", error);
    res.status(500).json({ error: error.message });
  }
});

// ======================
// PANTRY ROUTES
// ======================

// GET pantries by student
app.get("/api/pantries/student/:studentId", async (req, res) => {
  const { studentId } = req.params;

  try {
    const [rows] = await pool.query(
      `SELECT p.*
       FROM pantry p
       JOIN student_pantry sp ON p.pantry_id = sp.pantry_id
       WHERE sp.student_id = ?
       ORDER BY p.pantry_id`,
      [studentId]
    );

    res.json(rows);
  } catch (error) {
    console.error("Get pantries by student error:", error);
    res.status(500).json({ error: error.message });
  }
});

// CREATE pantry
app.post("/api/pantries", async (req, res) => {
  const { pantry_id, type, location } = req.body;

  try {
    const [existing] = await pool.query(
      "SELECT * FROM pantry WHERE pantry_id = ?",
      [pantry_id]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        message: "Pantry ID already exists"
      });
    }

    await pool.query(
      "INSERT INTO pantry (pantry_id, type, location) VALUES (?, ?, ?)",
      [pantry_id, type, location]
    );

    const [rows] = await pool.query(
      "SELECT * FROM pantry WHERE pantry_id = ?",
      [pantry_id]
    );

    res.status(201).json(rows[0]);
  } catch (error) {
    console.error("Create pantry error:", error);
    res.status(500).json({ error: error.message });
  }
});

// ======================
// PANTRY ITEM ROUTES
// ======================

// GET pantry items by student
app.get("/api/pantry-items/student/:studentId", async (req, res) => {
  const { studentId } = req.params;

  try {
    const [rows] = await pool.query(
      `SELECT 
         pi.pantry_item_id,
         pi.pantry_id,
         pi.ingredient_id,
         i.name AS ingredient_name,
         pi.unit,
         pi.date_added,
         pi.expiration_date,
         pi.quantity
       FROM pantry_item pi
       JOIN student_pantry sp
         ON pi.pantry_id = sp.pantry_id
       JOIN ingredients i
         ON pi.ingredient_id = i.ingredient_id
       WHERE sp.student_id = ?
       ORDER BY pi.expiration_date ASC, pi.pantry_item_id ASC`,
      [studentId]
    );

    res.json(rows);
  } catch (error) {
    console.error("Get pantry items by student error:", error);
    res.status(500).json({ error: error.message });
  }
});

// GET pantry items by pantry
app.get("/api/pantry-items/pantry/:pantryId", async (req, res) => {
  const { pantryId } = req.params;

  try {
    const [rows] = await pool.query(
      `SELECT pantry_item_id, pantry_id, ingredient_id, unit, date_added, expiration_date, quantity
       FROM pantry_item
       WHERE pantry_id = ?`,
      [pantryId]
    );

    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error fetching pantry items" });
  }
});

// CREATE pantry item
app.post("/api/pantry-items", async (req, res) => {
  const {
    pantry_id,
    ingredient_id,
    unit,
    date_added,
    expiration_date,
    quantity
  } = req.body;

  try {
    const [result] = await pool.query(
      `INSERT INTO pantry_item
       (pantry_id, ingredient_id, unit, date_added, expiration_date, quantity)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [pantry_id, ingredient_id, unit, date_added, expiration_date, quantity]
    );

    const [rows] = await pool.query(
      `SELECT pantry_item_id, pantry_id, ingredient_id, unit, date_added, expiration_date, quantity
       FROM pantry_item
       WHERE pantry_item_id = ?`,
      [result.insertId]
    );

    res.status(201).json(rows[0]);
  } catch (error) {
    console.error("Create pantry item error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/pantry-items/:id", async (req, res) => {
  const { id } = req.params;
  const { unit, quantity, date_added, expiration_date } = req.body;

  try {
    const [result] = await pool.query(
      `UPDATE pantry_item
       SET unit = ?, quantity = ?, date_added = ?, expiration_date = ?
       WHERE pantry_item_id = ?`,
      [unit, quantity, date_added, expiration_date, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Pantry item not found" });
    }

    const [rows] = await pool.query(
      `SELECT pantry_item_id, pantry_id, ingredient_id, unit, date_added, expiration_date, quantity
       FROM pantry_item
       WHERE pantry_item_id = ?`,
      [id]
    );

    res.json(rows[0]);
  } catch (error) {
    console.error("Update pantry item error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/pantry-items/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await pool.query(
      "DELETE FROM pantry_item WHERE pantry_item_id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Pantry item not found" });
    }

    res.json({ message: "Pantry item deleted" });
  } catch (error) {
    console.error("Delete pantry item error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/pantry-items/pantry/:pantryId", async (req, res) => {
  const { pantryId } = req.params;

  try {
    const [rows] = await pool.query(
      `SELECT pantry_item_id, pantry_id, ingredient_id, unit, date_added, expiration_date, quantity
       FROM pantry_item
       WHERE pantry_id = ?
       ORDER BY expiration_date ASC, pantry_item_id ASC`,
      [pantryId]
    );

    res.json(rows);
  } catch (error) {
    console.error("Get pantry items error:", error);
    res.status(500).json({ error: error.message });
  }
});

// ======================
// RECIPE ROUTES
// ======================

// GET all recipes
app.get("/api/recipes", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM recipe ORDER BY recipe_id");
    res.json(rows);
  } catch (error) {
    console.error("Get recipes error:", error);
    res.status(500).json({ error: error.message });
  }
});

// GET recipe by ID
app.get("/api/recipes/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await pool.query(
      "SELECT * FROM recipe WHERE recipe_id = ?",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error("Get recipe error:", error);
    res.status(500).json({ error: error.message });
  }
});

// CREATE recipe
app.post("/api/recipes", async (req, res) => {
  const { recipe_id, name, type, servings, total_time_prep } = req.body;

  try {
    await pool.query(
      `INSERT INTO recipe (recipe_id, name, type, servings, total_time_prep)
       VALUES (?, ?, ?, ?, ?)`,
      [recipe_id, name, type, servings, total_time_prep]
    );

    const [rows] = await pool.query(
      "SELECT * FROM recipe WHERE recipe_id = ?",
      [recipe_id]
    );

    res.status(201).json(rows[0]);
  } catch (error) {
    console.error("Create recipe error:", error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE recipe
app.delete("/api/recipes/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query("DELETE FROM recipe WHERE recipe_id = ?", [id]);
    res.json({ message: "Recipe deleted" });
  } catch (error) {
    console.error("Delete recipe error:", error);
    res.status(500).json({ error: error.message });
  }
});


// ======================
// RECIPE INGREDIENT ROUTES
// ======================

// GET recipe ingredients by recipe
app.get("/api/recipe-ingredients", async (req, res) => {
  const { recipe_id } = req.query;

  try {
    let rows;

    if (recipe_id) {
      [rows] = await pool.query(
        `SELECT recipe_id, ingredient_id, amount, unit
         FROM recipe_ingredients
         WHERE recipe_id = ?
         ORDER BY ingredient_id`,
        [recipe_id]
      );
    } else {
      [rows] = await pool.query(
        `SELECT recipe_id, ingredient_id, amount, unit
         FROM recipe_ingredients
         ORDER BY recipe_id, ingredient_id`
      );
    }

    res.json(rows);
  } catch (error) {
    console.error("Get recipe ingredients error:", error);
    res.status(500).json({ error: error.message });
  }
});

// CREATE recipe ingredient
app.post("/api/recipe-ingredients", async (req, res) => {
  const { recipe_id, ingredient_id, amount, unit } = req.body;

  try {
    await pool.query(
      `INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount, unit)
       VALUES (?, ?, ?, ?)`,
      [recipe_id, ingredient_id, amount, unit]
    );

    const [rows] = await pool.query(
      `SELECT recipe_id, ingredient_id, amount, unit
       FROM recipe_ingredients
       WHERE recipe_id = ? AND ingredient_id = ?`,
      [recipe_id, ingredient_id]
    );

    res.status(201).json(rows[0]);
  } catch (error) {
    console.error("Create recipe ingredient error:", error);
    res.status(500).json({ error: error.message });
  }
});

// GET ingredient by ID
app.get("/api/ingredients/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await pool.query(
      "SELECT * FROM ingredients WHERE ingredient_id = ?",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Ingredient not found" });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error("Get ingredient by id error:", error);
    res.status(500).json({ error: error.message });
  }
});

// ======================
// RECIPE STEP ROUTES
// ======================

// GET recipe steps by recipe_id
app.get("/api/recipe-steps", async (req, res) => {
  const { recipe_id } = req.query;

  try {
    const [rows] = await pool.query(
      `SELECT recipe_id, step_number, description
       FROM recipe_steps
       WHERE recipe_id = ?
       ORDER BY step_number ASC`,
      [recipe_id]
    );

    res.json(rows);
  } catch (error) {
    console.error("Get recipe steps error:", error);
    res.status(500).json({ error: error.message });
  }
});

// GET one recipe step
app.get("/api/recipe-steps/:recipeId/:stepNumber", async (req, res) => {
  const { recipeId, stepNumber } = req.params;

  try {
    const [rows] = await pool.query(
      `SELECT recipe_id, step_number, description
       FROM recipe_steps
       WHERE recipe_id = ? AND step_number = ?`,
      [recipeId, stepNumber]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Recipe step not found" });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error("Get recipe step error:", error);
    res.status(500).json({ error: error.message });
  }
});

// CREATE recipe step
app.post("/api/recipe-steps", async (req, res) => {
  const { recipe_id, step_number, description } = req.body;

  try {
    await pool.query(
      `INSERT INTO recipe_steps (recipe_id, step_number, description)
       VALUES (?, ?, ?)`,
      [recipe_id, step_number, description]
    );

    const [rows] = await pool.query(
      `SELECT recipe_id, step_number, description
       FROM recipe_steps
       WHERE recipe_id = ? AND step_number = ?`,
      [recipe_id, step_number]
    );

    res.status(201).json(rows[0]);
  } catch (error) {
    console.error("Create recipe step error:", error);
    res.status(500).json({ error: error.message });
  }
});

// UPDATE recipe step
app.put("/api/recipe-steps/:recipeId/:stepNumber", async (req, res) => {
  const { recipeId, stepNumber } = req.params;
  const { step_number, description } = req.body;

  try {
    const [result] = await pool.query(
      `UPDATE recipe_steps
       SET step_number = ?, description = ?
       WHERE recipe_id = ? AND step_number = ?`,
      [step_number, description, recipeId, stepNumber]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Recipe step not found" });
    }

    const [rows] = await pool.query(
      `SELECT recipe_id, step_number, description
       FROM recipe_steps
       WHERE recipe_id = ? AND step_number = ?`,
      [recipeId, step_number]
    );

    res.json(rows[0]);
  } catch (error) {
    console.error("Update recipe step error:", error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE recipe step
app.delete("/api/recipe-steps/:recipeId/:stepNumber", async (req, res) => {
  const { recipeId, stepNumber } = req.params;

  try {
    const [result] = await pool.query(
      `DELETE FROM recipe_steps
       WHERE recipe_id = ? AND step_number = ?`,
      [recipeId, stepNumber]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Recipe step not found" });
    }

    res.json({ message: "Recipe step deleted" });
  } catch (error) {
    console.error("Delete recipe step error:", error);
    res.status(500).json({ error: error.message });
  }
});

// ======================
// ADVANCED MEAL FINDER
// ======================
app.get("/api/advanced-meals", async (req, res) => {
  const { student_id, max_time, max_budget } = req.query;

  try {
    const [rows] = await pool.query(`
      SELECT 
        r.recipe_id,
        r.name,
        r.total_time_prep,
        COUNT(ri.ingredient_id) AS total_ingredients,

        SUM(
          CASE
            WHEN pantry_match.ingredient_id IS NOT NULL THEN 1
            ELSE 0
          END
        ) AS matched_ingredients,

        COALESCE(SUM(
          COALESCE(
            (
              SELECT (pi2.price / NULLIF(pi2.quantity, 0)) * COALESCE(ri.amount, 1)
              FROM purchased_ingredient pi2
              WHERE pi2.ingredient_id = ri.ingredient_id
                AND pi2.student_id = ?
              ORDER BY pi2.date DESC, pi2.purchase_id DESC
              LIMIT 1
            ),
            i.price * COALESCE(ri.amount, 1),
            0
          )
        ), 0) AS estimated_total_recipe_cost,

        COALESCE(SUM(
          CASE
            WHEN pantry_match.ingredient_id IS NOT NULL THEN
              COALESCE(
                (
                  SELECT (pi2.price / NULLIF(pi2.quantity, 0)) * COALESCE(ri.amount, 1)
                  FROM purchased_ingredient pi2
                  WHERE pi2.ingredient_id = ri.ingredient_id
                    AND pi2.student_id = ?
                  ORDER BY pi2.date DESC, pi2.purchase_id DESC
                  LIMIT 1
                ),
                i.price * COALESCE(ri.amount, 1),
                0
              )
            ELSE 0
          END
        ), 0) AS pantry_value_used,

        COALESCE(SUM(
          CASE
            WHEN pantry_match.ingredient_id IS NULL THEN
              COALESCE(
                (
                  SELECT (pi2.price / NULLIF(pi2.quantity, 0)) * COALESCE(ri.amount, 1)
                  FROM purchased_ingredient pi2
                  WHERE pi2.ingredient_id = ri.ingredient_id
                    AND pi2.student_id = ?
                  ORDER BY pi2.date DESC, pi2.purchase_id DESC
                  LIMIT 1
                ),
                i.price * COALESCE(ri.amount, 1),
                0
              )
            ELSE 0
          END
        ), 0) AS cost_to_buy_missing,

        GROUP_CONCAT(
          CASE
            WHEN pantry_match.ingredient_id IS NULL THEN
              CONCAT(
                i.name,
                ' ($',
                ROUND(
                  COALESCE(
                    (
                      SELECT (pi2.price / NULLIF(pi2.quantity, 0)) * COALESCE(ri.amount, 1)
                      FROM purchased_ingredient pi2
                      WHERE pi2.ingredient_id = ri.ingredient_id
                        AND pi2.student_id = ?
                      ORDER BY pi2.date DESC, pi2.purchase_id DESC
                      LIMIT 1
                    ),
                    i.price * COALESCE(ri.amount, 1),
                    0
                  ),
                2),
                ')'
              )
            ELSE NULL
          END
          SEPARATOR ', '
        ) AS missing_ingredients

      FROM recipe r
      JOIN recipe_ingredients ri
        ON r.recipe_id = ri.recipe_id
      JOIN ingredients i
        ON i.ingredient_id = ri.ingredient_id

      LEFT JOIN (
        SELECT DISTINCT pi.ingredient_id
        FROM pantry_item pi
        WHERE pi.pantry_id IN (
          SELECT pantry_id
          FROM student_pantry
          WHERE student_id = ?
        )
      ) pantry_match
        ON pantry_match.ingredient_id = ri.ingredient_id

      GROUP BY r.recipe_id, r.name, r.total_time_prep
      HAVING r.total_time_prep <= ?
         AND cost_to_buy_missing <= ?
      ORDER BY matched_ingredients DESC,
               cost_to_buy_missing ASC,
               r.total_time_prep ASC
    `, [
      student_id,
      student_id,
      student_id,
      student_id,
      student_id,
      max_time,
      max_budget
    ]);

    res.json(rows);
  } catch (error) {
    console.error("Advanced meals error:", error);
    res.status(500).json({ error: error.message });
  }
});

// GET pantry by student
app.get("/api/pantries/student/:studentId", async (req, res) => {
  const { studentId } = req.params;

  try {
    const [rows] = await pool.query(
      `SELECT p.*
       FROM pantry p
       JOIN student_pantry sp ON p.pantry_id = sp.pantry_id
       WHERE sp.student_id = ?
       LIMIT 1`,
      [studentId]
    );

    if (rows.length === 0) {
      return res.json(null);
    }

    res.json(rows[0]);
  } catch (error) {
    console.error("Get pantry by student error:", error);
    res.status(500).json({ error: error.message });
  }
});

// GET all purchases
app.get("/api/purchases", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT 
         p.*,
         i.name AS ingredient_name
       FROM purchased_ingredient p
       JOIN ingredients i
         ON p.ingredient_id = i.ingredient_id
       ORDER BY p.date DESC, p.purchase_id DESC`
    );

    res.json(rows);
  } catch (error) {
    console.error("Get all purchases error:", error);
    res.status(500).json({ error: error.message });
  }
});

// GET pantry items by student
app.get("/api/pantry-items/student/:studentId", async (req, res) => {
  const { studentId } = req.params;

  try {
    const [rows] = await pool.query(
      `SELECT 
         pi.pantry_item_id,
         pi.pantry_id,
         pi.ingredient_id,
         i.name AS ingredient_name,
         pi.unit,
         pi.date_added,
         pi.expiration_date,
         pi.quantity
       FROM pantry_item pi
       JOIN student_pantry sp
         ON pi.pantry_id = sp.pantry_id
       JOIN ingredients i
         ON pi.ingredient_id = i.ingredient_id
       WHERE sp.student_id = ?
       ORDER BY pi.expiration_date ASC, pi.pantry_item_id ASC`,
      [studentId]
    );

    res.json(rows);
  } catch (error) {
    console.error("Get pantry items by student error:", error);
    res.status(500).json({ error: error.message });
  }
});
//DONT MOVE
app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});

