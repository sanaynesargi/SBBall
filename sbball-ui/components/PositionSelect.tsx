import { VStack, Button, HStack } from "@chakra-ui/react";
import { useState, useReducer, useEffect } from "react";

interface PositionSelectProps {
  setPos: Function;
  sec?: boolean;
  defaultValue?: string;
}

export const PositionSelect = ({
  setPos,
  sec,
  defaultValue,
}: PositionSelectProps) => {
  const positions = ["PG", "SG", "SF", "PF", "C"];
  const [positionIndex, setPositionIndex] = useState(0);
  const [chosenSecond, setChosenSecond] = useState(false);
  const [, forceUpdate] = useReducer((x) => x + 1, 0);

  useEffect(() => {
    if (sec) {
      if (defaultValue) {
        setPositionIndex(positions.indexOf(defaultValue));
        setChosenSecond(true);
      } else {
        setPos("");
      }
    } else {
      if (defaultValue) {
        setPositionIndex(positions.indexOf(defaultValue));
      } else {
        setPos(positions[0]);
      }
    }
  }, []);

  useEffect(() => {
    if (sec && !chosenSecond) {
      return;
    }
    setPos(positions[positionIndex]);
  }, [positionIndex]);

  return (
    <VStack alignItems="start">
      {!chosenSecond && sec ? (
        <Button onClick={() => setChosenSecond(true)}>Enable Sec. Pos</Button>
      ) : (
        <>
          <HStack>
            <Button
              size="xs"
              onClick={() => {
                setPositionIndex(0);
              }}
              colorScheme={positionIndex == 0 ? "green" : "gray"}
            >
              PG
            </Button>
            <Button
              size="xs"
              onClick={() => {
                setPositionIndex(1);
              }}
              colorScheme={positionIndex == 1 ? "green" : "gray"}
            >
              SG
            </Button>
            <Button
              size="xs"
              onClick={() => {
                setPositionIndex(2);
              }}
              colorScheme={positionIndex == 2 ? "green" : "gray"}
            >
              SF
            </Button>
            <Button
              size="xs"
              onClick={() => {
                setPositionIndex(3);
              }}
              colorScheme={positionIndex == 3 ? "green" : "gray"}
            >
              PF
            </Button>
          </HStack>

          <Button
            size="xs"
            onClick={() => {
              setPositionIndex(4);
            }}
            colorScheme={positionIndex == 4 ? "green" : "gray"}
          >
            C
          </Button>
        </>
      )}
    </VStack>
  );
};
