import { Box, HStack, Avatar, VStack, Text } from "@chakra-ui/react";

interface FeedEntryProps {
  name: string;
  description: string;
  stat1Num: number | string | null;
  stat1Name: string | null;
  stat2Num: number | string | null;
  stat2Name: string | null;
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
    <Box
      w="100%"
      bg="bg.card"
      borderRadius="card"
      border="1px solid"
      borderColor="border.subtle"
      px={{ base: 3, md: 5 }}
      py={4}
    >
      <HStack w="100%" align="flex-start" spacing={{ base: 3, md: 4 }}>
        <Avatar bg="bg.hover" color="text.primary" name={name} />
        <VStack w="100%" align="flex-start" spacing={1}>
          <Text
            fontFamily="heading"
            fontSize={{ base: "md", md: "lg" }}
            fontWeight={800}
            color="text.primary"
          >
            {description}
          </Text>
          <HStack
            spacing={2}
            color="text.muted"
            fontSize={{ base: "xs", md: "sm" }}
          >
            <Text color="text.primary" fontWeight={700}>
              {name}
            </Text>
            <Text color="text.faint">·</Text>
            {stat1Name ? (
              <Text
                letterSpacing="0.04em"
                textTransform="uppercase"
                fontWeight={600}
              >
                {stat1Num} {stat1Name}
                {stat2Name ? `, ${stat2Num} ${stat2Name}` : ""}
              </Text>
            ) : null}
          </HStack>
        </VStack>
      </HStack>
    </Box>
  );
};
