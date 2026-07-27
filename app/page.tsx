import type { Metadata } from "next";
import { mirroredPages } from "./generated-pages";
import { MirroredPageView } from "./mirrored-page-view";
import { CountdownExperience } from "./countdown/countdown-experience";
import { AvooraStats } from "./avoora-stats";
import { CineryAubreyCarousel } from "./cinery-aubrey-carousel";
import { UnusuallyCta } from "./unusually-cta";
import { UnusuallyIntro } from "./unusually-intro";
import { TuomSplitFeature } from "./tuom-split-feature";

const home = mirroredPages["/"];

export const metadata: Metadata = {
  title: home.title,
  description: home.description,
  openGraph: {
    title: home.title,
    description: home.description,
    images: ["/webflow/assets/35736f752b-6904e320441441fe093b5653_Social.png"],
  },
};

export default function HomePage() {
  return (
    <>
      <MirroredPageView page={home} />
      <CountdownExperience />
      <CineryAubreyCarousel />
      <AvooraStats />
      <UnusuallyIntro />
      <TuomSplitFeature />
      <UnusuallyCta />
    </>
  );
}
