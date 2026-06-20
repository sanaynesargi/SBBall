import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const player = req.nextUrl.searchParams.get("player");
  if (!player) {
    return NextResponse.json({ error: "Invalid Request" });
  }
  try {
    const rows = await query(
      'SELECT * FROM players WHERE "playerName" = $1',
      [player]
    );
    return NextResponse.json({ data: rows });
  } catch (err) {
    return NextResponse.json({ error: String(err) });
  }
}
