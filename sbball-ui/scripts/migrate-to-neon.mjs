// One-shot migration: SQLite snapshot (db/seed/*.json) -> Neon Postgres.
//
// Usage (Node 20.6+, which supports --env-file):
//   node --env-file=.env.local scripts/migrate-to-neon.mjs
//
// It applies db/schema.sql, truncates each table (so re-runs are idempotent),
// bulk-inserts the seed rows preserving their original ids, then advances each
// identity sequence past MAX(id) so future inserts continue cleanly.

import { neon } from "@neondatabase/serverless";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const DB_URL_KEYS = [
  "DATABASE_URL",
  "POSTGRES_URL",
  "DATABASE_URL_UNPOOLED",
  "POSTGRES_URL_NON_POOLING",
  "POSTGRES_PRISMA_URL",
];
const url = DB_URL_KEYS.map((k) => process.env[k]).find(Boolean);
if (!url) {
  console.error(
    `No database URL found (looked for: ${DB_URL_KEYS.join(", ")}).\n\n` +
      "Fix:\n" +
      "  1. In the Vercel dashboard, connect a Neon database to this project (Storage tab).\n" +
      "  2. Check which env it landed in:  vercel env ls\n" +
      "  3. Pull it locally (try prod if dev is empty):\n" +
      "       vercel env pull .env.local --environment=production\n" +
      "     ...or paste the Neon connection string into .env.local as DATABASE_URL=...\n" +
      "  4. Re-run: npm run db:migrate"
  );
  process.exit(1);
}

const sql = neon(url);

// Order matters: games before stats (FK-ish references via gameId), though no
// hard FK constraints are defined.
const TABLES = [
  "players",
  "awards",
  "games",
  "stats",
  "playoff_stats",
  "game_feed",
  "game_feed2",
];

const BATCH = 200;
const quoteId = (name) => `"${name.replace(/"/g, '""')}"`;

async function applySchema() {
  // Drop first so schema changes (e.g. column types) always take effect — this
  // is a one-shot seed migration, safe to recreate from the JSON snapshot.
  for (const table of [...TABLES].reverse()) {
    await sql.query(`DROP TABLE IF EXISTS ${table} CASCADE`);
  }

  const schema = await readFile(join(root, "db", "schema.sql"), "utf8");
  // Strip full-line `--` comments first so they don't get attached to the
  // following statement when we split on `;`.
  const cleaned = schema
    .split("\n")
    .filter((line) => !/^\s*--/.test(line))
    .join("\n");
  const statements = cleaned
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  for (const stmt of statements) {
    await sql.query(stmt);
  }
  console.log(`Applied schema (${statements.length} statements).`);
}

async function loadSeed(table) {
  const raw = await readFile(join(root, "db", "seed", `${table}.json`), "utf8");
  const text = raw.trim();
  return text ? JSON.parse(text) : [];
}

async function insertRows(table, rows) {
  if (rows.length === 0) return;
  const columns = Object.keys(rows[0]);
  const colSql = columns.map(quoteId).join(", ");

  for (let i = 0; i < rows.length; i += BATCH) {
    const slice = rows.slice(i, i + BATCH);
    const params = [];
    const tuples = slice.map((row) => {
      const placeholders = columns.map((c) => {
        params.push(row[c]);
        return `$${params.length}`;
      });
      return `(${placeholders.join(", ")})`;
    });
    await sql.query(
      `INSERT INTO ${table} (${colSql}) VALUES ${tuples.join(", ")}`,
      params
    );
  }
}

async function resetSequence(table) {
  // Advance the identity sequence to MAX(id) so the next insert gets MAX+1.
  await sql.query(
    `SELECT setval(
       pg_get_serial_sequence('${table}', 'id'),
       (SELECT COALESCE(MAX(id), 1) FROM ${table}),
       true
     )`
  );
}

async function main() {
  await applySchema();

  for (const table of TABLES) {
    const rows = await loadSeed(table);
    await sql.query(`TRUNCATE TABLE ${table} RESTART IDENTITY CASCADE`);
    await insertRows(table, rows);
    await resetSequence(table);
    const [{ count }] = await sql.query(`SELECT COUNT(*)::int AS count FROM ${table}`);
    console.log(`  ${table}: imported ${count} rows`);
  }

  console.log("\nMigration complete ✅");
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
