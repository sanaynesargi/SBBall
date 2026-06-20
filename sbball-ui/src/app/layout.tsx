// app/layout.tsx
import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { Inter, Archivo } from "next/font/google";
import { Providers } from "./providers";

const body = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

// Condensed, sporty display face for headings and big stat numbers.
const display = Archivo({
  subsets: ["latin"],
  weight: ["600", "700", "800", "900"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SBBall — Hoops Stats",
  description: "Live basketball stat tracking for 2v2 and 4v4 pickup games.",
};

export const viewport: Viewport = {
  themeColor: "#080B0A",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${body.variable} ${display.variable}`}
      style={{ backgroundColor: "#080B0A", colorScheme: "dark" }}
    >
      <body style={{ backgroundColor: "#080B0A" }}>
        <Providers>
          <Suspense>{children}</Suspense>
        </Providers>
      </body>
    </html>
  );
}
