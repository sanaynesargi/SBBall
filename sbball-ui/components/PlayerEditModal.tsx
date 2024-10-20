import { EditIcon } from "@chakra-ui/icons";
import {
  useDisclosure,
  useToast,
  Box,
  IconButton,
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
  Button,
} from "@chakra-ui/react";
import axios from "axios";
import { useState } from "react";
import { apiUrl } from "../utils/apiUrl";
import { PositionSelect } from "./PositionSelect";
import { PlayerDetails } from "../types/PlayerDetails";

interface PlayerEditProps {
  players: PlayerDetails[];
  setPlayers: Function;
  index: number;
}

export const PlayerEditModal = ({
  index,
  players,
  setPlayers,
}: PlayerEditProps) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const pulledPlayer = players[index];

  let [playerName, setPlayerName] = useState(pulledPlayer.name);
  let [nickName, setNickName] = useState(pulledPlayer.nickname ?? "");
  let [jerseyNum, setJerseyNum] = useState(pulledPlayer.jersey.toString());
  let [pos, setPos] = useState(pulledPlayer.position);
  let [pos2, setPos2] = useState(pulledPlayer.secPosition ?? "");
  let [height, setHeight] = useState(pulledPlayer.height);

  return (
    <Box>
      <IconButton onClick={onOpen} icon={<EditIcon />} aria-label="edit">
        Create Player
      </IconButton>

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
                    <PositionSelect
                      setPos={setPos}
                      defaultValue={pulledPlayer.position}
                    />
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
                    <PositionSelect
                      setPos={setPos2}
                      sec
                      defaultValue={pulledPlayer.secPosition}
                    />
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
                  id: old[index].id,
                };

                // send request to server to insert player
                const resp = await axios.post(
                  `http://${apiUrl}/api/editPlayer`,
                  newPlayer
                );

                const error = resp.data.error;

                if (error) {
                  toast({
                    title: "Error Editing Player",
                    description: `An error has occured. Please try again later`,
                    status: "error",
                    duration: 3000,
                    isClosable: true,
                  });
                } else {
                  toast({
                    title: "Edited Player",
                    description: `Player ${playerName} edited successfully.`,
                    status: "success",
                    duration: 3000,
                    isClosable: true,
                  });

                  old[index] = newPlayer;
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
