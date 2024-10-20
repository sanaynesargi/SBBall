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
} from "@chakra-ui/react";
import Layout from "../../../components/Layout";
import { useState } from "react";

const GameView = () => {
  return (
    <Layout>
      <Center w="410px" pos="relative">
        <HStack>
          <Box>
            <HStack pos="absolute" left={0} top={2}>
              <Heading>77</Heading>
            </HStack>
            <HStack pos="absolute" right={0} top={2}>
              <Heading>77</Heading>
            </HStack>
          </Box>

          <VStack>
            <Heading fontSize="15pt">Final</Heading>
            <Text>Oct. 16, 2024</Text>
          </VStack>
        </HStack>
      </Center>

      {/* Box Score */}
      <Button>View Box Score</Button>

      {/* Feed */}
      <VStack w="100%">
        <Divider w="80%" />
      </VStack>
    </Layout>
  );
};

export default GameView;
