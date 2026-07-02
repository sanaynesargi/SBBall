"use client";

import {
  Box,
  Flex,
  Heading,
  VStack,
  Text,
  Divider,
  Button,
  useDisclosure,
} from "@chakra-ui/react";
import Layout from "../../../components/Layout";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import axios from "axios";
import { apiUrl } from "../../../utils/apiUrl";
import { BoxScoreDisplay } from "../../../components/BoxScoreDisplay";
import { FeedEntry } from "../../../components/FeedEntry";
import {
  getStatDataFromDesc,
  isClockEvent,
  formatFeedTime,
  formatQuarter,
} from "../../../utils/gameFeed";

function convertDate(dateString: string) {
  const dateParts: any = dateString.trim().split("/");
  const month = dateParts[0] - 1;
  const day = dateParts[1];
  const year = dateParts[2];

  const date = new Date(year, month, day);

  const options: any = { year: "numeric", month: "long", day: "numeric" };
  const formattedDate = new Intl.DateTimeFormat("en-US", options).format(date);

  return formattedDate;
}

const TeamScore = ({
  label,
  score,
  color,
  win,
}: {
  label: string;
  score: any;
  color: string;
  win: boolean;
}) => (
  <VStack spacing={1} flex="1" minW={0}>
    <Heading
      fontFamily="heading"
      fontSize={{ base: "44px", md: "56px" }}
      lineHeight={1}
      color={win ? color : "text.primary"}
    >
      {score}
    </Heading>
    <Text
      color="text.muted"
      fontSize="xs"
      fontWeight={700}
      noOfLines={1}
      textAlign="center"
      px={2}
    >
      {label}
    </Text>
  </VStack>
);

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
        `${apiUrl}/api/getBoxScore?mode=${mode}&gameId=${gameId}`
      );

      const data = resp.data;

      if (data.error) {
        console.log("ERROR: " + data.error);
        return;
      }

      setBoxScoreData(data[0]);
    };

    fetchData();
  }, [gameId, mode]);

  useEffect(() => {
    const fetchData = async () => {
      const resp = await axios.get(
        `${apiUrl}/api/gameFeed?gameId=${gameId}&mode=${mode}`
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

  const hasData = Object.keys(boxScoreData).length > 0;
  const team1Name = hasData ? boxScoreData.team1?.replaceAll(";", ", ") : "Team 1";
  const team2Name = hasData ? boxScoreData.team2?.replaceAll(";", ", ") : "Team 2";

  return (
    <Layout>
      <Box maxW="640px" mx="auto">
        {/* Scoreboard */}
        <Box
          bg="bg.card"
          border="1px solid"
          borderColor="border.subtle"
          borderRadius="card"
          p={{ base: 5, md: 6 }}
        >
          <Flex align="center" gap={2}>
            <TeamScore
              label={team1Name}
              score={hasData ? boxScoreData.team1Score : "…"}
              color="team1.500"
              win={hasData && boxScoreData.team1Score > boxScoreData.team2Score}
            />
            <VStack spacing={1} px={2}>
              <Box
                px={3}
                py={1}
                borderRadius="full"
                bg="bg.hover"
                color="text.muted"
                fontSize="xs"
                fontWeight={800}
                letterSpacing="0.1em"
              >
                FINAL
              </Box>
              <Text color="text.faint" fontSize="xs" whiteSpace="nowrap">
                {convertDate(date ?? "")}
              </Text>
            </VStack>
            <TeamScore
              label={team2Name}
              score={hasData ? boxScoreData.team2Score : "…"}
              color="team2.500"
              win={hasData && boxScoreData.team2Score > boxScoreData.team1Score}
            />
          </Flex>

          <Button
            mt={5}
            w="100%"
            variant="surface"
            onClick={onOpen}
            isDisabled={!hasData}
          >
            View Box Score
          </Button>
        </Box>

        {hasData ? (
          <BoxScoreDisplay
            data={boxScoreData}
            isOpen={isOpen}
            onClose={onClose}
            onOpen={onOpen}
            key={1}
          />
        ) : null}

        {/* Feed */}
        <Heading size="md" mt={8} mb={4}>
          Play-by-Play
        </Heading>
        <VStack w="100%" spacing={0} align="stretch">
          {feedList.map((entry: any, index: number) => {
            const feedData = getStatDataFromDesc(entry);

            return (
              <Box key={index}>
                <FeedEntry
                  system={isClockEvent(entry)}
                  name={entry.playerName}
                  description={entry.desc}
                  stat1Num={feedData.stat1Num}
                  stat1Name={feedData.stat1Name}
                  stat2Num={feedData.stat2Num != null ? feedData.stat2Num : ""}
                  stat2Name={feedData.stat2Name != null ? feedData.stat2Name : ""}
                  time={formatFeedTime(entry)}
                  quarter={formatQuarter(entry)}
                />
                {index < feedList.length - 1 && (
                  <Divider borderColor="border.subtle" />
                )}
              </Box>
            );
          })}
        </VStack>
      </Box>
    </Layout>
  );
};

export default GameView;
