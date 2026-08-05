import type { MirroredPage } from "./generated-pages";
import { AgelessUnusuallyHeader } from "./ageless-unusually-header";
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

function extractBalancedDiv(source: string, className: string) {
  const classIndex = source.indexOf(`class="${className}"`);
  if (classIndex === -1) return { html: source, element: "" };

  const startIndex = source.lastIndexOf("<div", classIndex);
  if (startIndex === -1) return { html: source, element: "" };

  const divPattern = /<\/?div\b[^>]*>/g;
  divPattern.lastIndex = startIndex;
  let depth = 0;
  let match: RegExpExecArray | null;

  while ((match = divPattern.exec(source))) {
    depth += match[0].startsWith("</div") ? -1 : 1;
    if (depth !== 0) continue;

    const endIndex = divPattern.lastIndex;
    return {
      html: `${source.slice(0, startIndex)}${source.slice(endIndex)}`,
      element: source.slice(startIndex, endIndex),
    };
  }

  return { html: source, element: "" };
}

function removeBalancedSection(source: string, className: string) {
  const sectionPattern = /<\/?section\b[^>]*>/g;
  let match: RegExpExecArray | null;

  while ((match = sectionPattern.exec(source))) {
    if (match[0].startsWith("</section")) continue;

    const classMatch = match[0].match(/\bclass="([^"]*)"/);
    const classes = classMatch?.[1].split(/\s+/) ?? [];
    if (!classes.includes(className)) continue;

    const startIndex = match.index;
    let depth = 1;

    while ((match = sectionPattern.exec(source))) {
      depth += match[0].startsWith("</section") ? -1 : 1;
      if (depth !== 0) continue;

      return `${source.slice(0, startIndex)}${source.slice(sectionPattern.lastIndex)}`;
    }
  }

  return source;
}

export function MirroredPageView({
  page,
  removeLegacyHomeSections = false,
}: {
  page: MirroredPage;
  removeLegacyHomeSections?: boolean;
}) {
  const transformedHtml = page.html
    .replaceAll(
      "/webflow/assets/7c5b461c18-6904ca7a4abbe56dfff89523_about-logo.svg",
      "/logo.jpeg",
    )
    .replace(
      "/webflow/assets/f2a06b015f-6904ca7a4abbe56dfff89564_hero_large_logo.svg",
      "/ageless-logo-transparent.webp",
    )
    .replaceAll("Bungee Branding Logo Icon", "Ageless logo")
    .replace(
      '<section class="hero">',
      '<section id="home" class="hero"><video class="ageless-okio-hero-background" autoplay="" loop="" muted="" playsinline="" preload="auto" poster="/colorful-centered-poster.webp?v=4" data-ageless-radial-reveal="true" aria-hidden="true" tabindex="-1"><source src="/colorful-centered-hevc.mov?v=3" type="video/quicktime; codecs=hvc1"/><source src="/colorful-centered.webm?v=3" type="video/webm"/></video>',
    )
    .replaceAll(
      /<div data-poster-url="\/webflow\/assets\/cafbb0c425-68f33158cced4a41f89d89a6_6903d92be1096c25ee0356a4_hero-marquee-video-01-poster-00001\.jpg"[^>]*>[\s\S]*?<\/video><\/div>/g,
      '<img loading="lazy" decoding="async" src="/assets/event-gallery/septimafoto.webp" alt="" class="hero-marquee-asset ageless-event-photo"/>',
    )
    .replaceAll(
      /<div data-poster-url="\/webflow\/assets\/c3ff434d74-68f33158cced4a41f89d89a6_6903da528f19a5a4baf4d58b_hero-marquee-video-03-poster-00001\.jpg"[^>]*>[\s\S]*?<\/video><\/div>/g,
      '<video autoplay="" loop="" muted="" playsinline="" preload="none" data-ageless-deferred-video="viewport" aria-hidden="true" class="hero-marquee-asset ageless-event-video"><source data-src="/video1.mp4" type="video/mp4"/></video>',
    )
    .replaceAll(
      "/webflow/assets/2d1591e803-6904ca7a4abbe56dfff89585_273373949f9a4faf1a9827a5ba3c5c5d_hero-marquee-img-02-p-500.avif",
      "/assets/event-gallery/decimafoto.webp",
    )
    .replaceAll(
      "/webflow/assets/be1727bb38-6904ca7a4abbe56dfff89585_hero-marquee-img-02.avif",
      "/assets/event-gallery/decimafoto.webp",
    )
    .replaceAll(
      "/webflow/assets/6168620f29-6904ca7a4abbe56dfff89567_hero-marquee-img-04.avif",
      "/assets/event-gallery/octavafoto.webp",
    )
    .replaceAll(
      "/webflow/assets/6e34cd6958-6904ca7a4abbe56dfff8956d_e88bd0e0ccbf22364181e9cd94c3965d_hero-marquee-img-05-p-500.avif",
      "/assets/event-gallery/novenafoto.webp",
    )
    .replaceAll(
      "/webflow/assets/b863435d43-6904ca7a4abbe56dfff8956d_hero-marquee-img-05.avif",
      "/assets/event-gallery/novenafoto.webp",
    )
    .replaceAll(
      "/webflow/assets/56f8b4a9d7-6904ca7a4abbe56dfff89573_hero-marquee-img-06.avif",
      "/assets/event-gallery/cuartafoto.webp",
    )
    .replaceAll(
      "/webflow/assets/315ae5dcf2-6904ca7a4abbe56dfff89578_c623e282854bbace99faadc327266619_hero-marquee-img-07-p-500.avif",
      "/assets/event-gallery/sextafoto.webp",
    )
    .replaceAll(
      "/webflow/assets/d66d1b4a72-6904ca7a4abbe56dfff89578_hero-marquee-img-07.avif",
      "/assets/event-gallery/sextafoto.webp",
    )
    .replaceAll('class="hero-marquee-asset _02"', 'class="hero-marquee-asset ageless-event-photo"')
    .replaceAll('class="hero-marquee-asset _04"', 'class="hero-marquee-asset ageless-event-photo"')
    .replaceAll('class="hero-marquee-asset _05"', 'class="hero-marquee-asset ageless-event-photo"')
    .replaceAll('class="hero-marquee-asset _06"', 'class="hero-marquee-asset ageless-event-photo"')
    .replaceAll('class="hero-marquee-asset _07"', 'class="hero-marquee-asset ageless-event-photo"')
    .replaceAll(
      "/webflow/assets/2d25429cc4-6904ca7a4abbe56dfff8957d_654504435d3422f5108fdd728d5d4763_hero-marquee-img-08-p-500.avif",
      "/assets/event-gallery/primerafoto.webp",
    )
    .replaceAll(
      "/webflow/assets/56c7994a9d-6904ca7a4abbe56dfff8957d_hero-marquee-img-08.avif",
      "/assets/event-gallery/primerafoto.webp",
    )
    .replaceAll(
      '<div class="hero-item-single v2"><img sizes="(max-width: 960px) 100vw, 960px" srcset="/assets/event-gallery/primerafoto.webp 960w" alt="" src="/assets/event-gallery/primerafoto.webp" loading="lazy" class="hero-marquee-asset"/></div>',
      '<div class="hero-item-single v2"><img sizes="(max-width: 960px) 100vw, 960px" srcset="/assets/event-gallery/primerafoto.webp 960w" alt="" src="/assets/event-gallery/primerafoto.webp" loading="lazy" decoding="async" class="hero-marquee-asset ageless-event-photo"/></div><div class="hero-item-single"><img loading="lazy" decoding="async" src="/assets/event-gallery/quintafoto.webp" alt="" class="hero-marquee-asset ageless-event-photo"/></div><div class="hero-item-single v2"><img loading="lazy" decoding="async" src="/assets/event-gallery/oncefoto.webp" alt="" class="hero-marquee-asset ageless-event-photo"/></div><div class="hero-item-single"><img loading="lazy" decoding="async" src="/assets/event-gallery/swap.webp" alt="" class="hero-marquee-asset ageless-event-photo"/></div>',
    )
    .replace(
      'class="heading-style-h5">Creative studio based in Gotham.</div>',
      'class="ageless-event-kicker">Longevity &amp; Wellness Summit</div><div class="heading-style-h5 ageless-event-date">JP Morgan Week • <span class="ageless-event-location">San Francisco</span> / January 14th, 2027</div><div id="ageless-countdown-slot" aria-label="Countdown to January 14, 2027"></div>',
    )
    .replace(
      '<div class="hero-left-time-block"><div class="paragraph-text-mono">(</div><div class="paragraph-text-mono">HAIL</div><div class="paragraph-text-mono">NY )</div></div>',
      "",
    )
    .replace(
      '<div class="home-about-text-block"><h2 class="heading-style-h3 split-text-effect">We’re Bungee® — a creative studio cultivating bold brands, beautiful websites, and ideas that refuse to be ordinary.</h2></div>',
      '<div class="home-about-text-block"></div>',
    );

  const conferenceCarousel = extractBalancedDiv(
    transformedHtml,
    "hero-marquee-wrapper-outer-block",
  );
  const orderedHtml = conferenceCarousel.html
    .replace(
      '</section><section class="home-about">',
      '</section><div id="ageless-cinery-carousel-slot"></div><section class="home-about">',
    )
    .replace(
      '</section><section class="home-projects">',
      '</section><div id="ageless-avoora-stats-slot"></div><div id="ageless-community-gallery-slot"></div><div id="ageless-unusually-intro-slot"></div><div id="ageless-tuom-feature-slot"></div><section class="home-projects">',
    );

  const brandedHtml = replaceAfter(
    orderedHtml,
    'class="hero-bottom-top-block"',
    HERO_SOCIAL_LINKS,
    '<div class="hero-event-date paragraph-text-mono">01 / 14 / 27</div>',
  );

  const withoutLegacyGlobalSections = ["testimonials", "faq", "footer"].reduce(
    (html, className) => removeBalancedSection(html, className),
    brandedHtml,
  );

  const withoutLegacyNavigation = extractBalancedDiv(
    withoutLegacyGlobalSections,
    "navbar w-nav",
  ).html;

  const finalHtml = removeLegacyHomeSections
    ? ["home-about", "home-projects", "services", "matrics", "home-blog"].reduce(
        (html, className) => removeBalancedSection(html, className),
        withoutLegacyNavigation,
      )
    : withoutLegacyNavigation;

  const visibleHtml = removeLegacyHomeSections
    ? finalHtml
        .replaceAll('style="opacity:0"', "")
        .replace(
          'data-w-id="b85c28f5-d788-90c8-ef23-48448f98d854"',
          'data-ageless-hero-logo="true"',
        )
        .replace(
          'loading="lazy" class="hero-large-logo"',
          'loading="eager" fetchpriority="high" decoding="async" class="hero-large-logo"',
        )
    : finalHtml;

  return (
    <>
      <AgelessUnusuallyHeader />
      <main
        className="mirrored-content"
        dangerouslySetInnerHTML={{ __html: visibleHtml }}
      />
      {removeLegacyHomeSections ? null : <WebflowRuntime page={page} />}
    </>
  );
}
