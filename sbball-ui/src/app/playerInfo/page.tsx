"use client";
import {
  Table,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
  useTab,
  useToast,
  VStack,
  Text,
  Button,
  Avatar,
  Heading,
  HStack,
  Container,
  Center,
  Box,
  Divider,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import Layout from "../../../components/Layout.tsx";
import axios from "axios";
import { apiUrl } from "../../../utils/apiUrl.tsx";
import { useRouter } from "next/navigation";

interface StatBoxProps {
  statName: string;
  statNum: number;
  rank: number;
}

interface PlayerAwardProps {
  awardName: string;
  timesWon: number;
}

const calcColor = (stat: string, statNum: number) => {
  if (stat == "pts") {
    return statNum >= 15
      ? "green"
      : statNum >= 10
      ? "yellow"
      : statNum >= 5
      ? "cyan"
      : "red";
  } else if (stat == "reb") {
    return statNum >= 10
      ? "green"
      : statNum >= 7
      ? "yellow"
      : statNum >= 3
      ? "cyan"
      : "red";
  } else if (stat == "ast") {
    return statNum >= 5
      ? "green"
      : statNum >= 4
      ? "yellow"
      : statNum >= 2
      ? "cyan"
      : "red";
  } else if (stat == "stl") {
    return statNum >= 2
      ? "green"
      : statNum >= 1
      ? "yellow"
      : statNum >= 0.5
      ? "cyan"
      : "red";
  } else if (stat == "blk") {
    return statNum >= 2
      ? "green"
      : statNum >= 1
      ? "yellow"
      : statNum >= 0.5
      ? "cyan"
      : "red";
  }
};

const StatBox = ({ rank, statName, statNum }: StatBoxProps) => {
  return (
    <Button
      w="75px"
      h="75px"
      colorScheme={calcColor(statName, statNum)}
      borderRadius="md"
    >
      <VStack
        w="100%"
        h="100%"
        alignItems="center"
        justifyContent="center"
        spacing="2px"
      >
        <Heading fontSize="18pt">{statNum.toFixed(1)}</Heading>
        <Heading fontSize="10pt" color="gray.700">
          {statName.toUpperCase()}
        </Heading>
        <Heading fontSize="10pt" color="gray.700">
          #{rank}
        </Heading>
      </VStack>
    </Button>
  );
};

const PlayerAward = ({ awardName, timesWon }: PlayerAwardProps) => {
  return (
    <Button h="50px" w="70%" colorScheme="yellow">
      <Text fontWeight="bold">
        {awardName} ({timesWon}x)
      </Text>
    </Button>
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

  useEffect(() => {
    const url = window.location.href;
    const query = url.split("?")[1];

    const params: any = {};
    const subStrs = query.split("&");

    for (const subStr of subStrs) {
      const split = subStr.split("=");
      const key = split[0];
      const value = split[1];

      params[key] = value;
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

      const playerDataReq = await axios.get(
        `${apiUrl}/api/getPlayerAverages?mode=${mode ? "4v4" : "2v2"}`
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

      for (const obj of tableData) {
        if (obj.player != playerName) {
          continue;
        }

        setPlayerData(obj);
        break;
      }
    };

    fetchPlayerData();
  }, [playerName, mode]);

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

  return (
    <Layout>
      <VStack>
        <Avatar size="lg" name={playerName} bg="teal" />
        <Heading>{playerName}</Heading>
        <HStack>
          <Heading fontSize="11pt">
            {height} • #{playerNum} {pos}
          </Heading>
          <Button size="sm" onClick={() => setMode(!mode)} colorScheme="blue">
            Mode: {mode ? "Playoffs" : "Regular"}
          </Button>
        </HStack>
        <HStack>
          {Object.keys(playerData).map((key, index) => {
            if (!["pts", "reb", "ast", "stl", "blk"].includes(key)) {
              return;
            }

            return (
              <StatBox
                rank={calcRank(tableData, key, playerName)}
                statName={key}
                statNum={playerData[key as any]}
                key={index}
              />
            );
          })}
        </HStack>
        <Divider my={5} />
        <VStack w="100%" h="100%">
          <Heading size="md" h="100%">
            Awards & Accolades
          </Heading>
          <VStack w="100%" h="100%">
            {awardsData.map((entry: any, index) => {
              return (
                <PlayerAward
                  awardName={entry[0]}
                  timesWon={entry[2]}
                  key={index}
                />
              );
            })}
          </VStack>
        </VStack>
      </VStack>
    </Layout>
  );
};

export default PlayerInfo;
