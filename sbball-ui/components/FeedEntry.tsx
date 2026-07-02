import { Box, Flex, HStack, Avatar, VStack, Text } from "@chakra-ui/react";

interface FeedEntryProps {
  name: string;
  description: string;
  stat1Num: number | string | null;
  stat1Name: string | null;
  stat2Num: number | string | null;
  stat2Name: string | null;
  system?: boolean;
  time?: string | null;
  quarter?: string | null;
}

const QuarterPill = ({ quarter }: { quarter: string }) => (
  <Box
    px={1.5}
    py={0.5}
    borderRadius="full"
    bg="bg.surface"
    border="1px solid"
    borderColor="border.subtle"
    fontSize="10px"
    fontWeight={800}
    letterSpacing="0.04em"
    color="accent.400"
    flexShrink={0}
  >
    {quarter}
  </Box>
);

export const FeedEntry = ({
  description,
  name,
  stat1Name,
  stat2Name,
  stat1Num,
  stat2Num,
  system,
  time,
  quarter,
}: FeedEntryProps) => {
  // System/clock events: centered, no avatar or stats.
  if (system) {
    return (
      <Flex align="center" justify="center" gap={2.5} py={3} color="text.muted">
        {quarter ? <QuarterPill quarter={quarter} /> : null}
        <Box w="6px" h="6px" borderRadius="full" bg="accent.400" flexShrink={0} />
        <Text
          fontSize="sm"
          fontWeight={700}
          letterSpacing="0.04em"
          textTransform="uppercase"
        >
          {description}
        </Text>
        {time ? (
          <Text fontSize="xs" color="text.faint" fontWeight={600}>
            {time}
          </Text>
        ) : null}
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
            {quarter ? <QuarterPill quarter={quarter} /> : null}
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
            {time ? (
              <>
                <Text color="text.faint">·</Text>
                <Text color="text.faint" fontWeight={600}>
                  {time}
                </Text>
              </>
            ) : null}
          </HStack>
        </VStack>
      </HStack>
    </Box>
  );
};
