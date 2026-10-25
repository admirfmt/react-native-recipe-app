import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import pool, { initDb } from "./db.js";
import dotenv from 'dotenv';

dotenv.config();

const server = express();
const port = process.env.PORT;
const JWT_SECRET = process.env.JWT_SECRET;

server.use(cors());
server.use(express.json());

// Register
server.post("/api/auth/register", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required." });
    }
    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters long." });
    }

    const hashed = await bcrypt.hash(password, 10);
    await pool.query("INSERT INTO users (username, password) VALUES ($1, $2)", [
      username.trim().toLowerCase(),
      hashed,
    ]);
    res.status(201).json({ message: "Account has been created." });
  } catch (e) {
    if (e.code === "23505") {
      return res.status(409).json({ message: "Username is already taken." });
    }
    console.error(e);
    res.status(500).json({ message: "Something went wrong. Try again." });
  }
});

// Login
server.post("/api/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const { rows } = await pool.query("SELECT * FROM users WHERE username = $1", [
      (username || "").trim().toLowerCase(),
    ]);
    const user = rows[0];
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Wrong username or password." });
    }
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "30d" });
    res.json({ token });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Something went wrong. Try again." });
  }
});

function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: "You need to be logged in." });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ message: "Invalid or expired token." });
  }
}

function toRecipe(row, req) {
  return {
    id: row.id,
    title: row.title,
    ingredients: row.ingredients,
    category: row.category,
  };
}

server.get("/api/recipes", requireAuth, async (req, res) => {
  try {
    const search = (req.query.search || "").trim();
    const category = (req.query.category || "").trim();

    const { rows } = await pool.query(
      `SELECT * FROM recipes
       WHERE user_id = $1
         AND ($2 = '' OR title ILIKE '%' || $2 || '%')
         AND ($3 = '' OR category = $3)
       ORDER BY id DESC`,
      [req.user.userId, search, category]
    );
    res.json(rows.map(toRecipe));
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Could not load recipes." });
  }
});

server.get("/api/recipes/:id", requireAuth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT * FROM recipes WHERE id = $1 AND user_id = $2",
      [Number(req.params.id), req.user.userId]
    );
    if (!rows[0]) return res.status(404).json({ message: "Recipe not found." });
    res.json(toRecipe(rows[0]));
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Could not load recipe." });
  }
});

server.post("/api/recipes", requireAuth, async (req, res) => {
  try {
    const { title, ingredients, category } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ message: "Title is required." });
    }
    if (!Array.isArray(ingredients) || ingredients.length === 0) {
      return res.status(400).json({ message: "At least one ingredient is required." });
    }
    const { rows } = await pool.query(
      `INSERT INTO recipes (title, ingredients, category, user_id)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [title.trim(), ingredients, category || "Other", req.user?.userId ?? null]
    );
    res.status(201).json(toRecipe(rows[0]));
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Could not save recipe." });
  }
});

// Update
server.patch("/api/recipes/:id", requireAuth, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const existing = await pool.query("SELECT * FROM recipes WHERE id = $1", [id]);
    const recipe = existing.rows[0];
    if (!recipe) return res.status(404).json({ message: "Recipe not found." });
    if (recipe.user_id !== req.user?.userId) {
      return res.status(403).json({ message: "You can only update own recipes." });
    }

    const title = req.body.title !== undefined ? req.body.title.trim() : recipe.title;
    const ingredients = req.body.ingredients !== undefined ? req.body.ingredients : recipe.ingredients;
    const category = req.body.category !== undefined ? req.body.category : recipe.category;

    if (!title) return res.status(400).json({ message: "Title is required." });
    if (!Array.isArray(ingredients) || ingredients.length === 0) {
      return res.status(400).json({ message: "At least one ingredient is required." });
    }

    const { rows } = await pool.query(
      `UPDATE recipes SET title = $1, ingredients = $2, category = $3
       WHERE id = $4 RETURNING *`,
      [title, ingredients, category, id]
    );
    res.json(toRecipe(rows[0]));
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Could not update recipe." });
  }
});

// Delete
server.delete("/api/recipes/:id", requireAuth, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const existing = await pool.query("SELECT user_id FROM recipes WHERE id = $1", [id]);
    if (!existing.rows[0]) return res.status(404).json({ message: "Recipe not found." });
    if (existing.rows[0].user_id !== req.user?.userId) {
      return res.status(403).json({ message: "You can only delete own recipes." });
    }

    await pool.query("DELETE FROM recipes WHERE id = $1", [id]);
    res.status(204).send();
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Could not delete recipe." });
  }
});

// Current User
server.get("/api/auth/me", requireAuth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT id, username FROM users WHERE id = $1",
      [req.user.userId]
    );
    if (!rows[0]) {
      return res.status(401).json({ message: "Account does not exist." });
    }
    res.json(rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Could not load username." });
  }
});

try {
  await initDb();
  server.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
} catch (e) {
  console.error("Could not initialize database:", e);
  process.exit(1);
}