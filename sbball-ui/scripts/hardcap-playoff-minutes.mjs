// Hard-cap playoff minutes at 48 (per player per game), the fair correction for
// added-time overage — it only trims players who actually exceeded regulation,
// leaving benched players untouched (unlike uniform scaling, which docks resters).
//
// Per row the target is min(base, 48), where:
//   - base = the ORIGINAL pre-scaling minutes if this row was previously scaled
//            by rescale-playoff-minutes.mjs (looked up in _minutes-backup.json),
//            so game 32's unfair uniform scaling is undone before capping;
//   - base = the current minutes otherwise.
//
//   node --env-file=.env.local scripts/hardcap-playoff-minutes.mjs [--apply]
//
// Dry-run by default; --apply performs the UPDATE (backing up current values to
// _minutes-backup-hardcap.json first, so the change is reversible).
import { neon } from "@neondatabase/serverless";
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const seedDir = join(__dirname, "..", "db", "seed");
const origBackupPath = join(seedDir, "_minutes-backup.json"); // pre-uniform-scale originals
const backupPath = join(seedDir, "_minutes-backup-hardcap.json"); // current values, pre-hardcap

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

// Originals from the previous uniform-scaling backup (keyed by row id).
let orig = {};
try {
  orig = Object.fromEntries(
    JSON.parse(await readFile(origBackupPath, "utf8")).map((b) => [b.id, b.minutes])
  );
} catch {
  console.log("(no _minutes-backup.json found — using current values as base for every row)");
}

const rows = await sql.query(
  'SELECT id, "gameId", "playerName", minutes FROM playoff_stats WHERE minutes IS NOT NULL ORDER BY "gameId", minutes DESC'
);

const updates = [];
const backup = [];
const preview = {};
for (const r of rows) {
  const cur = Number(r.minutes);
  const base = orig[r.id] != null ? Number(orig[r.id]) : cur;
  const target = Math.round(Math.min(base, CAP) * 100) / 100;
  (preview[r.gameId] ??= []).push({ p: r.playerName, cur, base, target });
  if (Math.abs(target - cur) > 1e-9) {
    updates.push({ id: r.id, min: target });
    backup.push({ id: r.id, minutes: cur });
  }
}

for (const [g, grp] of Object.entries(preview)) {
  console.log(`\n=== game ${g} ===`);
  for (const x of grp) {
    const changed = Math.abs(x.target - x.cur) > 1e-9;
    const baseNote = x.base !== x.cur ? ` (orig ${x.base.toFixed(2)})` : "";
    console.log(
      `  ${x.p.padEnd(9)} ${x.cur.toFixed(2).padStart(6)}${baseNote} -> ${x.target
        .toFixed(2)
        .padStart(6)}${changed ? "  *" : ""}`
    );
  }
}

console.log(`\n${updates.length} rows would change.`);
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
console.log(`\n✓ Hard-capped ${updates.length} rows. Prior values backed up -> ${backupPath}`);
