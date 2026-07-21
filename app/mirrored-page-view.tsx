import type { MirroredPage } from "./generated-pages";
import { WebflowRuntime } from "./webflow-runtime";

export function MirroredPageView({ page }: { page: MirroredPage }) {
  const brandedHtml = page.html
    .replaceAll(
      "/webflow/assets/7c5b461c18-6904ca7a4abbe56dfff89523_about-logo.svg",
      "/logo.jpeg",
    )
    .replace(
      "/webflow/assets/f2a06b015f-6904ca7a4abbe56dfff89564_hero_large_logo.svg",
      "/logo.jpeg",
    )
    .replaceAll("Bungee Branding Logo Icon", "Ageless logo")
    .replace(
      'class="heading-style-h5">Creative studio based in Gotham.</div>',
      'class="heading-style-h5 ageless-event-date">January 14th, 2027 · Silicon Valley</div><div id="ageless-countdown-slot" aria-label="Countdown to January 14, 2027"></div>',
    );

  return (
    <>
      <main
        className="mirrored-content"
        dangerouslySetInnerHTML={{ __html: brandedHtml }}
      />
      <WebflowRuntime page={page} />
    </>
  );
}
