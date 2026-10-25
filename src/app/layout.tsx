import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { getEnv } from "@/lib/env";
import "./globals.css";

export function generateMetadata(): Metadata {
  const { SITE_URL } = getEnv();
  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: "CyberReady Academy — Cybersecurity awareness training in Liberia",
      template: "%s | CyberReady Academy",
    },
    description:
      "Practical cybersecurity awareness training for organisations in Liberia, delivered in person or online.",
    robots: { index: false, follow: false },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
