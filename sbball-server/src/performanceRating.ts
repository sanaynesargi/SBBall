const playoffRatingSystem: any = {
  baseWeights: {
    points: 0.1,
    offensiveRebounds: 0.2,
    defensiveRebounds: 0.15,
    assists: 0.3,
    steals: 0.5,
    blocks: 0.5,
    threePointersMade: 0.3,
  },
  bonuses: {
    doubleDouble: 2,
    tripleDouble: 4,
    scoring: {
      20: 0.5,
      30: 0.5,
      40: 1,
      50: 2,
    },
    rebounds: {
      20: 2,
      30: 4,
    },
    assists: {
      5: 0.5,
      10: 1.5,
    },
    threePointers: {
      5: 0.5,
      10: 2,
    },
  },
};

const regularSeasonRatingSystem: any = {
  baseWeights: {
    points: 0.1,
    offensiveRebounds: 0.2,
    defensiveRebounds: 0.15,
    assists: 0.3,
    steals: 0.5,
    blocks: 0.5,
    threePointersMade: 0.3,
  },
  efficiencyMetrics: {
    turnovers: -0.1, // Penalty per turnover
    fieldGoalPercentage: 1.7, // Multiplier for FG% (e.g., 50% = +0.75)
    threePointPercentage: 1.0, // Multiplier for 3P% (e.g., 40% = +0.4)
  },
  bonuses: {
    doubleDouble: 2,
    tripleDouble: 4,
    scoring: {
      20: 0.5,
      30: 0.5,
      40: 1,
      50: 2,
    },
    rebounds: {
      20: 2,
      30: 4,
    },
    assists: {
      5: 0.5,
      10: 1.5,
    },
    threePointers: {
      5: 0.5,
      10: 2,
    },
  },
};

export function calculateRating(stats, isPlayoff) {
  const ratingSystem = isPlayoff
    ? playoffRatingSystem
    : regularSeasonRatingSystem;

  const [
    pts,
    oreb,
    dreb,
    ast,
    stl,
    blk,
    threePm,
    fgPercent,
    threePPercent,
    to,
  ] = stats;

  // Base weight calculations
  let rating =
    pts * ratingSystem.baseWeights.points +
    oreb * ratingSystem.baseWeights.offensiveRebounds +
    dreb * ratingSystem.baseWeights.defensiveRebounds +
    ast * ratingSystem.baseWeights.assists +
    stl * ratingSystem.baseWeights.steals +
    blk * ratingSystem.baseWeights.blocks +
    threePm * ratingSystem.baseWeights.threePointersMade;

  // Efficiency metrics for regular season
  if (!isPlayoff) {
    // Turnover penalty
    rating += to * ratingSystem.efficiencyMetrics.turnovers;
    // Field Goal percentage bonus
    rating +=
      (fgPercent / 100) * ratingSystem.efficiencyMetrics.fieldGoalPercentage;
    // Three-point percentage bonus
    rating +=
      (threePPercent / 100) *
      ratingSystem.efficiencyMetrics.threePointPercentage;
  }

  // Bonuses
  // Double-Double Bonus
  if (pts >= 10 && oreb + dreb >= 10)
    rating += ratingSystem.bonuses.doubleDouble;
  // Triple-Double Bonus
  if (pts >= 10 && oreb + dreb >= 10 && ast >= 10)
    rating += ratingSystem.bonuses.tripleDouble;

  // Scoring Bonus
  if (pts >= 50) rating += ratingSystem.bonuses.scoring[50];
  else if (pts >= 40) rating += ratingSystem.bonuses.scoring[40];
  else if (pts >= 30) rating += ratingSystem.bonuses.scoring[30];
  else if (pts >= 20) rating += ratingSystem.bonuses.scoring[20];

  // Rebound Bonus
  if (oreb + dreb >= 30) rating += ratingSystem.bonuses.rebounds[30];
  else if (oreb + dreb >= 20) rating += ratingSystem.bonuses.rebounds[20];

  // Assist Bonus
  if (ast >= 10) rating += ratingSystem.bonuses.assists[10];
  else if (ast >= 5) rating += ratingSystem.bonuses.assists[5];

  // Three-Point Bonus
  if (threePm >= 10) rating += ratingSystem.bonuses.threePointers[10];
  else if (threePm >= 5) rating += ratingSystem.bonuses.threePointers[5];

  return rating;
}

// // Example usage:
// const stats1 = [32, 3, 4, 1, 2, 1, 8, 50, 40, 3]; // Regular-season example
// const stats2 = [28, 12, 15, 5, 2, 3, 6, 45, 35, 4]; // Playoff example

// console.log("Regular Season Rating:", calculateRating(stats1, false)); // false for regular season
// console.log("Playoff Rating:", calculateRating(stats2, true)); // true for playoff
