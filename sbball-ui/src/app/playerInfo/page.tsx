"use client";
import {
  useToast,
  VStack,
  Text,
  Avatar,
  Heading,
  HStack,
  Box,
  Flex,
  SimpleGrid,
  Divider,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import Layout from "../../../components/Layout.tsx";
import axios from "axios";
import { apiUrl } from "../../../utils/apiUrl.tsx";

interface StatBoxProps {
  statName: string;
  statNum: number;
  rank: number;
}

interface PlayerAwardProps {
  awardName: string;
  timesWon: number;
}

// Tier -> theme color. Preserves the original green/yellow/cyan/red thresholds.
const TIERS: Record<string, { bg: string; fg: string }> = {
  great: { bg: "accent.500", fg: "accent.fg" },
  good: { bg: "warn.500", fg: "#1A1400" },
  ok: { bg: "team1.500", fg: "#04121F" },
  low: { bg: "neg.500", fg: "#FFFFFF" },
};

const calcTier = (stat: string, statNum: number): string => {
  if (stat == "pts") {
    return statNum >= 15 ? "great" : statNum >= 10 ? "good" : statNum >= 5 ? "ok" : "low";
  } else if (stat == "reb") {
    return statNum >= 10 ? "great" : statNum >= 7 ? "good" : statNum >= 3 ? "ok" : "low";
  } else if (stat == "ast") {
    return statNum >= 5 ? "great" : statNum >= 4 ? "good" : statNum >= 2 ? "ok" : "low";
  } else if (stat == "stl") {
    return statNum >= 2 ? "great" : statNum >= 1 ? "good" : statNum >= 0.5 ? "ok" : "low";
  } else if (stat == "blk") {
    return statNum >= 2 ? "great" : statNum >= 1 ? "good" : statNum >= 0.5 ? "ok" : "low";
  }
  return "low";
};

const StatBox = ({ rank, statName, statNum }: StatBoxProps) => {
  const tier = TIERS[calcTier(statName, statNum)];
  return (
    <Flex
      direction="column"
      align="center"
      justify="center"
      borderRadius="tile"
      bg={tier.bg}
      color={tier.fg}
      py={4}
      gap={0.5}
      boxShadow="0 6px 20px rgba(0,0,0,0.25)"
    >
      <Heading fontFamily="heading" fontSize={{ base: "2xl", md: "3xl" }} lineHeight={1}>
        {statNum.toFixed(1)}
      </Heading>
      <Text fontSize="xs" fontWeight={800} letterSpacing="0.08em" opacity={0.85}>
        {statName.toUpperCase()}
      </Text>
      <Text fontSize="xs" fontWeight={700} opacity={0.6}>
        #{rank}
      </Text>
    </Flex>
  );
};

const PlayerAward = ({ awardName, timesWon }: PlayerAwardProps) => {
  return (
    <Flex
      w="100%"
      align="center"
      gap={3}
      bg="bg.card"
      border="1px solid"
      borderColor="border.subtle"
      borderRadius="tile"
      px={4}
      py={3}
    >
      <Flex
        w="36px"
        h="36px"
        align="center"
        justify="center"
        borderRadius="10px"
        bg="warn.500"
        color="#1A1400"
        fontSize="18px"
        flexShrink={0}
      >
        🏆
      </Flex>
      <Text fontWeight={700} flex="1">
        {awardName}
      </Text>
      <Box
        px={2.5}
        py={1}
        borderRadius="full"
        bg="bg.hover"
        color="text.muted"
        fontSize="xs"
        fontWeight={800}
      >
        {timesWon}×
      </Box>
    </Flex>
  );
};

const calcRank = (data: any[], stat: string, playerName: string) => {
  const statMap: any = {};

  for (const obj of data) {
    statMap[obj.player] = obj[stat];
  }

  const sortedArr = Object.entries(statMap).toSorted(
    (a: any, b: any) => b[1] - a[1]
  );

  for (let rank = 0; rank < sortedArr.length; rank++) {
    const player = sortedArr[rank][0];

    if (playerName == player) {
      // check for tie
      if (rank != 0 && sortedArr[rank - 1][1] == sortedArr[rank][1])
        return rank;
      return rank + 1;
    }
  }

  return -1;
};

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

const SeriesPill = ({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) => (
  <Flex
    px={3}
    h="32px"
    align="center"
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
  </Flex>
);

const PlayerInfo = () => {
  const [mode, setMode] = useState(false);
  const toast = useToast();

  const [playerData, setPlayerData] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [awardsData, setAwardsData] = useState([]);
  const [playerName, setPlayerName] = useState("");
  const [height, setHeight] = useState("");
  const [playerNum, setPlayerNum] = useState(0);
  const [pos, setPos] = useState("");
  const [series, setSeries] = useState<string>("all");
  const [seriesList, setSeriesList] = useState<{ series: number; games: number }[]>([]);

  // Playoff series options.
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
    const url = window.location.href;
    const query = url.split("?")[1];

    const params: any = {};
    const subStrs = query.split("&");

    for (const subStr of subStrs) {
      const split = subStr.split("=");
      const key = split[0];
      const value = split[1];

      // Decode URL-encoding (e.g. %20 spaces in names/positions).
      params[key] = value === undefined ? "" : decodeURIComponent(value);
    }

    const heightParts = params.height.split("|");
    const heightStr = `${heightParts[0]}'${heightParts[1]}"`;

    setPlayerName(params.name);
    setHeight(heightStr);
    setPlayerNum(params.num);
    setPos(params.pos);
  }, []);

  useEffect(() => {
    const fetchPlayerData = async () => {
      if (!playerName) {
        return;
      }

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

      const tableData = playerDataReq.data.data;
      setTableData(tableData);

      let found = false;
      for (const obj of tableData) {
        if (obj.player != playerName) {
          continue;
        }

        setPlayerData(obj);
        found = true;
        break;
      }
      // Player didn't appear in this series — clear their line.
      if (!found) setPlayerData([]);
    };

    fetchPlayerData();
  }, [playerName, mode, series]);

  useEffect(() => {
    if (!playerName) {
      return;
    }

    const fetchData = async () => {
      const playerDataReq = await axios.get(
        `${apiUrl}/api/getAwards?player=${playerName}`
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

      const tableData = playerDataReq.data.awards;
      setAwardsData(tableData);
    };

    fetchData();
  }, [playerName]);

  const statKeys = Object.keys(playerData).filter((key) =>
    ["pts", "reb", "ast", "stl", "blk"].includes(key)
  );

  return (
    <Layout>
      <Box maxW="640px" mx="auto">
        {/* Profile header */}
        <Flex
          direction={{ base: "column", sm: "row" }}
          align={{ base: "center", sm: "center" }}
          gap={4}
          bg="bg.card"
          border="1px solid"
          borderColor="border.subtle"
          borderRadius="card"
          p={{ base: 5, md: 6 }}
          textAlign={{ base: "center", sm: "left" }}
        >
          <Avatar
            size="xl"
            name={playerName}
            bg="bg.hover"
            color="text.primary"
            border="2px solid"
            borderColor="accent.500"
          />
          <Box flex="1">
            <Heading fontSize={{ base: "2xl", md: "3xl" }}>{playerName}</Heading>
            <Text color="text.muted" mt={1} fontWeight={600}>
              {height} • #{playerNum} • {pos}
            </Text>
          </Box>
          <ModeToggle
            mode={mode}
            onToggle={() => {
              setSeries("all");
              setMode(!mode);
            }}
          />
        </Flex>

        {mode && seriesList.length > 0 && (
          <Flex align="center" gap={2} mt={4} wrap="wrap">
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
                active={series === String(s.series)}
                onClick={() => setSeries(String(s.series))}
              />
            ))}
          </Flex>
        )}

        {/* Stat tiles */}
        <SimpleGrid columns={{ base: 3, sm: 5 }} spacing={3} mt={5}>
          {statKeys.map((key, index) => (
            <StatBox
              rank={calcRank(tableData, key, playerName)}
              statName={key}
              statNum={playerData[key as any]}
              key={index}
            />
          ))}
        </SimpleGrid>

        {statKeys.length > 0 && (
          <>
            <Text
              fontSize="xs"
              fontWeight={800}
              color="text.muted"
              letterSpacing="0.06em"
              mt={6}
              mb={2}
            >
              ADVANCED
            </Text>
            <SimpleGrid columns={{ base: 3, sm: 4 }} spacing={3}>
              {(() => {
                const d: any = playerData;
                const pct = (v: any) =>
                  v == null || isNaN(v) ? "—" : `${Number(v).toFixed(1)}%`;
                const efg =
                  d.fgA > 0 ? ((d.fgM + 0.5 * d.ttpfgM) / d.fgA) * 100 : null;
                const pps = d.fgA > 0 ? d.pts / d.fgA : null;
                const threeRate = d.fgA > 0 ? (d.ttpfgA / d.fgA) * 100 : null;
                const tiles = [
                  { label: "FG%", value: pct(d.fg) },
                  { label: "3P%", value: pct(d.tp) },
                  { label: "eFG%", value: pct(efg) },
                  { label: "PTS/SHOT", value: pps == null ? "—" : pps.toFixed(2) },
                  { label: "3PA RATE", value: pct(threeRate) },
                  { label: "TOV", value: d.tov == null ? "—" : d.tov.toFixed(1) },
                  { label: "MPG", value: d.min == null ? "—" : d.min.toFixed(1) },
                  {
                    label: "+/-",
                    value:
                      d.pm == null
                        ? "—"
                        : d.pm > 0
                        ? `+${d.pm.toFixed(1)}`
                        : d.pm.toFixed(1),
                  },
                ];
                return tiles.map((tile) => (
                  <Box
                    key={tile.label}
                    bg="bg.card"
                    border="1px solid"
                    borderColor="border.subtle"
                    borderRadius="tile"
                    py={3}
                    textAlign="center"
                  >
                    <Heading
                      fontFamily="heading"
                      fontSize={{ base: "lg", md: "xl" }}
                      color="text.primary"
                    >
                      {tile.value}
                    </Heading>
                    <Text
                      fontSize="10px"
                      fontWeight={800}
                      color="text.muted"
                      letterSpacing="0.06em"
                    >
                      {tile.label}
                    </Text>
                  </Box>
                ));
              })()}
            </SimpleGrid>
          </>
        )}

        <Divider my={7} borderColor="border.subtle" />

        {/* Awards */}
        <Heading size="md" mb={4}>
          Awards & Accolades
        </Heading>
        {awardsData.length === 0 ? (
          <Flex
            h="100px"
            align="center"
            justify="center"
            color="text.faint"
            bg="bg.card"
            border="1px solid"
            borderColor="border.subtle"
            borderRadius="card"
          >
            No awards yet.
          </Flex>
        ) : (
          <VStack w="100%" spacing={2.5} align="stretch">
            {awardsData.map((entry: any, index) => (
              <PlayerAward
                awardName={entry[0]}
                timesWon={entry[2]}
                key={index}
              />
            ))}
          </VStack>
        )}
      </Box>
    </Layout>
  );
};

export default PlayerInfo;
