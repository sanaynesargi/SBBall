import { Box, VStack, HStack, Text } from "@chakra-ui/react";
import { useRouter } from "next/navigation";

interface BoxScoreEntryProps {
  onOpen: any;
  team1: string;
  team2: string;
  score1: number;
  score2: number;
  date: string;
  index: number;
  gameId: number;
}

export const BoxScoreEntry = ({
  onOpen,
  team1,
  team2,
  score1,
  score2,
  index,
  date,
  gameId,
}: BoxScoreEntryProps) => {
  const router = useRouter();

  return (
    <Box
      w="100%"
      bg="bg.card"
      borderRadius="card"
      border="1px solid"
      borderColor="border.subtle"
      px={{ base: 4, md: 6 }}
      py={4}
      transition="all 0.15s ease"
      _hover={{ cursor: "pointer", bg: "bg.hover", borderColor: "accent.500" }}
      pos="relative"
      onClick={() => {
        // setIndexNumber(index);
        // onOpen();
        const teamLength = team1.split(", ").length;
        const mode = `${teamLength}v${teamLength}`;
        router.push(`/gameView?id=${gameId}&mode=${mode}&date=${date}`);
      }}
    >
      <VStack spacing={2}>
        <Text
          color="text.muted"
          fontSize={{ base: "xs", md: "sm" }}
          fontWeight={700}
          letterSpacing="0.04em"
          textAlign="center"
        >
          {team1}
        </Text>
        <HStack align="baseline" spacing={3}>
          <Text
            fontFamily="heading"
            fontWeight={score1 >= score2 ? 900 : 400}
            color={score1 >= score2 ? "text.primary" : "text.muted"}
            fontSize={{ base: "3xl", md: "4xl" }}
            lineHeight={1}
          >
            {score1}
          </Text>
          <Text color="text.faint" fontSize="xl">
            -
          </Text>
          <Text
            fontFamily="heading"
            fontWeight={score2 >= score1 ? 900 : 400}
            color={score2 >= score1 ? "text.primary" : "text.muted"}
            fontSize={{ base: "3xl", md: "4xl" }}
            lineHeight={1}
          >
            {score2}
          </Text>
        </HStack>
        <Text
          color="text.muted"
          fontSize={{ base: "xs", md: "sm" }}
          fontWeight={700}
          letterSpacing="0.04em"
          textAlign="center"
        >
          {team2}
        </Text>
        <Text
          fontSize="2xs"
          color="text.faint"
          letterSpacing="0.04em"
          textTransform="uppercase"
        >
          {date}
        </Text>
      </VStack>
    </Box>
  );
};
