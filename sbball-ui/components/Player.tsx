import { DeleteIcon } from "@chakra-ui/icons";
import {
  useToast,
  Container,
  Center,
  HStack,
  Avatar,
  Heading,
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
    <Container
      w="100%"
      h="100px"
      bg="#279AF1"
      borderRadius="lg"
      position="relative"
    >
      <Center w="100%" h="100%">
        <HStack w="100%" h="100%">
          <Avatar bg="#191919" color="white" name={name} />
          <HStack w="100%" alignItems="center" justifyContent="center">
            <Heading fontSize="15pt">{height}</Heading>
            <Heading fontSize="15pt">•</Heading>
            <Heading
              fontSize="15pt"
              _hover={{ textDecor: "underline", cursor: "pointer" }}
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
            <Heading fontSize="15pt">•</Heading>
            <Heading fontSize="15pt">
              #{jersey} {position}
              {secPosition ? `/${secPosition}` : null}
            </Heading>
            {dev ? (
              <>
                <PlayerEditModal
                  index={index}
                  players={players}
                  setPlayers={setPlayers}
                />
                <IconButton
                  icon={<DeleteIcon />}
                  aria-label="delete"
                  colorScheme="red"
                  onClick={async () => {
                    let newP = players.slice();
                    let name = players[index].name;
                    let id = players[index].id;

                    const delReq = await axios.get(
                      `http://${apiUrl}/api/deletePlayer?id=${id}`
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
              </>
            ) : null}
          </HStack>
        </HStack>
      </Center>
    </Container>
  );
};
