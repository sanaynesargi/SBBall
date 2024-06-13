"use client";
import {
  Flex,
  Box,
  Text,
  Heading,
  Center,
  VStack,
  HStack,
  position,
  Container,
  useDisclosure,
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  FormControl,
  FormLabel,
  Input,
  Spacer,
  useToast,
} from "@chakra-ui/react";
import { AddIcon, BellIcon, EditIcon } from "@chakra-ui/icons";
import {
  BottomNavigation,
  BottomNavigationItem,
  BottomNavigationIcon,
  BottomNavigationLabel,
  BottomNavigationStyleConfig,
} from "chakra-ui-bottom-navigation";
import { useEffect, useReducer, useState } from "react";
import { useRouter } from "next/navigation";

interface LayoutProps {
  children: any;
  size?: string;
}

const Layout = ({ children, size }: LayoutProps) => {
  useEffect(() => {
    localStorage.setItem("chakra-ui-color-mode", "dark");
  }, []);

  const [index, setIndex] = useState<number | string>("value");
  const [nav, setNav] = useState("");

  const router = useRouter();
  const dev = process.env.NODE_ENV == "development";

  useEffect(() => {
    const rec = localStorage.getItem("nav");

    if (!rec) {
      setNav("2");
      router.push(`${dev ? "" : "/bball"}/create`);
    } else {
      setNav(rec);
    }
  }, []);

  return (
    <Center>
      <Box
        w={!size ? "450px" : size}
        h="170vh"
        bg="#001111"
        position="relative"
        overflowY="auto"
      >
        <Center w="100%" h="100%">
          <Box h="100%" alignItems="center" justifyContent="center">
            <Center>
              <VStack mt="2vh" mb="5vh">
                <Heading>HoopStats</Heading>
                <Heading fontSize="13pt" color="gray.700">
                  An S-Suite Product
                </Heading>
              </VStack>
            </Center>

            <VStack spacing="3vh">
              {children}
              <Center>
                <BottomNavigation
                  value={index}
                  onChange={(newIndex) => {
                    setIndex(newIndex);
                  }}
                  colorScheme="green"
                  variant="float"
                  showLabel="if-active"
                  pos="fixed"
                  w="410px"
                  left={0}
                  right={0}
                  ml="auto"
                  mr="auto"
                >
                  <BottomNavigationItem
                    value={nav == "1" ? "value" : ""}
                    onClick={() => {
                      localStorage.setItem("nav", "1");
                      router.push(`${dev ? "" : "/bball"}/create`);
                    }}
                  >
                    <BottomNavigationIcon as={AddIcon} />
                    <BottomNavigationLabel>Players</BottomNavigationLabel>
                  </BottomNavigationItem>
                  <BottomNavigationItem
                    value={nav == "2" ? "value" : ""}
                    onClick={() => {
                      localStorage.setItem("nav", "2");
                      router.push(`${dev ? "/" : "/bball"}`);
                    }}
                  >
                    <BottomNavigationIcon as={EditIcon} />
                    <BottomNavigationLabel>Stats</BottomNavigationLabel>
                  </BottomNavigationItem>
                  <BottomNavigationItem
                    value={nav == "3" ? "value" : ""}
                    onClick={() => {
                      localStorage.setItem("nav", "3");
                      router.push(`${dev ? "" : "/bball"}/main`);
                    }}
                  >
                    <BottomNavigationIcon as={BellIcon} />
                    <BottomNavigationLabel>Home</BottomNavigationLabel>
                  </BottomNavigationItem>
                </BottomNavigation>
              </Center>
            </VStack>
          </Box>
        </Center>
      </Box>
    </Center>
  );
};

export default Layout;
