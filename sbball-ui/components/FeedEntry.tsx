import { Box, HStack, Avatar, VStack, Text } from "@chakra-ui/react";

interface FeedEntryProps {
  name: string;
  description: string;
  stat1Num: number;
  stat1Name: string;
  stat2Num: number;
  stat2Name: string;
}

export const FeedEntry = ({
  description,
  name,
  stat1Name,
  stat2Name,
  stat1Num,
  stat2Num,
}: FeedEntryProps) => {
  return (
    <Box w="70%">
      <HStack w="100%">
        <Avatar name="Sanay" />
        <VStack w="100%">
          <Text fontSize="15pt" fontWeight="bold">
            {description}
          </Text>
          <HStack>
            <Text>{name}</Text>
            <Text color="gray.500">·</Text>
            <Text color="gray.500">
              {stat1Num}
              {stat1Name}, {stat2Name}
              {stat2Name}
            </Text>
          </HStack>
        </VStack>
      </HStack>
    </Box>
  );
};
