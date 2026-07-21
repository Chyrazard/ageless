import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://moving-hood-primary-allen.trycloudflare.com"),
  title: "Bungee — Creative Studio",
  description:
    "A creative studio cultivating bold brands, beautiful websites, and ideas that refuse to be ordinary.",
  icons: {
    icon: "/ageless-logo.png",
    apple: "/ageless-logo.png",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className="w-mod-js"
      data-wf-domain="bungee-pro.webflow.io"
      data-wf-site="6904c591abb4bd2b6a67271b"
      suppressHydrationWarning
    >
      <head>
        <link rel="preload" href="/ageless-logo.png" as="image" />
        <link rel="stylesheet" href="/webflow/original.css?v=1" />
      </head>
      <body>{children}</body>
    </html>
  );
}
