import { Box, VStack, SimpleGrid, HStack, Text } from "@chakra-ui/react";
import { RealStatShort } from "./RealStatShort";
import { gameScoreColor } from "../utils/rating";
import { GameScoreBreakdown } from "./GameScoreBreakdown";

interface BoxScorePlayerProps {
  name: string;
  pts: number;
  reb: number;
  ast: number;
  stl: number;
  blk: number;
  fg: number;
  fgm?: number;
  fga?: number;
  tpm?: number;
  tpa?: number;
  min?: number | null;
  pm?: number | null;
  rtg: number;
  // Full performance row, used to render the Game Score breakdown on tap.
  perf?: any;
}

export const BoxScorePlayer = ({
  name,
  pts,
  reb,
  ast,
  stl,
  blk,
  fg,
  fgm,
  fga,
  tpm,
  tpa,
  min,
  pm,
  rtg,
  perf,
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
        {(() => {
          const gmscText = (
            <Text
              fontFamily="heading"
              fontWeight={900}
              color={gameScoreColor(rtg)}
              fontSize={{ base: "sm", md: "md" }}
            >
              {rtg.toFixed(1)}
              <Box as="span" fontSize="2xs" color="text.faint" ml={1} fontWeight={700}>
                GMSC
              </Box>
            </Text>
          );
          return perf ? (
            <GameScoreBreakdown perf={perf}>{gmscText}</GameScoreBreakdown>
          ) : (
            gmscText
          );
        })()}
      </HStack>
      <SimpleGrid columns={{ base: 4, md: 5 }} spacing={2}>
        <RealStatShort
          statName="min"
          statNum={min == null ? "—" : min.toFixed(1)}
          sm
        />
        <RealStatShort
          statName="+/-"
          statNum={pm == null ? "—" : pm > 0 ? `+${Math.round(pm)}` : Math.round(pm)}
          sm
        />
        <RealStatShort statName="pts" statNum={Math.round(pts)} sm />
        <RealStatShort statName="reb" statNum={Math.round(reb)} sm />
        <RealStatShort statName="ast" statNum={Math.round(ast)} sm />
        <RealStatShort statName="stl" statNum={Math.round(stl)} sm />
        <RealStatShort statName="blk" statNum={Math.round(blk)} sm />
        <RealStatShort
          statName="fg"
          statNum={fga == null ? "—" : `${Math.round(fgm ?? 0)}-${Math.round(fga)}`}
          sm
        />
        <RealStatShort
          statName="3p"
          statNum={tpa == null ? "—" : `${Math.round(tpm ?? 0)}-${Math.round(tpa)}`}
          sm
        />
        <RealStatShort
          statName="fg%"
          statNum={fg == null ? "—" : (fg * 100).toFixed(1) + "%"}
          sm
        />
      </SimpleGrid>
    </VStack>
  );
};
