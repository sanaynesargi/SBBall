import { extendTheme, type ThemeConfig } from "@chakra-ui/react";
import { BottomNavigationStyleConfig } from "chakra-ui-bottom-navigation";

const config: ThemeConfig = {
  initialColorMode: "dark",
  useSystemColorMode: false,
};

// "Sleek dark courtside" — deep charcoal/teal base with an electric mint accent.
const colors = {
  court: {
    950: "#080B0A", // app background (deepest)
    900: "#0B100F",
    850: "#0F1615", // base surface
    800: "#141D1B", // card / elevated surface
    750: "#192421",
    700: "#1F2C28", // hover / pressed
    600: "#2A3A35",
    line: "#243430", // hairline borders
  },
  accent: {
    50: "#E6FFF2",
    100: "#B8FBDB",
    200: "#86F3C0",
    300: "#54EBA4",
    400: "#34E08F",
    500: "#1FC97A", // primary accent
    600: "#16A867",
    700: "#0F8351",
    800: "#0A5F3B",
    900: "#063B25",
  },
  team1: {
    // cool blue
    400: "#7CC0FF",
    500: "#5BA8FF",
    600: "#3D8AE6",
  },
  team2: {
    // warm amber
    400: "#FFBE6E",
    500: "#FF9F45",
    600: "#E07F2A",
  },
  pos: { 500: "#1FC97A" }, // positive / good
  neg: { 500: "#FF5D5D" }, // negative / foul / miss
  warn: { 500: "#FFC857" },
};

const semanticTokens = {
  colors: {
    "bg.app": { default: "court.950", _dark: "court.950" },
    "bg.surface": { default: "court.850", _dark: "court.850" },
    "bg.card": { default: "court.800", _dark: "court.800" },
    "bg.hover": { default: "court.700", _dark: "court.700" },
    "border.subtle": { default: "court.line", _dark: "court.line" },
    "text.primary": { default: "#EAF2EF", _dark: "#EAF2EF" },
    "text.muted": { default: "#8FA39D", _dark: "#8FA39D" },
    "text.faint": { default: "#5E716B", _dark: "#5E716B" },
    "accent.solid": { default: "accent.500", _dark: "accent.500" },
    "accent.fg": { default: "#04140C", _dark: "#04140C" },
  },
};

// Container width tokens used across the responsive shell.
const sizes = {
  shell: { base: "100%", md: "860px", lg: "1140px", xl: "1360px" },
};

const radii = {
  card: "16px",
  tile: "12px",
};

const styles = {
  global: {
    "html, body": {
      bg: "bg.app",
      color: "text.primary",
      WebkitFontSmoothing: "antialiased",
      textRendering: "optimizeLegibility",
    },
    "*::selection": { bg: "accent.500", color: "accent.fg" },
    "::-webkit-scrollbar": { width: "10px", height: "10px" },
    "::-webkit-scrollbar-track": { bg: "transparent" },
    "::-webkit-scrollbar-thumb": {
      bg: "court.700",
      borderRadius: "full",
      border: "2px solid transparent",
      backgroundClip: "content-box",
    },
    "::-webkit-scrollbar-thumb:hover": { bg: "court.600" },
  },
};

const fonts = {
  heading: "var(--font-display), ui-sans-serif, system-ui, sans-serif",
  body: "var(--font-body), ui-sans-serif, system-ui, sans-serif",
  mono: "var(--font-mono), ui-monospace, SFMono-Regular, monospace",
};

const components = {
  BottomNavigation: BottomNavigationStyleConfig,
  Heading: {
    baseStyle: { letterSpacing: "-0.02em", fontWeight: 800 },
  },
  Button: {
    baseStyle: {
      fontWeight: 700,
      borderRadius: "12px",
      letterSpacing: "-0.01em",
      _focusVisible: { boxShadow: "0 0 0 3px rgba(31,201,122,0.45)" },
    },
    variants: {
      accent: {
        bg: "accent.500",
        color: "accent.fg",
        _hover: { bg: "accent.400", _disabled: { bg: "accent.500" } },
        _active: { bg: "accent.600" },
      },
      surface: {
        bg: "bg.card",
        color: "text.primary",
        border: "1px solid",
        borderColor: "border.subtle",
        _hover: { bg: "bg.hover" },
      },
      ghostMuted: {
        bg: "transparent",
        color: "text.muted",
        _hover: { bg: "bg.hover", color: "text.primary" },
      },
    },
  },
  Card: {
    baseStyle: {
      container: {
        bg: "bg.card",
        borderRadius: "card",
        border: "1px solid",
        borderColor: "border.subtle",
      },
    },
  },
  Table: {
    baseStyle: {
      th: {
        color: "text.muted",
        borderColor: "border.subtle",
        letterSpacing: "0.04em",
      },
      td: { borderColor: "border.subtle" },
    },
  },
  Modal: {
    baseStyle: {
      dialog: {
        bg: "bg.card",
        border: "1px solid",
        borderColor: "border.subtle",
        borderRadius: "card",
      },
    },
  },
  Tabs: {
    variants: {
      "soft-rounded": {
        tab: {
          color: "text.muted",
          borderRadius: "full",
          fontWeight: 700,
          _selected: { bg: "accent.500", color: "accent.fg" },
        },
      },
    },
  },
};

export const theme = extendTheme({
  config,
  colors,
  semanticTokens,
  sizes,
  radii,
  styles,
  fonts,
  components,
});

export default theme;
