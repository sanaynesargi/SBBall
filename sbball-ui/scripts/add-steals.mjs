// Add N steals to a player's row in the latest playoff (4v4) game and recompute
// that row's Game Score (rating). Free throws are excluded from GMSC.
//   node --env-file=.env.local scripts/add-steals.mjs <player> <n> [--apply]
import { neon } from "@neondatabase/serverless";

const url =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.DATABASE_URL_UNPOOLED;
if (!url) {
  console.error("No database URL set.");
  process.exit(1);
}
const player = process.argv[2] ?? "Sanay";
const add = Number(process.argv[3] ?? 2);
const apply = process.argv.includes("--apply");
const sql = neon(url);

const num = (v) => Number(v) || 0;
function gameScore(s) {
  const pts = num(s.twos) * 2 + num(s.threes) * 3; // FTs excluded
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

const games = await sql.query(
  'SELECT id, team1, team2, date FROM games WHERE "playerCount" = 4 ORDER BY id DESC LIMIT 1'
);
if (!games.length) {
  console.log("No playoff games found.");
  process.exit(0);
}
const game = games[0];
const rows = await sql.query(
  'SELECT * FROM playoff_stats WHERE "gameId" = $1 AND "playerName" = $2',
  [game.id, player]
);
if (!rows.length) {
  console.log(`${player} not found in game ${game.id}.`);
  process.exit(0);
}
const r = rows[0];
const newStl = num(r.stl) + add;
const newRating = gameScore({ ...r, stl: newStl });
console.log(`Game ${game.id} (${game.date}) — ${player}`);
console.log(`  STL   ${num(r.stl)} -> ${newStl}`);
console.log(`  GMSC  ${num(r.rating).toFixed(1)} -> ${newRating}`);

if (!apply) {
  console.log("\nDry run. Re-run with --apply.");
  process.exit(0);
}
await sql.query(
  'UPDATE playoff_stats SET stl = $1, rating = $2 WHERE id = $3',
  [newStl, newRating, r.id]
);
console.log(`\n✓ Updated row id ${r.id}.`);
