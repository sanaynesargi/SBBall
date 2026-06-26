import {
  useDisclosure,
  Box,
  HStack,
  Avatar,
  Text,
} from "@chakra-ui/react";
import { FullStatDisplay } from "./FullStatDisplay";
import { RealStat } from "./RealStat";
import { gameScoreColor as ratingColor } from "../utils/rating";

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
    <Box
      w="100%"
      bg="bg.card"
      borderRadius="card"
      border="1px solid"
      borderColor="border.subtle"
      position="relative"
      px={{ base: 3, md: 5 }}
      pt={6}
      pb={3}
      transition="all 0.15s ease"
      _hover={{ cursor: "pointer", bg: "bg.hover", borderColor: "accent.500" }}
      onClick={onOpen}
    >
      <FullStatDisplay
        data={fullData}
        isOpen={isOpen}
        onClose={onClose}
        onOpen={onOpen}
        name={name}
      />
      <Text
        pos="absolute"
        left={3}
        top={2}
        color="text.muted"
        fontWeight={700}
        fontSize="2xs"
        letterSpacing="0.04em"
        textTransform="uppercase"
      >
        {date}
      </Text>
      <Text
        pos="absolute"
        right={3}
        top={2}
        color={ratingColor(fullData["rating"])}
        fontFamily="heading"
        fontWeight={900}
        fontSize={{ base: "sm", md: "md" }}
      >
        {fullData.rating.toFixed(1)}
        <Box as="span" fontSize="2xs" color="text.faint" ml={1} fontWeight={700}>
          GMSC
        </Box>
      </Text>
      <HStack
        w="100%"
        spacing={{ base: 3, md: 4 }}
        align="center"
      >
        <Avatar bg="bg.hover" color="text.primary" name={name} />
        <HStack
          flex="1"
          spacing={{ base: 2, md: 5 }}
          justify={{ base: "space-around", md: "flex-start" }}
        >
          <RealStat statName="pts" statNum={pts} />
          <RealStat statName={stat1} statNum={statNum1} />
          <RealStat statName={stat2} statNum={statNum2} />
        </HStack>
      </HStack>
    </Box>
  );
};
