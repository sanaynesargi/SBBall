import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    await query(
      `INSERT INTO players ("playerName", jersey, position, "secPosition", height, nickname)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [body.name, body.jersey, body.position, body.secPosition, body.height, body.nickname]
    );
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) });
  }
}
