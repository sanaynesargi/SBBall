import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { aggregateStatColumns, statsTable } from "@/lib/statHelpers";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const mode = req.nextUrl.searchParams.get("mode") ?? "2v2";
  const pc = mode === "2v2" ? 2 : 4;
  const table = statsTable(mode);

  try {
    const rows = await query<any>(
      `SELECT "playerName", ${aggregateStatColumns(mode)}
       FROM ${table} INNER JOIN games ON "gameId" = games.id
       WHERE "playerCount" = $1
       GROUP BY "playerName"`,
      [pc]
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
