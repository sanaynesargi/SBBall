"use client";
import { Box, Flex, HStack, Text, Icon } from "@chakra-ui/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, type ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
  /** Optional max-width override for the content column. */
  size?: string;
}

const NAV = [
  { label: "Live", href: "/", icon: LiveIcon },
  { label: "Players", href: "/create", icon: PlayersIcon },
  { label: "Stats", href: "/main", icon: StatsIcon },
  { label: "Teams", href: "/teams", icon: TeamsIcon },
];

const Layout = ({ children, size }: LayoutProps) => {
  const router = useRouter();
  const pathname = usePathname();

  // App is dark-only.
  useEffect(() => {
    localStorage.setItem("chakra-ui-color-mode", "dark");
  }, []);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const maxW = size ?? "shell";

  return (
    <Flex direction="column" minH="100dvh" bg="bg.app" color="text.primary">
      {/* Top bar */}
      <Box
        as="header"
        position="sticky"
        top={0}
        zIndex={20}
        bg="rgba(8,11,10,0.72)"
        backdropFilter="saturate(140%) blur(12px)"
        borderBottom="1px solid"
        borderColor="border.subtle"
      >
        <Flex
          w="100%"
          maxW={maxW}
          mx="auto"
          px={{ base: 4, md: 6 }}
          h={{ base: "56px", md: "64px" }}
          align="center"
          justify="space-between"
        >
          <HStack
            spacing={2.5}
            cursor="pointer"
            onClick={() => router.push("/main")}
            role="group"
          >
            <Flex
              w="30px"
              h="30px"
              align="center"
              justify="center"
              borderRadius="10px"
              bg="accent.500"
              color="accent.fg"
              fontWeight="900"
              fontFamily="heading"
              fontSize="18px"
              boxShadow="0 0 24px rgba(31,201,122,0.45)"
            >
              S
            </Flex>
            <Box lineHeight={1}>
              <Text
                fontFamily="heading"
                fontWeight="900"
                fontSize="18px"
                letterSpacing="-0.03em"
              >
                SBBall
              </Text>
              <Text fontSize="10px" color="text.faint" letterSpacing="0.08em">
                COURTSIDE STATS
              </Text>
            </Box>
          </HStack>

          {/* Desktop nav */}
          <HStack spacing={1} display={{ base: "none", md: "flex" }}>
            {NAV.map((item) => {
              const active = isActive(item.href);
              return (
                <HStack
                  key={item.href}
                  spacing={2}
                  px={3.5}
                  h="38px"
                  borderRadius="10px"
                  cursor="pointer"
                  color={active ? "accent.fg" : "text.muted"}
                  bg={active ? "accent.500" : "transparent"}
                  _hover={active ? {} : { bg: "bg.hover", color: "text.primary" }}
                  transition="all 0.15s"
                  onClick={() => router.push(item.href)}
                >
                  <Icon as={item.icon} boxSize="18px" />
                  <Text fontWeight="700" fontSize="14px">
                    {item.label}
                  </Text>
                </HStack>
              );
            })}
          </HStack>
        </Flex>
      </Box>

      {/* Content */}
      <Box
        as="main"
        flex="1"
        w="100%"
        maxW={maxW}
        mx="auto"
        px={{ base: 4, md: 6 }}
        pt={{ base: 5, md: 8 }}
        pb={{ base: "104px", md: 12 }}
      >
        {children}
      </Box>

      {/* Mobile bottom tab bar */}
      <Flex
        display={{ base: "flex", md: "none" }}
        position="fixed"
        bottom={0}
        left={0}
        right={0}
        zIndex={20}
        bg="rgba(8,11,10,0.85)"
        backdropFilter="saturate(140%) blur(14px)"
        borderTop="1px solid"
        borderColor="border.subtle"
        pb="env(safe-area-inset-bottom)"
        h="72px"
      >
        {NAV.map((item) => {
          const active = isActive(item.href);
          return (
            <Flex
              key={item.href}
              flex={1}
              direction="column"
              align="center"
              justify="center"
              gap={1}
              cursor="pointer"
              color={active ? "accent.400" : "text.faint"}
              onClick={() => router.push(item.href)}
            >
              <Icon as={item.icon} boxSize="22px" />
              <Text fontSize="11px" fontWeight={active ? "800" : "600"}>
                {item.label}
              </Text>
            </Flex>
          );
        })}
      </Flex>
    </Flex>
  );
};

function LiveIcon(props: any) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path
        d="M3.5 9.5h17M3.5 14.5h17M12 3.2c3.4 2.2 3.4 15.4 0 17.6M12 3.2c-3.4 2.2-3.4 15.4 0 17.6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function PlayersIcon(props: any) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <circle cx="9" cy="8" r="3.2" stroke="currentColor" strokeWidth="2" />
      <path
        d="M3.5 19c0-3 2.5-5 5.5-5s5.5 2 5.5 5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M16 5.5a3 3 0 0 1 0 5.8M17.5 19c0-2.4-1.3-4.3-3.2-5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function StatsIcon(props: any) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M5 20V11M12 20V4M19 20v-6"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function TeamsIcon(props: any) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M5 4h5v16H5zM14 4h5v16h-5z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M12 7v10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeDasharray="2 2" />
    </svg>
  );
}

export default Layout;
