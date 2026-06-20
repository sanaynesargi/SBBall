import { DeleteIcon } from "@chakra-ui/icons";
import {
  useToast,
  Box,
  HStack,
  Avatar,
  Heading,
  Text,
  IconButton,
} from "@chakra-ui/react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { PlayerDetails } from "../types/PlayerDetails";
import { apiUrl } from "../utils/apiUrl";
import { PlayerEditModal } from "./PlayerEditModal";

interface PlayerProps {
  id: string;
  name: string;
  jersey: number;
  position: string;
  secPosition?: string;
  height: string;
  nickname?: string;
  // editable props
  players: PlayerDetails[];
  setPlayers: Function;
  index: number;
}

export const Player = ({
  name,
  jersey,
  position,
  secPosition,
  height,
  index,
  players,
  setPlayers,
  nickname,
}: PlayerProps) => {
  const toast = useToast();
  const dev = process.env.NODE_ENV == "development";
  const router = useRouter();

  return (
    <Box
      w="100%"
      bg="bg.card"
      borderRadius="card"
      border="1px solid"
      borderColor="border.subtle"
      position="relative"
      overflow="hidden"
      px={{ base: 3, md: 5 }}
      py={4}
      _before={{
        content: '""',
        position: "absolute",
        left: 0,
        top: 0,
        bottom: 0,
        width: "4px",
        bg: "accent.500",
      }}
    >
      <HStack
        w="100%"
        spacing={{ base: 3, md: 4 }}
        align="center"
        flexWrap={{ base: "wrap", md: "nowrap" }}
      >
        <Avatar bg="bg.hover" color="text.primary" name={name} />
        <HStack
          flex="1"
          minW={0}
          spacing={{ base: 2, md: 3 }}
          align="center"
          divider={
            <Text color="text.faint" px={1}>
              •
            </Text>
          }
        >
          <Text
            color="text.muted"
            fontSize={{ base: "xs", md: "sm" }}
            fontWeight={700}
            letterSpacing="0.04em"
            whiteSpace="nowrap"
          >
            {height}
          </Text>
          <Heading
            fontFamily="heading"
            fontWeight={800}
            fontSize={{ base: "md", md: "lg" }}
            color="text.primary"
            isTruncated
            _hover={{ color: "accent.400", cursor: "pointer" }}
            onClick={() =>
              router.push(
                `/playerInfo?name=${name}&height=${
                  height[0] + "|" + height[2]
                }&num=${jersey}&pos=${`${position}${
                  secPosition ? `/${secPosition}` : ""
                }`}`
              )
            }
          >
            {name}
          </Heading>
          <Text
            color="text.muted"
            fontSize={{ base: "xs", md: "sm" }}
            fontWeight={700}
            whiteSpace="nowrap"
          >
            #{jersey} {position}
            {secPosition ? `/${secPosition}` : null}
          </Text>
        </HStack>
        {dev ? (
          <HStack spacing={2}>
            <PlayerEditModal
              index={index}
              players={players}
              setPlayers={setPlayers}
            />
            <IconButton
              icon={<DeleteIcon />}
              aria-label="delete"
              colorScheme="red"
              size="sm"
              onClick={async () => {
                    let newP = players.slice();
                    let name = players[index].name;
                    let id = players[index].id;

                    const delReq = await axios.get(
                      `${apiUrl}/api/deletePlayer?id=${id}`
                    );

                    const error = delReq.data.error;

                    if (error) {
                      toast({
                        title: "Error Deleting Player",
                        description: `An error has occured. Please try again later`,
                        status: "error",
                        duration: 3000,
                        isClosable: true,
                      });
                    } else {
                      toast({
                        title: "Deleted Player",
                        description: `Player ${name} deleted successfully.`,
                        status: "success",
                        duration: 3000,
                        isClosable: true,
                      });

                      newP.splice(index, 1);
                      setPlayers(newP);
                    }
                  }}
                />
          </HStack>
        ) : null}
      </HStack>
    </Box>
  );
};
