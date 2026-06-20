import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

// game_feed = playoffs (4v4), game_feed2 = regular season (2v2)
export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const gameId = params.get("gameId");
  const mode = params.get("mode");

  if (!gameId || !mode) {
    return NextResponse.json({ error: true, msg: "Invalid Request" });
  }

  const table = mode !== "2v2" ? "game_feed" : "game_feed2";

  try {
    const rows = await query(
      `SELECT * FROM ${table} WHERE "gameId" = $1 ORDER BY rel_id DESC`,
      [gameId]
    );
    return NextResponse.json({ feed: rows });
  } catch (err) {
    return NextResponse.json({ err: String(err) });
  }
}
