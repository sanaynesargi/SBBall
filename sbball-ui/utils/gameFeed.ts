// Shared model for the live/persisted game feed (play-by-play).
//
// Feed rows are stored in game_feed (4v4/playoffs) and game_feed2 (2v2/regular)
// with a free-text `desc` plus running stat snapshots. getStatDataFromDesc()
// classifies a row from its description so the UI knows which snapshot to show.
// It understands BOTH the new live descriptions defined here and the historical
// generated ones (which embed a shot distance like 17').

export type FeedEventType =
  | "make2"
  | "miss2"
  | "make3"
  | "miss3"
  | "ft"
  | "ast"
  | "oreb"
  | "dreb"
  | "stl"
  | "blk"
  | "clock_start"
  | "clock_stop";

// updateStats() field -> feed event type. Fields not listed here (tov, fouls,
// twosAttempted handled below) are simply not recorded in the feed because the
// feed tables have no snapshot column for them.
export const FIELD_TO_FEED_TYPE: Record<string, FeedEventType> = {
  twos: "make2",
  twosAttempted: "miss2",
  threes: "make3",
  threesAttempted: "miss3",
  fts: "ft",
  ast: "ast",
  offReb: "oreb",
  defReb: "dreb",
  stl: "stl",
  blk: "blk",
};

export function describeFeedEvent(type: FeedEventType): string {
  switch (type) {
    case "make2":
      return "made a 2-pointer";
    case "miss2":
      return "missed a 2-pointer";
    case "make3":
      return "made a 3-pointer";
    case "miss3":
      return "missed a 3-pointer";
    case "ft":
      return "made a free throw";
    case "ast":
      return "assisted a basket";
    case "oreb":
      return "grabbed an offensive rebound";
    case "dreb":
      return "grabbed a defensive rebound";
    case "stl":
      return "came up with a steal";
    case "blk":
      return "swatted a block";
    case "clock_start":
      return "Clock started";
    case "clock_stop":
      return "Clock stopped";
  }
}

// Clock/system events (clock start/stop, timeouts) aren't tied to a player and
// render as a centered row.
export function isClockEvent(entry: any): boolean {
  const t = entry?.type;
  if (typeof t === "string" && (t.startsWith("clock") || t === "timeout"))
    return true;
  const d = String(entry?.desc ?? "").toLowerCase();
  return d.startsWith("clock") || d.startsWith("timeout");
}

export interface FeedEntry {
  type?: FeedEventType;
  team?: number;
  playerName: string;
  desc: string;
  score: string;
  snapshotPts: number;
  snapshotAst: number;
  snapshotOffReb: number;
  snapshotDefReb: number;
  snapshotBlk: number;
  snapshotStl: number;
}

export interface FeedDisplay {
  stat1Name: string | null;
  stat2Name: string | null;
  stat1Num: number | null;
  stat2Num: number | null;
}

export function getStatDataFromDesc(entry: any): FeedDisplay {
  const desc = String(entry?.desc ?? "").toLowerCase();
  const r: FeedDisplay = {
    stat1Name: null,
    stat2Name: null,
    stat1Num: null,
    stat2Num: null,
  };

  if (desc.includes("assisted")) {
    r.stat1Name = "ast";
    r.stat2Name = "pt";
    r.stat1Num = entry.snapshotAst;
    r.stat2Num = entry.snapshotPts;
  } else if (desc.includes("steal") || desc.includes("swipe")) {
    r.stat1Name = "stl";
    r.stat1Num = entry.snapshotStl;
  } else if (desc.includes("block") || desc.includes("rejection")) {
    r.stat1Name = "blk";
    r.stat1Num = entry.snapshotBlk;
  } else if (desc.includes("offensive")) {
    r.stat1Name = "oreb";
    r.stat2Name = "dreb";
    r.stat1Num = entry.snapshotOffReb;
    r.stat2Num = entry.snapshotDefReb;
  } else if (desc.includes("defensive")) {
    r.stat1Name = "dreb";
    r.stat2Name = "oreb";
    r.stat1Num = entry.snapshotDefReb;
    r.stat2Num = entry.snapshotOffReb;
  } else if (
    desc.includes("free throw") ||
    desc.includes("pointer") ||
    desc.includes("'")
  ) {
    // A shot (made or missed), incl. historical "17' pull-up jumper" form.
    r.stat1Name = "pt";
    r.stat2Name = "ast";
    r.stat1Num = entry.snapshotPts;
    r.stat2Num = entry.snapshotAst;
  }

  return r;
}
