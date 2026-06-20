"use client";
import {
  Box,
  Flex,
  Text,
  Heading,
  Center,
  Divider,
  VStack,
  HStack,
  SimpleGrid,
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
  useToast,
  IconButton,
  Switch,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
} from "@chakra-ui/react";
import { DeleteIcon } from "@chakra-ui/icons";
import { useEffect, useReducer, useState, type ReactNode } from "react";
import Layout from "../../components/Layout.tsx";
import { FeedEntry } from "../../components/FeedEntry.tsx";
import axios from "axios";
import { apiUrl } from "../../utils/apiUrl.tsx";
import {
  FIELD_TO_FEED_TYPE,
  describeFeedEvent,
  getStatDataFromDesc,
  type FeedEntry as FeedEntryData,
} from "../../utils/gameFeed.ts";

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
  fts: number;
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
  fts: number;
  // display
  compressed?: boolean;
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
  // feed
  onFeedEvent?: Function;
}

// set the teams up
interface TeamSelectProps {
  team1: string[];
  team2: string[];
  setTeam1: Function;
  setTeam2: Function;
  onSave: Function;
  compressed?: boolean;
}

const VALUE_TONE: Record<string, string> = {
  make: "accent.400",
  miss: "neg.500",
  reb: "team1.400",
  play: "text.primary",
  to: "neg.500",
  foul: "warn.500",
  ftm: "accent.400",
};

// A tappable stat cell. inc mode (Add/Remove) is handled by the parent via onTap.
const StatCell = ({
  label,
  value,
  tone,
  onTap,
  compact,
}: {
  label: string;
  value: ReactNode;
  tone: string;
  onTap: () => void;
  compact?: boolean;
}) => (
  <Flex
    as="button"
    type="button"
    direction="column"
    align="center"
    justify="center"
    gap={0.5}
    py={compact ? 1.5 : 2.5}
    bg="bg.surface"
    border="1px solid"
    borderColor="border.subtle"
    borderRadius="tile"
    cursor="pointer"
    userSelect="none"
    transition="all 0.1s"
    _hover={{ bg: "bg.hover", borderColor: "accent.500" }}
    _active={{ transform: "scale(0.96)" }}
    onClick={onTap}
  >
    <Heading
      fontFamily="heading"
      fontSize={compact ? "lg" : "xl"}
      lineHeight={1}
      color={VALUE_TONE[tone]}
    >
      {value}
    </Heading>
    <Text fontSize="10px" fontWeight={800} letterSpacing="0.06em" color="text.muted">
      {label}
    </Text>
  </Flex>
);

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
  compressed,
  fts,
  onFeedEvent,
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
      fts,
    };

    if (field == "twos") {
      inc > 0
        ? player[field as keyof PlayerDetails]++
        : player[field as keyof PlayerDetails]--;

      if (inc > 0) {
        player.twosAttempted++;
      } else {
        player.twosAttempted--;
      }

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

      if (inc > 0) {
        player.threesAttempted++;
      } else {
        player.threesAttempted--;
      }

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
    } else if (field == "fts") {
      inc > 0
        ? player[field as keyof PlayerDetails]++
        : player[field as keyof PlayerDetails]--;
      if (team == 1) {
        let old = score1;
        old[0] += 0.5 * inc;
        old[1] += 1 * inc;
        setScore1(old);
      } else {
        let old = score2;
        old[0] += 0.5 * inc;
        old[1] += 1 * inc;
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

    // Record the play in the live feed (only for fields that map to a feed
    // event; tov/fouls have no snapshot column and are skipped).
    const feedType = FIELD_TO_FEED_TYPE[field];
    if (feedType && onFeedEvent) {
      const snapshotPts = player.twos * 2 + player.threes * 3 + player.fts * 1;
      onFeedEvent({
        inc,
        entry: {
          type: feedType,
          team,
          playerName: name,
          desc: describeFeedEvent(feedType),
          score: `${score1[1]}-${score2[1]}`,
          snapshotPts,
          snapshotAst: player.ast,
          snapshotOffReb: player.offReb,
          snapshotDefReb: player.defReb,
          snapshotBlk: player.blk,
          snapshotStl: player.stl,
        },
      });
    }
  };

  const teamColor = team == 1 ? "team1.500" : "team2.500";

  return (
    <Box
      w="100%"
      maxW={compressed ? "340px" : "520px"}
      bg="bg.card"
      border="1px solid"
      borderColor="border.subtle"
      borderRadius="card"
      overflow="hidden"
      position="relative"
      _before={{
        content: '""',
        position: "absolute",
        left: 0,
        top: 0,
        bottom: 0,
        width: "4px",
        bg: teamColor,
      }}
      px={{ base: 3, md: 4 }}
      py={3}
    >
      {/* Header */}
      <Flex align="center" gap={2} mb={2}>
        <Flex
          w="34px"
          h="34px"
          flexShrink={0}
          align="center"
          justify="center"
          borderRadius="10px"
          bg="bg.hover"
          color={teamColor}
          fontFamily="heading"
          fontWeight={900}
          fontSize="14px"
        >
          {jersey}
        </Flex>
        <Box flex="1" minW={0}>
          <Text
            fontFamily="heading"
            fontWeight={800}
            fontSize={{ base: "sm", md: "md" }}
            color={teamColor}
            isTruncated
          >
            {name}
          </Text>
          <Text fontSize="11px" color="text.faint" fontWeight={600}>
            {position}
          </Text>
        </Box>
        <HStack spacing={1.5}>
          <VStack spacing={0} bg="bg.surface" px={2} py={1} borderRadius="lg">
            <Heading fontFamily="heading" fontSize="md" lineHeight={1}>
              {twos * 1 + threes * 2}
            </Heading>
            <Text fontSize="9px" color="text.faint" fontWeight={700}>
              sPTS
            </Text>
          </VStack>
          <VStack spacing={0} bg="accent.500" color="accent.fg" px={2} py={1} borderRadius="lg">
            <Heading fontFamily="heading" fontSize="md" lineHeight={1}>
              {twos * 2 + threes * 3 + fts * 1}
            </Heading>
            <Text fontSize="9px" fontWeight={800}>
              PTS
            </Text>
          </VStack>
        </HStack>
      </Flex>

      {/* Fouls + FTM (tappable) */}
      <HStack spacing={2} mb={2}>
        <StatCell label="PF" value={fouls} tone="foul" onTap={() => updateStats("fouls")} compact />
        {compressed ? (
          <StatCell label="FTM" value={fts} tone="ftm" onTap={() => updateStats("fts")} compact />
        ) : null}
        <StatCell label="TO" value={tov} tone="to" onTap={() => updateStats("tov")} compact />
      </HStack>

      {/* Stat grid */}
      <SimpleGrid columns={compressed ? 3 : 5} spacing={2}>
        <StatCell label="2PM" value={twos} tone="make" onTap={() => updateStats("twos")} />
        <StatCell label="2PA" value={twosAttempted} tone="miss" onTap={() => updateStats("twosAttempted")} />
        <StatCell label="3PM" value={threes} tone="make" onTap={() => updateStats("threes")} />
        <StatCell label="3PA" value={threesAttempted} tone="miss" onTap={() => updateStats("threesAttempted")} />
        <StatCell label="OREB" value={offReb} tone="reb" onTap={() => updateStats("offReb")} />
        <StatCell label="DREB" value={defReb} tone="reb" onTap={() => updateStats("defReb")} />
        <StatCell label="AST" value={ast} tone="play" onTap={() => updateStats("ast")} />
        <StatCell label="STL" value={stl} tone="play" onTap={() => updateStats("stl")} />
        <StatCell label="BLK" value={blk} tone="play" onTap={() => updateStats("blk")} />
      </SimpleGrid>
    </Box>
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

  const TeamChip = ({
    player,
    index,
    color,
    onRemove,
  }: {
    player: string;
    index: number;
    color: string;
    onRemove: () => void;
  }) => (
    <Flex
      align="center"
      gap={2}
      bg="bg.surface"
      border="1px solid"
      borderColor="border.subtle"
      borderRadius="full"
      pl={3}
      pr={1}
      py={1}
    >
      <Box w="8px" h="8px" borderRadius="full" bg={color} />
      <Text fontWeight={700} fontSize="sm" flex="1">
        {player}
      </Text>
      <IconButton
        icon={<DeleteIcon />}
        aria-label="delete"
        size="xs"
        variant="ghost"
        colorScheme="red"
        onClick={onRemove}
      />
    </Flex>
  );

  return (
    <Box>
      <Button variant="surface" onClick={onOpen}>
        Select Teams
      </Button>

      <Modal isOpen={isOpen} onClose={onClose} size={{ base: "full", md: "xl" }}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader fontFamily="heading" fontWeight={800}>
            Select Teams
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Flex direction={{ base: "column", md: "row" }} gap={5} align="start">
              <FormControl>
                <FormLabel color="text.muted" fontSize="sm" fontWeight={600}>
                  Player Name
                </FormLabel>
                <Input
                  bg="bg.surface"
                  borderColor="border.subtle"
                  _hover={{ borderColor: "accent.500" }}
                  _focus={{ borderColor: "accent.500", boxShadow: "none" }}
                  placeholder="e.g. Lebron James"
                  onChange={(e) => setPlayerName(e.target.value)}
                  value={playerName}
                />
                <HStack mt={3}>
                  <Button
                    flex="1"
                    bg="team1.500"
                    color="#04121F"
                    _hover={{ bg: "team1.400" }}
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
                    flex="1"
                    bg="team2.500"
                    color="#1A1400"
                    _hover={{ bg: "team2.400" }}
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
              </FormControl>
              <VStack w={{ base: "100%", md: "60%" }} align="stretch" spacing={2}>
                {team1.map((player: string, index: number) => (
                  <TeamChip
                    key={`t1-${index}`}
                    player={player}
                    index={index}
                    color="team1.500"
                    onRemove={() => {
                      toast({
                        title: "Player Removed",
                        description: `${player} removed from Team 1`,
                        status: "success",
                        duration: 3000,
                        isClosable: true,
                      });
                      let old = team1;
                      old.splice(index, 1);
                      setTeam1(old);
                      forceUpdate();
                    }}
                  />
                ))}
                {team2.map((player: string, index: number) => (
                  <TeamChip
                    key={`t2-${index}`}
                    player={player}
                    index={index}
                    color="team2.500"
                    onRemove={() => {
                      toast({
                        title: "Player Removed",
                        description: `${player} removed from Team 2`,
                        status: "success",
                        duration: 3000,
                        isClosable: true,
                      });
                      let old = team2;
                      old.splice(index, 1);
                      setTeam2(old);
                      forceUpdate();
                    }}
                  />
                ))}
              </VStack>
            </Flex>
          </ModalBody>

          <ModalFooter>
            <Button
              variant="accent"
              onClick={() => {
                localStorage.setItem("T1", JSON.stringify(team1));
                localStorage.setItem("T2", JSON.stringify(team2));
                onSave();
                onClose();
              }}
            >
              Save Teams
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
  const [playoffs, setPlayoffs] = useState(false);
  const [feed, setFeed] = useState<FeedEntryData[]>([]);

  // Add (inc>0) or undo (inc<0) a play in the live feed. Undo removes the most
  // recent matching event for that player so corrections stay consistent.
  const handleFeedEvent = ({ inc, entry }: any) => {
    setFeed((prev) => {
      let next: FeedEntryData[];
      if (inc > 0) {
        next = [...prev, entry];
      } else {
        let removeAt = -1;
        for (let i = prev.length - 1; i >= 0; i--) {
          if (
            prev[i].playerName === entry.playerName &&
            prev[i].type === entry.type
          ) {
            removeAt = i;
            break;
          }
        }
        next =
          removeAt === -1
            ? prev
            : [...prev.slice(0, removeAt), ...prev.slice(removeAt + 1)];
      }
      localStorage.setItem("gameFeed", JSON.stringify(next));
      return next;
    });
  };

  const createPlayers = async () => {
    const playersReq = await axios.get(`${apiUrl}/api/getPlayers`);

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

    setScore1([0, 0]);
    setScore2([0, 0]);
    setFeed([]);
    localStorage.setItem("gameFeed", "[]");

    for (const player of team1) {
      players.push({
        name: player,
        position: `${pulledPlayerData[player].position}${
          pulledPlayerData[player].secPosition ? "/" : ""
        }${pulledPlayerData[player].secPosition ?? ""}`, // will later pull from sever
        jersey: pulledPlayerData[player].jersey, // will later pull from server
        ast: 0,
        blk: 0,
        fts: 0,
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
        fts: 0,
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

    resetPlayerScores(players);
  };

  const resetPlayerScores = (ps: any) => {
    let newPlayers = ps;

    for (const player of newPlayers) {
      player.score1 = score1;
      player.score2 = score2;
    }

    setPlayers(newPlayers);
  };

  const findPlayerByName = (arr: any[], name: string) => {
    for (const elem of arr) {
      if (name == elem.name) {
        return elem;
      }
    }

    return -1;
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

    const pulledFeed = localStorage.getItem("gameFeed");
    if (pulledFeed) {
      try {
        setFeed(JSON.parse(pulledFeed));
      } catch {}
    }

    let team1 = JSON.parse(pulledT1);
    let team2 = JSON.parse(pulledT2);

    let p = JSON.parse(pulledState);

    let s1 = [0, 0];
    let s2 = [0, 0];

    for (const name of team1) {
      const playerObj = findPlayerByName(p, name);

      s1[0] += playerObj.twos * 1 + playerObj.threes * 2;
      s1[1] += playerObj.twos * 2 + playerObj.threes * 3;
    }

    for (const name of team2) {
      const playerObj = findPlayerByName(p, name);

      s2[0] += playerObj.twos * 1 + playerObj.threes * 2;
      s2[1] += playerObj.twos * 2 + playerObj.threes * 3;
    }

    setScore1(s1);
    setScore2(s2);
  }, []);

  const [inc, setInc] = useState(1);

  const PhonePlayerView = () => {
    return (
      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={4} w="100%" justifyItems="center">
        {players.map((player: PlayerDetails, index: number) => {
          if (!player.setScore1) {
            return (
              <Player
                key={index}
                {...player}
                updatePlayers={setPlayers}
                index={index}
                players={players}
                inc={inc}
                onFeedEvent={handleFeedEvent}
                setScore1={setScore1}
                setScore2={setScore2}
              />
            );
          } else {
            return (
              <Player
                key={index}
                {...player}
                updatePlayers={setPlayers}
                index={index}
                players={players}
                inc={inc}
                onFeedEvent={handleFeedEvent}
              />
            );
          }
        })}
      </SimpleGrid>
    );
  };

  const splitParts = () => {
    let ps = [];
    if (team1.length % 2 == 0) {
      let groups = [
        team1.slice(0, team1.length / 2),
        team1.slice(team1.length / 2, team1.length),
        team2.slice(0, team1.length / 2),
        team2.slice(team1.length / 2, team1.length),
      ];

      for (const gr of groups) {
        let p: any = [];
        for (const pName of gr) {
          p.push(findPlayerByName(players, pName));
        }

        ps.push(p);
      }

      return ps;
    } else {
      let groups = [team1, team2];

      for (const gr of groups) {
        let p: any = [];
        for (const pName of gr) {
          p.push(findPlayerByName(players, pName));
        }

        ps.push(p);
      }

      return ps;
    }
  };

  const MaxPlayerView = () => {
    const tms = splitParts();

    return (
      <Flex justify="center" gap={4} flexWrap="wrap" w="100%">
        {tms.map((ppl: any[], idx: number) => (
          <VStack key={idx} spacing={3} flex={{ base: "1 1 100%", md: "1 1 320px" }} maxW="360px">
            {ppl.map((player: PlayerDetails, index: number) => {
              if (!player.setScore1) {
                return (
                  <Player
                    compressed={playoffs}
                    key={index}
                    {...player}
                    updatePlayers={setPlayers}
                    index={players.indexOf(player)}
                    players={players}
                    inc={inc}
                    onFeedEvent={handleFeedEvent}
                    setScore1={setScore1}
                    setScore2={setScore2}
                  />
                );
              } else {
                return (
                  <Player
                    compressed={playoffs}
                    key={index}
                    {...player}
                    updatePlayers={setPlayers}
                    index={players.indexOf(player)}
                    players={players}
                    inc={inc}
                    onFeedEvent={handleFeedEvent}
                  />
                );
              }
            })}
          </VStack>
        ))}
      </Flex>
    );
  };

  const EndGameModal = () => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [averageFill, setAverageFill] = useState(false);

    return (
      <>
        <Button variant="accent" onClick={onOpen}>
          End Game
        </Button>

        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader fontFamily="heading" fontWeight={800}>
              Send Game Results
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Text fontSize="sm" color="text.muted" fontWeight={700} mb={2}>
                SETTINGS
              </Text>
              <Flex
                align="center"
                justify="space-between"
                bg="bg.surface"
                border="1px solid"
                borderColor="border.subtle"
                borderRadius="tile"
                px={4}
                py={3}
              >
                <Box>
                  <Text fontWeight={700}>Average Fill</Text>
                  <Text fontSize="xs" color="text.faint">
                    Backfill non-shooting stats from career averages
                  </Text>
                </Box>
                <Switch
                  id="isChecked"
                  colorScheme="green"
                  onChange={(_) => {
                    setAverageFill(!averageFill);
                  }}
                />
              </Flex>

              <Text mt={5} fontWeight="bold">
                Make sure everything looks good!
              </Text>
            </ModalBody>

            <ModalFooter>
              <Button
                w="100%"
                variant="accent"
                onClick={async () => {
                  const endGameReq = await axios.post(`${apiUrl}/api/endGame`, {
                    players: players,
                    winner: score1 > score2 ? 1 : score2 > score1 ? 2 : 0,
                    mode: playoffs ? "4v4" : "2v2",
                    averageFill,
                    feed,
                  });

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
                  localStorage.setItem("gameFeed", "[]");
                  setPlayers([]);
                  setTeam1([]);
                  setTeam2([]);
                  setScore1([0, 0]);
                  setScore2([0, 0]);
                  setFeed([]);

                  onClose();
                }}
              >
                End Game
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </>
    );
  };

  const getFouls = (tm: number) => {
    let tot = 0;
    let team = tm == 1 ? team1 : team2;

    for (const player of players) {
      if (!team.includes(player.name)) {
        continue;
      }

      tot += player.fouls;
    }

    return tot;
  };

  return (
    <Layout size={playoffs ? "1400px" : undefined}>
      {/* Scoreboard */}
      <Box
        bg="bg.card"
        border="1px solid"
        borderColor="border.subtle"
        borderRadius="card"
        p={{ base: 4, md: 5 }}
        mb={4}
      >
        <Flex align="center" justify="space-between" gap={3} wrap="wrap">
          <TeamSelect
            setTeam1={setTeam1}
            setTeam2={setTeam2}
            team1={team1}
            team2={team2}
            onSave={createPlayers}
          />

          <HStack spacing={3} flex="1" justify="center" minW="200px">
            <VStack spacing={0}>
              <Heading fontFamily="heading" fontSize={{ base: "3xl", md: "4xl" }} color="team1.500" lineHeight={1}>
                {score1[0]}
              </Heading>
              <Text fontSize="xs" color="text.faint">
                ({score1[1]}) raw
              </Text>
            </VStack>
            <Text color="text.faint" fontWeight={800}>
              –
            </Text>
            <VStack spacing={0}>
              <Heading fontFamily="heading" fontSize={{ base: "3xl", md: "4xl" }} color="team2.500" lineHeight={1}>
                {score2[0]}
              </Heading>
              <Text fontSize="xs" color="text.faint">
                ({score2[1]}) raw
              </Text>
            </VStack>
          </HStack>

          <EndGameModal />
        </Flex>

        {/* Controls */}
        <Flex align="center" justify="space-between" gap={3} mt={4} wrap="wrap">
          <FoulPill team="Team 1" color="team1.500" value={getFouls(1)} />
          <HStack spacing={2}>
            <Button
              size="sm"
              variant={inc == 1 ? "accent" : undefined}
              bg={inc == 1 ? undefined : "neg.500"}
              color={inc == 1 ? undefined : "white"}
              _hover={inc == 1 ? undefined : { opacity: 0.9 }}
              onClick={() => {
                if (inc == 1) {
                  setInc(-1);
                } else {
                  setInc(1);
                }
              }}
            >
              {inc == 1 ? "+ Add" : "– Remove"}
            </Button>
            <Button
              size="sm"
              variant="surface"
              onClick={() => {
                setPlayoffs(!playoffs);
              }}
            >
              {!playoffs ? "Regular" : "Playoffs"}
            </Button>
          </HStack>
          <FoulPill team="Team 2" color="team2.500" value={getFouls(2)} />
        </Flex>
      </Box>

      <Tabs variant="soft-rounded" colorScheme="green" size="sm">
        <TabList gap={2} justifyContent="center" mb={4}>
          <Tab>Stats</Tab>
          <Tab>Feed</Tab>
        </TabList>
        <TabPanels>
          <TabPanel px={0}>
            {players.length === 0 ? (
              <Center
                h="200px"
                color="text.faint"
                bg="bg.card"
                border="1px solid"
                borderColor="border.subtle"
                borderRadius="card"
                textAlign="center"
                px={4}
              >
                No active game. Tap “Select Teams” to start tracking.
              </Center>
            ) : !playoffs ? (
              <PhonePlayerView />
            ) : (
              <MaxPlayerView />
            )}
          </TabPanel>
          <TabPanel px={0}>
            {feed.length === 0 ? (
              <Center
                h="160px"
                color="text.faint"
                bg="bg.card"
                border="1px solid"
                borderColor="border.subtle"
                borderRadius="card"
                textAlign="center"
                px={4}
              >
                No plays yet. Tap a stat tile and it shows up here live.
              </Center>
            ) : (
              <VStack
                w="100%"
                maxW="640px"
                mx="auto"
                spacing={0}
                align="stretch"
              >
                {feed
                  .map((e, i) => ({ e, i }))
                  .reverse()
                  .map(({ e, i }) => {
                    const d = getStatDataFromDesc(e);
                    return (
                      <Box key={i}>
                        <FeedEntry
                          name={e.playerName}
                          description={e.desc}
                          stat1Num={d.stat1Num}
                          stat1Name={d.stat1Name}
                          stat2Num={d.stat2Num}
                          stat2Name={d.stat2Name}
                        />
                        {i > 0 && <Divider borderColor="border.subtle" />}
                      </Box>
                    );
                  })}
              </VStack>
            )}
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Layout>
  );
};

const FoulPill = ({
  team,
  color,
  value,
}: {
  team: string;
  color: string;
  value: number;
}) => (
  <VStack spacing={0} minW="70px">
    <Text fontSize="10px" color="text.faint" fontWeight={700}>
      {team}
    </Text>
    <HStack spacing={1}>
      <Box w="8px" h="8px" borderRadius="full" bg={color} />
      <Text fontWeight={800} fontFamily="heading">
        {value} <Box as="span" fontSize="xs" color="text.muted">FLS</Box>
      </Text>
    </HStack>
  </VStack>
);

export default Home;
