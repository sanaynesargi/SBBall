"use client";
import {
  Avatar,
  Box,
  Button,
  Center,
  Container,
  FormControl,
  FormLabel,
  HStack,
  Heading,
  IconButton,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Text,
  Select,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  VStack,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import Layout from "../../../components/Layout.tsx";
import { useEffect, useReducer, useState } from "react";
import { DeleteIcon, EditIcon } from "@chakra-ui/icons";
import axios from "axios";
import { apiUrl } from "../../../utils/apiUrl.tsx";
import { useRouter } from "next/navigation";
import { query } from "express";
import { BoxScoreEntry } from "../../../components/BoxScoreEntry.tsx";
import { GameLogEntry } from "../../../components/GameLogEntry.tsx";
import { Player } from "../../../components/Player.tsx";
import { PlayerCreateModal } from "../../../components/PlayerCreateModal.tsx";
import { PlayerDetails } from "../../../types/PlayerDetails.ts";

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
      const playerReq = await axios.get(`http://${apiUrl}/api/getPlayers`);
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
        `http://${apiUrl}/api/getPlayerGameLog?mode=${selectedMode}&playerName=${selectedPlayer}`
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
        `http://${apiUrl}/api/getBoxScores?mode=${boxScoreMode}`
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
        <Center>
          <TabList>
            <Tab>Create Players</Tab>
            <Tab>Game Log</Tab>
            <Tab>Box Scores</Tab>
          </TabList>
        </Center>
        <TabPanels>
          <TabPanel>
            <VStack w="410px" h="100vh">
              <PlayerCreateModal players={players} setPlayers={setPlayers} />
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
            </VStack>
          </TabPanel>
          <TabPanel>
            <VStack spacing={15}>
              <HStack>
                {players.length == 0 ? null : (
                  <>
                    <Select
                      variant="filled"
                      placeholder="Select Mode"
                      onChange={(e) => setSelectedMode(e.target.value)}
                    >
                      <option value="2v2">Regular Season</option>
                      <option value="4v4">Playoffs</option>
                    </Select>
                    <Select
                      variant="filled"
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
                  </>
                )}
              </HStack>
              <VStack w="100%">
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
          <TabPanel>
            <VStack spacing={15}>
              <HStack>
                {players.length == 0 ? null : (
                  <>
                    <Select
                      variant="filled"
                      placeholder="Select Mode"
                      onChange={(e) => setBoxScoreMode(e.target.value)}
                    >
                      <option value="2v2">Regular Season</option>
                      <option value="4v4">Playoffs</option>
                    </Select>
                  </>
                )}
              </HStack>
              <VStack w="100%">
                {boxScores.map((entry: any, index) => {
                  return (
                    <BoxScoreEntry
                      index={index}
                      gameId={entry.gameId}
                      //   setIndexNumber={setSelectedIndex}

                      date={entry.date}
                      onOpen={onOpen}
                      score1={entry.team1Score}
                      score2={entry.team2Score}
                      team1={entry.team1.replaceAll(";", ", ")}
                      team2={entry.team2.replaceAll(";", ", ")}
                    />
                  );
                })}
              </VStack>
            </VStack>
            {/* {boxScores.length > 0 ? (
              <BoxScoreDisplay
                data={boxScores[selectedIndex]}
                isOpen={isOpen}
                onClose={onClose}
                onOpen={onOpen}
                key={1}
              />
            ) : null} */}
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Layout>
  );
};

export default AddPlayers;
