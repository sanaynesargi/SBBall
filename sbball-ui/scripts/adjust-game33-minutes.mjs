// One-off manual reconciliation of game 33 minutes. The tracker over-counted
// on-court time (added time + un-toggled subs), so the busiest players hit ~65.
// Using the recorded team rosters and the scorekeeper's memory, set each
// player's minutes so both teams total the same (they share the court equally).
//
// Team 1 (Ansuman;Arav;Cyrus;Sanay) = 139 ; Team 2 (Aarav;Advik;Kurt;Viraaj) = 139
//
//   node --env-file=.env.local scripts/adjust-game33-minutes.mjs [--apply]
import { neon } from "@neondatabase/serverless";
import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const backupPath = join(__dirname, "..", "db", "seed", "_minutes-backup-g33-manual.json");

const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
if (!url) {
  console.error("No database URL set.");
  process.exit(1);
}
const apply = process.argv.includes("--apply");
const sql = neon(url);

// Target minutes by player name (game 33 only). Iron-men Sanay/Kurt/Advik stay 48.
const TARGET = {
  Sanay: 48,
  Kurt: 48,
  Advik: 48,
  Cyrus: 36,
  Arav: 31,
  Aarav: 28,
  Ansuman: 24,
  Viraaj: 15,
};

const rows = await sql.query(
  'SELECT id, "playerName", minutes FROM playoff_stats WHERE "gameId"=33'
);

const updates = [];
const backup = [];
for (const r of rows) {
  const target = TARGET[r.playerName];
  const cur = Number(r.minutes);
  const mark = target != null && Math.abs(target - cur) > 1e-9 ? " *" : "";
  console.log(
    `  ${r.playerName.padEnd(9)} ${cur.toFixed(2).padStart(6)} -> ${(target ?? cur)
      .toFixed(2)
      .padStart(6)}${mark}`
  );
  if (target != null && Math.abs(target - cur) > 1e-9) {
    updates.push({ id: r.id, min: target });
    backup.push({ id: r.id, minutes: cur });
  }
}

const t1 = ["Ansuman", "Arav", "Cyrus", "Sanay"].reduce((s, n) => s + TARGET[n], 0);
const t2 = ["Aarav", "Advik", "Kurt", "Viraaj"].reduce((s, n) => s + TARGET[n], 0);
console.log(`\nTeam 1 total: ${t1}   Team 2 total: ${t2}`);
console.log(`${updates.length} rows would change.`);

if (!apply) {
  console.log("Dry run. Re-run with --apply.");
  process.exit(0);
}
await writeFile(backupPath, JSON.stringify(backup, null, 0));
const tuples = updates.map((u) => `(${u.id}, ${u.min.toFixed(4)})`).join(", ");
await sql.query(
  `UPDATE playoff_stats AS s SET minutes = v.m::float8 FROM (VALUES ${tuples}) AS v(id, m) WHERE s.id = v.id`
);
console.log(`\n✓ Updated ${updates.length} rows. Prior values backed up -> ${backupPath}`);
