import {
  Box,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Select,
  Center,
  VStack,
  ModalFooter,
  Button,
} from "@chakra-ui/react";
import { useState } from "react";
import { BoxScorePlayer } from "./BoxScorePlayer";

interface BoxScoreDisplayProps {
  data: any;
  isOpen: any;
  onOpen: any;
  onClose: any;
}

export const BoxScoreDisplay = ({
  isOpen,
  onClose,
  data,
}: BoxScoreDisplayProps) => {
  const team1Lst = data.team1.split(";");

  const team1Form = data.team1.replaceAll(";", ", ");
  const team2Form = data.team2.replaceAll(";", ", ");

  let sortedPerfs = data.perfs;
  const [selectedTeam, setSelectedTeam] = useState(team1Form);

  sortedPerfs.sort((a: any, b: any) => b.pts - a.pts);

  return (
    <Box>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader fontFamily="heading" fontWeight={800}>
            Box Score
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Select
              bg="bg.surface"
              borderColor="border.subtle"
              defaultValue={team1Form}
              onChange={(e) => setSelectedTeam(e.target.value)}
            >
              <option value={team1Form}>{team1Form}</option>
              <option value={team2Form}>{team2Form}</option>
            </Select>
            <Center mt="15px">
              <VStack w="100%" spacing={3}>
                {sortedPerfs.map((perf: any, index: number) => {
                  if (
                    selectedTeam == team1Form &&
                    !team1Lst.includes(perf.playerName)
                  ) {
                    return;
                  }
                  if (
                    selectedTeam != team1Form &&
                    team1Lst.includes(perf.playerName)
                  ) {
                    return;
                  }

                  return (
                    <BoxScorePlayer
                      key={index}
                      name={perf.playerName}
                      pts={perf.pts}
                      reb={perf.reb}
                      ast={perf.ast}
                      blk={perf.blk}
                      stl={perf.stl}
                      fg={perf.fg}
                      rtg={perf.rating}
                    />
                  );
                })}
              </VStack>
            </Center>
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
