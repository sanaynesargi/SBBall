import { HStack, Heading } from "@chakra-ui/react";
import { RealStatProps } from "../types/RealStat";

export const RealStat = ({ statName, statNum, sm }: RealStatProps) => {
  return (
    <HStack display="table-cell" textAlign="center">
      <HStack spacing={1}>
        <Heading fontSize={sm ? "20pt" : "25pt"}>{statNum}</Heading>
        <Heading fontSize="12pt" color="gray" mt="9pt" fontWeight="semibold">
          {statName}
        </Heading>
      </HStack>
    </HStack>
  );
};
