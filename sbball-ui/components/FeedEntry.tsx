import { Box, Flex, HStack, Avatar, VStack, Text } from "@chakra-ui/react";

interface FeedEntryProps {
  name: string;
  description: string;
  stat1Num: number | string | null;
  stat1Name: string | null;
  stat2Num: number | string | null;
  stat2Name: string | null;
  system?: boolean;
}

export const FeedEntry = ({
  description,
  name,
  stat1Name,
  stat2Name,
  stat1Num,
  stat2Num,
  system,
}: FeedEntryProps) => {
  // System/clock events: centered, no avatar or stats.
  if (system) {
    return (
      <Flex align="center" justify="center" gap={2.5} py={3} color="text.muted">
        <Box w="6px" h="6px" borderRadius="full" bg="accent.400" flexShrink={0} />
        <Text
          fontSize="sm"
          fontWeight={700}
          letterSpacing="0.04em"
          textTransform="uppercase"
        >
          {description}
        </Text>
      </Flex>
    );
  }

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
