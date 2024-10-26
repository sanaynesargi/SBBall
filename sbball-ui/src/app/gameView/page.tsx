"use client";

import {
  Box,
  Center,
  Heading,
  HStack,
  VStack,
  Text,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Avatar,
  Divider,
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  useDisclosure,
} from "@chakra-ui/react";
import Layout from "../../../components/Layout";
import { Suspense } from "react";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import axios from "axios";
import { apiUrl } from "../../../utils/apiUrl";
import { BoxScoreDisplay } from "../../../components/BoxScoreDisplay";
import { FeedEntry } from "../../../components/FeedEntry";

const getStatDataFromDesc = (entry: any) => {
  const desc = entry.desc;

  let retObj: any = {
    stat1Name: null,
    stat2Name: null,
    stat1Num: null,
    stat2Num: null,
  };

  if (desc.includes("'")) {
    // pts, ast
    retObj.stat1Name = "pt";
    retObj.stat2Name = "ast";
    retObj.stat1Num = entry.snapshotPts;
    retObj.stat2Num = entry.snapshotAst;
  } else if (desc.includes("assisted")) {
    // ast, pts
    retObj.stat1Name = "ast";
    retObj.stat2Name = "pt";
    retObj.stat1Num = entry.snapshotAst;
    retObj.stat2Num = entry.snapshotPts;
  } else if (desc.includes("steal") || desc.includes("swipe")) {
    // stl
    retObj.stat1Name = "stl";
    retObj.stat1Num = entry.snapshotStl;
  } else if (desc.includes("block") || desc.includes("rejection")) {
    // blk
    retObj.stat1Name = "blk";
    retObj.stat1Num = entry.snapshotBlk;
  } else if (desc.includes("offensive")) {
    // oreb, dreb
    retObj.stat1Name = "oreb";
    retObj.stat2Name = "dreb";
    retObj.stat1Num = entry.snapshotOffReb;
    retObj.stat2Num = entry.snapshotDefReb;
  } else if (desc.includes("defensive")) {
    // dreb, oreb
    retObj.stat1Name = "dreb";
    retObj.stat2Name = "oreb";
    retObj.stat1Num = entry.snapshotDefReb;
    retObj.stat2Num = entry.snapshotOffReb;
  }

  return retObj;
};

function convertDate(dateString: string) {
  // Parse the input date string (MM/DD/YYYY)
  const dateParts: any = dateString.trim().split("/");
  const month = dateParts[0] - 1; // Month is zero-indexed in JS Date
  const day = dateParts[1];
  const year = dateParts[2];

  // Create a new Date object
  const date = new Date(year, month, day);

  // Format the date to "Month Day, Year"
  const options: any = { year: "numeric", month: "long", day: "numeric" };
  const formattedDate = new Intl.DateTimeFormat("en-US", options).format(date);

  return formattedDate;
}

const GameView = () => {
  const searchParams = useSearchParams();
  const gameId = searchParams.get("id");
  const mode = searchParams.get("mode");
  const date = searchParams.get("date");

  const [boxScoreData, setBoxScoreData] = useState<any>({});
  const { isOpen, onClose, onOpen } = useDisclosure();
  const [feedList, setFeedList] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!gameId || !mode) {
        return;
      }

      const resp = await axios.get(
        `http://${apiUrl}/api/getBoxScore?mode=${mode}&gameId=${gameId}`
      );

      const data = resp.data;

      if (data.error) {
        console.log("ERROR: " + data.error);
        return;
      }

      setBoxScoreData(data[0]);

      console.log(boxScoreData);
    };

    fetchData();
  }, [gameId, mode]);

  useEffect(() => {
    const fetchData = async () => {
      const resp = await axios.get(
        `http://${apiUrl}/api/gameFeed?gameId=${gameId}&mode=${mode}`
      );

      const data = resp.data;

      if (data.error) {
        console.log("ERROR: " + data.error);
        return;
      }

      setFeedList(data.feed);
    };

    fetchData();
  }, []);

  return (
    <Layout>
      <Center w="410px" pos="relative">
        <HStack>
          <Box>
            <HStack pos="absolute" left={0} top={2}>
              <Heading>
                {Object.keys(boxScoreData).length > 0
                  ? boxScoreData.team1Score
                  : "..."}
              </Heading>
            </HStack>
            <HStack pos="absolute" right={0} top={2}>
              <Heading>
                {Object.keys(boxScoreData).length > 0
                  ? boxScoreData.team2Score
                  : "..."}
              </Heading>
            </HStack>
          </Box>

          <VStack>
            <Heading fontSize="15pt">Final</Heading>
            <Text>{convertDate(date ?? "")}</Text>
          </VStack>
        </HStack>
      </Center>

      {/* Box Score */}
      <Button onClick={onOpen}>View Box Score</Button>
      {Object.keys(boxScoreData).length > 0 ? (
        <BoxScoreDisplay
          data={boxScoreData}
          isOpen={isOpen}
          onClose={onClose}
          onOpen={onOpen}
          key={1}
        />
      ) : null}

      {/* Feed */}
      <VStack w="100%">
        {feedList.map((entry: any, index: number) => {
          const feedData = getStatDataFromDesc(entry);

          return (
            <>
              <FeedEntry
                key={index}
                name={entry.playerName}
                description={entry.desc}
                stat1Num={feedData.stat1Num}
                stat1Name={feedData.stat1Name}
                stat2Num={feedData.stat2Num != null ? feedData.stat2Num : ""}
                stat2Name={feedData.stat2Name != null ? feedData.stat2Name : ""}
              />
              <Divider w="80%" />
            </>
          );
        })}
      </VStack>
    </Layout>
  );
};

export default GameView;
