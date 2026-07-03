// Player single-game performance score ("Game Score"), reworked to a
// Hollinger-style metric adapted to the stats this app tracks. It rewards
// efficient scoring and all-around production and penalizes empty volume,
// turnovers, and fouls — far more meaningful than the old ad-hoc weight/bonus
// system.
//
//   GmSc = PTS
//        + 0.4·FGM − 0.7·FGA      (efficiency: reward makes, punish missed shots)
//        + 0.7·ORB + 0.3·DRB
//        + STL + 0.7·AST + 0.7·BLK
//        − 0.4·PF − TOV
//
// NOTE: free throws are disregarded entirely in our version — FT makes are not
// added to PTS and (since attempts aren't tracked) the −0.4·(FTA−FTM) missed-FT
// penalty is omitted. Game Score here is built purely from 2s/3s + the box
// score. Mode-agnostic.

export interface GameStatLine {
  twos: number;
  threes: number;
  fts?: number;
  twosAttempted: number;
  threesAttempted: number;
  offReb: number;
  defReb: number;
  ast: number;
  stl: number;
  blk: number;
  tov: number;
  fouls: number;
}

const n = (v: number | undefined | null) => Number(v) || 0;

export function calculateGameScore(s: GameStatLine): number {
  // Free throws are intentionally excluded from Game Score in our version.
  const pts = n(s.twos) * 2 + n(s.threes) * 3;
  const fgm = n(s.twos) + n(s.threes);
  const fga = n(s.twosAttempted) + n(s.threesAttempted);

  const gs =
    pts +
    0.4 * fgm -
    0.7 * fga +
    0.7 * n(s.offReb) +
    0.3 * n(s.defReb) +
    n(s.stl) +
    0.7 * n(s.ast) +
    0.7 * n(s.blk) -
    0.4 * n(s.fouls) -
    n(s.tov);

  return Math.round(gs * 10) / 10;
}
