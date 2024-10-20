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
            Box Score - {name}: {data["date"]}
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
