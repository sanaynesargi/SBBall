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
} from "@chakra-ui/react";
import { gameScoreColor } from "../utils/rating";

interface Perf {
  playerName: string;
  pts: number;
  reb: number;
  ast: number;
  stl: number;
  blk: number;
  fg: number | null;
  min?: number | null;
  pm?: number | null;
  rating: number;
}

interface BoxScoreTableProps {
  title: string;
  color: string;
  score: number | string;
  win?: boolean;
  players: Perf[];
}

const num = (v: number) => Math.round(v);
const pmFmt = (v?: number | null) =>
  v == null ? "—" : v > 0 ? `+${Math.round(v)}` : Math.round(v);

// A full-width box score table for one team, used on large screens. Rows are
// players sorted by points; a TOTALS row sums the counting stats.
export const BoxScoreTable = ({
  title,
  color,
  score,
  win,
  players,
}: BoxScoreTableProps) => {
  const sorted = [...players].sort((a, b) => b.pts - a.pts);
  const totals = sorted.reduce(
    (t, p) => ({
      min: t.min + (p.min ?? 0),
      pts: t.pts + p.pts,
      reb: t.reb + p.reb,
      ast: t.ast + p.ast,
      stl: t.stl + p.stl,
      blk: t.blk + p.blk,
    }),
    { min: 0, pts: 0, reb: 0, ast: 0, stl: 0, blk: 0 }
  );

  const headSx = {
    color: "text.faint",
    fontSize: "10px",
    letterSpacing: "0.06em",
    borderColor: "border.subtle",
    py: 2,
  };
  const cellSx = { borderColor: "border.subtle", py: 2.5, fontSize: "sm" };

  return (
    <Box
      bg="bg.card"
      border="1px solid"
      borderColor="border.subtle"
      borderRadius="card"
      overflow="hidden"
    >
      <Flex align="center" gap={2.5} px={4} py={3} bg="bg.surface">
        <Box w="10px" h="10px" borderRadius="full" bg={color} />
        <Text fontFamily="heading" fontWeight={800} color={color} flex="1" noOfLines={1}>
          {title}
        </Text>
        <Text
          fontFamily="heading"
          fontWeight={900}
          fontSize="xl"
          color={win ? color : "text.primary"}
        >
          {score}
        </Text>
      </Flex>

      <TableContainer>
        <Table size="sm" variant="unstyled">
          <Thead>
            <Tr>
              <Th {...headSx} textAlign="left">
                Player
              </Th>
              {["MIN", "+/-", "PTS", "REB", "AST", "STL", "BLK", "FG%", "GMSC"].map(
                (h) => (
                  <Th key={h} {...headSx} isNumeric>
                    {h}
                  </Th>
                )
              )}
            </Tr>
          </Thead>
          <Tbody>
            {sorted.map((p, i) => (
              <Tr key={i} _hover={{ bg: "bg.hover" }}>
                <Td {...cellSx} fontWeight={700} color="text.primary">
                  {p.playerName}
                </Td>
                <Td {...cellSx} isNumeric color="text.muted">
                  {p.min == null ? "—" : p.min.toFixed(1)}
                </Td>
                <Td {...cellSx} isNumeric color="text.muted">
                  {pmFmt(p.pm)}
                </Td>
                <Td {...cellSx} isNumeric fontWeight={700} color="text.primary">
                  {num(p.pts)}
                </Td>
                <Td {...cellSx} isNumeric color="text.muted">
                  {num(p.reb)}
                </Td>
                <Td {...cellSx} isNumeric color="text.muted">
                  {num(p.ast)}
                </Td>
                <Td {...cellSx} isNumeric color="text.muted">
                  {num(p.stl)}
                </Td>
                <Td {...cellSx} isNumeric color="text.muted">
                  {num(p.blk)}
                </Td>
                <Td {...cellSx} isNumeric color="text.muted">
                  {p.fg == null ? "—" : (p.fg * 100).toFixed(1) + "%"}
                </Td>
                <Td {...cellSx} isNumeric fontWeight={800} color={gameScoreColor(p.rating)}>
                  {p.rating.toFixed(1)}
                </Td>
              </Tr>
            ))}
          </Tbody>
          <Tfoot>
            <Tr>
              <Td {...cellSx} fontWeight={800} color="text.faint" fontSize="xs">
                TOTALS
              </Td>
              <Td {...cellSx} isNumeric color="text.faint">
                {totals.min ? totals.min.toFixed(1) : "—"}
              </Td>
              <Td {...cellSx} isNumeric color="text.faint">
                —
              </Td>
              <Td {...cellSx} isNumeric fontWeight={800} color="text.primary">
                {num(totals.pts)}
              </Td>
              <Td {...cellSx} isNumeric color="text.faint">
                {num(totals.reb)}
              </Td>
              <Td {...cellSx} isNumeric color="text.faint">
                {num(totals.ast)}
              </Td>
              <Td {...cellSx} isNumeric color="text.faint">
                {num(totals.stl)}
              </Td>
              <Td {...cellSx} isNumeric color="text.faint">
                {num(totals.blk)}
              </Td>
              <Td {...cellSx} isNumeric color="text.faint">
                —
              </Td>
              <Td {...cellSx} isNumeric color="text.faint">
                —
              </Td>
            </Tr>
          </Tfoot>
        </Table>
      </TableContainer>
    </Box>
  );
};
