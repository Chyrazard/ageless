import { mirroredPages } from "./generated-pages";
import { MirroredPageView } from "./mirrored-page-view";
import { CountdownExperience } from "./countdown/countdown-experience";
import { HomeScrollReset } from "./home-scroll-reset";
import { AvooraStats } from "./avoora-stats";
import { CineryAubreyCarousel } from "./cinery-aubrey-carousel";
import { CommunityGallery } from "./community-gallery";
import { TuomSplitFeature } from "./tuom-split-feature";
import { UnusuallyIntro } from "./unusually-intro";

const home = mirroredPages["/"];

export default function HomePage() {
  return (
    <>
      <HomeScrollReset />
      <MirroredPageView page={home} removeLegacyHomeSections />
      <CountdownExperience />
      <CineryAubreyCarousel />
      <AvooraStats />
      <CommunityGallery />
      <UnusuallyIntro />
      <TuomSplitFeature />
    </>
  );
}
