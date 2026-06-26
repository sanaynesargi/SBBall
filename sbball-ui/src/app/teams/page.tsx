"use client";
import {
  Box,
  Flex,
  Heading,
  HStack,
  Select,
  Text,
  VStack,
  SimpleGrid,
} from "@chakra-ui/react";
import { useEffect, useMemo, useState } from "react";
import Layout from "../../../components/Layout.tsx";
import axios from "axios";
import { apiUrl } from "../../../utils/apiUrl.tsx";

const selectStyles = {
  bg: "bg.surface",
  borderColor: "border.subtle",
  color: "text.primary",
  _hover: { borderColor: "accent.500" },
} as const;

const ModeToggle = ({ mode, onToggle }: { mode: boolean; onToggle: () => void }) => (
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
        px={4}
        h="32px"
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
      >
        {opt.label}
      </Flex>
    ))}
  </Flex>
);

type TeamAgg = ReturnType<typeof aggregate>;

function aggregate(perfs: any[], namesStr: string) {
  const names = new Set(String(namesStr).split(";").filter(Boolean));
  const t = perfs.filter((p) => names.has(p.playerName));
  const s = (f: string) => t.reduce((a, p) => a + (Number(p[f]) || 0), 0);
  const twoM = s("tpfgM");
  const twoA = s("tpfgA");
  const threeM = s("ttpfgM");
  const threeA = s("ttpfgA");
  const pts = s("pts");
  const fgM = twoM + threeM;
  const fgA = twoA + threeA;
  return {
    players: t.length,
    pts,
    reb: s("reb"),
    ast: s("ast"),
    stl: s("stl"),
    blk: s("blk"),
    tov: s("tov"),
    twoM,
    twoA,
    threeM,
    threeA,
    fgM,
    fgA,
    fgPct: fgA ? (fgM / fgA) * 100 : null,
    twoPct: twoA ? (twoM / twoA) * 100 : null,
    threePct: threeA ? (threeM / threeA) * 100 : null,
    pts2: twoM * 2,
    pts3: threeM * 3,
    ptsFt: Math.max(0, pts - (twoM * 2 + threeM * 3)),
  };
}

const fmtPct = (v: number | null) => (v == null ? "—" : `${v.toFixed(1)}%`);
const ma = (m: number, a: number) => `${Math.round(m)}/${Math.round(a)}`;

// A team's shooting + points-composition card.
const TeamShootingCard = ({
  name,
  color,
  t,
  win,
}: {
  name: string;
  color: string;
  t: TeamAgg;
  win: boolean;
}) => {
  const total = t.pts2 + t.pts3 + t.ptsFt || 1;
  const seg = [
    { label: "2PT", val: t.pts2, c: "team1.500" },
    { label: "3PT", val: t.pts3, c: "accent.500" },
    { label: "FT", val: t.ptsFt, c: "warn.500" },
  ];
  return (
    <Box
      bg="bg.card"
      border="1px solid"
      borderColor={win ? color : "border.subtle"}
      borderRadius="card"
      p={{ base: 4, md: 5 }}
    >
      <Flex align="baseline" justify="space-between" mb={3}>
        <Heading fontSize={{ base: "md", md: "lg" }} color={color} noOfLines={1}>
          {name}
        </Heading>
        <Heading fontFamily="heading" fontSize="2xl" color={win ? color : "text.primary"}>
          {Math.round(t.pts)}
        </Heading>
      </Flex>

      <VStack spacing={2} align="stretch" mb={4}>
        {[
          { k: "FG", m: t.fgM, a: t.fgA, p: t.fgPct },
          { k: "2PT", m: t.twoM, a: t.twoA, p: t.twoPct },
          { k: "3PT", m: t.threeM, a: t.threeA, p: t.threePct },
        ].map((r) => (
          <Flex key={r.k} align="center" justify="space-between" fontSize="sm">
            <Text color="text.muted" fontWeight={700} w="44px">
              {r.k}
            </Text>
            <Text fontFamily="mono" color="text.primary">
              {ma(r.m, r.a)}
            </Text>
            <Text
              fontFamily="heading"
              fontWeight={800}
              w="64px"
              textAlign="right"
              color={color}
            >
              {fmtPct(r.p)}
            </Text>
          </Flex>
        ))}
      </VStack>

      {/* Points composition */}
      <Text fontSize="10px" fontWeight={800} color="text.faint" letterSpacing="0.06em" mb={1}>
        POINTS BY SHOT
      </Text>
      <Flex h="10px" borderRadius="full" overflow="hidden" bg="bg.surface">
        {seg.map((g) => (
          <Box key={g.label} w={`${(g.val / total) * 100}%`} bg={g.c} h="100%" />
        ))}
      </Flex>
      <HStack spacing={3} mt={1.5}>
        {seg.map((g) => (
          <HStack key={g.label} spacing={1}>
            <Box w="8px" h="8px" borderRadius="full" bg={g.c} />
            <Text fontSize="11px" color="text.muted">
              {g.label} {Math.round(g.val)}
            </Text>
          </HStack>
        ))}
      </HStack>
    </Box>
  );
};

// Head-to-head bar for a single stat.
const StatBar = ({
  label,
  a,
  b,
  pct,
  lowerBetter,
}: {
  label: string;
  a: number;
  b: number;
  pct?: boolean;
  lowerBetter?: boolean;
}) => {
  const total = a + b || 1;
  const aWins = a !== b && (lowerBetter ? a < b : a > b);
  const bWins = a !== b && !aWins;
  const fmt = (v: number) => (pct ? `${v.toFixed(1)}%` : `${Math.round(v)}`);
  return (
    <Box>
      <Flex align="center" justify="space-between" mb={1}>
        <Text fontFamily="heading" fontWeight={800} color={aWins ? "team1.400" : "text.muted"} flex="1">
          {fmt(a)}
        </Text>
        <Text fontSize="xs" fontWeight={800} color="text.faint" letterSpacing="0.06em" px={3}>
          {label}
        </Text>
        <Text fontFamily="heading" fontWeight={800} color={bWins ? "team2.400" : "text.muted"} flex="1" textAlign="end">
          {fmt(b)}
        </Text>
      </Flex>
      <Flex h="5px" gap="3px">
        <Flex flex="1" justify="flex-end">
          <Box w={`${(a / total) * 100}%`} h="100%" borderRadius="full" bg={aWins ? "team1.500" : "court.700"} />
        </Flex>
        <Flex flex="1" justify="flex-start">
          <Box w={`${(b / total) * 100}%`} h="100%" borderRadius="full" bg={bWins ? "team2.500" : "court.700"} />
        </Flex>
      </Flex>
    </Box>
  );
};

const TeamsPage = () => {
  const [mode, setMode] = useState(false);
  const [games, setGames] = useState<any[]>([]);
  const [gameId, setGameId] = useState<string>("");

  useEffect(() => {
    const fetchData = async () => {
      const res = await axios.get(`${apiUrl}/api/getBoxScores?mode=${mode ? "4v4" : "2v2"}`);
      const data = Array.isArray(res.data) ? res.data : [];
      const parseDate = (d: string) => {
        const [m, day, y] = String(d).split("/");
        return new Date(+y, +m - 1, +day).getTime();
      };
      data.sort((a: any, b: any) => parseDate(b.date) - parseDate(a.date));
      setGames(data);
      setGameId(data.length ? String(data[0].gameId) : "");
    };
    fetchData();
  }, [mode]);

  const game = useMemo(
    () => games.find((g) => String(g.gameId) === gameId),
    [games, gameId]
  );

  const t1 = game ? aggregate(game.perfs, game.team1) : null;
  const t2 = game ? aggregate(game.perfs, game.team2) : null;

  return (
    <Layout>
      <Box maxW="720px" mx="auto">
        <Flex
          direction={{ base: "column", sm: "row" }}
          justify="space-between"
          align={{ base: "stretch", sm: "center" }}
          gap={4}
          mb={6}
        >
          <Box>
            <Heading fontSize={{ base: "2xl", md: "3xl" }}>Team Breakdown</Heading>
            <Text color="text.muted" fontSize="sm" mt={1}>
              Team shooting splits & totals for a {mode ? "playoff" : "regular season"} game
            </Text>
          </Box>
          <ModeToggle mode={mode} onToggle={() => setMode(!mode)} />
        </Flex>

        {games.length === 0 ? (
          <Flex
            h="200px"
            align="center"
            justify="center"
            color="text.faint"
            bg="bg.card"
            border="1px solid"
            borderColor="border.subtle"
            borderRadius="card"
          >
            No games logged yet for this mode.
          </Flex>
        ) : (
          <>
            <Select
              {...selectStyles}
              mb={6}
              value={gameId}
              onChange={(e) => setGameId(e.target.value)}
            >
              {games.map((g) => (
                <option key={g.gameId} value={g.gameId}>
                  {g.date} · {g.team1.replaceAll(";", ", ")} vs{" "}
                  {g.team2.replaceAll(";", ", ")} ({Math.round(g.team1Score)}-
                  {Math.round(g.team2Score)})
                </option>
              ))}
            </Select>

            {game && t1 && t2 && (
              <VStack spacing={5} align="stretch">
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <TeamShootingCard
                    name={game.team1.replaceAll(";", ", ")}
                    color="team1.500"
                    t={t1}
                    win={t1.pts > t2.pts}
                  />
                  <TeamShootingCard
                    name={game.team2.replaceAll(";", ", ")}
                    color="team2.500"
                    t={t2}
                    win={t2.pts > t1.pts}
                  />
                </SimpleGrid>

                <Box
                  bg="bg.card"
                  border="1px solid"
                  borderColor="border.subtle"
                  borderRadius="card"
                  p={{ base: 5, md: 6 }}
                >
                  <Heading size="sm" mb={4} color="text.muted">
                    Head to Head
                  </Heading>
                  <VStack spacing={4} align="stretch">
                    <StatBar label="PTS" a={t1.pts} b={t2.pts} />
                    <StatBar label="FG%" a={t1.fgPct ?? 0} b={t2.fgPct ?? 0} pct />
                    <StatBar label="3P%" a={t1.threePct ?? 0} b={t2.threePct ?? 0} pct />
                    <StatBar label="REB" a={t1.reb} b={t2.reb} />
                    <StatBar label="AST" a={t1.ast} b={t2.ast} />
                    <StatBar label="STL" a={t1.stl} b={t2.stl} />
                    <StatBar label="BLK" a={t1.blk} b={t2.blk} />
                    <StatBar label="TOV" a={t1.tov} b={t2.tov} lowerBetter />
                  </VStack>
                </Box>
              </VStack>
            )}
          </>
        )}
      </Box>
    </Layout>
  );
};

export default TeamsPage;
