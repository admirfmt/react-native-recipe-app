import pg from "pg";
import dotenv from 'dotenv';
dotenv.config();

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
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

export default pool;