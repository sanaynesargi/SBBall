// Reversible joke: give Samar a copy of all of Sanay's stat lines.
//
//   node --env-file=.env.local scripts/samar-as-sanay.mjs apply
//   node --env-file=.env.local scripts/samar-as-sanay.mjs revert
//
// "apply" backs up Samar's current stats/playoff_stats rows to
// db/seed/_samar-backup.json, clears them, then copies every Sanay row to Samar.
// "revert" deletes Samar's current rows and restores the backup exactly.

import { neon } from "@neondatabase/serverless";
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const backupPath = join(__dirname, "..", "db", "seed", "_samar-backup.json");

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL not set (run with: node --env-file=.env.local ...)");
  process.exit(1);
}
const sql = neon(url);
const mode = process.argv[2];
const TABLES = ["stats", "playoff_stats"];
const quoteId = (n) => `"${n.replace(/"/g, '""')}"`;

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
  // 1) Back up Samar's current rows.
  const backup = {};
  for (const t of TABLES) {
    backup[t] = await sql.query(`SELECT * FROM ${t} WHERE "playerName" = 'Samar'`);
  }
  await writeFile(backupPath, JSON.stringify(backup, null, 2));
  console.log(
    `Backed up Samar -> ${backupPath} (stats: ${backup.stats.length}, playoff_stats: ${backup.playoff_stats.length})`
  );

  // 2) Clear Samar, then copy every Sanay row across as Samar.
  await sql.query(`DELETE FROM stats WHERE "playerName" = 'Samar'`);
  await sql.query(`DELETE FROM playoff_stats WHERE "playerName" = 'Samar'`);

  await sql.query(`
    INSERT INTO stats (ast, blk, "defReb", fouls, "playerName", "offReb", stl, threes,
                       "threesAttempted", tov, twos, "twosAttempted", rating, "gameId")
    SELECT ast, blk, "defReb", fouls, 'Samar', "offReb", stl, threes,
           "threesAttempted", tov, twos, "twosAttempted", rating, "gameId"
    FROM stats WHERE "playerName" = 'Sanay'`);

  await sql.query(`
    INSERT INTO playoff_stats (ast, blk, "defReb", fouls, "playerName", "offReb", stl, threes,
                               fts, "threesAttempted", tov, twos, "twosAttempted", rating, "gameId")
    SELECT ast, blk, "defReb", fouls, 'Samar', "offReb", stl, threes,
           fts, "threesAttempted", tov, twos, "twosAttempted", rating, "gameId"
    FROM playoff_stats WHERE "playerName" = 'Sanay'`);

  for (const t of TABLES) {
    const c = (await sql.query(`SELECT COUNT(*)::int c FROM ${t} WHERE "playerName" = 'Samar'`))[0].c;
    console.log(`  ${t}: Samar now has ${c} rows`);
  }
  console.log("Applied ✅  (revert with: node --env-file=.env.local scripts/samar-as-sanay.mjs revert)");
}

async function revert() {
  let backup;
  try {
    backup = JSON.parse(await readFile(backupPath, "utf8"));
  } catch {
    backup = { stats: [], playoff_stats: [] };
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
  console.error('Usage: samar-as-sanay.mjs <apply|revert>');
  process.exit(1);
}
