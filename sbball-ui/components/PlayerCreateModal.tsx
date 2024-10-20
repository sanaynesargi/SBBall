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
  HStack,
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

  return (
    <Box w="410px">
      <Button onClick={onOpen}>Create Player</Button>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create Player</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <HStack>
              <FormControl>
                <VStack alignItems="start" height="100%" spacing="2vh">
                  <Box>
                    <FormLabel>Player Name</FormLabel>
                    <Input
                      placeholder="e.g. Lebron James"
                      onChange={(e) => setPlayerName(e.target.value)}
                      value={playerName}
                    />
                  </Box>
                  <Box>
                    <FormLabel>Jersey #</FormLabel>
                    <NumberInput
                      onChange={(e) => setJerseyNum(e)}
                      defaultValue={15}
                      value={jerseyNum}
                    >
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </Box>
                  <Box>
                    <FormLabel>Position</FormLabel>
                    <PositionSelect setPos={setPos} />
                  </Box>
                </VStack>
              </FormControl>
              <FormControl>
                <VStack alignItems="start" spacing="2vh">
                  <Box>
                    <FormLabel>Nickname (Opt.)</FormLabel>
                    <Input
                      placeholder="e.g. The King"
                      onChange={(e) => setNickName(e.target.value)}
                      value={nickName}
                    />
                  </Box>
                  <Box>
                    <FormLabel>Height</FormLabel>
                    <Input
                      placeholder={`e.g. 7'0"`}
                      onChange={(e) => setHeight(e.target.value)}
                      value={height}
                    />
                  </Box>

                  <Box>
                    <FormLabel>Sec. Position (Opt.)</FormLabel>
                    <PositionSelect setPos={setPos2} sec />
                  </Box>
                </VStack>
              </FormControl>
            </HStack>
          </ModalBody>

          <ModalFooter>
            <Button
              colorScheme="blue"
              mr={3}
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
                  `http://${apiUrl}/api/createPlayer`,
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
