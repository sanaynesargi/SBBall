// Ported verbatim from sbball-server/src/performanceRating.ts so rating values
// stay identical after the move to Postgres. stats = [pts, oreb, dreb, ast,
// stl, blk, threePm, fgPercent, threePPercent, to].

type RatingSystem = {
  baseWeights: {
    points: number;
    offensiveRebounds: number;
    defensiveRebounds: number;
    assists: number;
    steals: number;
    blocks: number;
    threePointersMade: number;
  };
  efficiencyMetrics?: {
    turnovers: number;
    fieldGoalPercentage: number;
    threePointPercentage: number;
  };
  bonuses: {
    doubleDouble: number;
    tripleDouble: number;
    scoring: Record<number, number>;
    rebounds: Record<number, number>;
    assists: Record<number, number>;
    threePointers: Record<number, number>;
  };
};

const baseWeights = {
  points: 0.1,
  offensiveRebounds: 0.2,
  defensiveRebounds: 0.15,
  assists: 0.3,
  steals: 0.5,
  blocks: 0.5,
  threePointersMade: 0.3,
};

const bonuses = {
  doubleDouble: 2,
  tripleDouble: 4,
  scoring: { 20: 0.5, 30: 0.5, 40: 1, 50: 2 } as Record<number, number>,
  rebounds: { 20: 2, 30: 4 } as Record<number, number>,
  assists: { 5: 0.5, 10: 1.5 } as Record<number, number>,
  threePointers: { 5: 0.5, 10: 2 } as Record<number, number>,
};

const playoffRatingSystem: RatingSystem = { baseWeights, bonuses };

const regularSeasonRatingSystem: RatingSystem = {
  baseWeights,
  efficiencyMetrics: {
    turnovers: -0.1,
    fieldGoalPercentage: 1.7,
    threePointPercentage: 1.0,
  },
  bonuses,
};

export function calculateRating(stats: number[], isPlayoff: boolean): number {
  const ratingSystem = isPlayoff
    ? playoffRatingSystem
    : regularSeasonRatingSystem;

  const [pts, oreb, dreb, ast, stl, blk, threePm, fgPercent, threePPercent, to] =
    stats;

  let rating =
    pts * ratingSystem.baseWeights.points +
    oreb * ratingSystem.baseWeights.offensiveRebounds +
    dreb * ratingSystem.baseWeights.defensiveRebounds +
    ast * ratingSystem.baseWeights.assists +
    stl * ratingSystem.baseWeights.steals +
    blk * ratingSystem.baseWeights.blocks +
    threePm * ratingSystem.baseWeights.threePointersMade;

  if (!isPlayoff && ratingSystem.efficiencyMetrics) {
    rating += to * ratingSystem.efficiencyMetrics.turnovers;
    rating +=
      (fgPercent / 100) * ratingSystem.efficiencyMetrics.fieldGoalPercentage;
    rating +=
      (threePPercent / 100) *
      ratingSystem.efficiencyMetrics.threePointPercentage;
  }

  if (pts >= 10 && oreb + dreb >= 10) rating += ratingSystem.bonuses.doubleDouble;
  if (pts >= 10 && oreb + dreb >= 10 && ast >= 10)
    rating += ratingSystem.bonuses.tripleDouble;

  if (pts >= 50) rating += ratingSystem.bonuses.scoring[50];
  else if (pts >= 40) rating += ratingSystem.bonuses.scoring[40];
  else if (pts >= 30) rating += ratingSystem.bonuses.scoring[30];
  else if (pts >= 20) rating += ratingSystem.bonuses.scoring[20];

  if (oreb + dreb >= 30) rating += ratingSystem.bonuses.rebounds[30];
  else if (oreb + dreb >= 20) rating += ratingSystem.bonuses.rebounds[20];

  if (ast >= 10) rating += ratingSystem.bonuses.assists[10];
  else if (ast >= 5) rating += ratingSystem.bonuses.assists[5];

  if (threePm >= 10) rating += ratingSystem.bonuses.threePointers[10];
  else if (threePm >= 5) rating += ratingSystem.bonuses.threePointers[5];

  return rating;
}
