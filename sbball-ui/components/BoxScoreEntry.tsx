import { Center, VStack, HStack, Text } from "@chakra-ui/react";
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
    <Center
      border="0.30px solid gray"
      px="25px"
      py="10px"
      borderRadius="md"
      _hover={{ cursor: "pointer" }}
      pos="relative"
      onClick={() => {
        // setIndexNumber(index);
        // onOpen();
        router.push(`/gameView?id=${gameId}`);
      }}
    >
      <VStack>
        <Text>{team1}</Text>
        <HStack>
          <Text fontWeight={score1 >= score2 ? "bold" : "thin"} fontSize="25pt">
            {score1}
          </Text>
          <Text>-</Text>
          <Text fontWeight={score2 >= score1 ? "bold" : "thin"} fontSize="25pt">
            {score2}
          </Text>
        </HStack>
        <Text>{team2}</Text>
        <Text fontSize="11pt" color="gray.500">
          {date}
        </Text>
      </VStack>
    </Center>
  );
};
