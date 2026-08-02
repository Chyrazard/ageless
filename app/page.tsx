import { mirroredPages } from "./generated-pages";
import { MirroredPageView } from "./mirrored-page-view";
import { CountdownExperience } from "./countdown/countdown-experience";
import { HomeScrollReset } from "./home-scroll-reset";
import { DeferredHomeSections } from "./deferred-home-sections";

const home = mirroredPages["/"];

export default function HomePage() {
  return (
    <>
      <HomeScrollReset />
      <MirroredPageView page={home} removeLegacyHomeSections />
      <CountdownExperience />
      <DeferredHomeSections />
    </>
  );
}
