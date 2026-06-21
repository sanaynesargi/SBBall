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
  let [weight, setWeight] = useState(
    pulledPlayer.weight != null ? String(pulledPlayer.weight) : ""
  );

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
    <Box>
      <IconButton
        onClick={onOpen}
        icon={<EditIcon />}
        aria-label="edit"
        variant="surface"
      />

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader fontFamily="heading" fontWeight={800}>
            Edit Player
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
                    <PositionSelect
                      setPos={setPos}
                      defaultValue={pulledPlayer.position}
                    />
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
                    <FormLabel {...labelProps}>Weight (lbs, opt.)</FormLabel>
                    <Input
                      {...inputProps}
                      type="number"
                      placeholder="e.g. 185"
                      onChange={(e) => setWeight(e.target.value)}
                      value={weight}
                    />
                  </Box>

                  <Box w="100%">
                    <FormLabel {...labelProps}>Sec. Position (Opt.)</FormLabel>
                    <PositionSelect
                      setPos={setPos2}
                      sec
                      defaultValue={pulledPlayer.secPosition}
                    />
                  </Box>
                </VStack>
              </FormControl>
            </Stack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghostMuted" mr={3} onClick={onClose}>
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
                  weight: weight ? parseInt(weight) : null,
                  id: old[index].id,
                };

                // send request to server to insert player
                const resp = await axios.post(
                  `${apiUrl}/api/editPlayer`,
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
