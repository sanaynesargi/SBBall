// Player POWER RANKING for a per-series running ranking over a small sample
// (typically 3–7 games). Built from the research on how real platforms rank:
//
//   - FiveThirtyEight Elo, Hollinger Game Score, fantasy two-step dominance,
//     Colley/Massey were all surveyed. The batch linear-algebra methods
//     (Colley/Massey) and plain Elo are poor fits at 3–7 sparse games, so this
//     instead composes the pieces that ARE small-sample-friendly:
//
//   1. PRODUCTION  — the app's existing Game Score (GMSC), recency-weighted with
//      an exponential moving average (recent games count more), then shrunk
//      toward the roster mean so a hot 2-game start doesn't dominate.
//   2. WIN term    — win rate, Bayesian-shrunk toward .500 with phantom games so
//      a 2-0 record isn't treated as a certainty.
//   3. BLEND       — both terms are z-scored across the roster (so they share a
//      scale) and combined  POWER = w·Z(prod) + (1−w)·Z(win).
//
// Formulas / constants sourced from:
//   - EWMA (pandas ewm):      S_t = α·x_t + (1−α)·S_{t-1};  α = 1 − exp(−ln2/hl)
//   - Beta-binomial shrink:   winRate = (wins + s0) / (games + s0 + f0)
//   - Normal-normal shrink:   shrunk  = (n·observed + k·prior) / (n + k)
//   - MVP-style blend weight: ~0.5 production / 0.5 wins (fantasy tools use ~0.6
//     production). Exposed as PRODUCTION_WEIGHT so it stays a single knob.

export interface PlayerSeriesLine {
  player: string;
  /** Per-game GMSC values in chronological order (oldest → newest). */
  gmscByGame: number[];
  wins: number;
  games: number;
}

export interface PowerRankingRow {
  player: string;
  power: number; // final blended power score (roster-relative, ~mean 0)
  prodScore: number; // recency-weighted, shrunk GMSC (pre-z)
  winRate: number; // shrunk win rate in [0,1]
  prodZ: number;
  winZ: number;
  wins: number;
  games: number;
}

// ---- Tunable constants (documented in the header above) -----------------

/** GMSC recency half-life, in games. hl=2 → a game 2 back counts half. */
export const RECENCY_HALFLIFE_GAMES = 2;

/** Phantom games pulling production toward the roster mean (normal-normal k). */
export const PROD_SHRINK_GAMES = 3;

/** Beta prior for win rate: s0 wins + f0 losses of "phantom" .500 evidence. */
export const WIN_PRIOR_WINS = 1.5;
export const WIN_PRIOR_LOSSES = 1.5;

/** Blend: how much "how you played" vs "did you win". 0.5 = MVP-style even. */
export const PRODUCTION_WEIGHT = 0.5;

// ---- Pure helpers -------------------------------------------------------

/** EWMA decay α from a half-life in games. */
export function alphaFromHalfLife(halfLifeGames: number): number {
  return 1 - Math.exp(-Math.LN2 / halfLifeGames);
}

/**
 * Exponentially-weighted mean of a chronological series (oldest → newest),
 * giving more weight to recent games. Equivalent to pandas `.ewm(halflife=…,
 * adjust=False).mean()` evaluated at the last point.
 */
export function ewma(values: number[], halfLifeGames: number): number {
  if (values.length === 0) return 0;
  const a = alphaFromHalfLife(halfLifeGames);
  let s = values[0];
  for (let i = 1; i < values.length; i++) {
    s = a * values[i] + (1 - a) * s;
  }
  return s;
}

/** Beta-binomial shrunk win rate toward .500 (with the phantom-game prior). */
export function shrunkWinRate(wins: number, games: number): number {
  return (
    (wins + WIN_PRIOR_WINS) /
    (games + WIN_PRIOR_WINS + WIN_PRIOR_LOSSES)
  );
}

/** Population z-scores of a value list (0 when there's no spread / <2 items). */
function zScores(values: number[]): number[] {
  const n = values.length;
  if (n === 0) return [];
  const mean = values.reduce((a, b) => a + b, 0) / n;
  const variance =
    values.reduce((a, b) => a + (b - mean) * (b - mean), 0) / n;
  const sd = Math.sqrt(variance);
  if (sd === 0) return values.map(() => 0);
  return values.map((v) => (v - mean) / sd);
}

/**
 * Compute a power ranking for a roster of players over a series.
 *
 * Steps per player:
 *   prodRaw = EWMA(gmscByGame, halflife)                 (recency)
 *   prod    = (n·prodRaw + k·rosterMeanProd) / (n + k)   (small-sample shrink)
 *   winRate = (wins + s0) / (games + s0 + f0)            (beta shrink)
 * Then z-score prod and winRate across the roster and blend.
 */
export function computePowerRankings(
  lines: PlayerSeriesLine[],
  opts: {
    halfLife?: number;
    prodShrinkGames?: number;
    productionWeight?: number;
  } = {}
): PowerRankingRow[] {
  const halfLife = opts.halfLife ?? RECENCY_HALFLIFE_GAMES;
  const k = opts.prodShrinkGames ?? PROD_SHRINK_GAMES;
  const w = opts.productionWeight ?? PRODUCTION_WEIGHT;

  const eligible = lines.filter((l) => l.games > 0);
  if (eligible.length === 0) return [];

  // Recency-weighted production, before shrinkage.
  const prodRaw = eligible.map((l) => ewma(l.gmscByGame, halfLife));

  // Roster prior = mean of the recency-weighted productions.
  const rosterMeanProd =
    prodRaw.reduce((a, b) => a + b, 0) / prodRaw.length;

  // Shrink each toward the roster mean by k phantom games.
  const prodScore = eligible.map((l, i) => {
    const n = l.games;
    return (n * prodRaw[i] + k * rosterMeanProd) / (n + k);
  });

  const winRate = eligible.map((l) => shrunkWinRate(l.wins, l.games));

  const prodZ = zScores(prodScore);
  const winZ = zScores(winRate);

  const rows: PowerRankingRow[] = eligible.map((l, i) => ({
    player: l.player,
    power: w * prodZ[i] + (1 - w) * winZ[i],
    prodScore: Math.round(prodScore[i] * 10) / 10,
    winRate: winRate[i],
    prodZ: Math.round(prodZ[i] * 100) / 100,
    winZ: Math.round(winZ[i] * 100) / 100,
    wins: l.wins,
    games: l.games,
  }));

  rows.sort((a, b) => b.power - a.power);
  return rows.map((r) => ({ ...r, power: Math.round(r.power * 1000) / 1000 }));
}
