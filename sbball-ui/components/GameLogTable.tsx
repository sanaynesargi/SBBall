import {
  Box,
  Flex,
  Text,
  Table,
  Thead,
  Tbody,
  Tfoot,
  Tr,
  Th,
  Td,
  TableContainer,
  Avatar,
  Icon,
} from "@chakra-ui/react";
import { useMemo, useState } from "react";
import { gameScoreColor } from "../utils/rating";

// One normalized game row derived from the API's `dataFull` payload.
interface GameRow {
  i: number;
  date: string;
  pts: number;
  reb: number;
  ast: number;
  stl: number;
  blk: number;
  tov: number;
  twos: number;
  twa: number;
  threes: number;
  tha: number;
  fg: number | null;
  rating: number;
}

type SortKey =
  | "pts"
  | "reb"
  | "ast"
  | "stl"
  | "blk"
  | "tov"
  | "fg"
  | "rating"
  | null;

const num = (v: number) => Math.round(v);
const avg1 = (v: number) => (Number.isFinite(v) ? v.toFixed(1) : "—");
const pct = (v: number | null) =>
  v == null || !Number.isFinite(v) ? "—" : `${v.toFixed(1)}%`;

const headSx = {
  color: "text.faint",
  fontSize: "10px",
  letterSpacing: "0.06em",
  borderColor: "border.subtle",
  py: 2.5,
  userSelect: "none" as const,
};
const cellSx = { borderColor: "border.subtle", py: 2.5, fontSize: "sm" };

// A caret shown next to the active sort column.
const Caret = () => (
  <Icon viewBox="0 0 24 24" boxSize="10px" ml={1} color="accent.400">
    <path fill="currentColor" d="M12 15.5 5.5 9h13z" />
  </Icon>
);

// Full-width per-game log for one player, shown on desktop. Every game is a row
// with all counting + shooting stats visible (no modal needed); a footer row
// carries per-game averages. Counting-stat and GMSC/FG% headers are clickable
// to sort; DATE returns to chronological (most-recent-first) order.
export const GameLogTable = ({
  data,
  name,
}: {
  data: any[];
  name: string;
}) => {
  const [sortKey, setSortKey] = useState<SortKey>(null);

  const rows: GameRow[] = useMemo(
    () =>
      data.map((d, i) => {
        const fg = parseFloat(d.fg);
        return {
          i,
          date: d.date,
          pts: d.pts,
          reb: d.reb,
          ast: d.ast,
          stl: d.stl,
          blk: d.blk,
          tov: d.tov,
          twos: d.twos,
          twa: d.twosAttempted,
          threes: d.threes,
          tha: d.threesAttempted,
          fg: Number.isFinite(fg) ? fg : null,
          rating: d.rating,
        };
      }),
    [data]
  );

  // `data` already arrives most-recent-first; that's the default (sortKey null).
  const sorted = useMemo(() => {
    if (!sortKey) return rows;
    return [...rows].sort((a, b) => {
      const av = a[sortKey] ?? -Infinity;
      const bv = b[sortKey] ?? -Infinity;
      return (bv as number) - (av as number);
    });
  }, [rows, sortKey]);

  const totals = useMemo(() => {
    const t = {
      pts: 0,
      reb: 0,
      ast: 0,
      stl: 0,
      blk: 0,
      tov: 0,
      twos: 0,
      twa: 0,
      threes: 0,
      tha: 0,
      rating: 0,
    };
    for (const r of rows) {
      t.pts += r.pts;
      t.reb += r.reb;
      t.ast += r.ast;
      t.stl += r.stl;
      t.blk += r.blk;
      t.tov += r.tov;
      t.twos += r.twos;
      t.twa += r.twa;
      t.threes += r.threes;
      t.tha += r.tha;
      t.rating += r.rating;
    }
    return t;
  }, [rows]);

  const n = rows.length || 1;
  const totalFg = totals.twa + totals.tha;
  const seasonFgPct = totalFg ? ((totals.twos + totals.threes) / totalFg) * 100 : null;

  const cols: { key: Exclude<SortKey, null>; label: string }[] = [
    { key: "pts", label: "PTS" },
    { key: "reb", label: "REB" },
    { key: "ast", label: "AST" },
    { key: "stl", label: "STL" },
    { key: "blk", label: "BLK" },
    { key: "tov", label: "TOV" },
  ];

  const SortableTh = ({ col }: { col: { key: Exclude<SortKey, null>; label: string } }) => (
    <Th
      {...headSx}
      isNumeric
      cursor="pointer"
      _hover={{ color: "accent.400" }}
      color={sortKey === col.key ? "accent.400" : headSx.color}
      onClick={() => setSortKey(sortKey === col.key ? null : col.key)}
    >
      <Flex align="center" justify="flex-end">
        {col.label}
        {sortKey === col.key && <Caret />}
      </Flex>
    </Th>
  );

  return (
    <Box
      bg="bg.card"
      border="1px solid"
      borderColor="border.subtle"
      borderRadius="card"
      overflow="hidden"
    >
      <Flex align="center" gap={3} px={4} py={3} bg="bg.surface">
        <Avatar size="sm" bg="bg.hover" color="text.primary" name={name} />
        <Text fontFamily="heading" fontWeight={800} color="text.primary" flex="1" noOfLines={1}>
          {name}
        </Text>
        <Text color="text.muted" fontSize="sm" fontWeight={700}>
          {rows.length} game{rows.length === 1 ? "" : "s"}
        </Text>
      </Flex>

      <TableContainer>
        <Table size="sm" variant="unstyled">
          <Thead>
            <Tr>
              <Th
                {...headSx}
                textAlign="left"
                cursor="pointer"
                _hover={{ color: "accent.400" }}
                color={sortKey === null ? "accent.400" : headSx.color}
                onClick={() => setSortKey(null)}
              >
                Date
              </Th>
              {cols.map((c) => (
                <SortableTh key={c.key} col={c} />
              ))}
              <Th {...headSx} isNumeric>
                2FG
              </Th>
              <Th {...headSx} isNumeric>
                3FG
              </Th>
              <Th
                {...headSx}
                isNumeric
                cursor="pointer"
                _hover={{ color: "accent.400" }}
                color={sortKey === "fg" ? "accent.400" : headSx.color}
                onClick={() => setSortKey(sortKey === "fg" ? null : "fg")}
              >
                <Flex align="center" justify="flex-end">
                  FG%
                  {sortKey === "fg" && <Caret />}
                </Flex>
              </Th>
              <Th
                {...headSx}
                isNumeric
                cursor="pointer"
                _hover={{ color: "accent.400" }}
                color={sortKey === "rating" ? "accent.400" : headSx.color}
                onClick={() => setSortKey(sortKey === "rating" ? null : "rating")}
              >
                <Flex align="center" justify="flex-end">
                  GMSC
                  {sortKey === "rating" && <Caret />}
                </Flex>
              </Th>
            </Tr>
          </Thead>
          <Tbody>
            {sorted.map((r) => (
              <Tr key={r.i} _hover={{ bg: "bg.hover" }}>
                <Td {...cellSx} color="text.muted" whiteSpace="nowrap">
                  {r.date}
                </Td>
                <Td {...cellSx} isNumeric fontWeight={700} color="text.primary">
                  {num(r.pts)}
                </Td>
                <Td {...cellSx} isNumeric color="text.muted">
                  {num(r.reb)}
                </Td>
                <Td {...cellSx} isNumeric color="text.muted">
                  {num(r.ast)}
                </Td>
                <Td {...cellSx} isNumeric color="text.muted">
                  {num(r.stl)}
                </Td>
                <Td {...cellSx} isNumeric color="text.muted">
                  {num(r.blk)}
                </Td>
                <Td {...cellSx} isNumeric color="text.muted">
                  {num(r.tov)}
                </Td>
                <Td {...cellSx} isNumeric color="text.muted">
                  {num(r.twos)}-{num(r.twa)}
                </Td>
                <Td {...cellSx} isNumeric color="text.muted">
                  {num(r.threes)}-{num(r.tha)}
                </Td>
                <Td {...cellSx} isNumeric color="text.muted">
                  {pct(r.fg)}
                </Td>
                <Td {...cellSx} isNumeric fontWeight={800} color={gameScoreColor(r.rating)}>
                  {r.rating.toFixed(1)}
                </Td>
              </Tr>
            ))}
          </Tbody>
          <Tfoot>
            <Tr bg="bg.surface">
              <Td {...cellSx} fontWeight={800} color="text.faint" fontSize="xs">
                AVG
              </Td>
              <Td {...cellSx} isNumeric fontWeight={800} color="text.primary">
                {avg1(totals.pts / n)}
              </Td>
              <Td {...cellSx} isNumeric color="text.faint">
                {avg1(totals.reb / n)}
              </Td>
              <Td {...cellSx} isNumeric color="text.faint">
                {avg1(totals.ast / n)}
              </Td>
              <Td {...cellSx} isNumeric color="text.faint">
                {avg1(totals.stl / n)}
              </Td>
              <Td {...cellSx} isNumeric color="text.faint">
                {avg1(totals.blk / n)}
              </Td>
              <Td {...cellSx} isNumeric color="text.faint">
                {avg1(totals.tov / n)}
              </Td>
              <Td {...cellSx} isNumeric color="text.faint">
                {avg1(totals.twos / n)}-{avg1(totals.twa / n)}
              </Td>
              <Td {...cellSx} isNumeric color="text.faint">
                {avg1(totals.threes / n)}-{avg1(totals.tha / n)}
              </Td>
              <Td {...cellSx} isNumeric color="text.faint">
                {pct(seasonFgPct)}
              </Td>
              <Td {...cellSx} isNumeric fontWeight={800} color={gameScoreColor(totals.rating / n)}>
                {avg1(totals.rating / n)}
              </Td>
            </Tr>
          </Tfoot>
        </Table>
      </TableContainer>
    </Box>
  );
};
