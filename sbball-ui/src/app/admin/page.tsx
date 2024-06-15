"use client";

import {
  Box,
  Button,
  Center,
  HStack,
  Input,
  Select,
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
        `http://${apiUrl}/api/getPlayerAverages?mode=${"4v4"}`
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
        <Box>
          <VStack spacing={3}>
            <HStack>
              <Select
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
            </HStack>
            <Center>
              <HStack>
                <Button
                  isDisabled={!selectedAward || !selectedPlayer}
                  colorScheme="blue"
                  onClick={() => {
                    let old = awardData;
                    old.push([selectedPlayer, selectedAward]);

                    setAwardData(old);

                    forceUpdate();
                  }}
                >
                  Add Award
                </Button>
                <Button
                  colorScheme="green"
                  onClick={async () => {
                    // send request to server to insert player
                    const resp = await axios.post(
                      `http://${apiUrl}/api/addAwards`,
                      { awardData }
                    );

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
            </Center>
            <VStack w="100%">
              {awardData.map((val: any, index: number) => {
                return (
                  <Button
                    w="80%"
                    h="45px"
                    colorScheme="blue"
                    key={index}
                    pos="relative"
                    _hover={{ colorScheme: "blue" }}
                  >
                    <HStack>
                      <Text>
                        {val[0]}: {val[1]}
                      </Text>
                      <IconButton
                        pos="absolute"
                        right={0}
                        colorScheme="red"
                        aria-label={"trash"}
                        icon={<DeleteIcon />}
                        onClick={() => {
                          let newA: any = awardData;
                          newA.splice(index, 1);

                          setAwardData(newA);
                          forceUpdate();
                        }}
                      />
                    </HStack>
                  </Button>
                );
              })}
            </VStack>
          </VStack>
        </Box>
      ) : null}
    </Layout>
  );
};

export default AdminPage;
