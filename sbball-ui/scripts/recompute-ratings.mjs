// Recompute the `rating` (Game Score) column for every stored game using the
// reworked formula. Backs up the old ratings first.
//
//   node --env-file=.env.local scripts/recompute-ratings.mjs
//
// Keep gameScore() in sync with src/lib/performanceRating.ts.

import { neon } from "@neondatabase/serverless";
import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const backupPath = join(__dirname, "..", "db", "seed", "_ratings-backup.json");

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL not set (run with: node --env-file=.env.local ...)");
  process.exit(1);
}
const sql = neon(url);

const num = (v) => Number(v) || 0;
function gameScore(s) {
  // Free throws are intentionally excluded from Game Score in our version.
  const pts = num(s.twos) * 2 + num(s.threes) * 3;
  const fgm = num(s.twos) + num(s.threes);
  const fga = num(s.twosAttempted) + num(s.threesAttempted);
  const gs =
    pts +
    0.4 * fgm -
    0.7 * fga +
    0.7 * num(s.offReb) +
    0.3 * num(s.defReb) +
    num(s.stl) +
    0.7 * num(s.ast) +
    0.7 * num(s.blk) -
    0.4 * num(s.fouls) -
    num(s.tov);
  return Math.round(gs * 10) / 10;
}

const TABLES = [
  {
    name: "stats",
    cols: `id, twos, threes, "twosAttempted", "threesAttempted", "offReb", "defReb", ast, stl, blk, tov, fouls, rating`,
    fts: false,
  },
  {
    name: "playoff_stats",
    cols: `id, twos, threes, fts, "twosAttempted", "threesAttempted", "offReb", "defReb", ast, stl, blk, tov, fouls, rating`,
    fts: true,
  },
];

async function main() {
  const backup = {};
  for (const t of TABLES) {
    const rows = await sql.query(`SELECT ${t.cols} FROM ${t.name}`);
    backup[t.name] = rows.map((r) => ({ id: r.id, rating: r.rating }));

    if (rows.length === 0) {
      console.log(`${t.name}: no rows`);
      continue;
    }

    const tuples = rows
      .map((r) => `(${r.id}, ${gameScore(t.fts ? r : { ...r, fts: 0 })})`)
      .join(", ");
    await sql.query(
      `UPDATE ${t.name} AS s SET rating = v.r FROM (VALUES ${tuples}) AS v(id, r) WHERE s.id = v.id`
    );

    const sample = rows
      .slice(0, 3)
      .map((r) => `id${r.id}: ${num(r.rating).toFixed(1)} -> ${gameScore(t.fts ? r : { ...r, fts: 0 })}`);
    console.log(`${t.name}: recomputed ${rows.length} rows  (e.g. ${sample.join(", ")})`);
  }

  await writeFile(backupPath, JSON.stringify(backup, null, 0));
  console.log(`\nBacked up old ratings -> ${backupPath}`);
  console.log("Recompute complete ✅");
}

main().catch((e) => {
  console.error("Recompute failed:", e);
  process.exit(1);
});
