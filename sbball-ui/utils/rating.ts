// Color tiers for the Game Score (GMSC) metric. Tuned to this app's
// high-scoring pickup games (typical great games land in the 20s-30s).
export function gameScoreColor(gs: number): string {
  if (gs >= 22) return "accent.400"; // elite
  if (gs >= 12) return "warn.500"; // strong
  if (gs >= 4) return "text.muted"; // solid
  return "neg.500"; // quiet / inefficient game
}
