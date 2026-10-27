
require("dotenv").config();
const bcrypt = require("bcrypt");
const { Pool } = require("pg");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT || 5432)
});

async function main() {
  const fullName = await new Promise(resolve =>
    rl.question("Admin full name: ", resolve)
  );
  const email = await new Promise(resolve =>
    rl.question("Admin email: ", resolve)
  );
  const password = await new Promise(resolve =>
    rl.question("Admin password (12+ characters): ", resolve)
  );

  if (!fullName.trim() || !email.trim() || password.length < 12) {
    throw new Error("Enter a name, email, and password of at least 12 characters.");
  }

  const existing = await pool.query("SELECT id FROM users LIMIT 1");

  if (existing.rows.length) {
    throw new Error("A user already exists. No account was created.");
  }

  const hash = await bcrypt.hash(password, 12);

  await pool.query(
    `INSERT INTO users (full_name, email, password_hash, role)
     VALUES ($1, $2, $3, 'Admin')`,
    [fullName.trim(), email.trim().toLowerCase(), hash]
  );

  console.log("Admin account created successfully!");
}

main()
  .catch(error => console.error(error.message))
  .finally(async () => {
    rl.close();
    await pool.end();
  });
