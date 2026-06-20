import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { aggregateStatColumns, statsTable } from "@/lib/statHelpers";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const mode = params.get("mode") ?? "2v2";
  const seriesParam = params.get("series");
  const pc = mode === "2v2" ? 2 : 4;
  const table = statsTable(mode);

  // Optional playoff series filter (ignored for regular season / "all").
  const queryParams: unknown[] = [pc];
  let seriesClause = "";
  if (seriesParam && seriesParam !== "all" && mode !== "2v2") {
    queryParams.push(Number(seriesParam));
    seriesClause = ` AND games.series = $${queryParams.length}`;
  }

  try {
    const rows = await query<any>(
      `SELECT "playerName", ${aggregateStatColumns(mode)}
       FROM ${table} INNER JOIN games ON "gameId" = games.id
       WHERE "playerCount" = $1${seriesClause}
       GROUP BY "playerName"`,
      queryParams
    );

    const dataObj = rows.map((row) => ({
      player: row.playerName,
      pts: row.pts,
      reb: row.reb,
      ast: row.ast,
      stl: row.stl,
      blk: row.blk,
      tov: row.tov,
      fg: row.fg * 100,
      tp: row.ttpfgA > 0 ? (row.ttpfgM / row.ttpfgA) * 100 : 0,
      tpfgA: row.tpfgA,
      tpfgM: row.tpfgM,
      ttpfgA: row.ttpfgA,
      ttpfgM: row.ttpfgM,
      fgA: row.ttpfgA + row.tpfgA,
      fgM: row.ttpfgM + row.tpfgM,
    }));

    return NextResponse.json({ data: dataObj });
  } catch (err) {
    return NextResponse.json({ error: String(err) });
  }
}
