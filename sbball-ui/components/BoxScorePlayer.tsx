import { VStack, HStack, Text } from "@chakra-ui/react";
import { RealStatShort } from "./RealStatShort";

interface BoxScorePlayerProps {
  name: string;
  pts: number;
  reb: number;
  ast: number;
  stl: number;
  blk: number;
  fg: number;
}

export const BoxScorePlayer = ({
  name,
  pts,
  reb,
  ast,
  stl,
  blk,
  fg,
}: BoxScorePlayerProps) => {
  return (
    <VStack border="0.15px solid gray" borderRadius="md" px="15px" py="5px">
      <Text alignSelf="self-start" fontWeight="semibold">
        {name}
      </Text>
      <HStack>
        <RealStatShort statName="pts" statNum={Math.round(pts)} sm />
        <RealStatShort statName="reb" statNum={Math.round(reb)} sm />
        <RealStatShort statName="ast" statNum={Math.round(ast)} sm />
        <RealStatShort statName="stl" statNum={Math.round(stl)} sm />
        <RealStatShort statName="blk" statNum={Math.round(blk)} sm />
        <RealStatShort statName="fg" statNum={(fg * 100).toFixed(2) + "%"} sm />
      </HStack>
    </VStack>
  );
};
