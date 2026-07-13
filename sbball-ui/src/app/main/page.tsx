"use client";
import {
  Table,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
  useToast,
  VStack,
  HStack,
  Box,
  Flex,
  Text,
  Heading,
  Button,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Tooltip,
} from "@chakra-ui/react";
import { useEffect, useState, type ReactNode } from "react";
import Layout from "../../../components/Layout.tsx";
import axios from "axios";
import { apiUrl } from "../../../utils/apiUrl.tsx";
import Link from "next/link";

const TableCard = ({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: ReactNode;
}) => (
  <Box
    w="100%"
    bg="bg.card"
    border="1px solid"
    borderColor="border.subtle"
    borderRadius="card"
    overflow="hidden"
  >
    <Flex
      align="baseline"
      justify="space-between"
      px={{ base: 4, md: 5 }}
      py={3}
      borderBottom="1px solid"
      borderColor="border.subtle"
    >
      <Heading fontSize={{ base: "md", md: "lg" }}>{title}</Heading>
      {hint && (
        <Text fontSize="xs" color="text.faint" letterSpacing="0.06em">
          {hint}
        </Text>
      )}
    </Flex>
    <Box overflowX="auto" px={{ base: 1, md: 2 }} py={1}>
      {children}
    </Box>
  </Box>
);

const sortableThProps = {
  cursor: "pointer",
  userSelect: "none" as const,
  whiteSpace: "nowrap" as const,
  _hover: { color: "text.primary" },
};

const numTd = {
  fontVariantNumeric: "tabular-nums",
  fontWeight: 600,
  textAlign: "end" as const,
};

// Numeric headers must be end-aligned too — `isNumeric` doesn't apply alignment
// under `variant="unstyled"`, so set it explicitly to keep headers over values.
const numTh = {
  ...sortableThProps,
  textAlign: "end" as const,
};

// Sortable table header that shows the stat's full name on hover.
const HeadCell = ({
  label,
  full,
  onClick,
  numeric = true,
}: {
  label: string;
  full: string;
  onClick: () => void;
  numeric?: boolean;
}) => (
  <Tooltip
    label={full}
    hasArrow
    placement="top"
    openDelay={150}
    fontSize="xs"
    bg="bg.card"
    color="text.primary"
    border="1px solid"
    borderColor="border.subtle"
    px={2.5}
    py={1.5}
  >
    <Th {...(numeric ? numTh : sortableThProps)} onClick={onClick}>
      {label}
    </Th>
  </Tooltip>
);

const SortableTable = ({
  data,
  defaultSortColumn,
  defaultSortColumn2,
  defaultSortColumn3,
  defaultSortOrder,
}: any) => {
  const [sortBy, setSortBy] = useState(defaultSortColumn);
  const [sortOrder, setSortOrder] = useState(defaultSortOrder);

  const [sortBy2, setSortBy2] = useState(defaultSortColumn2);
  const [sortOrder2, setSortOrder2] = useState(defaultSortOrder);

  const [sortBy3, setSortBy3] = useState(defaultSortColumn3);
  const [sortOrder3, setSortOrder3] = useState(defaultSortOrder);

  const handleSort = (column: any) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  };

  const handleSort2 = (column: any) => {
    if (sortBy2 === column) {
      setSortOrder2(sortOrder2 === "asc" ? "desc" : "asc");
    } else {
      setSortBy2(column);
      setSortOrder2("asc");
    }
  };

  const handleSort3 = (column: any) => {
    if (sortBy3 === column) {
      setSortOrder3(sortOrder3 === "asc" ? "desc" : "asc");
    } else {
      setSortBy3(column);
      setSortOrder3("asc");
    }
  };

  useEffect(() => {
    setSortBy(defaultSortColumn);
    setSortOrder(defaultSortOrder);
  }, [defaultSortColumn, defaultSortOrder]);

  useEffect(() => {
    setSortBy2(defaultSortColumn2);
    setSortOrder2(defaultSortOrder);
  }, [defaultSortColumn2, defaultSortOrder]);

  useEffect(() => {
    setSortBy3(defaultSortColumn3);
    setSortOrder3(defaultSortOrder);
  }, [defaultSortColumn3, defaultSortOrder]);

  const sortedData = data.slice().sort((a: any, b: any) => {
    if (sortBy) {
      if (a[sortBy] < b[sortBy]) {
        return sortOrder === "asc" ? -1 : 1;
      }
      if (a[sortBy] > b[sortBy]) {
        return sortOrder === "asc" ? 1 : -1;
      }
    }
    return 0;
  });

  const sortedData2 = data.slice().sort((a: any, b: any) => {
    if (sortBy) {
      if (a[sortBy2] < b[sortBy2]) {
        return sortOrder2 === "asc" ? -1 : 1;
      }
      if (a[sortBy2] > b[sortBy2]) {
        return sortOrder2 === "asc" ? 1 : -1;
      }
    }
    return 0;
  });

  const sortedData3 = data.slice().sort((a: any, b: any) => {
    if (sortBy) {
      if (a[sortBy3] < b[sortBy3]) {
        return sortOrder3 === "asc" ? -1 : 1;
      }
      if (a[sortBy3] > b[sortBy3]) {
        return sortOrder3 === "asc" ? 1 : -1;
      }
    }
    return 0;
  });

  const PlayerTd = ({ name }: { name: string }) => (
    <Td
      fontFamily="heading"
      fontWeight={800}
      color="text.primary"
      whiteSpace="nowrap"
    >
      {name}
    </Td>
  );

  return (
    <VStack spacing={5} w="100%" align="stretch">
      <TableCard title="Averages" hint="PER GAME">
        <Table size="sm" variant="unstyled">
          <Thead>
            <Tr>
              <HeadCell label="Player" full="Player" numeric={false} onClick={() => handleSort("player")} />
              <HeadCell label="PTS" full="Points" onClick={() => handleSort("pts")} />
              <HeadCell label="REB" full="Rebounds" onClick={() => handleSort("reb")} />
              <HeadCell label="AST" full="Assists" onClick={() => handleSort("ast")} />
              <HeadCell label="STL" full="Steals" onClick={() => handleSort("stl")} />
              <HeadCell label="BLK" full="Blocks" onClick={() => handleSort("blk")} />
              <HeadCell label="MPG" full="Minutes per game" onClick={() => handleSort("min")} />
            </Tr>
          </Thead>
          <Tbody>
            {sortedData.map((row: any, index: number) => (
              <Tr key={index} _hover={{ bg: "bg.hover" }}>
                <PlayerTd name={row.player} />
                <Td {...numTd} color="accent.400">
                  {row.pts.toFixed(1)}
                </Td>
                <Td {...numTd}>{row.reb.toFixed(1)}</Td>
                <Td {...numTd}>{row.ast.toFixed(1)}</Td>
                <Td {...numTd}>{row.stl.toFixed(1)}</Td>
                <Td {...numTd}>{row.blk.toFixed(1)}</Td>
                <Td {...numTd} color="text.muted">
                  {row.min == null ? "—" : row.min.toFixed(1)}
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableCard>

      <TableCard title="Shooting" hint="MAKES / ATTEMPTS">
        <Table size="sm" variant="unstyled">
          <Thead>
            <Tr>
              <HeadCell label="Player" full="Player" numeric={false} onClick={() => handleSort3("player")} />
              <HeadCell label="FGM" full="Field goals made / game" onClick={() => handleSort3("fgA")} />
              <HeadCell label="FGA" full="Field goals attempted / game" onClick={() => handleSort3("fgM")} />
              <HeadCell label="2PM" full="2-pointers made / game" onClick={() => handleSort3("tpfgM")} />
              <HeadCell label="2PA" full="2-pointers attempted / game" onClick={() => handleSort3("tpfgA")} />
              <HeadCell label="3PM" full="3-pointers made / game" onClick={() => handleSort3("ttpfgM")} />
              <HeadCell label="3PA" full="3-pointers attempted / game" onClick={() => handleSort3("ttpfgA")} />
            </Tr>
          </Thead>
          <Tbody>
            {sortedData.map((row: any, index: number) => (
              <Tr key={index} _hover={{ bg: "bg.hover" }}>
                <PlayerTd name={row.player} />
                <Td {...numTd}>{row.fgM.toFixed(1)}</Td>
                <Td {...numTd}>{row.fgA.toFixed(1)}</Td>
                <Td {...numTd}>{row.tpfgM.toFixed(1)}</Td>
                <Td {...numTd}>{row.tpfgA.toFixed(1)}</Td>
                <Td {...numTd}>{row.ttpfgM.toFixed(1)}</Td>
                <Td {...numTd}>{row.ttpfgA.toFixed(1)}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableCard>

      <TableCard title="Efficiency" hint="PERCENTAGES">
        <Table size="sm" variant="unstyled">
          <Thead>
            <Tr>
              <HeadCell label="Player" full="Player" numeric={false} onClick={() => handleSort2("player")} />
              <HeadCell label="FG%" full="Field goal percentage" onClick={() => handleSort2("fg")} />
              <HeadCell label="3P%" full="3-point percentage" onClick={() => handleSort2("tp")} />
              <HeadCell label="TOV" full="Turnovers / game" onClick={() => handleSort2("tov")} />
            </Tr>
          </Thead>
          <Tbody>
            {sortedData2.map((row: any, index: number) => (
              <Tr key={index} _hover={{ bg: "bg.hover" }}>
                <PlayerTd name={row.player} />
                <Td {...numTd}>{row.fg.toFixed(2)}</Td>
                <Td {...numTd}>{row.tp.toFixed(2)}</Td>
                <Td {...numTd}>{row.tov.toFixed(1)}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableCard>
    </VStack>
  );
};

const ModeToggle = ({
  mode,
  onToggle,
}: {
  mode: boolean;
  onToggle: () => void;
}) => (
  <Flex
    bg="bg.surface"
    border="1px solid"
    borderColor="border.subtle"
    borderRadius="full"
    p={1}
    gap={1}
  >
    {[
      { label: "Regular", active: !mode },
      { label: "Playoffs", active: mode },
    ].map((opt) => (
      <Flex
        key={opt.label}
        px={{ base: 4, md: 5 }}
        h="36px"
        align="center"
        borderRadius="full"
        cursor="pointer"
        fontWeight={700}
        fontSize="sm"
        color={opt.active ? "accent.fg" : "text.muted"}
        bg={opt.active ? "accent.500" : "transparent"}
        onClick={() => {
          if (!opt.active) onToggle();
        }}
        transition="all 0.15s"
      >
        {opt.label}
      </Flex>
    ))}
  </Flex>
);

const SeriesPill = ({
  label,
  hint,
  active,
  onClick,
}: {
  label: string;
  hint?: string;
  active: boolean;
  onClick: () => void;
}) => (
  <Flex
    px={3}
    h="32px"
    align="center"
    gap={1.5}
    borderRadius="full"
    cursor="pointer"
    fontSize="sm"
    fontWeight={700}
    border="1px solid"
    borderColor={active ? "accent.500" : "border.subtle"}
    bg={active ? "accent.500" : "bg.surface"}
    color={active ? "accent.fg" : "text.muted"}
    _hover={active ? {} : { color: "text.primary", borderColor: "accent.500" }}
    onClick={onClick}
  >
    {label}
    {hint ? (
      <Box as="span" fontSize="xs" opacity={0.7}>
        ({hint})
      </Box>
    ) : null}
  </Flex>
);

// "6'3\"" / "6’3”" -> inches. Returns null if unparseable.
const parseHeightInches = (h?: string): number | null => {
  if (!h) return null;
  const m = String(h).match(/(\d+)\D+(\d+)/);
  if (m) return parseInt(m[1]) * 12 + parseInt(m[2]);
  const single = String(h).match(/(\d+)/);
  return single ? parseInt(single[1]) : null;
};

const EmptyCard = ({ children }: { children: ReactNode }) => (
  <Flex
    h="200px"
    align="center"
    justify="center"
    textAlign="center"
    px={6}
    color="text.faint"
    bg="bg.card"
    border="1px solid"
    borderColor="border.subtle"
    borderRadius="card"
  >
    {children}
  </Flex>
);

const NORM_COLS = ["pts", "reb", "ast", "stl", "blk"] as const;
const NORM_FULL: Record<string, string> = {
  pts: "Points",
  reb: "Rebounds",
  ast: "Assists",
  stl: "Steals",
  blk: "Blocks",
};

// "Just for fun" per-unit table: stats divided by height (inches) or weight (lbs).
const NormalizedTable = ({
  rows,
  unit,
}: {
  rows: any[];
  unit: "inch" | "pound";
}) => {
  const [sortBy, setSortBy] = useState<string>("pts");
  const [order, setOrder] = useState<"asc" | "desc">("desc");
  const handle = (c: string) => {
    if (sortBy === c) setOrder((o) => (o === "asc" ? "desc" : "asc"));
    else {
      setSortBy(c);
      setOrder("desc");
    }
  };
  const sorted = [...rows].sort((a, b) => {
    if (sortBy === "player")
      return order === "desc"
        ? String(b.player).localeCompare(a.player)
        : String(a.player).localeCompare(b.player);
    return order === "desc" ? b[sortBy] - a[sortBy] : a[sortBy] - b[sortBy];
  });

  return (
    <TableCard
      title={unit === "inch" ? "Inch for Inch" : "Pound for Pound"}
      hint={unit === "inch" ? "PER INCH OF HEIGHT" : "PER POUND"}
    >
      <Table size="sm" variant="unstyled">
        <Thead>
          <Tr>
            <HeadCell label="Player" full="Player" numeric={false} onClick={() => handle("player")} />
            {NORM_COLS.map((k) => (
              <HeadCell
                key={k}
                label={k.toUpperCase()}
                full={`${NORM_FULL[k]} per ${unit === "inch" ? "inch" : "lb"}`}
                onClick={() => handle(k)}
              />
            ))}
          </Tr>
        </Thead>
        <Tbody>
          {sorted.map((r, i) => (
            <Tr key={i} _hover={{ bg: "bg.hover" }}>
              <Td
                fontFamily="heading"
                fontWeight={800}
                color="text.primary"
                whiteSpace="nowrap"
              >
                {r.player}
              </Td>
              {NORM_COLS.map((k, ci) => (
                <Td key={k} {...numTd} color={ci === 0 ? "accent.400" : undefined}>
                  {r[k].toFixed(3)}
                </Td>
              ))}
            </Tr>
          ))}
        </Tbody>
      </Table>
    </TableCard>
  );
};

// Per-player shot-type splits: how points/attempts distribute across 2PT/3PT/FT.
const ShotMixTable = ({ data }: { data: any[] }) => {
  const rows = data.map((r) => {
    const p2 = (r.tpfgM || 0) * 2;
    const p3 = (r.ttpfgM || 0) * 3;
    const pts = r.pts || 0;
    const ft = Math.max(0, pts - (p2 + p3));
    return {
      player: r.player,
      pct2: pts ? (p2 / pts) * 100 : 0,
      pct3: pts ? (p3 / pts) * 100 : 0,
      pctFt: pts ? (ft / pts) * 100 : 0,
      threeRate: r.fgA ? (r.ttpfgA / r.fgA) * 100 : 0,
    };
  });
  const [sortBy, setSortBy] = useState<string>("pct3");
  const [order, setOrder] = useState<"asc" | "desc">("desc");
  const handle = (c: string) => {
    if (sortBy === c) setOrder((o) => (o === "asc" ? "desc" : "asc"));
    else {
      setSortBy(c);
      setOrder("desc");
    }
  };
  const sorted = [...rows].sort((a: any, b: any) => {
    if (sortBy === "player")
      return order === "desc"
        ? String(b.player).localeCompare(a.player)
        : String(a.player).localeCompare(b.player);
    return order === "desc" ? b[sortBy] - a[sortBy] : a[sortBy] - b[sortBy];
  });
  const cols = [
    { k: "pct2", label: "2PT%", full: "% of points from 2-pointers" },
    { k: "pct3", label: "3PT%", full: "% of points from 3-pointers" },
    { k: "pctFt", label: "FT%", full: "% of points from free throws" },
    { k: "threeRate", label: "3PA RATE", full: "3-point attempt rate (share of FGA)" },
  ];
  return (
    <TableCard title="Shot Mix" hint="% OF POINTS · 3PA RATE">
      <Table size="sm" variant="unstyled">
        <Thead>
          <Tr>
            <HeadCell label="Player" full="Player" numeric={false} onClick={() => handle("player")} />
            {cols.map((c) => (
              <HeadCell key={c.k} label={c.label} full={c.full} onClick={() => handle(c.k)} />
            ))}
          </Tr>
        </Thead>
        <Tbody>
          {sorted.map((r: any, i: number) => (
            <Tr key={i} _hover={{ bg: "bg.hover" }}>
              <Td fontFamily="heading" fontWeight={800} whiteSpace="nowrap">
                {r.player}
              </Td>
              <Td {...numTd}>{r.pct2.toFixed(0)}%</Td>
              <Td {...numTd} color="accent.400">
                {r.pct3.toFixed(0)}%
              </Td>
              <Td {...numTd}>{r.pctFt.toFixed(0)}%</Td>
              <Td {...numTd}>{r.threeRate.toFixed(0)}%</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </TableCard>
  );
};

// Advanced metrics leaderboard: Game Score, efficiency, ball movement.
const AdvancedTable = ({ data }: { data: any[] }) => {
  const rows = data.map((r) => ({
    player: r.player,
    gmsc: r.gmsc ?? 0,
    efg: r.fgA > 0 ? ((r.fgM + 0.5 * r.ttpfgM) / r.fgA) * 100 : 0,
    pps: r.fgA > 0 ? r.pts / r.fgA : 0,
    threeRate: r.fgA > 0 ? (r.ttpfgA / r.fgA) * 100 : 0,
    astTo: r.tov > 0 ? r.ast / r.tov : r.ast > 0 ? Infinity : 0,
    min: r.min,
    pm: r.pm,
  }));
  const [sortBy, setSortBy] = useState<string>("gmsc");
  const [order, setOrder] = useState<"asc" | "desc">("desc");
  const handle = (c: string) => {
    if (sortBy === c) setOrder((o) => (o === "asc" ? "desc" : "asc"));
    else {
      setSortBy(c);
      setOrder("desc");
    }
  };
  const val = (x: any) => (Number.isFinite(x) ? x : x === Infinity ? 1e9 : -1e9);
  const sorted = [...rows].sort((a: any, b: any) => {
    if (sortBy === "player")
      return order === "desc"
        ? String(b.player).localeCompare(a.player)
        : String(a.player).localeCompare(b.player);
    return order === "desc"
      ? val(b[sortBy]) - val(a[sortBy])
      : val(a[sortBy]) - val(b[sortBy]);
  });
  const num = (v: any, d = 1, suf = "") =>
    v == null ? "—" : !Number.isFinite(v) ? "∞" : `${Number(v).toFixed(d)}${suf}`;
  const cols = [
    { k: "gmsc", label: "GMSC", full: "Game Score (avg per-game performance rating)" },
    { k: "efg", label: "eFG%", full: "Effective field goal % (credits 3-pointers)" },
    { k: "pps", label: "PTS/SH", full: "Points per shot (points / FG attempt)" },
    { k: "threeRate", label: "3PA%", full: "3-point attempt rate (share of FGA)" },
    { k: "astTo", label: "AST/TO", full: "Assist-to-turnover ratio" },
    { k: "min", label: "MPG", full: "Minutes per game" },
    { k: "pm", label: "+/-", full: "Plus/minus (team point differential on court)" },
  ];
  return (
    <TableCard title="Advanced" hint="GAME SCORE · EFFICIENCY">
      <Table size="sm" variant="unstyled">
        <Thead>
          <Tr>
            <HeadCell label="Player" full="Player" numeric={false} onClick={() => handle("player")} />
            {cols.map((c) => (
              <HeadCell key={c.k} label={c.label} full={c.full} onClick={() => handle(c.k)} />
            ))}
          </Tr>
        </Thead>
        <Tbody>
          {sorted.map((r: any, i: number) => (
            <Tr key={i} _hover={{ bg: "bg.hover" }}>
              <Td fontFamily="heading" fontWeight={800} whiteSpace="nowrap">
                {r.player}
              </Td>
              <Td {...numTd} color="accent.400">
                {num(r.gmsc, 1)}
              </Td>
              <Td {...numTd}>{num(r.efg, 1, "%")}</Td>
              <Td {...numTd}>{num(r.pps, 2)}</Td>
              <Td {...numTd}>{num(r.threeRate, 0, "%")}</Td>
              <Td {...numTd}>{num(r.astTo, 2)}</Td>
              <Td {...numTd}>{num(r.min, 1)}</Td>
              <Td {...numTd}>
                {r.pm == null
                  ? "—"
                  : r.pm > 0
                  ? `+${r.pm.toFixed(1)}`
                  : r.pm.toFixed(1)}
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </TableCard>
  );
};

// Power ranking leaderboard. Blends a recency-weighted, small-sample-shrunk
// Game Score with a shrunk win rate (both z-scored), from /api/getPowerRankings.
// See src/lib/powerRanking.ts for the formulas.
const PowerTable = ({ data }: { data: any[] }) => {
  const [sortBy, setSortBy] = useState<string>("power");
  const [order, setOrder] = useState<"asc" | "desc">("desc");
  const handle = (c: string) => {
    if (sortBy === c) setOrder((o) => (o === "asc" ? "desc" : "asc"));
    else {
      setSortBy(c);
      setOrder("desc");
    }
  };
  const sorted = [...data].sort((a: any, b: any) => {
    if (sortBy === "player")
      return order === "desc"
        ? String(b.player).localeCompare(a.player)
        : String(a.player).localeCompare(b.player);
    return order === "desc" ? b[sortBy] - a[sortBy] : a[sortBy] - b[sortBy];
  });
  const num = (v: any, d = 2) => (v == null ? "—" : Number(v).toFixed(d));
  const signed = (v: number, d = 2) =>
    v > 0 ? `+${v.toFixed(d)}` : v.toFixed(d);
  const cols = [
    { k: "power", label: "PWR", full: "Power score: blend of recency-weighted Game Score and win rate, z-scored across the roster (0 ≈ roster average)" },
    { k: "prodScore", label: "PROD", full: "Recency-weighted, small-sample-shrunk Game Score (production)" },
    { k: "winRate", label: "WIN%", full: "Win rate, Bayesian-shrunk toward .500 for small samples" },
    { k: "games", label: "GP", full: "Games played" },
  ];
  return (
    <TableCard title="Power Ranking" hint="PRODUCTION × WINS · RECENCY-WEIGHTED">
      <Table size="sm" variant="unstyled">
        <Thead>
          <Tr>
            <Th {...sortableThProps} onClick={() => handle("player")} textAlign="start">
              #
            </Th>
            <HeadCell label="Player" full="Player" numeric={false} onClick={() => handle("player")} />
            {cols.map((c) => (
              <HeadCell key={c.k} label={c.label} full={c.full} onClick={() => handle(c.k)} />
            ))}
          </Tr>
        </Thead>
        <Tbody>
          {sorted.map((r: any, i: number) => (
            <Tr key={r.player} _hover={{ bg: "bg.hover" }}>
              <Td sx={{ fontVariantNumeric: "tabular-nums" }} color="text.faint" fontWeight={700}>
                {i + 1}
              </Td>
              <Td fontFamily="heading" fontWeight={800} whiteSpace="nowrap">
                {r.player}
              </Td>
              <Td
                {...numTd}
                fontFamily="heading"
                color={r.power >= 0 ? "accent.400" : "text.muted"}
              >
                {signed(r.power)}
              </Td>
              <Td {...numTd}>{num(r.prodScore, 1)}</Td>
              <Td {...numTd}>{num(r.winRate * 100, 0)}%</Td>
              <Td {...numTd}>{r.games}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </TableCard>
  );
};

const Home = () => {
  const [tableData, setTableData] = useState([]);
  const [powerData, setPowerData] = useState<any[]>([]);
  const [mode, setMode] = useState(false);
  const [series, setSeries] = useState<string>("all");
  const [seriesList, setSeriesList] = useState<{ series: number; games: number }[]>([]);
  const [normalize, setNormalize] = useState<"total" | "inch" | "pound">("total");
  const [playerMeta, setPlayerMeta] = useState<
    Record<string, { h: number | null; w: number | null }>
  >({});
  const toast = useToast();

  // Player height/weight for the "just for fun" per-unit views.
  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const res = await axios.get(`${apiUrl}/api/getPlayers`);
        const map: Record<string, { h: number | null; w: number | null }> = {};
        for (const p of res.data.data ?? []) {
          map[p.playerName] = {
            h: parseHeightInches(p.height),
            w: p.weight ?? null,
          };
        }
        setPlayerMeta(map);
      } catch {}
    };
    fetchPlayers();
  }, []);

  // Available playoff series (only relevant in playoffs mode).
  useEffect(() => {
    if (!mode) {
      setSeriesList([]);
      return;
    }
    const fetchSeries = async () => {
      try {
        const res = await axios.get(`${apiUrl}/api/getSeries?mode=4v4`);
        if (!res.data.error) setSeriesList(res.data.series ?? []);
      } catch {}
    };
    fetchSeries();
  }, [mode]);

  useEffect(() => {
    const fetchPlayerData = async () => {
      const seriesQ = mode && series !== "all" ? `&series=${series}` : "";
      const playerDataReq = await axios.get(
        `${apiUrl}/api/getPlayerAverages?mode=${mode ? "4v4" : "2v2"}${seriesQ}`
      );

      const error = playerDataReq.data.error;

      if (error) {
        toast({
          title: "Error Fetching Data",
          description: `We couldn't pull your stats right now. Please try later.`,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      setTableData(playerDataReq.data.data);
    };

    fetchPlayerData();
  }, [mode, series]);

  // Power ranking (recency-weighted GMSC blended with win rate).
  useEffect(() => {
    const fetchPower = async () => {
      const seriesQ = mode && series !== "all" ? `&series=${series}` : "";
      try {
        const res = await axios.get(
          `${apiUrl}/api/getPowerRankings?mode=${mode ? "4v4" : "2v2"}${seriesQ}`
        );
        setPowerData(res.data.error ? [] : res.data.data ?? []);
      } catch {
        setPowerData([]);
      }
    };
    fetchPower();
  }, [mode, series]);

  const switchMode = () => {
    setSeries("all");
    setMode(!mode);
  };

  const normalizedRows = (() => {
    if (normalize === "total") return [] as any[];
    const out: any[] = [];
    for (const row of tableData as any[]) {
      const meta = playerMeta[row.player];
      const factor = normalize === "inch" ? meta?.h : meta?.w;
      if (!factor) continue;
      out.push({
        player: row.player,
        pts: row.pts / factor,
        reb: row.reb / factor,
        ast: row.ast / factor,
        stl: row.stl / factor,
        blk: row.blk / factor,
      });
    }
    return out;
  })();

  return (
    <Layout>
      <Flex
        direction={{ base: "column", sm: "row" }}
        align={{ base: "stretch", sm: "center" }}
        justify="space-between"
        gap={4}
        mb={6}
      >
        <Box>
          <Heading fontSize={{ base: "2xl", md: "3xl" }}>League Leaders</Heading>
          <Text color="text.muted" fontSize="sm" mt={1}>
            {mode ? "Playoff" : "Regular season"} averages
            {mode && series !== "all" ? ` · Series ${series}` : ""}
          </Text>
        </Box>
        <HStack spacing={3} justify={{ base: "space-between", sm: "flex-end" }}>
          <ModeToggle mode={mode} onToggle={switchMode} />
          <Link href="/compare" passHref legacyBehavior>
            <Button as="a" variant="surface" size="md">
              Compare
            </Button>
          </Link>
        </HStack>
      </Flex>

      {mode && seriesList.length > 0 && (
        <Flex align="center" gap={2} mb={5} wrap="wrap">
          <Text fontSize="sm" fontWeight={800} color="text.muted" mr={1}>
            By Series
          </Text>
          <SeriesPill
            label="All"
            active={series === "all"}
            onClick={() => setSeries("all")}
          />
          {seriesList.map((s) => (
            <SeriesPill
              key={s.series}
              label={`Series ${s.series}`}
              hint={`${s.games}`}
              active={series === String(s.series)}
              onClick={() => setSeries(String(s.series))}
            />
          ))}
        </Flex>
      )}

      {/* Just-for-fun per-size views */}
      <Flex align="center" gap={2} mb={5} wrap="wrap">
        <Text fontSize="sm" fontWeight={800} color="text.muted" mr={1}>
          For Fun
        </Text>
        <SeriesPill
          label="Totals"
          active={normalize === "total"}
          onClick={() => setNormalize("total")}
        />
        <SeriesPill
          label="Inch for inch"
          active={normalize === "inch"}
          onClick={() => setNormalize("inch")}
        />
        <SeriesPill
          label="Pound for pound"
          active={normalize === "pound"}
          onClick={() => setNormalize("pound")}
        />
      </Flex>

      {tableData.length === 0 ? (
        <EmptyCard>No games logged yet for this mode.</EmptyCard>
      ) : normalize === "total" ? (
        <Tabs variant="soft-rounded" colorScheme="green">
          <TabList
            gap={2}
            mb={5}
            overflowX="auto"
            sx={{ "&::-webkit-scrollbar": { display: "none" } }}
          >
            <Tab whiteSpace="nowrap">Per Game</Tab>
            <Tab whiteSpace="nowrap">Shot Mix</Tab>
            <Tab whiteSpace="nowrap">Advanced</Tab>
            <Tab whiteSpace="nowrap">Power</Tab>
          </TabList>
          <TabPanels>
            <TabPanel px={0}>
              <SortableTable
                data={tableData}
                defaultSortColumn="pts"
                defaultSortColumn2="fg"
                defaultSortColumn3="fgA"
                defaultSortOrder="desc"
              />
            </TabPanel>
            <TabPanel px={0}>
              <ShotMixTable data={tableData} />
            </TabPanel>
            <TabPanel px={0}>
              <AdvancedTable data={tableData} />
            </TabPanel>
            <TabPanel px={0}>
              {powerData.length === 0 ? (
                <EmptyCard>Not enough games logged for a power ranking.</EmptyCard>
              ) : (
                <PowerTable data={powerData} />
              )}
            </TabPanel>
          </TabPanels>
        </Tabs>
      ) : normalizedRows.length === 0 ? (
        <EmptyCard>
          {normalize === "pound"
            ? "Add player weights (edit a player in the Roster tab) to see pound-for-pound."
            : "No height data available for these players."}
        </EmptyCard>
      ) : (
        <NormalizedTable rows={normalizedRows} unit={normalize} />
      )}
    </Layout>
  );
};

export default Home;
