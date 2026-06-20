import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { calculateRating } from "@/lib/performanceRating";
import { getTodayDate, hasFreeThrows, statsTable } from "@/lib/statHelpers";

export const dynamic = "force-dynamic";

type PlayerEntry = {
  name: string;
  team: number;
  ast: number;
  blk: number;
  defReb: number;
  offReb: number;
  fouls: number;
  stl: number;
  tov: number;
  twos: number;
  twosAttempted: number;
  threes: number;
  threesAttempted: number;
  fts?: number;
};

// Per-player career averages, used to backfill the non-shooting stats when
// `averageFill` is on. Mirrors getPlayerAverages() from the old server.
async function getPlayerAverages(mode: string, playerName: string) {
  const pc = mode === "2v2" ? 2 : 4;
  const table = statsTable(mode);
  const ftsCol = hasFreeThrows(mode) ? 'AVG(fts)::float8 AS fts,' : "";

  const rows = await query<any>(
    `SELECT "playerName",
       AVG(twos)::float8 AS twos,
       AVG(threes)::float8 AS threes,
       ${ftsCol}
       AVG("offReb")::float8 AS "offReb",
       AVG("defReb")::float8 AS "defReb",
       AVG(ast)::float8 AS ast,
       AVG(blk)::float8 AS blk,
       AVG(stl)::float8 AS stl,
       AVG(tov)::float8 AS tov,
       AVG("twosAttempted")::float8 AS "twosAttempted",
       AVG("threesAttempted")::float8 AS "threesAttempted",
       AVG(fouls)::float8 AS fouls
     FROM ${table} INNER JOIN games ON "gameId" = games.id
     WHERE "playerCount" = $1 AND "playerName" = $2
     GROUP BY "playerName"`,
    [pc, playerName]
  );

  return rows[0] ?? null;
}

export async function POST(req: NextRequest) {
  try {
    const reqBody = await req.json();
    const players: PlayerEntry[] = reqBody.players;
    const averageFill: boolean = reqBody.averageFill;
    const mode: string = reqBody.mode;
    const winner = reqBody.winner;
    const isPlayoff = mode === "4v4";

    const team1: string[] = [];
    const team2: string[] = [];
    for (const p of players) {
      if (p.team === 1) team1.push(p.name);
      if (p.team === 2) team2.push(p.name);
    }

    const team1Str = team1.join(";");
    const team2Str = team2.join(";");
    const playerCount = mode === "4v4" ? 4 : team1.length;
    const date = getTodayDate();

    // Insert the game and grab its id atomically (replaces the old
    // insert-then-SELECT-MAX(id) race condition).
    const gameRows = await query<{ id: number }>(
      `INSERT INTO games (team1, team2, "playerCount", winner, date)
       VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      [team1Str, team2Str, playerCount, winner, date]
    );
    const gameId = gameRows[0].id;

    for (const p of players) {
      const ftsVal = p.fts ?? 0;

      // Rating is always computed from the player's actual line, regardless of
      // averageFill.
      const formattedPerf = [
        p.twos * 2 + p.threes * 3 + ftsVal,
        p.offReb,
        p.defReb,
        p.ast,
        p.stl,
        p.blk,
        p.threes,
        ((p.twos + p.threes) / (p.threesAttempted + p.twosAttempted)) * 100,
        (p.threes / p.threesAttempted) * 100,
        p.tov,
      ];
      const rating = calculateRating(formattedPerf, isPlayoff);

      // Base (non-shooting) stats either come straight from the entry or from
      // the player's rounded career averages.
      let ast = p.ast;
      let blk = p.blk;
      let defReb = p.defReb;
      let fouls = p.fouls;
      let offReb = p.offReb;
      let stl = p.stl;
      let tov = p.tov;

      if (averageFill) {
        const avgs = await getPlayerAverages(mode, p.name);
        if (!avgs) {
          return NextResponse.json({ error: true, message: "player doesn't exist" });
        }
        ast = Math.round(avgs.ast);
        blk = Math.round(avgs.blk);
        defReb = Math.round(avgs.defReb);
        fouls = Math.round(avgs.fouls);
        offReb = Math.round(avgs.offReb);
        stl = Math.round(avgs.stl);
        tov = Math.round(avgs.tov);
      }

      if (isPlayoff) {
        await query(
          `INSERT INTO playoff_stats
             (ast, blk, "defReb", fouls, "playerName", "offReb", stl, threes,
              "threesAttempted", tov, twos, "twosAttempted", "gameId", fts, rating)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
          [ast, blk, defReb, fouls, p.name, offReb, stl, p.threes,
           p.threesAttempted, tov, p.twos, p.twosAttempted, gameId, ftsVal, rating]
        );
      } else {
        await query(
          `INSERT INTO stats
             (ast, blk, "defReb", fouls, "playerName", "offReb", stl, threes,
              "threesAttempted", tov, twos, "twosAttempted", "gameId", rating)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
          [ast, blk, defReb, fouls, p.name, offReb, stl, p.threes,
           p.threesAttempted, tov, p.twos, p.twosAttempted, gameId, rating]
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) });
  }
}
