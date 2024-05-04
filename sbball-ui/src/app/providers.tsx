// app/providers.tsx
"use client";

import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import { BottomNavigationStyleConfig } from "chakra-ui-bottom-navigation";

const theme = extendTheme({
  components: {
    BottomNavigation: BottomNavigationStyleConfig,
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  return <ChakraProvider theme={theme}>{children}</ChakraProvider>;
}
