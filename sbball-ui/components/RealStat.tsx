import { VStack, Heading, Text } from "@chakra-ui/react";
import { RealStatProps } from "../types/RealStat";

export const RealStat = ({ statName, statNum, sm }: RealStatProps) => {
  return (
    <VStack spacing={0} textAlign="center" px={2}>
      <Heading
        fontFamily="heading"
        fontWeight={900}
        lineHeight={1}
        color="text.primary"
        fontSize={sm ? { base: "lg", md: "xl" } : { base: "xl", md: "2xl" }}
      >
        {statNum}
      </Heading>
      <Text
        color="text.muted"
        fontSize="2xs"
        fontWeight={700}
        letterSpacing="0.04em"
        textTransform="uppercase"
      >
        {statName}
      </Text>
    </VStack>
  );
};
