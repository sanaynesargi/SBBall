import {
  useDisclosure,
  useToast,
  Box,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Stack,
  FormControl,
  VStack,
  FormLabel,
  Input,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  ModalFooter,
} from "@chakra-ui/react";
import axios from "axios";
import { useState } from "react";
import { apiUrl } from "../utils/apiUrl";
import { PositionSelect } from "./PositionSelect";
import { PlayerDetails } from "../types/PlayerDetails";

interface PlayerCreateProps {
  players: PlayerDetails[];
  setPlayers: Function;
}

export const PlayerCreateModal = ({
  players,
  setPlayers,
}: PlayerCreateProps) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  let [playerName, setPlayerName] = useState("");
  let [nickName, setNickName] = useState("");
  let [jerseyNum, setJerseyNum] = useState("");
  let [pos, setPos] = useState("");
  let [pos2, setPos2] = useState("");
  let [height, setHeight] = useState("");

  const labelProps = {
    color: "text.muted",
    fontSize: "sm",
    fontWeight: 600,
    mb: 1,
  };

  const inputProps = {
    bg: "bg.surface",
    border: "1px solid",
    borderColor: "border.subtle",
    color: "text.primary",
    _placeholder: { color: "text.faint" },
    _hover: { borderColor: "accent.500" },
    _focus: { borderColor: "accent.500", boxShadow: "none" },
    _focusVisible: { borderColor: "accent.500", boxShadow: "none" },
  } as const;

  return (
    <Box w="100%" maxW="410px">
      <Button variant="accent" onClick={onOpen}>
        Create Player
      </Button>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader fontFamily="heading" fontWeight={800}>
            Create Player
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Stack
              direction={{ base: "column", md: "row" }}
              spacing={{ base: 4, md: 6 }}
              align="start"
            >
              <FormControl>
                <VStack alignItems="start" height="100%" spacing={4} w="100%">
                  <Box w="100%">
                    <FormLabel {...labelProps}>Player Name</FormLabel>
                    <Input
                      {...inputProps}
                      placeholder="e.g. Lebron James"
                      onChange={(e) => setPlayerName(e.target.value)}
                      value={playerName}
                    />
                  </Box>
                  <Box w="100%">
                    <FormLabel {...labelProps}>Jersey #</FormLabel>
                    <NumberInput
                      onChange={(e) => setJerseyNum(e)}
                      defaultValue={15}
                      value={jerseyNum}
                    >
                      <NumberInputField {...inputProps} />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </Box>
                  <Box w="100%">
                    <FormLabel {...labelProps}>Position</FormLabel>
                    <PositionSelect setPos={setPos} />
                  </Box>
                </VStack>
              </FormControl>
              <FormControl>
                <VStack alignItems="start" spacing={4} w="100%">
                  <Box w="100%">
                    <FormLabel {...labelProps}>Nickname (Opt.)</FormLabel>
                    <Input
                      {...inputProps}
                      placeholder="e.g. The King"
                      onChange={(e) => setNickName(e.target.value)}
                      value={nickName}
                    />
                  </Box>
                  <Box w="100%">
                    <FormLabel {...labelProps}>Height</FormLabel>
                    <Input
                      {...inputProps}
                      placeholder={`e.g. 7'0"`}
                      onChange={(e) => setHeight(e.target.value)}
                      value={height}
                    />
                  </Box>

                  <Box w="100%">
                    <FormLabel {...labelProps}>Sec. Position (Opt.)</FormLabel>
                    <PositionSelect setPos={setPos2} sec />
                  </Box>
                </VStack>
              </FormControl>
            </Stack>
          </ModalBody>

          <ModalFooter>
            <Button
              variant="ghostMuted"
              mr={3}
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              variant="accent"
              onClick={async () => {
                let old = players.slice();

                let newPlayer: PlayerDetails = {
                  height,
                  jersey: parseInt(jerseyNum),
                  name: playerName,
                  position: pos,
                  secPosition: pos2 ? pos2 : "",
                  nickname: nickName ? nickName : "",
                };

                // send request to server to insert player
                const resp = await axios.post(
                  `${apiUrl}/api/createPlayer`,
                  newPlayer
                );

                const error = resp.data.error;

                if (error) {
                  toast({
                    title: "Error Creating Player",
                    description: `An error has occured. Please try again later`,
                    status: "error",
                    duration: 3000,
                    isClosable: true,
                  });
                } else {
                  toast({
                    title: "Created Player",
                    description: `Player ${playerName} created successfully.`,
                    status: "success",
                    duration: 3000,
                    isClosable: true,
                  });
                  old.push(newPlayer);
                  setPlayers(old);
                }
                onClose();
              }}
            >
              Save
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};
