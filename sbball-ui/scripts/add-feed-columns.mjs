// One-off: ensure the play-by-play feed tables have the "occurredAt" and
// "quarter" columns on the live Neon DB. Idempotent (ADD COLUMN IF NOT EXISTS).
// Run: node --env-file=.env.local scripts/add-feed-columns.mjs
import { neon } from "@neondatabase/serverless";

const url =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.DATABASE_URL_UNPOOLED;
if (!url) {
  console.error("No database URL set.");
  process.exit(1);
}

const sql = neon(url);
const cols = [
  ['"occurredAt"', "TIMESTAMPTZ"],
  ["quarter", "INTEGER"],
];
for (const table of ["game_feed", "game_feed2"]) {
  for (const [col, type] of cols) {
    await sql.query(`ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS ${col} ${type}`);
    console.log(`✓ ${table}.${col} ensured`);
  }
}
console.log("Done.");
