import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

// body.awardData: Array<[playerName, awardName]>
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data: [string, string][] = body.awardData ?? [];

    for (const award of data) {
      const playerName = award[0];
      const awardName = award[1];

      const existing = await query(
        'SELECT * FROM awards WHERE name = $1 AND "winnerName" = $2',
        [awardName, playerName]
      );

      if (existing.length > 0) {
        await query(
          'UPDATE awards SET "timesWon" = "timesWon" + 1 WHERE name = $1 AND "winnerName" = $2',
          [awardName, playerName]
        );
      } else {
        await query(
          'INSERT INTO awards (name, "winnerName", "timesWon") VALUES ($1, $2, 1)',
          [awardName, playerName]
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) });
  }
}
