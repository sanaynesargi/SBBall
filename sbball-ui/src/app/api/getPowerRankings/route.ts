import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { statsTable } from "@/lib/statHelpers";
import { computePowerRankings, PlayerSeriesLine } from "@/lib/powerRanking";

export const dynamic = "force-dynamic";

// Per-series (or all-time) player POWER RANKING. Blends a recency-weighted,
// shrunk Game Score with a shrunk win rate — see src/lib/powerRanking.ts for
// the math. Playoffs support an optional ?series=N filter (mirrors
// getPlayerAverages); regular season ignores series.
export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const mode = params.get("mode") ?? "2v2";
  const seriesParam = params.get("series");
  const pc = mode === "2v2" ? 2 : 4;
  const table = statsTable(mode);

  const queryParams: unknown[] = [pc];
  let seriesClause = "";
  if (seriesParam && seriesParam !== "all" && mode !== "2v2") {
    queryParams.push(Number(seriesParam));
    seriesClause = ` AND games.series = $${queryParams.length}`;
  }

  try {
    // One row per (player, game): the game's stored GMSC (rating), the game id
    // (for chronological ordering), the game's winner, and the team lists so we
    // can tell whether this player won. team1/team2 are ";"-separated names.
    const rows = await query<{
      playerName: string;
      gameId: number;
      rating: number;
      winner: number | null;
      team1: string;
      team2: string;
    }>(
      `SELECT s."playerName", s."gameId", s.rating,
              games.winner, games.team1, games.team2
       FROM ${table} s
       INNER JOIN games ON s."gameId" = games.id
       WHERE games."playerCount" = $1${seriesClause}
       ORDER BY s."gameId" ASC`,
      queryParams
    );

    // Aggregate into per-player series lines (GMSC in chronological order + W/L).
    const byPlayer = new Map<string, PlayerSeriesLine>();
    for (const r of rows) {
      let line = byPlayer.get(r.playerName);
      if (!line) {
        line = { player: r.playerName, gmscByGame: [], wins: 0, games: 0 };
        byPlayer.set(r.playerName, line);
      }
      line.gmscByGame.push(Number(r.rating) || 0);
      line.games += 1;

      // Determine which team the player was on and whether that team won.
      const onTeam1 = r.team1?.split(";").includes(r.playerName);
      const playerTeam = onTeam1 ? 1 : 2;
      if (r.winner != null && r.winner === playerTeam) line.wins += 1;
    }

    const data = computePowerRankings(Array.from(byPlayer.values()));
    return NextResponse.json({ data });
  } catch (err) {
    return NextResponse.json({ error: String(err) });
  }
}
