import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import {
  aggregateStatColumns,
  calculateImpressiveIndex,
  getTopStats,
  hasFreeThrows,
  statsTable,
} from "@/lib/statHelpers";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const mode = params.get("mode");
  const playerName = params.get("playerName");
  const pc = mode === "2v2" ? 2 : 4;

  if (!playerName || !mode) {
    return NextResponse.json({ error: true, message: "Invalid Request" });
  }

  const table = statsTable(mode);
  const fts = hasFreeThrows(mode) ? "+ (fts * 1)" : "";

  try {
    const avgRows = await query<any>(
      `SELECT "playerName", ${aggregateStatColumns(mode)}
       FROM ${table} INNER JOIN games ON "gameId" = games.id
       WHERE "playerCount" = $1 AND "playerName" = $2
       GROUP BY "playerName"`,
      [pc, playerName]
    );

    const avgRow = avgRows[0];
    if (!avgRow) {
      return NextResponse.json({ data: [] });
    }

    const avg = {
      player: avgRow.playerName,
      pts: avgRow.pts,
      reb: avgRow.reb,
      ast: avgRow.ast,
      stl: avgRow.stl,
      blk: avgRow.blk,
      tov: avgRow.tov,
      fg: 75,
    };

    const weights: Record<string, number> = {
      pts: 1.0,
      reb: 0.6,
      ast: 1.5,
      stl: 1.8,
      blk: 1.8,
      tov: -0.5,
      fg: 0.9,
    };

    const rows = await query<any>(
      `SELECT "playerName", (twos * 2) + (threes * 3) ${fts} AS pts,
        "offReb", "defReb", ast, blk, stl, tov,
        "twosAttempted", twos, "threesAttempted", threes, date, rating
       FROM ${table} INNER JOIN games ON "gameId" = games.id
       WHERE "playerCount" = $1 AND "playerName" = $2`,
      [pc, playerName]
    );

    if (rows.length === 0) {
      return NextResponse.json({ data: [], dataFull: [] });
    }

    const dataObj: any[] = [];
    const dataFull: any[] = [];

    for (const row of rows) {
      const obj = {
        player: Math.round(row.playerName),
        pts: Math.round(row.pts),
        reb: Math.round(row.offReb + row.defReb),
        ast: Math.round(row.ast),
        stl: Math.round(row.stl),
        blk: Math.round(row.blk),
        tov: Math.round(row.tov),
        twos: Math.round(row.twos),
        date: row.date,
        threes: Math.round(row.threes),
        twosAttempted: Math.round(row.twosAttempted),
        threesAttempted: Math.round(row.threesAttempted),
        fg: (
          ((row.twos + row.threes) /
            (row.twosAttempted + row.threesAttempted)) *
          100
        ).toFixed(2),
      };

      const impressiveIndex = calculateImpressiveIndex(obj as any, weights, avg as any);
      const topStats = getTopStats(obj as any, impressiveIndex);
      const finalStats = { pts: obj.pts, ...topStats, rating: row.rating };

      dataObj.push({ ...finalStats, date: obj.date });
      dataFull.push({ ...obj, rating: row.rating });
    }

    return NextResponse.json({
      data: dataObj.reverse(),
      dataFull: dataFull.reverse(),
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) });
  }
}
