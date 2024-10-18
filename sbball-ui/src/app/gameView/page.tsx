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
} from "@chakra-ui/react";
import Layout from "../../../components/Layout";

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

      {/* Feed */}
    </Layout>
  );
};

export default GameView;
