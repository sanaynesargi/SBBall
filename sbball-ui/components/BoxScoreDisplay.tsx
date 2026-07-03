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
import { BoxScoreTable } from "./BoxScoreTable";

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

  // Split performances by team for the large-screen table view.
  const team1Perfs = sortedPerfs.filter((p: any) =>
    team1Lst.includes(p.playerName)
  );
  const team2Perfs = sortedPerfs.filter(
    (p: any) => !team1Lst.includes(p.playerName)
  );
  const t1Score = data.team1Score;
  const t2Score = data.team2Score;

  return (
    <Box>
      <Modal isOpen={isOpen} onClose={onClose} size={{ base: "md", lg: "6xl" }}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader fontFamily="heading" fontWeight={800}>
            Box Score
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {/* Small screens: team dropdown + stacked player cards. */}
            <Box display={{ base: "block", lg: "none" }}>
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
                        min={perf.min}
                        pm={perf.pm}
                        rtg={perf.rating}
                      />
                    );
                  })}
                </VStack>
              </Center>
            </Box>

            {/* Large screens: full box score tables for both teams at once. */}
            <VStack
              display={{ base: "none", lg: "flex" }}
              spacing={6}
              align="stretch"
            >
              <BoxScoreTable
                title={team1Form}
                color="team1.500"
                score={t1Score}
                win={t1Score > t2Score}
                players={team1Perfs}
              />
              <BoxScoreTable
                title={team2Form}
                color="team2.500"
                score={t2Score}
                win={t2Score > t1Score}
                players={team2Perfs}
              />
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
