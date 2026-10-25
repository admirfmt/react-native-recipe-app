import pg from "pg";
import dotenv from 'dotenv';
dotenv.config();

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  // comment out ssl authorization when using local database 
  ssl: { rejectUnauthorized: false }
});

pool.on("connect", (client) => {
  console.log("Connected to the database");
});

pool.on("remove", () => {
  console.log("Disconnected from the database");
});

pool.on("error", (err) => {
  console.error("Unexpected error in database:", err);
});

export async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS recipes (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      ingredients TEXT[] NOT NULL,
      category TEXT NOT NULL DEFAULT 'Other',
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ DEFAULT now()
    );
  `);
  console.log("Database initialized");
}

export default pool;