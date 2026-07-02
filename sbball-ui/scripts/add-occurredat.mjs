// One-off: add the "occurredAt" TIMESTAMPTZ column to the feed tables on the
// live Neon DB. Idempotent (ADD COLUMN IF NOT EXISTS).
// Run: node --env-file=.env.local scripts/add-occurredat.mjs
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
for (const table of ["game_feed", "game_feed2"]) {
  await sql.query(
    `ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS "occurredAt" TIMESTAMPTZ`
  );
  console.log(`✓ ${table}."occurredAt" ensured`);
}
console.log("Done.");
