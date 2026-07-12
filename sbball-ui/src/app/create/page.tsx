"use client";
import {
  Box,
  Flex,
  HStack,
  Heading,
  Text,
  Select,
  SimpleGrid,
  Stack,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  VStack,
  useDisclosure,
} from "@chakra-ui/react";
import Layout from "../../../components/Layout.tsx";
import { useEffect, useState } from "react";
import axios from "axios";
import { apiUrl } from "../../../utils/apiUrl.tsx";
import { BoxScoreEntry } from "../../../components/BoxScoreEntry.tsx";
import { GameLogEntry } from "../../../components/GameLogEntry.tsx";
import { GameLogTable } from "../../../components/GameLogTable.tsx";
import { Player } from "../../../components/Player.tsx";
import { PlayerCreateModal } from "../../../components/PlayerCreateModal.tsx";
import { PlayerDetails } from "../../../types/PlayerDetails.ts";

const selectStyles = {
  bg: "bg.surface",
  borderColor: "border.subtle",
  color: "text.primary",
  _hover: { borderColor: "accent.500" },
  maxW: { base: "100%", sm: "220px" },
} as const;

const AddPlayers = () => {
  const [players, setPlayers] = useState<PlayerDetails[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<string>("");
  const [selectedMode, setSelectedMode] = useState<string>("");
  const [gameLog, setGameLog] = useState([]);
  const [fullGameLog, setFullGameLog] = useState([]);

  const { isOpen, onClose, onOpen } = useDisclosure();
  const [boxScoreMode, setBoxScoreMode] = useState("");
  const [boxScores, setBoxScores] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    const retrievePlayers = async () => {
      const playerReq = await axios.get(`${apiUrl}/api/getPlayers`);
      const error = playerReq.data.error;

      if (error) {
        return;
      }

      const data = playerReq.data.data;
      let newP = players.slice();

      for (const row of data) {
        newP.push({
          height: row.height,
          jersey: row.jersey,
          name: row.playerName,
          position: row.position,
          secPosition: row.secPosition,
          nickname: row.nickname,
          weight: row.weight,
          id: row.id,
        });
      }

      setPlayers(newP);
    };

    retrievePlayers();
  }, []);

  useEffect(() => {
    if (!selectedMode || !selectedPlayer) {
      return;
    }

    const getData = async () => {
      const req = await axios.get(
        `${apiUrl}/api/getPlayerGameLog?mode=${selectedMode}&playerName=${selectedPlayer}`
      );

      const resp = req.data;

      setGameLog(resp.data);
      setFullGameLog(resp.dataFull);
    };

    getData();
  }, [selectedMode, selectedPlayer]);

  useEffect(() => {
    if (!boxScoreMode) {
      return;
    }

    const getData = async () => {
      const req = await axios.get(
        `${apiUrl}/api/getBoxScores?mode=${boxScoreMode}`
      );

      const resp = req.data;

      function parseDate(dateString: any) {
        const parts = dateString.split("/");
        return new Date(parts[2], parts[0] - 1, parts[1]);
      }

      resp
        .sort(
          (a: any, b: any) =>
            (parseDate(a.date) as any) - (parseDate(b.date) as any)
        )
        .reverse();

      setBoxScores(resp);
    };

    getData();
  }, [boxScoreMode]);

  return (
    <Layout>
      <Tabs variant="soft-rounded" colorScheme="green">
        <TabList
          gap={2}
          mb={6}
          overflowX="auto"
          sx={{ "&::-webkit-scrollbar": { display: "none" } }}
        >
          <Tab whiteSpace="nowrap">Roster</Tab>
          <Tab whiteSpace="nowrap">Game Log</Tab>
          <Tab whiteSpace="nowrap">Box Scores</Tab>
        </TabList>

        <TabPanels>
          {/* Roster */}
          <TabPanel px={0}>
            <Flex
              direction={{ base: "column", sm: "row" }}
              justify="space-between"
              align={{ base: "stretch", sm: "center" }}
              gap={3}
              mb={5}
            >
              <Box>
                <Heading fontSize={{ base: "xl", md: "2xl" }}>Roster</Heading>
                <Text color="text.muted" fontSize="sm">
                  {players.length} player{players.length === 1 ? "" : "s"}
                </Text>
              </Box>
              <PlayerCreateModal players={players} setPlayers={setPlayers} />
            </Flex>

            <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={3}>
              {players.map((player: PlayerDetails, index) => {
                return (
                  <Player
                    key={index}
                    {...player}
                    players={players}
                    setPlayers={setPlayers}
                    index={index}
                    id={player.id!}
                  />
                );
              })}
            </SimpleGrid>
          </TabPanel>

          {/* Game Log */}
          <TabPanel px={0}>
            <VStack spacing={5} align="stretch">
              {players.length == 0 ? null : (
                <Stack direction={{ base: "column", sm: "row" }} spacing={3}>
                  <Select
                    {...selectStyles}
                    placeholder="Select Mode"
                    onChange={(e) => setSelectedMode(e.target.value)}
                  >
                    <option value="2v2">Regular Season</option>
                    <option value="4v4">Playoffs</option>
                  </Select>
                  <Select
                    {...selectStyles}
                    placeholder="Select Player"
                    onChange={(e) => setSelectedPlayer(e.target.value)}
                  >
                    {players.map((player: PlayerDetails, index) => {
                      return (
                        <option key={index} value={player.name}>
                          {player.name}
                        </option>
                      );
                    })}
                  </Select>
                </Stack>
              )}

              {selectedMode && selectedPlayer && gameLog.length === 0 ? (
                <Box
                  bg="bg.card"
                  border="1px solid"
                  borderColor="border.subtle"
                  borderRadius="card"
                  py={12}
                  textAlign="center"
                >
                  <Text color="text.muted">
                    No {selectedMode === "4v4" ? "playoff" : "regular season"} games
                    for {selectedPlayer} yet.
                  </Text>
                </Box>
              ) : null}

              {/* Desktop: full sortable table with every stat visible per game */}
              {fullGameLog.length > 0 && (
                <Box display={{ base: "none", md: "block" }}>
                  <GameLogTable data={fullGameLog} name={selectedPlayer} />
                </Box>
              )}

              {/* Mobile: compact tap-to-expand cards */}
              <VStack
                display={{ base: "flex", md: "none" }}
                w="100%"
                maxW="640px"
                mx="auto"
                spacing={3}
                align="stretch"
              >
                {gameLog.map((entry: any, index: number) => {
                  const keys: any = Object.keys(entry);
                  const values: any = Object.values(entry);

                  const fgIncluded = keys.includes("fg");

                  let otherKey = "";
                  let otherVal = "";

                  for (const key of keys) {
                    if (key == "fg" || key == "pts") {
                      continue;
                    }

                    otherKey = key;
                    otherVal = entry[key];
                    break;
                  }

                  return (
                    <GameLogEntry
                      stat1={otherKey}
                      stat2={fgIncluded ? "fg" : keys[2]}
                      pts={entry["pts"]}
                      statNum1={otherVal}
                      statNum2={fgIncluded ? `${entry.fg}%` : values[2]}
                      key={index}
                      name={selectedPlayer}
                      fullData={fullGameLog[index]}
                      date={entry["date"]}
                    />
                  );
                })}
              </VStack>
            </VStack>
          </TabPanel>

          {/* Box Scores */}
          <TabPanel px={0}>
            <VStack spacing={5} align="stretch">
              {players.length == 0 ? null : (
                <Select
                  {...selectStyles}
                  placeholder="Select Mode"
                  onChange={(e) => setBoxScoreMode(e.target.value)}
                >
                  <option value="2v2">Regular Season</option>
                  <option value="4v4">Playoffs</option>
                </Select>
              )}
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3} w="100%">
                {boxScores.map((entry: any, index) => {
                  return (
                    <BoxScoreEntry
                      key={index}
                      index={index}
                      gameId={entry.gameId}
                      date={entry.date}
                      onOpen={onOpen}
                      score1={entry.team1Score}
                      score2={entry.team2Score}
                      team1={entry.team1.replaceAll(";", ", ")}
                      team2={entry.team2.replaceAll(";", ", ")}
                    />
                  );
                })}
              </SimpleGrid>
            </VStack>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Layout>
  );
};

export default AddPlayers;
