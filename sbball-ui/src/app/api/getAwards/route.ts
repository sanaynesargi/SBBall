import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const player = req.nextUrl.searchParams.get("player");
  if (!player) {
    return NextResponse.json({ error: true, message: "Invalid Request" });
  }
  try {
    const rows = await query<{ name: string; winnerName: string; timesWon: number }>(
      'SELECT * FROM awards WHERE "winnerName" = $1',
      [player]
    );
    const beautified = rows.map((r) => [r.name, r.winnerName, r.timesWon]);
    return NextResponse.json({ awards: beautified });
  } catch (err) {
    return NextResponse.json({ error: String(err) });
  }
}
