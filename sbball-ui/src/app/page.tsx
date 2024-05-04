"use client";
import {
  Flex,
  Box,
  Text,
  Heading,
  Center,
  VStack,
  HStack,
  position,
  Container,
  useDisclosure,
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  FormControl,
  FormLabel,
  Input,
  Spacer,
  useToast,
  IconButton,
} from "@chakra-ui/react";
import { AddIcon, BellIcon, DeleteIcon, EditIcon } from "@chakra-ui/icons";
import {
  BottomNavigation,
  BottomNavigationItem,
  BottomNavigationIcon,
  BottomNavigationLabel,
  BottomNavigationStyleConfig,
} from "chakra-ui-bottom-navigation";
import { useEffect, useReducer, useState } from "react";
import Layout from "../../components/Layout";
import axios from "axios";
import { apiUrl } from "../../utils/apiUrl.tsx";

interface PlayerDetails {
  position: string;
  name: string;
  jersey: number;
  /*    ^  Server Pulled ^      */
  fouls: number;
  twos: number;
  twosAttempted: number;
  threes: number;
  threesAttempted: number;
  offReb: number;
  defReb: number;
  ast: number;
  blk: number;
  stl: number;
  tov: number;
  score1: number[];
  score2: number[];
  setScore1: Function;
  setScore2: Function;
  team: number;
}

interface PlayerDetailsProps {
  position: string;
  name: string;
  jersey: number;
  team: number;
  /*    ^  Server Pulled ^      */
  fouls: number;
  twos: number;
  twosAttempted: number;
  threes: number;
  threesAttempted: number;
  offReb: number;
  defReb: number;
  ast: number;
  blk: number;
  stl: number;
  tov: number;
  // update properties
  updatePlayers: Function;
  players: PlayerDetails[];
  inc: number;
  index: number;
  // score
  score1: number[];
  score2: number[];
  setScore1: Function;
  setScore2: Function;
}

// set the teams up
interface TeamSelectProps {
  team1: string[];
  team2: string[];
  setTeam1: Function;
  setTeam2: Function;
  onSave: Function;
}

const Player = ({
  name,
  jersey,
  fouls,
  position,
  twos,
  threes,
  ast,
  blk,
  defReb,
  offReb,
  stl,
  threesAttempted,
  tov,
  twosAttempted,
  index,
  updatePlayers,
  players,
  team,
  score1,
  score2,
  setScore1,
  setScore2,
  inc,
}: PlayerDetailsProps) => {
  const [, forceUpdate] = useReducer((x) => x + 1, 0);

  const updateStats = (field: string) => {
    let player: PlayerDetails = {
      name,
      jersey,
      fouls,
      position,
      twos,
      threes,
      ast,
      blk,
      defReb,
      offReb,
      stl,
      threesAttempted,
      tov,
      twosAttempted,
      team,
      score1,
      score2,
      setScore1,
      setScore2,
    };

    if (field == "twos") {
      inc > 0
        ? player[field as keyof PlayerDetails]++
        : player[field as keyof PlayerDetails]--;
      player.twosAttempted += inc;

      if (team == 1) {
        let old = score1;
        old[0] += 1 * inc;
        old[1] += 2 * inc;
        setScore1(old);
      } else {
        let old = score2;
        old[0] += 1 * inc;
        old[1] += 2 * inc;
        setScore2(old);
      }
    } else if (field == "threes") {
      inc > 0
        ? player[field as keyof PlayerDetails]++
        : player[field as keyof PlayerDetails]--;
      player.threesAttempted++;
      if (team == 1) {
        let old = score1;
        old[0] += 2 * inc;
        old[1] += 3 * inc;
        setScore1(old);
      } else {
        let old = score2;
        old[0] += 2 * inc;
        old[1] += 3 * inc;
        setScore2(old);
      }
    } else {
      inc > 0
        ? player[field as keyof PlayerDetails]++
        : player[field as keyof PlayerDetails]--;
    }

    let newPlayers = players.slice();
    newPlayers[index] = player;

    localStorage.setItem("gameState", JSON.stringify(newPlayers));

    updatePlayers(newPlayers);
  };

  return (
    <>
      <HStack w="410px">
        <Text
          textAlign="left"
          fontWeight="semibold"
          color={team == 1 ? "#90CDF4" : "#FCD28D"}
        >
          #{jersey} {name} | {position}
        </Text>
        <Text
          fontWeight="semibold"
          px="3px"
          borderRadius="md"
          py="2px"
          bg="#6D6A75"
          color="black"
        >
          {twos * 1 + threes * 2} sPTS
        </Text>
        <Text
          fontWeight="semibold"
          px="3px"
          borderRadius="md"
          py="2px"
          bg="#3590F3"
          color="black"
        >
          {twos * 2 + threes * 3} PTS
        </Text>
        <Text
          textAlign="left"
          fontWeight="semibold"
          ml="auto"
          px="3px"
          borderRadius="md"
          py="2px"
          bg="#CAF0F8"
          color="black"
          onClick={() => {
            updateStats("fouls");
          }}
        >
          PF: {fouls}
        </Text>
      </HStack>
      <Box w="410px" h="170px" bg="#6D98BA" borderRadius="lg">
        <Center h="100%">
          <VStack
            pos="relative"
            width="100%"
            h="100%"
            justifyContent="center"
            spacing="2vh"
          >
            <Box
              pos="absolute"
              top={0}
              right={0}
              textAlign="left"
              fontWeight="semibold"
              fontSize="9pt"
              ml="auto"
              px="25px"
              borderRadius="md"
              py="2px"
              bg="#182825"
              color="white"
              w="80px"
              onClick={() => {
                updateStats("tov");
              }}
            >
              <Center>TO {tov}</Center>
            </Box>
            <HStack mt="1vh">
              <Text fontWeight="bold">2P</Text>
              <Box
                textAlign="left"
                fontWeight="semibold"
                ml="auto"
                px="25px"
                borderRadius="md"
                py="2px"
                bg="#758173"
                color="black"
                w="65px"
                alignItems="center"
                justifyContent="center"
                onClick={() => {
                  updateStats("twos");
                }}
              >
                <Center>{twos}</Center>
              </Box>
              <Box
                textAlign="left"
                fontWeight="semibold"
                ml="auto"
                px="25px"
                borderRadius="md"
                py="2px"
                bg="#A30000"
                color="black"
                w="65px"
                onClick={() => {
                  updateStats("twosAttempted");
                }}
              >
                <Center>{twosAttempted}</Center>
              </Box>
              <Box
                textAlign="left"
                fontWeight="semibold"
                ml="auto"
                px="25px"
                borderRadius="md"
                py="2px"
                bg="#182825"
                color="white"
                w="115px"
                onClick={() => {
                  updateStats("blk");
                }}
              >
                <Center>BLK {blk}</Center>
              </Box>
            </HStack>
            <HStack>
              <Text fontWeight="bold">3P</Text>
              <Box
                textAlign="left"
                fontWeight="semibold"
                ml="auto"
                px="25px"
                borderRadius="md"
                py="2px"
                bg="#758173"
                color="black"
                w="65px"
                alignItems="center"
                justifyContent="center"
                onClick={() => {
                  updateStats("threes");
                }}
              >
                <Center>{threes}</Center>
              </Box>
              <Box
                textAlign="left"
                fontWeight="semibold"
                ml="auto"
                px="25px"
                borderRadius="md"
                py="2px"
                bg="#A30000"
                color="black"
                w="65px"
                onClick={() => {
                  updateStats("threesAttempted");
                }}
              >
                <Center>{threesAttempted}</Center>
              </Box>
              <Box
                textAlign="left"
                fontWeight="semibold"
                ml="auto"
                px="25px"
                borderRadius="md"
                py="2px"
                bg="#182825"
                color="white"
                w="115px"
                onClick={() => {
                  updateStats("stl");
                }}
              >
                <Center>STL {stl}</Center>
              </Box>
            </HStack>
            <HStack>
              <Text fontWeight="bold">RB</Text>
              <Box
                textAlign="left"
                fontWeight="semibold"
                ml="auto"
                px="25px"
                borderRadius="md"
                py="2px"
                bg="#6279B8"
                color="black"
                w="65px"
                alignItems="center"
                justifyContent="center"
                onClick={() => {
                  updateStats("offReb");
                }}
              >
                <Center>{offReb}</Center>
              </Box>
              <Box
                textAlign="left"
                fontWeight="semibold"
                ml="auto"
                px="25px"
                borderRadius="md"
                py="2px"
                bg="#EDDEA4"
                color="black"
                w="65px"
                onClick={() => {
                  updateStats("defReb");
                }}
              >
                <Center>{defReb}</Center>
              </Box>
              <Box
                textAlign="left"
                fontWeight="semibold"
                ml="auto"
                px="25px"
                borderRadius="md"
                py="2px"
                bg="#182825"
                color="white"
                w="115px"
                onClick={() => {
                  updateStats("ast");
                }}
              >
                <Center>AST {ast}</Center>
              </Box>
            </HStack>
          </VStack>
        </Center>
      </Box>
    </>
  );
};

const TeamSelect = ({
  team1,
  team2,
  setTeam1,
  setTeam2,
  onSave,
}: TeamSelectProps) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  let [playerName, setPlayerName] = useState("");
  const [, forceUpdate] = useReducer((x) => x + 1, 0);

  return (
    <Box w="410px">
      <Button onClick={onOpen}>Select Teams</Button>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Select Teams</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <HStack>
              <FormControl>
                <VStack alignItems="start" spacing="2vh">
                  <Box>
                    <FormLabel>Player Name</FormLabel>
                    <Input
                      placeholder="e.g. Lebron James"
                      onChange={(e) => setPlayerName(e.target.value)}
                      value={playerName}
                    />
                  </Box>
                  <HStack>
                    <Button
                      colorScheme="blue"
                      onClick={() => {
                        let oldTeam = team1;
                        oldTeam.push(playerName);
                        setTeam1(oldTeam);
                        toast({
                          title: "Player Added",
                          description: `${playerName} added to Team 1`,
                          status: "success",
                          duration: 3000,
                          isClosable: true,
                        });
                        setPlayerName("");
                      }}
                    >
                      Team 1
                    </Button>
                    <Button
                      colorScheme="orange"
                      onClick={() => {
                        let oldTeam = team2;
                        oldTeam.push(playerName);
                        setTeam2(oldTeam);
                        toast({
                          title: "Player Added",
                          description: `${playerName} added to Team 2`,
                          status: "success",
                          duration: 3000,
                          isClosable: true,
                        });
                        setPlayerName("");
                      }}
                    >
                      Team 2
                    </Button>
                  </HStack>
                </VStack>
              </FormControl>
              <VStack w="75%" h="100%">
                {team1.map((player: string, index: number) => {
                  return (
                    <HStack borderRadius="md">
                      <Button
                        key={index}
                        w="100px"
                        h="20px"
                        onClick={() => {}}
                        colorScheme="blue"
                        color="black"
                      >
                        {player}
                      </Button>
                      <IconButton
                        icon={<DeleteIcon />}
                        aria-label="delete"
                        ml="auto"
                        size="sm"
                        colorScheme="red"
                        onClick={() => {
                          toast({
                            title: "Player Removed",
                            description: `${playerName} removed from Team 1`,
                            status: "success",
                            duration: 3000,
                            isClosable: true,
                          });
                          let old = team1;
                          old.splice(index, 1);
                          setTeam1(old);
                          forceUpdate();
                        }}
                      ></IconButton>
                    </HStack>
                  );
                })}
                {team2.map((player: string, index: number) => {
                  return (
                    <HStack borderRadius="md">
                      <Button
                        key={index}
                        w="100px"
                        h="20px"
                        onClick={() => {}}
                        colorScheme="orange"
                        color="black"
                      >
                        {player}
                      </Button>
                      <IconButton
                        icon={<DeleteIcon />}
                        aria-label="delete"
                        ml="auto"
                        size="sm"
                        colorScheme="red"
                        onClick={() => {
                          toast({
                            title: "Player Removed",
                            description: `${playerName} removed from Team 2`,
                            status: "success",
                            duration: 3000,
                            isClosable: true,
                          });
                          let old = team2;
                          old.splice(index, 1);
                          setTeam2(old);
                        }}
                      ></IconButton>
                    </HStack>
                  );
                })}
              </VStack>
            </HStack>
          </ModalBody>

          <ModalFooter>
            <Button
              colorScheme="blue"
              mr={3}
              onClick={() => {
                // set team1 and 2 into localStorage22
                localStorage.setItem("T1", JSON.stringify(team1));
                localStorage.setItem("T2", JSON.stringify(team2));
                // function calls
                onSave(); // - save callback
                onClose();
              }}
            >
              Save
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

const transformData = (data: Array<any>) => {
  let dataObj: any = {};

  for (const row of data) {
    dataObj[row.playerName] = row;
  }

  return dataObj;
};

const Home = () => {
  let [players, setPlayers] = useState<PlayerDetails[]>([]);
  let [team1, setTeam1] = useState<string[]>([]);
  let [team2, setTeam2] = useState<string[]>([]);
  let [score1, setScore1] = useState<number[]>([0, 0]);
  let [score2, setScore2] = useState<number[]>([0, 0]);
  const toast = useToast();

  const createPlayers = async () => {
    const playersReq = await axios.get(`http://${apiUrl}/api/getPlayers`);

    if (playersReq.data.error) {
      toast({
        title: "Something Went Wrong",
        description: `We couldn't pull the players right now. Please try again later.`,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    let pulledPlayerData = transformData(playersReq.data.data);

    let players = [];

    for (const player of team1) {
      console.log(pulledPlayerData[player], player);
      players.push({
        name: player,
        position: `${pulledPlayerData[player].position}${
          pulledPlayerData[player].secPosition ? "/" : ""
        }${pulledPlayerData[player].secPosition ?? ""}`, // will later pull from sever
        jersey: pulledPlayerData[player].jersey, // will later pull from server
        ast: 0,
        blk: 0,
        defReb: 0,
        fouls: 0,
        stl: 0,
        offReb: 0,
        threes: 0,
        threesAttempted: 0,
        tov: 0,
        twos: 0,
        twosAttempted: 0,
        score1,
        score2,
        setScore1,
        setScore2,
        team: 1,
      });
    }

    for (const player of team2) {
      players.push({
        name: player,
        position: `${pulledPlayerData[player].position}${
          pulledPlayerData[player].secPosition ? "/" : ""
        }${pulledPlayerData[player].secPosition ?? ""}`, // will later pull from sever
        jersey: pulledPlayerData[player].jersey, // will later pull from server
        ast: 0,
        blk: 0,
        defReb: 0,
        fouls: 0,
        stl: 0,
        offReb: 0,
        threes: 0,
        threesAttempted: 0,
        tov: 0,
        twos: 0,
        twosAttempted: 0,
        score1,
        score2,
        setScore1,
        setScore2,
        team: 2,
      });
    }

    setPlayers(players);
    localStorage.setItem("gameState", JSON.stringify(players));
  };

  useEffect(() => {
    localStorage.setItem("chakra-ui-color-mode", "dark");

    const pulledState = localStorage.getItem("gameState");
    const pulledT1 = localStorage.getItem("T1");
    const pulledT2 = localStorage.getItem("T2");

    if (!pulledState || !pulledT1 || !pulledT2) {
      return;
    }

    setPlayers(JSON.parse(pulledState));
    setTeam1(JSON.parse(pulledT1));
    setTeam2(JSON.parse(pulledT2));
  }, []);

  const [inc, setInc] = useState(1);

  return (
    <Layout>
      <HStack w="410px" h="100%" justifyContent="space-between">
        <TeamSelect
          setTeam1={setTeam1}
          setTeam2={setTeam2}
          team1={team1}
          team2={team2}
          onSave={createPlayers}
        />
        <Center>
          <Heading fontSize="17pt" w="100%">
            <HStack>
              <Text color="#90CDF4">{score1[0]}</Text>
              <Text color="#90CDF4" fontWeight="normal">
                ({score1[1]})
              </Text>
              <Text>-</Text>
              <Text color="#FCD28D" fontWeight="normal">
                ({score2[1]})
              </Text>
              <Text color="#FCD28D">{score2[0]}</Text>
            </HStack>
          </Heading>
        </Center>
        <Button
          w="100%"
          onClick={async () => {
            const endGameReq = await axios.post(
              `http://${apiUrl}/api/endGame`,
              {
                players: players,
                winner: score1 > score2 ? 1 : score2 > score1 ? 2 : 0,
              }
            );

            const error = endGameReq.data.error;

            if (error) {
              console.log(error);
              toast({
                title: "Error Ending Game",
                description: `Your data is still safe. Try later.`,
                status: "error",
                duration: 3000,
                isClosable: true,
              });
              return;
            }

            toast({
              title: "Game Ended",
              description: `Hopefully you had fun! Your stats have been saved.`,
              status: "success",
              duration: 3000,
              isClosable: true,
            });

            // reset display variables
            localStorage.setItem("gameState", "[]");
            localStorage.setItem("T1", "");
            localStorage.setItem("T2", "");
            setPlayers([]);
            setTeam1([]);
            setTeam2([]);
            setScore1([0, 0]);
            setScore2([0, 0]);
          }}
        >
          End Game
        </Button>
      </HStack>
      <Button
        colorScheme={inc == 1 ? "green" : "red"}
        onClick={() => {
          if (inc == 1) {
            setInc(-1);
          } else {
            setInc(1);
          }
        }}
      >
        Mode: {inc == 1 ? "Add" : "Remove"}
      </Button>
      <VStack h="max(100vh, 100%)">
        {players.map((player: PlayerDetails, index: number) => {
          return (
            <Player
              key={index}
              {...player}
              updatePlayers={setPlayers}
              index={index}
              players={players}
              inc={inc}
            />
          );
        })}
      </VStack>
    </Layout>
  );
};

export default Home;
