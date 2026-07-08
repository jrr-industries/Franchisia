import "dotenv/config";

const url = process.env.DATABASE_URL;
console.log("DB URL prefix:", url?.substring(0, 50) + "...");

async function main() {
  try {
    const { Pool } = await import("pg");
    const pool = new Pool({
      connectionString: url,
      connectionTimeoutMillis: 10000,
    });
    const result = await pool.query("SELECT 1");
    console.log("DB connected:", result.rows);
    await pool.end();
  } catch (e) {
    console.log("DB connection failed:", e.message);
    console.log("Full error:", JSON.stringify(e, Object.getOwnPropertyNames(e)));
  }
}

main();
