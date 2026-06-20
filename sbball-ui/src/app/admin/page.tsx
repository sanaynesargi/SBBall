"use client";

import {
  Box,
  Button,
  Flex,
  HStack,
  Heading,
  Select,
  Stack,
  VStack,
  useToast,
  Text,
  IconButton,
} from "@chakra-ui/react";
import Layout from "../../../components/Layout";
import { useEffect, useReducer, useState } from "react";
import axios from "axios";
import { apiUrl } from "../../../utils/apiUrl";
import { DeleteIcon } from "@chakra-ui/icons";

const selectStyles = {
  bg: "bg.surface",
  borderColor: "border.subtle",
  color: "text.primary",
  _hover: { borderColor: "accent.500" },
} as const;

const AdminPage = () => {
  const dev = process.env.NODE_ENV == "development";
  const [tableData, setTableData] = useState([]);
  const toast = useToast();
  const [selectedPlayer, setSelectedPlayer] = useState("");
  const [selectedAward, setSelectedAward] = useState("");
  const [awardData, setAwardData] = useState<any>([]);

  const awardOptions = [
    "Best Team Captain",
    "Team MVP",
    "Best Passing",
    "Best Rebounding",
    "Best 3pt Scorer",
    "Best 2pt Scorer",
    "Best Defender",
    "Best Teammate",
    "Playoffs MIP",
    "Playoffs MVP",
    "Offensive Specialist",
    "Defensive Specialist",
  ];

  useEffect(() => {
    const fetchPlayerData = async () => {
      const playerDataReq = await axios.get(
        `${apiUrl}/api/getPlayerAverages?mode=${"4v4"}`
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
    };

    fetchPlayerData();
  }, []);

  const [, forceUpdate] = useReducer((x) => x + 1, 0);

  return (
    <Layout>
      {dev ? (
        <Box maxW="640px" mx="auto">
          <Heading fontSize={{ base: "2xl", md: "3xl" }} mb={1}>
            Award Manager
          </Heading>
          <Text color="text.muted" fontSize="sm" mb={6}>
            Dev-only tool for assigning player accolades.
          </Text>

          <VStack
            spacing={4}
            align="stretch"
            bg="bg.card"
            border="1px solid"
            borderColor="border.subtle"
            borderRadius="card"
            p={{ base: 4, md: 5 }}
          >
            <Stack direction={{ base: "column", sm: "row" }} spacing={3}>
              <Select
                {...selectStyles}
                placeholder="Select Player ..."
                onChange={(e) => {
                  setSelectedPlayer(e.target.value);
                }}
              >
                {tableData.map((obj: any, index) => {
                  return (
                    <option key={index} value={obj.player}>
                      {obj.player}
                    </option>
                  );
                })}
              </Select>
              <Select
                {...selectStyles}
                placeholder="Select Award ..."
                onChange={(e) => {
                  setSelectedAward(e.target.value);
                }}
              >
                {awardOptions.map((name, index) => {
                  return (
                    <option key={index} value={name}>
                      {name}
                    </option>
                  );
                })}
              </Select>
            </Stack>

            <HStack justify="flex-end" spacing={3}>
              <Button
                variant="surface"
                isDisabled={!selectedAward || !selectedPlayer}
                onClick={() => {
                  let old = awardData;
                  old.push([selectedPlayer, selectedAward]);

                  setAwardData(old);

                  forceUpdate();
                }}
              >
                Add to Batch
              </Button>
              <Button
                variant="accent"
                isDisabled={awardData.length === 0}
                onClick={async () => {
                  const resp = await axios.post(`${apiUrl}/api/addAwards`, {
                    awardData,
                  });

                  const error = resp.data.error;

                  if (error) {
                    toast({
                      title: "Error!",
                      description: `An error has occured. Please try again later`,
                      status: "error",
                      duration: 3000,
                      isClosable: true,
                    });
                  } else {
                    toast({
                      title: "Sucess!",
                      description: `Awards added successfully.`,
                      status: "success",
                      duration: 3000,
                      isClosable: true,
                    });

                    setAwardData([]);
                  }
                }}
              >
                Send Awards
              </Button>
            </HStack>
          </VStack>

          {awardData.length > 0 && (
            <VStack w="100%" spacing={2.5} align="stretch" mt={5}>
              {awardData.map((val: any, index: number) => {
                return (
                  <Flex
                    key={index}
                    align="center"
                    gap={3}
                    bg="bg.card"
                    border="1px solid"
                    borderColor="border.subtle"
                    borderRadius="tile"
                    px={4}
                    py={3}
                  >
                    <Text fontWeight={700} flex="1">
                      <Box as="span" color="accent.400">
                        {val[0]}
                      </Box>{" "}
                      — {val[1]}
                    </Text>
                    <IconButton
                      size="sm"
                      colorScheme="red"
                      variant="ghost"
                      aria-label="remove"
                      icon={<DeleteIcon />}
                      onClick={() => {
                        let newA: any = awardData;
                        newA.splice(index, 1);

                        setAwardData(newA);
                        forceUpdate();
                      }}
                    />
                  </Flex>
                );
              })}
            </VStack>
          )}
        </Box>
      ) : null}
    </Layout>
  );
};

export default AdminPage;
