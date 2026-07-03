// Move the most recent playoff (4v4) game to a target series.
// Usage: node --env-file=.env.local scripts/move-latest-playoff-series.mjs <series> [--apply]
import { neon } from "@neondatabase/serverless";

const url =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.DATABASE_URL_UNPOOLED;
if (!url) {
  console.error("No database URL set.");
  process.exit(1);
}
const target = Number(process.argv[2] ?? 3);
const apply = process.argv.includes("--apply");
const sql = neon(url);

const rows = await sql.query(
  `SELECT id, team1, team2, date, series, winner
     FROM games WHERE "playerCount" = 4 ORDER BY id DESC LIMIT 1`
);
if (!rows.length) {
  console.log("No playoff games found.");
  process.exit(0);
}
const g = rows[0];
console.log("Most recent playoff game:");
console.log(
  `  id=${g.id}  ${g.team1} vs ${g.team2}  date=${g.date}  series=${g.series}  winner=${g.winner}`
);

if (!apply) {
  console.log(`\nDry run. Would set series ${g.series} -> ${target}. Re-run with --apply.`);
  process.exit(0);
}

await sql.query(`UPDATE games SET series = $1 WHERE id = $2`, [target, g.id]);
console.log(`\n✓ Game ${g.id} series updated to ${target}.`);
