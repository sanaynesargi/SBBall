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
import Layout from "../../../components/Layout";
import { useEffect, useReducer, useState } from "react";
import { DeleteIcon, EditIcon } from "@chakra-ui/icons";
import axios from "axios";
import { apiUrl } from "../../../utils/apiUrl.tsx";

interface PlayerDetails {
  id?: string;
  name: string;
  jersey: number;
  position: string;
  secPosition?: string;
  height: string;
  nickname?: string;
}

interface PlayerProps {
  id: string;
  name: string;
  jersey: number;
  position: string;
  secPosition?: string;
  height: string;
  nickname?: string;
  // editable props
  players: PlayerDetails[];
  setPlayers: Function;
  index: number;
}

interface PlayerCreateProps {
  players: PlayerDetails[];
  setPlayers: Function;
}

interface PlayerEditProps {
  players: PlayerDetails[];
  setPlayers: Function;
  index: number;
}

interface PositionSelectProps {
  setPos: Function;
  sec?: boolean;
  defaultValue?: string;
}

interface PlayerLogEntry {
  pts: number;
  fullData: any;
  statNum1: number | string;
  statNum2: number | string;
  stat1: string;
  stat2: string;
  name: string;
}

interface RealStatProps {
  statNum: number | string;
  statName: string;
}

interface FullStatDisplayProps {
  data: any;
  isOpen: any;
  onOpen: any;
  onClose: any;
}

const Player = ({
  name,
  jersey,
  position,
  secPosition,
  height,
  index,
  players,
  setPlayers,
  nickname,
}: PlayerProps) => {
  const toast = useToast();

  return (
    <Container
      w="100%"
      h="100px"
      bg="#279AF1"
      borderRadius="lg"
      position="relative"
    >
      <Center w="100%" h="100%">
        <HStack w="100%" h="100%">
          <Avatar bg="#191919" color="white" name={name} />
          <HStack w="100%" alignItems="center" justifyContent="center">
            <Heading fontSize="15pt">{height}</Heading>
            <Heading fontSize="15pt">•</Heading>
            <Heading fontSize="15pt">{name}</Heading>
            <Heading fontSize="15pt">•</Heading>
            <Heading fontSize="15pt">
              #{jersey} {position}
              {secPosition ? `/${secPosition}` : null}
            </Heading>
            <PlayerEditModal
              index={index}
              players={players}
              setPlayers={setPlayers}
            />
            <IconButton
              icon={<DeleteIcon />}
              aria-label="delete"
              colorScheme="red"
              onClick={async () => {
                let newP = players.slice();
                let name = players[index].name;
                let id = players[index].id;

                const delReq = await axios.get(
                  `http://${apiUrl}/api/deletePlayer?id=${id}`
                );

                const error = delReq.data.error;

                if (error) {
                  toast({
                    title: "Error Deleting Player",
                    description: `An error has occured. Please try again later`,
                    status: "error",
                    duration: 3000,
                    isClosable: true,
                  });
                } else {
                  toast({
                    title: "Deleted Player",
                    description: `Player ${name} deleted successfully.`,
                    status: "success",
                    duration: 3000,
                    isClosable: true,
                  });

                  newP.splice(index, 1);
                  setPlayers(newP);
                }
              }}
            />
          </HStack>
        </HStack>
      </Center>
    </Container>
  );
};

const PositionSelect = ({ setPos, sec, defaultValue }: PositionSelectProps) => {
  const positions = ["PG", "SG", "SF", "PF", "C"];
  const [positionIndex, setPositionIndex] = useState(0);
  const [chosenSecond, setChosenSecond] = useState(false);
  const [, forceUpdate] = useReducer((x) => x + 1, 0);

  useEffect(() => {
    if (sec) {
      if (defaultValue) {
        setPositionIndex(positions.indexOf(defaultValue));
        setChosenSecond(true);
      } else {
        setPos("");
      }
    } else {
      if (defaultValue) {
        setPositionIndex(positions.indexOf(defaultValue));
      } else {
        setPos(positions[0]);
      }
    }
  }, []);

  useEffect(() => {
    if (sec && !chosenSecond) {
      return;
    }
    setPos(positions[positionIndex]);
  }, [positionIndex]);

  return (
    <VStack alignItems="start">
      {!chosenSecond && sec ? (
        <Button onClick={() => setChosenSecond(true)}>Enable Sec. Pos</Button>
      ) : (
        <>
          <HStack>
            <Button
              size="xs"
              onClick={() => {
                setPositionIndex(0);
              }}
              colorScheme={positionIndex == 0 ? "green" : "gray"}
            >
              PG
            </Button>
            <Button
              size="xs"
              onClick={() => {
                setPositionIndex(1);
              }}
              colorScheme={positionIndex == 1 ? "green" : "gray"}
            >
              SG
            </Button>
            <Button
              size="xs"
              onClick={() => {
                setPositionIndex(2);
              }}
              colorScheme={positionIndex == 2 ? "green" : "gray"}
            >
              SF
            </Button>
            <Button
              size="xs"
              onClick={() => {
                setPositionIndex(3);
              }}
              colorScheme={positionIndex == 3 ? "green" : "gray"}
            >
              PF
            </Button>
          </HStack>

          <Button
            size="xs"
            onClick={() => {
              setPositionIndex(4);
            }}
            colorScheme={positionIndex == 4 ? "green" : "gray"}
          >
            C
          </Button>
        </>
      )}
    </VStack>
  );
};

const PlayerCreateModal = ({ players, setPlayers }: PlayerCreateProps) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  let [playerName, setPlayerName] = useState("");
  let [nickName, setNickName] = useState("");
  let [jerseyNum, setJerseyNum] = useState("");
  let [pos, setPos] = useState("");
  let [pos2, setPos2] = useState("");
  let [height, setHeight] = useState("");

  return (
    <Box w="410px">
      <Button onClick={onOpen}>Create Player</Button>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create Player</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <HStack>
              <FormControl>
                <VStack alignItems="start" height="100%" spacing="2vh">
                  <Box>
                    <FormLabel>Player Name</FormLabel>
                    <Input
                      placeholder="e.g. Lebron James"
                      onChange={(e) => setPlayerName(e.target.value)}
                      value={playerName}
                    />
                  </Box>
                  <Box>
                    <FormLabel>Jersey #</FormLabel>
                    <NumberInput
                      onChange={(e) => setJerseyNum(e)}
                      defaultValue={15}
                      value={jerseyNum}
                    >
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </Box>
                  <Box>
                    <FormLabel>Position</FormLabel>
                    <PositionSelect setPos={setPos} />
                  </Box>
                </VStack>
              </FormControl>
              <FormControl>
                <VStack alignItems="start" spacing="2vh">
                  <Box>
                    <FormLabel>Nickname (Opt.)</FormLabel>
                    <Input
                      placeholder="e.g. The King"
                      onChange={(e) => setNickName(e.target.value)}
                      value={nickName}
                    />
                  </Box>
                  <Box>
                    <FormLabel>Height</FormLabel>
                    <Input
                      placeholder={`e.g. 7'0"`}
                      onChange={(e) => setHeight(e.target.value)}
                      value={height}
                    />
                  </Box>

                  <Box>
                    <FormLabel>Sec. Position (Opt.)</FormLabel>
                    <PositionSelect setPos={setPos2} sec />
                  </Box>
                </VStack>
              </FormControl>
            </HStack>
          </ModalBody>

          <ModalFooter>
            <Button
              colorScheme="blue"
              mr={3}
              onClick={async () => {
                let old = players.slice();

                let newPlayer: PlayerDetails = {
                  height,
                  jersey: parseInt(jerseyNum),
                  name: playerName,
                  position: pos,
                  secPosition: pos2 ? pos2 : "",
                  nickname: nickName ? nickName : "",
                };

                // send request to server to insert player
                const resp = await axios.post(
                  `http://${apiUrl}/api/createPlayer`,
                  newPlayer
                );

                const error = resp.data.error;

                if (error) {
                  toast({
                    title: "Error Creating Player",
                    description: `An error has occured. Please try again later`,
                    status: "error",
                    duration: 3000,
                    isClosable: true,
                  });
                } else {
                  toast({
                    title: "Created Player",
                    description: `Player ${playerName} created successfully.`,
                    status: "success",
                    duration: 3000,
                    isClosable: true,
                  });
                  old.push(newPlayer);
                  setPlayers(old);
                }
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

const PlayerEditModal = ({ index, players, setPlayers }: PlayerEditProps) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const pulledPlayer = players[index];

  let [playerName, setPlayerName] = useState(pulledPlayer.name);
  let [nickName, setNickName] = useState(pulledPlayer.nickname ?? "");
  let [jerseyNum, setJerseyNum] = useState(pulledPlayer.jersey.toString());
  let [pos, setPos] = useState(pulledPlayer.position);
  let [pos2, setPos2] = useState(pulledPlayer.secPosition ?? "");
  let [height, setHeight] = useState(pulledPlayer.height);

  return (
    <Box>
      <IconButton onClick={onOpen} icon={<EditIcon />} aria-label="edit">
        Create Player
      </IconButton>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create Player</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <HStack>
              <FormControl>
                <VStack alignItems="start" height="100%" spacing="2vh">
                  <Box>
                    <FormLabel>Player Name</FormLabel>
                    <Input
                      placeholder="e.g. Lebron James"
                      onChange={(e) => setPlayerName(e.target.value)}
                      value={playerName}
                    />
                  </Box>
                  <Box>
                    <FormLabel>Jersey #</FormLabel>
                    <NumberInput
                      onChange={(e) => setJerseyNum(e)}
                      defaultValue={15}
                      value={jerseyNum}
                    >
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </Box>
                  <Box>
                    <FormLabel>Position</FormLabel>
                    <PositionSelect
                      setPos={setPos}
                      defaultValue={pulledPlayer.position}
                    />
                  </Box>
                </VStack>
              </FormControl>
              <FormControl>
                <VStack alignItems="start" spacing="2vh">
                  <Box>
                    <FormLabel>Nickname (Opt.)</FormLabel>
                    <Input
                      placeholder="e.g. The King"
                      onChange={(e) => setNickName(e.target.value)}
                      value={nickName}
                    />
                  </Box>
                  <Box>
                    <FormLabel>Height</FormLabel>
                    <Input
                      placeholder={`e.g. 7'0"`}
                      onChange={(e) => setHeight(e.target.value)}
                      value={height}
                    />
                  </Box>

                  <Box>
                    <FormLabel>Sec. Position (Opt.)</FormLabel>
                    <PositionSelect
                      setPos={setPos2}
                      sec
                      defaultValue={pulledPlayer.secPosition}
                    />
                  </Box>
                </VStack>
              </FormControl>
            </HStack>
          </ModalBody>

          <ModalFooter>
            <Button
              colorScheme="blue"
              mr={3}
              onClick={async () => {
                let old = players.slice();

                let newPlayer: PlayerDetails = {
                  height,
                  jersey: parseInt(jerseyNum),
                  name: playerName,
                  position: pos,
                  secPosition: pos2 ? pos2 : "",
                  nickname: nickName ? nickName : "",
                  id: old[index].id,
                };

                // send request to server to insert player
                const resp = await axios.post(
                  `http://${apiUrl}/api/editPlayer`,
                  newPlayer
                );

                const error = resp.data.error;

                if (error) {
                  toast({
                    title: "Error Editing Player",
                    description: `An error has occured. Please try again later`,
                    status: "error",
                    duration: 3000,
                    isClosable: true,
                  });
                } else {
                  toast({
                    title: "Edited Player",
                    description: `Player ${playerName} edited successfully.`,
                    status: "success",
                    duration: 3000,
                    isClosable: true,
                  });

                  old[index] = newPlayer;
                  setPlayers(old);
                }

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

const FullStatDisplay = ({
  isOpen,
  onClose,
  onOpen,
  data,
}: FullStatDisplayProps) => {
  `
    ast
    : 
    0
    blk
    : 
    0
    fg
    : 
    "40.00"
    player
    : 
    "Arav"
    pts
    : 
    8
    reb
    : 
    1
    stl
    : 
    1
    threes
    : 
    0
    tov
    : 
    0
    twos
    : 
    4
    twosAttemped
    : 
    8
  `;

  return (
    <Box>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent bg="gray.800">
          <ModalHeader>Box Score</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack>
              <HStack>
                <RealStatShort statName="pts" statNum={data["pts"]} />
                <RealStatShort statName="reb" statNum={data["reb"]} />
                <RealStatShort statName="ast" statNum={data["ast"]} />
                <RealStatShort statName="stl" statNum={data["stl"]} />
                <RealStatShort statName="blk" statNum={data["blk"]} />
              </HStack>
              <HStack>
                <RealStatShort
                  statName="2fg"
                  statNum={`${data["twos"]}/${data["twosAttempted"]}`}
                />
                <RealStatShort
                  statName="3fg"
                  statNum={`${data["threes"]}/${data["threesAttempted"]}`}
                />
                <RealStatShort
                  statName="3%"
                  statNum={`${(
                    (data["threes"] / data["threesAttempted"]) *
                    100
                  ).toFixed(2)}%`}
                />
              </HStack>
              <HStack>
                <RealStatShort statName="fg%" statNum={data.fg} />
              </HStack>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

const RealStat = ({ statName, statNum }: RealStatProps) => {
  return (
    <HStack display="table-cell" textAlign="center">
      <HStack spacing={1}>
        <Heading fontSize="25pt">{statNum}</Heading>
        <Heading fontSize="12pt" color="gray" mt="9pt" fontWeight="semibold">
          {statName}
        </Heading>
      </HStack>
    </HStack>
  );
};

const RealStatShort = ({ statName, statNum }: RealStatProps) => {
  return (
    <HStack display="table-cell" textAlign="center">
      <HStack spacing={1}>
        <Heading fontSize="25pt">{statNum}</Heading>
        <Heading fontSize="12pt" color="gray" mt="9pt" fontWeight="semibold">
          {statName}
        </Heading>
      </HStack>
    </HStack>
  );
};

const GameLogEntry = ({
  pts,
  fullData,
  name,
  stat1,
  stat2,
  statNum1,
  statNum2,
}: PlayerLogEntry) => {
  const { isOpen, onClose, onOpen } = useDisclosure();

  return (
    <Container
      w="100%"
      h="80px"
      bg="#000000"
      borderRadius="lg"
      border="0.15px solid gray"
      position="relative"
      _hover={{ cursor: "pointer" }}
      onClick={onOpen}
    >
      <Center w="100%" h="100%">
        <HStack w="100%" h="100%">
          <FullStatDisplay
            data={fullData}
            isOpen={isOpen}
            onClose={onClose}
            onOpen={onOpen}
          />
          <Avatar bg="#191919" color="white" name={name} />
          <HStack alignItems="center" justifyContent="center">
            <RealStat statName="pts" statNum={pts} />
            <RealStat statName={stat1} statNum={statNum1} />
            <RealStat statName={stat2} statNum={statNum2} />
          </HStack>
        </HStack>
      </Center>
    </Container>
  );
};

const AddPlayers = () => {
  const [players, setPlayers] = useState<PlayerDetails[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<string>("");
  const [selectedMode, setSelectedMode] = useState<string>("");
  const [gameLog, setGameLog] = useState([]);
  const [fullGameLog, setFullGameLog] = useState([]);

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

  return (
    <Layout>
      <Tabs variant="soft-rounded" colorScheme="green">
        <Center>
          <TabList>
            <Tab>Create Players</Tab>
            <Tab>Game Log</Tab>
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
                    />
                  );
                })}
              </VStack>
            </VStack>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Layout>
  );
};

export default AddPlayers;
