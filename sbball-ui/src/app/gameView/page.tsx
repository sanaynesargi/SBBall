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
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import axios from "axios";
import { apiUrl } from "../../../utils/apiUrl";
import { BoxScoreDisplay } from "../../../components/BoxScoreDisplay";

const GameView = () => {
  const searchParams = useSearchParams();
  const gameId = searchParams.get("id");
  const mode = searchParams.get("mode");

  const [boxScoreData, setBoxScoreData] = useState<any>({});
  const { isOpen, onClose, onOpen } = useDisclosure();

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
            <Text>Oct. 16, 2024</Text>
          </VStack>
        </HStack>
      </Center>

      {/* Box Score */}
      <Button onClick={onOpen}>View Box Score {mode}</Button>
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
        <Divider w="80%" />
      </VStack>
    </Layout>
  );
};

export default GameView;
