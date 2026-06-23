// Reversible joke pt.2: set every one of Samar's stats to -5.
//
//   node --env-file=.env.local scripts/samar-minus5.mjs apply
//   node --env-file=.env.local scripts/samar-minus5.mjs revert
//
// "apply" backs up Samar's current rows to db/seed/_samar-minus5-backup.json,
// then sets all numeric stat columns to -5. "revert" restores that backup.

import { neon } from "@neondatabase/serverless";
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const backupPath = join(__dirname, "..", "db", "seed", "_samar-minus5-backup.json");

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL not set (run with: node --env-file=.env.local ...)");
  process.exit(1);
}
const sql = neon(url);
const mode = process.argv[2];
const TABLES = ["stats", "playoff_stats"];
const quoteId = (n) => `"${n.replace(/"/g, '""')}"`;

// Numeric stat columns to slam to -5 (playoff_stats also has fts).
const STAT_COLS = [
  "ast", "blk", "defReb", "fouls", "offReb", "stl", "threes",
  "threesAttempted", "tov", "twos", "twosAttempted", "rating",
];

async function reinsert(table, rows) {
  for (const row of rows) {
    const cols = Object.keys(row).filter((k) => k !== "id");
    const params = cols.map((c) => row[c]);
    const placeholders = cols.map((_, i) => `$${i + 1}`);
    await sql.query(
      `INSERT INTO ${table} (${cols.map(quoteId).join(", ")}) VALUES (${placeholders.join(", ")})`,
      params
    );
  }
}

async function apply() {
  const backup = {};
  for (const t of TABLES) {
    backup[t] = await sql.query(`SELECT * FROM ${t} WHERE "playerName" = 'Samar'`);
  }
  await writeFile(backupPath, JSON.stringify(backup, null, 2));
  console.log(
    `Backed up Samar -> ${backupPath} (stats: ${backup.stats.length}, playoff_stats: ${backup.playoff_stats.length})`
  );

  const setStats = STAT_COLS.map((c) => `${quoteId(c)} = -5`).join(", ");
  await sql.query(`UPDATE stats SET ${setStats} WHERE "playerName" = 'Samar'`);
  await sql.query(
    `UPDATE playoff_stats SET ${setStats}, fts = -5 WHERE "playerName" = 'Samar'`
  );

  for (const t of TABLES) {
    const c = (await sql.query(`SELECT COUNT(*)::int c FROM ${t} WHERE "playerName" = 'Samar'`))[0].c;
    console.log(`  ${t}: ${c} Samar rows set to -5`);
  }
  console.log("Applied ✅  (revert: node --env-file=.env.local scripts/samar-minus5.mjs revert)");
}

async function revert() {
  let backup;
  try {
    backup = JSON.parse(await readFile(backupPath, "utf8"));
  } catch {
    console.error("No backup found — nothing to revert.");
    process.exit(1);
  }
  await sql.query(`DELETE FROM stats WHERE "playerName" = 'Samar'`);
  await sql.query(`DELETE FROM playoff_stats WHERE "playerName" = 'Samar'`);
  for (const t of TABLES) await reinsert(t, backup[t] ?? []);
  for (const t of TABLES) {
    const c = (await sql.query(`SELECT COUNT(*)::int c FROM ${t} WHERE "playerName" = 'Samar'`))[0].c;
    console.log(`  ${t}: Samar restored to ${c} rows`);
  }
  console.log("Reverted ✅");
}

if (mode === "apply") await apply();
else if (mode === "revert") await revert();
else {
  console.error("Usage: samar-minus5.mjs <apply|revert>");
  process.exit(1);
}
