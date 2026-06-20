// Shared helpers ported from the original Express server so the API behaves
// identically after the move to Postgres.

export function getTodayDate(): string {
  const today = new Date();
  const dd = String(today.getDate()).padStart(2, "0");
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const yyyy = today.getFullYear();
  return `${mm}/${dd}/${yyyy}`;
}

// True when free throws are part of the box score (4v4 / playoffs).
export const hasFreeThrows = (mode: string) => mode !== "2v2";

// stats vs playoff_stats table selection. Returned value is a fixed identifier
// (never user input) so it is safe to interpolate into SQL.
export const statsTable = (mode: string) =>
  mode === "2v2" ? "stats" : "playoff_stats";

/**
 * The shared per-player aggregate column list used by the averages and box
 * score endpoints. Aggregates are cast ::float8 so the Neon driver returns JS
 * numbers (Postgres numeric/bigint otherwise deserialize to strings), and
 * percentage denominators are wrapped in NULLIF to avoid Postgres'
 * divide-by-zero error (SQLite silently returned NULL).
 */
export function aggregateStatColumns(mode: string): string {
  const fts = hasFreeThrows(mode) ? "+ (fts * 1)" : "";
  return `
    AVG((twos * 2) + (threes * 3) ${fts})::float8 AS pts,
    AVG("offReb" + "defReb")::float8 AS reb,
    AVG(ast)::float8 AS ast,
    AVG(blk)::float8 AS blk,
    AVG(stl)::float8 AS stl,
    AVG(tov)::float8 AS tov,
    ((COALESCE(SUM(twos), 0) + COALESCE(SUM(threes), 0))::numeric
      / NULLIF(COALESCE(SUM("twosAttempted"), 0) + COALESCE(SUM("threesAttempted"), 0), 0))::float8 AS fg,
    AVG("twosAttempted")::float8 AS "tpfgA",
    AVG(twos)::float8 AS "tpfgM",
    AVG("threesAttempted")::float8 AS "ttpfgA",
    AVG(threes)::float8 AS "ttpfgM",
    (COALESCE(SUM(threes), 0)::numeric
      / NULLIF(COALESCE(SUM("threesAttempted"), 0), 0))::float8 AS tp`;
}

export function calculateImpressiveIndex(
  stats: Record<string, number>,
  weights: Record<string, number>,
  avg: Record<string, number>
): Record<string, number> {
  const impressiveIndex: Record<string, number> = {};
  for (const stat in stats) {
    if (Object.prototype.hasOwnProperty.call(weights, stat)) {
      const normalizedValue = stats[stat] / avg[stat];
      impressiveIndex[stat] = normalizedValue * weights[stat];
    }
  }
  return impressiveIndex;
}

export function getTopStats(
  stats: Record<string, number>,
  impressiveIndex: Record<string, number>
): Record<string, number> {
  delete impressiveIndex["pts"];
  const sortedStats = Object.entries(impressiveIndex).sort(
    (a, b) => b[1] - a[1]
  );
  const topStats: Record<string, number> = {};
  if (sortedStats.length > 0) topStats[sortedStats[0][0]] = stats[sortedStats[0][0]];
  if (sortedStats.length > 1) topStats[sortedStats[1][0]] = stats[sortedStats[1][0]];
  return topStats;
}
