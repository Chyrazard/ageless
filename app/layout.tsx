import type { Metadata } from "next";
import { Chivo_Mono, Geist } from "next/font/google";
import type { ReactNode } from "react";
import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
import "./globals.css";
import { AgelessFooter } from "./ageless-footer";
import { WhatsAppButton } from "./whatsapp-button";
import { DeferredMedia } from "./deferred-media";

config.autoAddCss = false;

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  display: "swap",
});

const chivoMono = Chivo_Mono({
  subsets: ["latin"],
  variable: "--font-chivo-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://agelessevo.com"),
  title: "Longevity and Wellness Summit",
  description:
    "Ageless Evolution Summit — longevity, wellness, science, and meaningful connections.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/logo.jpeg",
  },
  openGraph: {
    title: "Longevity and Wellness Summit",
    description:
      "Ageless Evolution Summit — longevity, wellness, science, and meaningful connections.",
    type: "website",
    siteName: "Ageless Evolution Summit",
    images: [
      {
        url: "/logo.jpeg",
        width: 1600,
        height: 836,
        alt: "Ageless logo on a white background",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Longevity and Wellness Summit",
    description:
      "Ageless Evolution Summit — longevity, wellness, science, and meaningful connections.",
    images: ["/logo.jpeg"],
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`w-mod-js ${geistSans.variable} ${chivoMono.variable}`}
      data-wf-domain="bungee-pro.webflow.io"
      data-wf-site="6904c591abb4bd2b6a67271b"
      suppressHydrationWarning
    >
      <head>
        <link rel="stylesheet" href="/webflow/original.css?v=1" />
      </head>
      <body>
        {children}
        <AgelessFooter />
        <WhatsAppButton />
        <DeferredMedia />
      </body>
    </html>
  );
}
