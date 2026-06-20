import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

// Distinct playoff series with game counts, plus the current (max) series.
export async function GET(req: NextRequest) {
  const mode = req.nextUrl.searchParams.get("mode") ?? "4v4";
  const pc = mode === "2v2" ? 2 : 4;

  try {
    const rows = await query<{ series: number; games: number }>(
      `SELECT series, COUNT(*)::int AS games
       FROM games
       WHERE "playerCount" = $1
       GROUP BY series
       ORDER BY series`,
      [pc]
    );

    const current = rows.length ? Math.max(...rows.map((r) => r.series)) : 1;
    return NextResponse.json({ series: rows, current });
  } catch (err) {
    return NextResponse.json({ error: String(err) });
  }
}
