import { VStack, SimpleGrid, HStack, Text } from "@chakra-ui/react";
import { RealStatShort } from "./RealStatShort";

interface BoxScorePlayerProps {
  name: string;
  pts: number;
  reb: number;
  ast: number;
  stl: number;
  blk: number;
  fg: number;
  rtg: number;
}

export const BoxScorePlayer = ({
  name,
  pts,
  reb,
  ast,
  stl,
  blk,
  fg,
  rtg,
}: BoxScorePlayerProps) => {
  return (
    <VStack
      w="100%"
      align="stretch"
      bg="bg.surface"
      border="1px solid"
      borderColor="border.subtle"
      borderRadius="tile"
      px={4}
      py={3}
      spacing={3}
    >
      <HStack justify="space-between" align="baseline">
        <Text
          fontFamily="heading"
          fontWeight={800}
          color="text.primary"
          fontSize={{ base: "sm", md: "md" }}
        >
          {name}
        </Text>
        <Text
          fontFamily="heading"
          fontWeight={900}
          color="accent.400"
          fontSize={{ base: "sm", md: "md" }}
        >
          {rtg.toFixed(2)}
        </Text>
      </HStack>
      <SimpleGrid columns={{ base: 3, md: 6 }} spacing={2}>
        <RealStatShort statName="pts" statNum={Math.round(pts)} sm />
        <RealStatShort statName="reb" statNum={Math.round(reb)} sm />
        <RealStatShort statName="ast" statNum={Math.round(ast)} sm />
        <RealStatShort statName="stl" statNum={Math.round(stl)} sm />
        <RealStatShort statName="blk" statNum={Math.round(blk)} sm />
        <RealStatShort statName="fg" statNum={(fg * 100).toFixed(2) + "%"} sm />
      </SimpleGrid>
    </VStack>
  );
};
