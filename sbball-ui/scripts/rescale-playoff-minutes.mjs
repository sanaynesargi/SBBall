// Rescale playoff (playoff_stats) minutes so 48 is the max in every game.
// For each game whose busiest player exceeds 48 min, multiply every player's
// minutes in that game by 48 / (game max), preserving within-game ratios.
// Games already at/under 48 are left untouched (we only scale DOWN).
//
//   node --env-file=.env.local scripts/rescale-playoff-minutes.mjs [--apply]
//
// Dry-run by default; --apply performs the UPDATE (backing up old values first).
import { neon } from "@neondatabase/serverless";
import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const backupPath = join(__dirname, "..", "db", "seed", "_minutes-backup.json");

const url =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.DATABASE_URL_UNPOOLED;
if (!url) {
  console.error("No database URL set.");
  process.exit(1);
}
const CAP = 48;
const apply = process.argv.includes("--apply");
const sql = neon(url);

const rows = await sql.query(
  'SELECT id, "gameId", "playerName", minutes FROM playoff_stats WHERE minutes IS NOT NULL'
);

const byGame = new Map();
for (const r of rows) {
  if (!byGame.has(r.gameId)) byGame.set(r.gameId, []);
  byGame.get(r.gameId).push(r);
}

const updates = [];
const backup = [];
let gamesChanged = 0;
for (const [gid, grp] of byGame) {
  const maxMin = Math.max(...grp.map((r) => Number(r.minutes)));
  if (maxMin <= CAP) continue;
  gamesChanged++;
  const factor = CAP / maxMin;
  console.log(
    `game ${gid}: max ${maxMin.toFixed(1)} -> 48 (x${factor.toFixed(3)}), ${grp.length} players`
  );
  for (const r of grp) {
    const nv = Math.round(Number(r.minutes) * factor * 100) / 100;
    updates.push({ id: r.id, min: nv });
    backup.push({ id: r.id, minutes: Number(r.minutes) });
  }
}

console.log(
  `\n${updates.length} rows across ${gamesChanged} game(s) would change (of ${byGame.size} playoff games).`
);
if (!apply) {
  console.log("Dry run. Re-run with --apply.");
  process.exit(0);
}
if (updates.length === 0) {
  console.log("Nothing to do.");
  process.exit(0);
}

await writeFile(backupPath, JSON.stringify(backup, null, 0));
const tuples = updates.map((u) => `(${u.id}, ${u.min.toFixed(4)})`).join(", ");
await sql.query(
  `UPDATE playoff_stats AS s SET minutes = v.m::float8 FROM (VALUES ${tuples}) AS v(id, m) WHERE s.id = v.id`
);
console.log(`\n✓ Rescaled ${updates.length} rows. Old values backed up -> ${backupPath}`);
