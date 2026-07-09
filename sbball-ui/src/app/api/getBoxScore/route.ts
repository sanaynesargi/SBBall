import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { aggregateStatColumns, statsTable } from "@/lib/statHelpers";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const mode = params.get("mode");
  const gameId = params.get("gameId");
  const pc = mode === "2v2" ? 2 : 4;

  if (!mode || !gameId) {
    return NextResponse.json({ error: true, message: "Invalid Request" });
  }

  const table = statsTable(mode);

  try {
    const games = await query<any>(
      'SELECT * FROM games WHERE "playerCount" = $1 AND id = $2',
      [pc, gameId]
    );

    if (!games || games.length === 0) {
      return NextResponse.json({ error: true, message: "No games found" });
    }

    const dataObj = await Promise.all(
      games.map(async (game) => {
        const team1Lst: string[] = game.team1.split(";");

        const performances = await query<any>(
          `SELECT "playerName", ${aggregateStatColumns(mode)}, rating,
             AVG("offReb")::float8 AS orb,
             AVG("defReb")::float8 AS drb,
             AVG(fouls)::float8 AS pf
           FROM ${table}
           WHERE "gameId" = $1
           GROUP BY "playerName", rating`,
          [game.id]
        );

        let team1Score = 0;
        let team2Score = 0;
        for (const perf of performances) {
          if (team1Lst.includes(perf.playerName)) team1Score += perf.pts;
          else team2Score += perf.pts;
        }

        return {
          gameId: game.id,
          perfs: performances,
          team1Score,
          team2Score,
          team1: game.team1,
          team2: game.team2,
          date: game.date,
        };
      })
    );

    return NextResponse.json(dataObj);
  } catch (err) {
    return NextResponse.json({ error: String(err) });
  }
}
