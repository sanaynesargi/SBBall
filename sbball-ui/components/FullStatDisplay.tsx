import {
  Box,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  VStack,
  HStack,
  SimpleGrid,
  ModalFooter,
  Button,
  Text,
} from "@chakra-ui/react";
import { RealStatShort } from "./RealStatShort";
import { gameScoreColor as ratingColor } from "../utils/rating";

interface FullStatDisplayProps {
  data: any;
  isOpen: any;
  onOpen: any;
  onClose: any;
  name: any;
}

export const FullStatDisplay = ({
  isOpen,
  onClose,
  onOpen,
  data,
  name,
}: FullStatDisplayProps) => {
  return (
    <Box>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <HStack spacing={2} align="baseline">
              <Text
                fontFamily="heading"
                fontWeight={800}
                color="text.primary"
              >
                {name}
              </Text>
              <Text color="text.faint">|</Text>
              <Text
                fontFamily="heading"
                fontWeight={900}
                fontSize={{ base: "lg", md: "xl" }}
                color={ratingColor(data["rating"])}
              >
                {data["rating"].toFixed(1)}
                <Box as="span" fontSize="2xs" color="text.faint" ml={1} fontWeight={700}>
                  GMSC
                </Box>
              </Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <SimpleGrid columns={{ base: 3, md: 5 }} spacing={3}>
                <RealStatShort statName="pts" statNum={data["pts"]} />
                <RealStatShort statName="reb" statNum={data["reb"]} />
                <RealStatShort statName="ast" statNum={data["ast"]} />
                <RealStatShort statName="stl" statNum={data["stl"]} />
                <RealStatShort statName="blk" statNum={data["blk"]} />
              </SimpleGrid>
              <SimpleGrid columns={{ base: 2, md: 4 }} spacing={3}>
                <RealStatShort
                  statName="2fg"
                  statNum={`${data["twos"]}/${data["twosAttempted"]}`}
                />
                <RealStatShort
                  statName="3fg"
                  statNum={`${data["threes"]}/${data["threesAttempted"]}`}
                />
                <RealStatShort
                  statName="3%"
                  statNum={`${(
                    (data["threes"] / data["threesAttempted"]) * 100 || 0
                  ).toFixed(2)}%`}
                />
                <RealStatShort statName="fg%" statNum={data.fg} />
              </SimpleGrid>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="accent" onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};
