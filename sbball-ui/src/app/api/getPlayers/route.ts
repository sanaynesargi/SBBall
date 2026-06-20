import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const rows = await query("SELECT * FROM players ORDER BY id");
    return NextResponse.json({ data: rows });
  } catch (err) {
    return NextResponse.json({ error: String(err) });
  }
}
