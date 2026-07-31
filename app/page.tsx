import type { Metadata } from "next";
import { headers } from "next/headers";
import { mirroredPages } from "./generated-pages";
import { MirroredPageView } from "./mirrored-page-view";
import { CountdownExperience } from "./countdown/countdown-experience";
import { AvooraStats } from "./avoora-stats";
import { CineryAubreyCarousel } from "./cinery-aubrey-carousel";
import { UnusuallyIntro } from "./unusually-intro";
import { TuomSplitFeature } from "./tuom-split-feature";

const home = mirroredPages["/"];

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host =
    requestHeaders.get("x-forwarded-host")?.split(",")[0].trim() ??
    requestHeaders.get("host");
  const forwardedProtocol = requestHeaders
    .get("x-forwarded-proto")
    ?.split(",")[0]
    .trim();
  const protocol =
    forwardedProtocol ?? (host?.startsWith("localhost") ? "http" : "https");

  let metadataBase = new URL("https://agelessevo.com");
  if (host) {
    try {
      metadataBase = new URL(`${protocol}://${host}`);
    } catch {
      // Keep the production fallback when proxy headers are malformed.
    }
  }

  return {
    metadataBase,
    title: "Longevity and Wellness Summit",
    description:
      "Ageless Evolution Summit — longevity, wellness, science, and meaningful connections.",
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
}

export default function HomePage() {
  return (
    <>
      <MirroredPageView page={home} removeLegacyHomeSections />
      <CountdownExperience />
      <CineryAubreyCarousel />
      <AvooraStats />
      <UnusuallyIntro />
      <TuomSplitFeature />
    </>
  );
}
