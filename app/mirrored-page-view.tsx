import type { MirroredPage } from "./generated-pages";
import { WebflowRuntime } from "./webflow-runtime";

const HERO_SOCIAL_LINKS =
  '<div class="social-links-block"><a href="https://www.behance.net/nayzakui" target="_blank" class="social-link">BE</a><div class="paragraph-text-mono">/</div><a href="https://dribbble.com/clonifylibrary" target="_blank" class="social-link">DR</a><div class="paragraph-text-mono">/</div><a href="https://x.com/ClonifyLibrary" target="_blank" class="social-link">X</a></div>';

function replaceAfter(
  source: string,
  anchor: string,
  search: string,
  replacement: string,
) {
  const anchorIndex = source.indexOf(anchor);
  if (anchorIndex === -1) return source;

  const searchIndex = source.indexOf(search, anchorIndex);
  if (searchIndex === -1) return source;

  return `${source.slice(0, searchIndex)}${replacement}${source.slice(searchIndex + search.length)}`;
}

export function MirroredPageView({ page }: { page: MirroredPage }) {
  const transformedHtml = page.html
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
    )
    .replace(
      '<div class="paragraph-text-mono">HAIL</div><div class="paragraph-text-mono">NY )</div>',
      '<div class="paragraph-text-mono">LONGEVITY AND</div><div class="paragraph-text-mono">WELLNESS SUMMIT )</div>',
    );

  const brandedHtml = replaceAfter(
    transformedHtml,
    'class="hero-bottom-top-block"',
    HERO_SOCIAL_LINKS,
    '<div class="hero-event-date paragraph-text-mono">01 / 17 / 27</div>',
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
