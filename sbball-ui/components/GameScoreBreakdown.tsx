import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  PopoverBody,
  PopoverHeader,
  Box,
  Flex,
  Text,
  Divider,
} from "@chakra-ui/react";
import { ReactNode } from "react";
import { gameScoreColor } from "../utils/rating";

const n = (v: any) => Number(v) || 0;

// The Game Score (GMSC) terms, matching src/lib/performanceRating.ts. Free
// throws are excluded (points = 2s·2 + 3s·3 only).
function terms(perf: any) {
  const pts = n(perf.tpfgM) * 2 + n(perf.ttpfgM) * 3;
  const fgm = n(perf.tpfgM) + n(perf.ttpfgM);
  const fga = n(perf.tpfgA) + n(perf.ttpfgA);
  return [
    { label: "Points (2s·2 + 3s·3)", val: pts, w: 1 },
    { label: "FG made", val: fgm, w: 0.4 },
    { label: "FG attempts", val: fga, w: -0.7 },
    { label: "Off. rebounds", val: n(perf.orb), w: 0.7 },
    { label: "Def. rebounds", val: n(perf.drb), w: 0.3 },
    { label: "Steals", val: n(perf.stl), w: 1 },
    { label: "Assists", val: n(perf.ast), w: 0.7 },
    { label: "Blocks", val: n(perf.blk), w: 0.7 },
    { label: "Fouls", val: n(perf.pf), w: -0.4 },
    { label: "Turnovers", val: n(perf.tov), w: -1 },
  ];
}

const numFmt = (v: number) => (Number.isInteger(v) ? String(v) : v.toFixed(1));
const signed = (v: number) => `${v >= 0 ? "+" : "−"}${Math.abs(v).toFixed(1)}`;

// Wrap any node (the clickable GMSC value) to reveal a per-term breakdown of
// how that game's Game Score was calculated.
export const GameScoreBreakdown = ({
  perf,
  children,
}: {
  perf: any;
  children: ReactNode;
}) => {
  const rows = terms(perf);
  const total = rows.reduce((t, r) => t + r.val * r.w, 0);

  return (
    <Popover placement="auto" isLazy trigger="click">
      <PopoverTrigger>
        <Box
          display="inline-block"
          cursor="pointer"
          borderBottom="1px dashed"
          borderColor="whiteAlpha.400"
          _hover={{ borderColor: "accent.400" }}
        >
          {children}
        </Box>
      </PopoverTrigger>
      <PopoverContent
        bg="bg.card"
        borderColor="border.subtle"
        w="290px"
        boxShadow="0 12px 40px rgba(0,0,0,0.5)"
      >
        <PopoverArrow bg="bg.card" />
        <PopoverHeader
          borderColor="border.subtle"
          fontFamily="heading"
          fontWeight={800}
          fontSize="sm"
        >
          Game Score breakdown
        </PopoverHeader>
        <PopoverBody>
          <Flex justify="space-between" fontSize="10px" color="text.faint" mb={1} px={0.5}>
            <Text>STAT</Text>
            <Flex gap={4}>
              <Text w="54px" textAlign="right">
                VAL × W
              </Text>
              <Text w="42px" textAlign="right">
                PTS
              </Text>
            </Flex>
          </Flex>
          {rows.map((r) => {
            const c = r.val * r.w;
            return (
              <Flex
                key={r.label}
                justify="space-between"
                align="center"
                fontSize="xs"
                py={0.5}
                opacity={r.val === 0 ? 0.45 : 1}
              >
                <Text color="text.muted">{r.label}</Text>
                <Flex gap={4} sx={{ fontVariantNumeric: "tabular-nums" }}>
                  <Text w="54px" textAlign="right" color="text.faint">
                    {numFmt(r.val)} × {r.w}
                  </Text>
                  <Text
                    w="42px"
                    textAlign="right"
                    fontWeight={700}
                    color={c > 0 ? "pos.500" : c < 0 ? "neg.500" : "text.faint"}
                  >
                    {signed(c)}
                  </Text>
                </Flex>
              </Flex>
            );
          })}
          <Divider my={2} borderColor="border.subtle" />
          <Flex justify="space-between" align="center">
            <Text fontFamily="heading" fontWeight={800} fontSize="sm">
              GMSC
            </Text>
            <Text
              fontFamily="heading"
              fontWeight={900}
              fontSize="lg"
              color={gameScoreColor(total)}
            >
              {total.toFixed(1)}
            </Text>
          </Flex>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
};
