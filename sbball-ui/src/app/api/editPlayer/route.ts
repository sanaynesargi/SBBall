import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    await query(
      `UPDATE players SET
         "playerName" = $1,
         jersey = $2,
         position = $3,
         "secPosition" = $4,
         height = $5,
         nickname = $6
       WHERE id = $7`,
      [body.name, body.jersey, body.position, body.secPosition, body.height, body.nickname, body.id]
    );
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) });
  }
}
