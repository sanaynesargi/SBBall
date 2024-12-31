import {
  useDisclosure,
  Container,
  Center,
  HStack,
  Avatar,
  Text,
} from "@chakra-ui/react";
import { FullStatDisplay } from "./FullStatDisplay";
import { RealStat } from "./RealStat";

interface PlayerLogEntry {
  pts: number;
  fullData: any;
  statNum1: number | string;
  statNum2: number | string;
  stat1: string;
  stat2: string;
  name: string;
  date: string;
}

export const GameLogEntry = ({
  pts,
  fullData,
  date,
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
            name={name}
          />
          <Avatar bg="#191919" color="white" name={name} />
          <HStack alignItems="center" justifyContent="center">
            <RealStat statName="pts" statNum={pts} />
            <RealStat statName={stat1} statNum={statNum1} />
            <RealStat statName={stat2} statNum={statNum2} />
            <Text
              pos="absolute"
              left={2}
              top={0}
              color="gray.300"
              fontWeight="semibold"
              fontSize="8pt"
            >
              {date}
            </Text>
            <Text
              pos="absolute"
              right={2}
              top={0}
              color={
                fullData["rating"] >= 5
                  ? "yellow"
                  : fullData["rating"] >= 10
                  ? "greenyellow"
                  : fullData["rating"] >= 15
                  ? "green"
                  : fullData["rating"] >= 20
                  ? "lime"
                  : fullData["rating"] >= 25
                  ? "limegreen"
                  : fullData["rating"] >= 30
                  ? "forestgreen"
                  : fullData["rating"] >= 35
                  ? "mediumseagreen"
                  : fullData["rating"] >= 40
                  ? "seagreen"
                  : fullData["rating"] >= 45
                  ? "darkseagreen"
                  : fullData["rating"] >= 50
                  ? "mediumspringgreen"
                  : "red"
              }
              fontWeight="bold"
              fontSize="11pt"
            >
              {fullData.rating.toFixed(2)}
            </Text>
          </HStack>
        </HStack>
      </Center>
    </Container>
  );
};
