import type { MirroredPage } from "./generated-pages";
import { WebflowRuntime } from "./webflow-runtime";

const HERO_SOCIAL_LINKS =
  '<div class="social-links-block"><a href="https://www.behance.net/nayzakui" target="_blank" class="social-link">BE</a><div class="paragraph-text-mono">/</div><a href="https://dribbble.com/clonifylibrary" target="_blank" class="social-link">DR</a><div class="paragraph-text-mono">/</div><a href="https://x.com/ClonifyLibrary" target="_blank" class="social-link">X</a></div>';

const LIVE_WELL_MARQUEE =
  '<div class="ageless-live-marquee" role="img" aria-label="Live Well, Age Less"><div class="ageless-live-marquee-track" aria-hidden="true"><div class="ageless-live-marquee-group"><span>LIVE WELL</span><i></i><span>AGE LESS</span><i></i></div><div class="ageless-live-marquee-group"><span>LIVE WELL</span><i></i><span>AGE LESS</span><i></i></div><div class="ageless-live-marquee-group"><span>LIVE WELL</span><i></i><span>AGE LESS</span><i></i></div><div class="ageless-live-marquee-group"><span>LIVE WELL</span><i></i><span>AGE LESS</span><i></i></div></div></div>';

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
    .replaceAll(
      /<div data-poster-url="\/webflow\/assets\/cafbb0c425-68f33158cced4a41f89d89a6_6903d92be1096c25ee0356a4_hero-marquee-video-01-poster-00001\.jpg"[^>]*>[\s\S]*?<\/video><\/div>/g,
      '<img loading="eager" src="/septimafoto.png" alt="" class="hero-marquee-asset ageless-event-photo"/>',
    )
    .replaceAll(
      /<div data-poster-url="\/webflow\/assets\/c3ff434d74-68f33158cced4a41f89d89a6_6903da528f19a5a4baf4d58b_hero-marquee-video-03-poster-00001\.jpg"[^>]*>[\s\S]*?<\/video><\/div>/g,
      '<video autoplay="" loop="" muted="" playsinline="" preload="auto" aria-hidden="true" class="hero-marquee-asset ageless-event-video"><source src="/video1.mp4" type="video/mp4"/></video>',
    )
    .replaceAll(
      "/webflow/assets/2d1591e803-6904ca7a4abbe56dfff89585_273373949f9a4faf1a9827a5ba3c5c5d_hero-marquee-img-02-p-500.avif",
      "/decimafoto.jpg",
    )
    .replaceAll(
      "/webflow/assets/be1727bb38-6904ca7a4abbe56dfff89585_hero-marquee-img-02.avif",
      "/decimafoto.jpg",
    )
    .replaceAll(
      "/webflow/assets/6168620f29-6904ca7a4abbe56dfff89567_hero-marquee-img-04.avif",
      "/octavafoto.jpg",
    )
    .replaceAll(
      "/webflow/assets/6e34cd6958-6904ca7a4abbe56dfff8956d_e88bd0e0ccbf22364181e9cd94c3965d_hero-marquee-img-05-p-500.avif",
      "/novenafoto.jpg",
    )
    .replaceAll(
      "/webflow/assets/b863435d43-6904ca7a4abbe56dfff8956d_hero-marquee-img-05.avif",
      "/novenafoto.jpg",
    )
    .replaceAll(
      "/webflow/assets/56f8b4a9d7-6904ca7a4abbe56dfff89573_hero-marquee-img-06.avif",
      "/cuartafoto.jpg",
    )
    .replaceAll(
      "/webflow/assets/315ae5dcf2-6904ca7a4abbe56dfff89578_c623e282854bbace99faadc327266619_hero-marquee-img-07-p-500.avif",
      "/sextafoto.jpg",
    )
    .replaceAll(
      "/webflow/assets/d66d1b4a72-6904ca7a4abbe56dfff89578_hero-marquee-img-07.avif",
      "/sextafoto.jpg",
    )
    .replaceAll('class="hero-marquee-asset _02"', 'class="hero-marquee-asset ageless-event-photo"')
    .replaceAll('class="hero-marquee-asset _04"', 'class="hero-marquee-asset ageless-event-photo"')
    .replaceAll('class="hero-marquee-asset _05"', 'class="hero-marquee-asset ageless-event-photo"')
    .replaceAll('class="hero-marquee-asset _06"', 'class="hero-marquee-asset ageless-event-photo"')
    .replaceAll('class="hero-marquee-asset _07"', 'class="hero-marquee-asset ageless-event-photo"')
    .replaceAll(
      "/webflow/assets/2d25429cc4-6904ca7a4abbe56dfff8957d_654504435d3422f5108fdd728d5d4763_hero-marquee-img-08-p-500.avif",
      "/primerafoto.jpg",
    )
    .replaceAll(
      "/webflow/assets/56c7994a9d-6904ca7a4abbe56dfff8957d_hero-marquee-img-08.avif",
      "/primerafoto.jpg",
    )
    .replaceAll(
      '<div class="hero-item-single v2"><img sizes="(max-width: 960px) 100vw, 960px" srcset="/primerafoto.jpg 500w, /primerafoto.jpg 960w" alt="" src="/primerafoto.jpg" loading="lazy" class="hero-marquee-asset"/></div>',
      '<div class="hero-item-single v2"><img sizes="(max-width: 960px) 100vw, 960px" srcset="/primerafoto.jpg 500w, /primerafoto.jpg 960w" alt="" src="/primerafoto.jpg" loading="lazy" class="hero-marquee-asset ageless-event-photo"/></div><div class="hero-item-single"><img loading="lazy" src="/quintafoto.jpg" alt="" class="hero-marquee-asset ageless-event-photo"/></div><div class="hero-item-single v2"><img loading="lazy" src="/oncefoto.jpg" alt="" class="hero-marquee-asset ageless-event-photo"/></div><div class="hero-item-single"><img loading="lazy" src="/docefoto.jpg" alt="" class="hero-marquee-asset ageless-event-photo"/></div>',
    )
    .replace(
      'class="heading-style-h5">Creative studio based in Gotham.</div>',
      'class="ageless-event-kicker">Longevity &amp; Wellness Summit</div><div class="heading-style-h5 ageless-event-date">January 14th, 2027 · <span class="ageless-event-location">San Francisco</span></div><div id="ageless-countdown-slot" aria-label="Countdown to January 14, 2027"></div>',
    )
    .replace(
      '<div class="paragraph-text-mono">HAIL</div><div class="paragraph-text-mono">NY )</div>',
      '<div class="paragraph-text-mono">LONGEVITY &amp;</div><div class="paragraph-text-mono">WELLNESS SUMMIT )</div>',
    )
    .replace(
      '<div class="home-about-text-block"><h2 class="heading-style-h3 split-text-effect">We’re Bungee® — a creative studio cultivating bold brands, beautiful websites, and ideas that refuse to be ordinary.</h2></div>',
      `<div class="home-about-text-block ageless-live-marquee-block">${LIVE_WELL_MARQUEE}</div>`,
    )
    .replace(
      '</section><section class="home-projects">',
      '</section><div id="ageless-unusually-cta-slot"></div><section class="home-projects">',
    );

  const brandedHtml = replaceAfter(
    transformedHtml,
    'class="hero-bottom-top-block"',
    HERO_SOCIAL_LINKS,
    '<div class="hero-event-date paragraph-text-mono">01 / 14 / 27</div>',
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
