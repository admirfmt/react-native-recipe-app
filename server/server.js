import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const server = express();
const port = 3000;
const JWT_SECRET = "mysecretkey"; // TODO: use environment variable

server.use(cors());
server.use(express.json());

const users = [];
const recipes = [];
let nextRecipeId = 1;

// Register
server.post("/api/auth/register", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required." });
  }
  if (password.length < 8) {
    return res.status(400).json({ message: "Password must be at least 8 characters long." });
  }
  if (users.some((u) => u.username === username)) {
    return res.status(409).json({ message: "Username is already taken." });
  }

  const hashed = await bcrypt.hash(password, 10);
  const user = { id: users.length + 1, username, password: hashed };
  users.push(user);
  res.status(201).json({ message: "Account has been created" });
});

// Login
server.post("/api/auth/login", async (req, res) => {
  const { username, password } = req.body;
  const user = users.find((u) => u.username === username);
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: "Wrong username or password." });
  }
  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "30d" });
  res.json({ token });
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

server.get("/api/recipes", requireAuth, (req, res) => {
  res.json(recipes.filter((r) => r.userId === req.user.userId));
});

server.get("/api/recipes/:id", requireAuth, (req, res) => {
  const recipe = recipes.find(
    (r) => r.id === Number(req.params.id) && r.userId === req.user.userId
  );
  if (!recipe) return res.status(404).json({ message: "Recipe not found." });
  res.json(recipe);
});

server.post("/api/recipes", requireAuth, (req, res) => {
  const { title, ingredients } = req.body;
  if (!title || !Array.isArray(ingredients)) {
    return res.status(400).json({ message: "Title and ingredients are required." });
  }
  const recipe = { id: nextRecipeId++, title, ingredients, userId: req.user.userId };
  recipes.push(recipe);
  res.status(201).json(recipe);
});

server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});