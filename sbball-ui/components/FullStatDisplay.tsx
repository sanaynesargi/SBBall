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
  ModalFooter,
  Button,
  Text,
} from "@chakra-ui/react";
import { RealStatShort } from "./RealStatShort";

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
        <ModalContent bg="gray.800">
          <ModalHeader>
            <HStack>
              <Text>{name} |</Text>
              <Text
                fontSize={"15pt"}
                color={
                  data["rating"] >= 5
                    ? "yellow"
                    : data["rating"] >= 10
                    ? "greenyellow"
                    : data["rating"] >= 15
                    ? "green"
                    : data["rating"] >= 20
                    ? "lime"
                    : data["rating"] >= 25
                    ? "limegreen"
                    : data["rating"] >= 30
                    ? "forestgreen"
                    : data["rating"] >= 35
                    ? "mediumseagreen"
                    : data["rating"] >= 40
                    ? "seagreen"
                    : data["rating"] >= 45
                    ? "darkseagreen"
                    : data["rating"] >= 50
                    ? "mediumspringgreen"
                    : "red"
                }
              >
                {data["rating"].toFixed(2)}
              </Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack>
              <HStack>
                <RealStatShort statName="pts" statNum={data["pts"]} />
                <RealStatShort statName="reb" statNum={data["reb"]} />
                <RealStatShort statName="ast" statNum={data["ast"]} />
                <RealStatShort statName="stl" statNum={data["stl"]} />
                <RealStatShort statName="blk" statNum={data["blk"]} />
              </HStack>
              <HStack>
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
              </HStack>
              <HStack>
                <RealStatShort statName="fg%" statNum={data.fg} />
              </HStack>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};
