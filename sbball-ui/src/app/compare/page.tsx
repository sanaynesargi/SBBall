"use client";
import {
  Avatar,
  Box,
  Flex,
  Heading,
  Select,
  Text,
  VStack,
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

type StatDef = {
  key: string;
  label: string;
  digits: number;
  suffix?: string;
  lowerBetter?: boolean;
};

const STATS: StatDef[] = [
  { key: "pts", label: "PTS", digits: 1 },
  { key: "reb", label: "REB", digits: 1 },
  { key: "ast", label: "AST", digits: 1 },
  { key: "stl", label: "STL", digits: 1 },
  { key: "blk", label: "BLK", digits: 1 },
  { key: "fg", label: "FG%", digits: 1, suffix: "%" },
  { key: "tp", label: "3P%", digits: 1, suffix: "%" },
  { key: "tov", label: "TOV", digits: 1, lowerBetter: true },
];

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

const PlayerColumn = ({
  name,
  color,
  align,
}: {
  name: string;
  color: string;
  align: "start" | "end";
}) => (
  <VStack spacing={2} align={align === "start" ? "flex-start" : "flex-end"} flex="1" minW={0}>
    <Avatar
      name={name}
      bg="bg.hover"
      color="text.primary"
      border="2px solid"
      borderColor={color}
    />
    <Heading
      fontSize={{ base: "md", md: "lg" }}
      color={color}
      noOfLines={1}
      textAlign={align === "start" ? "left" : "right"}
    >
      {name || "—"}
    </Heading>
  </VStack>
);

const ComparisonRow = ({
  def,
  a,
  b,
}: {
  def: StatDef;
  a: number;
  b: number;
}) => {
  const valA = Number.isFinite(a) ? a : 0;
  const valB = Number.isFinite(b) ? b : 0;
  const total = valA + valB || 1;
  const pctA = (valA / total) * 100;
  const pctB = (valB / total) * 100;

  // Winner: higher is better, unless lowerBetter (e.g. turnovers).
  let aWins = false;
  let bWins = false;
  if (valA !== valB) {
    const aBetter = def.lowerBetter ? valA < valB : valA > valB;
    aWins = aBetter;
    bWins = !aBetter;
  }

  const fmt = (v: number) => `${v.toFixed(def.digits)}${def.suffix ?? ""}`;

  return (
    <Box>
      <Flex align="center" justify="space-between" mb={1.5}>
        <Text
          fontFamily="heading"
          fontWeight={800}
          fontSize={{ base: "lg", md: "xl" }}
          color={aWins ? "team1.400" : "text.muted"}
          flex="1"
        >
          {fmt(valA)}
        </Text>
        <Text
          fontSize="xs"
          fontWeight={800}
          letterSpacing="0.08em"
          color="text.faint"
          px={3}
        >
          {def.label}
        </Text>
        <Text
          fontFamily="heading"
          fontWeight={800}
          fontSize={{ base: "lg", md: "xl" }}
          color={bWins ? "team2.400" : "text.muted"}
          flex="1"
          textAlign="end"
        >
          {fmt(valB)}
        </Text>
      </Flex>
      <Flex h="6px" gap="3px">
        <Flex flex="1" justify="flex-end">
          <Box
            w={`${pctA}%`}
            h="100%"
            borderRadius="full"
            bg={aWins ? "team1.500" : "court.700"}
          />
        </Flex>
        <Flex flex="1" justify="flex-start">
          <Box
            w={`${pctB}%`}
            h="100%"
            borderRadius="full"
            bg={bWins ? "team2.500" : "court.700"}
          />
        </Flex>
      </Flex>
    </Box>
  );
};

const ComparePage = () => {
  const [mode, setMode] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [aName, setAName] = useState("");
  const [bName, setBName] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const req = await axios.get(
        `${apiUrl}/api/getPlayerAverages?mode=${mode ? "4v4" : "2v2"}`
      );
      if (req.data.error) return;
      setData(req.data.data ?? []);
    };
    fetchData();
  }, [mode]);

  const players = useMemo(
    () => data.map((d) => d.player).sort((x, y) => x.localeCompare(y)),
    [data]
  );

  const a = data.find((d) => d.player === aName);
  const b = data.find((d) => d.player === bName);
  const ready = a && b;

  return (
    <Layout>
      <Box maxW="680px" mx="auto">
        <Flex
          direction={{ base: "column", sm: "row" }}
          justify="space-between"
          align={{ base: "stretch", sm: "center" }}
          gap={4}
          mb={6}
        >
          <Box>
            <Heading fontSize={{ base: "2xl", md: "3xl" }}>Compare</Heading>
            <Text color="text.muted" fontSize="sm" mt={1}>
              Head-to-head {mode ? "playoff" : "regular season"} averages
            </Text>
          </Box>
          <ModeToggle mode={mode} onToggle={() => setMode(!mode)} />
        </Flex>

        {/* Pickers */}
        <Flex gap={3} mb={6}>
          <Select
            {...selectStyles}
            placeholder="Player A"
            value={aName}
            onChange={(e) => setAName(e.target.value)}
          >
            {players.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </Select>
          <Select
            {...selectStyles}
            placeholder="Player B"
            value={bName}
            onChange={(e) => setBName(e.target.value)}
          >
            {players.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </Select>
        </Flex>

        {/* Comparison */}
        <Box
          bg="bg.card"
          border="1px solid"
          borderColor="border.subtle"
          borderRadius="card"
          p={{ base: 5, md: 7 }}
        >
          {ready ? (
            <>
              <Flex align="flex-start" justify="space-between" mb={7} gap={4}>
                <PlayerColumn name={a.player} color="team1.500" align="start" />
                <Flex
                  align="center"
                  justify="center"
                  alignSelf="center"
                  w="40px"
                  h="40px"
                  flexShrink={0}
                  borderRadius="full"
                  bg="bg.surface"
                  border="1px solid"
                  borderColor="border.subtle"
                  fontFamily="heading"
                  fontWeight={800}
                  fontSize="sm"
                  color="text.muted"
                >
                  VS
                </Flex>
                <PlayerColumn name={b.player} color="team2.500" align="end" />
              </Flex>

              <VStack spacing={5} align="stretch">
                {STATS.map((def) => (
                  <ComparisonRow
                    key={def.key}
                    def={def}
                    a={a[def.key]}
                    b={b[def.key]}
                  />
                ))}
              </VStack>
            </>
          ) : (
            <Flex
              h="160px"
              align="center"
              justify="center"
              color="text.faint"
              textAlign="center"
              px={4}
            >
              {players.length === 0
                ? "No games logged yet for this mode."
                : "Pick two players above to compare their averages."}
            </Flex>
          )}
        </Box>
      </Box>
    </Layout>
  );
};

export default ComparePage;
