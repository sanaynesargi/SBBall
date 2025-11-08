// app/providers.tsx
"use client";

import { ChakraProvider, extendTheme, type ThemeConfig } from "@chakra-ui/react";
import { BottomNavigationStyleConfig } from "chakra-ui-bottom-navigation";

const config: ThemeConfig = {
  initialColorMode: 'dark',
  useSystemColorMode: false,
};

const theme = extendTheme({
  config,
  components: {
    BottomNavigation: BottomNavigationStyleConfig,
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  return <ChakraProvider theme={theme}>{children}</ChakraProvider>;
}
