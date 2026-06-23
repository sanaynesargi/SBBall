// Set every one of Samar's numeric stats to a given value (joke helper).
//
//   node --env-file=.env.local scripts/samar-set.mjs 0     # all zeros
//   node --env-file=.env.local scripts/samar-set.mjs -5
//
// States are all reproducible, so this needs no backup:
//   - back to Sanay's real line:  npm run joke:samar
//   - back to a clean (empty) Samar: npm run joke:samar:revert

import { neon } from "@neondatabase/serverless";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL not set (run with: node --env-file=.env.local ...)");
  process.exit(1);
}
const sql = neon(url);

const value = Number(process.argv[2]);
if (!Number.isFinite(value)) {
  console.error("Usage: samar-set.mjs <number>");
  process.exit(1);
}

const quoteId = (n) => `"${n.replace(/"/g, '""')}"`;
const STAT_COLS = [
  "ast", "blk", "defReb", "fouls", "offReb", "stl", "threes",
  "threesAttempted", "tov", "twos", "twosAttempted", "rating",
];

const setStats = STAT_COLS.map((c) => `${quoteId(c)} = ${value}`).join(", ");
await sql.query(`UPDATE stats SET ${setStats} WHERE "playerName" = 'Samar'`);
await sql.query(`UPDATE playoff_stats SET ${setStats}, fts = ${value} WHERE "playerName" = 'Samar'`);

for (const t of ["stats", "playoff_stats"]) {
  const c = (await sql.query(`SELECT COUNT(*)::int c FROM ${t} WHERE "playerName" = 'Samar'`))[0].c;
  console.log(`  ${t}: ${c} Samar rows set to ${value}`);
}
console.log(`Set all of Samar's stats to ${value} ✅`);
