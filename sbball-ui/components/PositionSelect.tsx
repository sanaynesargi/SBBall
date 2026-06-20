import { VStack, Button, Wrap, WrapItem } from "@chakra-ui/react";
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
    <VStack alignItems="start" w="100%">
      {!chosenSecond && sec ? (
        <Button size="sm" variant="surface" onClick={() => setChosenSecond(true)}>
          Enable Sec. Pos
        </Button>
      ) : (
        <Wrap spacing={2} w="100%">
          {positions.map((label, i) => {
            const selected = positionIndex === i;
            return (
              <WrapItem key={label}>
                <Button
                  size="sm"
                  variant={selected ? undefined : "surface"}
                  bg={selected ? "accent.500" : undefined}
                  color={selected ? "accent.fg" : undefined}
                  _hover={selected ? { bg: "accent.400" } : undefined}
                  _active={selected ? { bg: "accent.600" } : undefined}
                  fontFamily="heading"
                  fontWeight={800}
                  minW="44px"
                  onClick={() => {
                    setPositionIndex(i);
                  }}
                >
                  {label}
                </Button>
              </WrapItem>
            );
          })}
        </Wrap>
      )}
    </VStack>
  );
};
