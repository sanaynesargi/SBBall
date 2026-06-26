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
// NOTE: free-throw *attempts* aren't tracked (only makes, and only in 4v4), so
// the standard −0.4·(FTA−FTM) missed-FT penalty is omitted. Mode-agnostic.

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
  const fts = n(s.fts);
  const pts = n(s.twos) * 2 + n(s.threes) * 3 + fts;
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
