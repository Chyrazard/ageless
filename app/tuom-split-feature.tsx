"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { AGELESS_PRICING_PLANS } from "./ageless-pricing-data";
import styles from "./tuom-split-feature.module.css";

const RECAP_2024_VIDEO = "/assets/ageless-recap-2024-web.mp4";
const RECAP_2025_VIDEO = "/assets/ageless-recap-2025-web.mp4";

const SPONSORS = [
  {
    name: "Tuom",
    image: "/assets/sponsors/tuom.png",
    width: 330,
    height: 97,
  },
  {
    name: "NFCODEX",
    image: "/assets/sponsors/nfcodex.webp",
    width: 500,
    height: 78,
  },
  {
    name: "TrueBinding",
    image: "/assets/sponsors/truebinding.png",
    width: 411,
    height: 81,
  },
] as const;

const PARTNERS = [
  {
    name: "Center for Partnering Initiative",
    image: "/assets/partners/p1.avif",
    width: 288,
    height: 100,
  },
  {
    name: "Buzzable",
    image: "/assets/partners/p2.webp",
    width: 424,
    height: 87,
  },
  {
    name: "Angel Launch",
    image: "/assets/partners/p3.png",
    width: 258,
    height: 126,
  },
  {
    name: "Great LongLife",
    image: "/assets/partners/p4.png",
    width: 349,
    height: 110,
  },
  {
    name: "Sand Hill Angels",
    image: "/assets/partners/p5.png",
    width: 250,
    height: 105,
  },
  {
    name: "YLZ Investments",
    image: "/assets/partners/ylz-investments.svg",
    width: 446,
    height: 35,
  },
] as const;

const TESTIMONIALS = [
  {
    name: "Nick Larson",
    role: "Co-Founder & CEO",
    image: "/assets/crew/members/nick-larson.png",
  },
  {
    name: "Sandra Larson",
    role: "Co-Founder & COO",
    image: "/assets/crew/members/sandra-larson.png",
  },
  {
    name: "Hooman Khalili",
    role: "Co-Host & Liaison",
    image: "/assets/crew/members/hooman-khalili.png",
  },
  {
    name: "Jenny Mao",
    role: "Communications",
    image: "/assets/crew/members/jenny-mao.png",
  },
  {
    name: "Linda Ching",
    role: "Media Strategy",
    image: "/assets/crew/members/linda-ching.png",
  },
  {
    name: "Maddi Mrcela",
    role: "Business Development",
    image: "/assets/crew/members/maddi-mrcela.png",
  },
  {
    name: "Richard Simpkins",
    role: "Chief of Strategy",
    image: "/assets/crew/members/richard-simpkins.png",
  },
] as const;

const PAST_SPEAKERS = [
  {
    name: "Peter Crone",
    role: "The Mind Architect · Human potential and transformation",
    image: "/assets/past-speakers/peter-crone-final-v2.png",
  },
  {
    name: "Dr. Beth McDougall, M.D.",
    role: "Co-Founder & Chief Medical Officer, Jyzen",
    image: "/assets/past-speakers/beth-mcdougall-final-v2.png",
  },
  {
    name: "Dr. Aubrey de Grey",
    role: "Biomedical gerontologist · Author of Ending Aging",
    image: "/assets/past-speakers/aubrey-de-grey-final-v2.png",
  },
  {
    name: "William Kapp, MD",
    role: "Co-Founder & CEO, Fountain Life",
    image: "/assets/past-speakers/william-kapp-final-v2.png",
  },
  {
    name: "Mark Victor Hansen",
    role: "Co-creator, Chicken Soup for the Soul",
    image: "/assets/past-speakers/mark-victor-hansen-final-v2.png",
  },
  {
    name: "Daniel Kraft, MD",
    role: "Physician-scientist · Founder of NextMed Health",
    image: "/assets/past-speakers/daniel-kraft-final-v2.png",
  },
  {
    name: "Dr. Anastasia Chemeritskaya, MD, MHA",
    role: "Physician · Longevity medicine leader",
    image: "/assets/current-speakers/anastasia-chemeritskaya.png",
  },
  {
    name: "Dr. Niko Dimitriadis",
    role: "Applied neuroscientist · Award-winning author",
    image: "/assets/past-speakers/niko-dimitriadis-final-v2.png",
  },
  {
    name: "Dr. Ronjon Nag",
    role: "Founder, R42 · Adjunct Professor, Stanford Medicine",
    image: "/assets/past-speakers/ronjon-nag-final-v2.png",
  },
  {
    name: "Wei-Wu He, Ph.D.",
    role: "CEO, Human Longevity, Inc. · Precision health",
    image: "/assets/past-speakers/wei-wu-he-final-v2.png",
  },
  {
    name: "Dr. Hillary Lin",
    role: "Physician · Digital health and longevity innovator",
    image: "/assets/current-speakers/hillary-lin.png",
  },
  {
    name: "Dr. David Furman",
    role: "Director, Buck Institute AI & Bioinformatics Platform",
    image: "/assets/past-speakers/david-furman-final-v2.png",
  },
  {
    name: "Max Marchione",
    role: "CEO, Superpower · Proactive health innovator",
    image: "/assets/past-speakers/max-marchione-final-v2.png",
  },
] as const;

function RecapVideo({ src }: { src: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          void video.play().catch(() => undefined);
        } else {
          video.pause();
        }
      },
      { rootMargin: "240px 0px", threshold: 0.05 },
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  return (
    <video
      ref={videoRef}
      className={styles.video}
      loop
      muted
      playsInline
      preload="metadata"
      aria-hidden="true"
    >
      <source src={src} type="video/mp4" />
    </video>
  );
}

function PastSpeakersCarousel() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const showCard = useCallback(
    (index: number, behavior: ScrollBehavior = "smooth") => {
      const track = trackRef.current;
      const card = track?.children.item(index) as HTMLElement | null;
      const firstCard = track?.children.item(0) as HTMLElement | null;
      if (!track || !card || !firstCard) return;

      track.scrollTo({
        left: card.offsetLeft - firstCard.offsetLeft,
        behavior,
      });
    },
    [],
  );

  const moveOneCard = useCallback(
    (direction: -1 | 1) => {
      const track = trackRef.current;
      if (!track) return;

      const cards = Array.from(track.children) as HTMLElement[];
      const firstCard = cards[0];
      if (!firstCard) return;

      const positions = cards.map(
        (card) => card.offsetLeft - firstCard.offsetLeft,
      );
      const current = track.scrollLeft;
      const maxScroll = Math.max(0, track.scrollWidth - track.clientWidth);
      const tolerance = 3;
      let nextIndex = 0;

      if (direction === 1) {
        if (current >= maxScroll - tolerance) {
          nextIndex = 0;
        } else {
          const nextVisiblePosition = positions.findIndex(
            (position) => position > current + tolerance,
          );
          nextIndex = nextVisiblePosition === -1 ? 0 : nextVisiblePosition;
        }
      } else if (current <= tolerance) {
        nextIndex = cards.length - 1;
      } else {
        nextIndex = positions.reduce(
          (candidate, position, index) =>
            position < current - tolerance ? index : candidate,
          0,
        );
      }

      setActiveIndex(nextIndex);
      showCard(nextIndex);
    },
    [showCard],
  );

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { rootMargin: "0px 0px -8%", threshold: 0.04 },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible || isPaused) return;

    const timer = window.setInterval(() => {
      moveOneCard(1);
    }, 5000);

    return () => window.clearInterval(timer);
  }, [isPaused, isVisible, moveOneCard]);

  useEffect(() => {
    const handleResize = () => showCard(activeIndex, "auto");
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [activeIndex, showCard]);

  return (
    <div ref={sectionRef} className={styles.speakerCarousel}>
      <div ref={trackRef} className={styles.speakerTrack}>
        {PAST_SPEAKERS.map((speaker, index) => (
          <article
            className={styles.speakerCard}
            key={speaker.name}
            onPointerEnter={() => setIsPaused(true)}
            onPointerLeave={() => setIsPaused(false)}
          >
            <div className={styles.speakerPortraitWrap}>
              <Image
                src={speaker.image}
                alt={speaker.name}
                width={500}
                height={600}
                unoptimized
                loading={index < 3 ? "eager" : "lazy"}
                className={styles.speakerPortrait}
              />
            </div>
            <div className={styles.speakerCopy}>
              <h3>{speaker.name}</h3>
              <p>{speaker.role}</p>
            </div>
          </article>
        ))}
      </div>

      <button
        type="button"
        className={`${styles.speakerArrow} ${styles.speakerPrev}`}
        onClick={() => moveOneCard(-1)}
        aria-label="Show previous past speaker"
      >
        <span aria-hidden="true">←</span>
      </button>

      <button
        type="button"
        className={`${styles.speakerArrow} ${styles.speakerNext}`}
        onClick={() => moveOneCard(1)}
        aria-label="Show next past speaker"
      >
        <span aria-hidden="true">→</span>
      </button>
    </div>
  );
}

function HomePricingSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const items = Array.from(
      section.querySelectorAll<HTMLElement>("[data-pricing-reveal]"),
    );
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          (entry.target as HTMLElement).dataset.visible = "true";
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -6%" },
    );

    items.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className={styles.pricingSection}
      aria-labelledby="home-pricing-title"
    >
      <div className={styles.pricingBackdrop} aria-hidden="true">
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          poster="/assets/speakers/colorful3-background-poster.png?v=1"
        >
          <source
            src="/assets/speakers/colorful3-background-hevc.mov?v=1"
            type='video/quicktime; codecs="hvc1"'
          />
          <source
            src="/assets/speakers/colorful3-background.webm?v=1"
            type="video/webm"
          />
        </video>
      </div>

      <header className={styles.pricingIntro} data-pricing-reveal>
        <h2 id="home-pricing-title">
          <span>Invest In Your Longevity</span>
          <span>
            Choose <em>Your Pass</em>
          </span>
        </h2>
      </header>

      <div className={styles.pricingGrid}>
        {AGELESS_PRICING_PLANS.map((plan) => (
          <article
            className={`${styles.planCard} ${plan.featured ? styles.featuredPlan : ""} ${plan.id === "become-a-sponsor" ? styles.sponsorCard : ""}`}
            data-pricing-reveal
            key={plan.id}
          >
            <div>
              <div className={styles.planLabel}>
                <h3 aria-label={plan.label}>
                  {plan.labelLines.map((line) => (
                    <span key={line}>{line}</span>
                  ))}
                </h3>
                {plan.featured ? <em>Featured</em> : null}
              </div>
              {plan.price ? (
                <div className={styles.priceRow}>
                  <div className={styles.primaryPrice}>
                    {"priceLabel" in plan ? (
                      <span>{plan.priceLabel}</span>
                    ) : null}
                    <strong>{plan.price}</strong>
                  </div>
                  {"regularPrice" in plan ? (
                    <div className={styles.regularPrice}>
                      <span>{plan.regularPriceLabel}</span>
                      <del>{plan.regularPrice}</del>
                    </div>
                  ) : null}
                </div>
              ) : null}
              <div className={styles.included}>
                <h4>What&apos;s Included:</h4>
                <ul>
                  {plan.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
            <a
              className={`ageless-cta ${
                plan.id === "become-a-sponsor" ? "" : "ageless-cta--primary"
              }`}
              href={
                plan.id === "become-a-sponsor"
                  ? "/contact"
                  : "https://luma.com/ageless3"
              }
              target={plan.id === "become-a-sponsor" ? undefined : "_blank"}
              rel={plan.id === "become-a-sponsor" ? undefined : "noreferrer"}
            >
              <span className="ageless-cta__glow" aria-hidden="true" />
              <span
                className="ageless-cta__label"
                data-text={plan.id === "become-a-sponsor" ? "Submit a Request" : "Buy Tickets"}
              >
                {plan.id === "become-a-sponsor" ? "Submit a Request" : "Buy Tickets"}
              </span>
            </a>
          </article>
        ))}
      </div>
    </section>
  );
}

function SponsorsSection() {
  return (
    <section
      className={styles.sponsorsSection}
      aria-labelledby="sponsors-title"
    >
      <h2 id="sponsors-title" className={styles.sponsorsTitle}>
        <span>Supported By</span>
        <em>Industry Leaders</em>
      </h2>

      <div className={styles.sponsorsGrid}>
        {SPONSORS.map((sponsor) => (
          <div className={styles.sponsorLogo} key={sponsor.name}>
            <Image
              src={sponsor.image}
              alt={`${sponsor.name} logo`}
              width={sponsor.width}
              height={sponsor.height}
              sizes="(max-width: 767px) 70vw, 26vw"
            />
          </div>
        ))}
      </div>

      <div className={styles.partnersBlock}>
        <h2 id="partners-title" className={styles.partnersTitle}>
          <span>Our</span>
          <em>Partners</em>
        </h2>

        <div
          className={styles.partnersMarquee}
          aria-labelledby="partners-title"
        >
          <div className={styles.partnersTrack}>
            {[0, 1].map((groupIndex) => (
              <div
                className={styles.partnersGroup}
                aria-hidden={groupIndex === 1}
                key={groupIndex}
              >
                {PARTNERS.map((partner) => (
                  <div
                    className={styles.partnerLogo}
                    key={`${groupIndex}-${partner.name}`}
                  >
                    <Image
                      src={partner.image}
                      alt={groupIndex === 0 ? `${partner.name} logo` : ""}
                      width={partner.width}
                      height={partner.height}
                      sizes="(max-width: 767px) 44vw, 16vw"
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  const moveTestimonial = useCallback((direction: -1 | 1) => {
    setFocusedIndex(
      (current) =>
        (current + direction + TESTIMONIALS.length) % TESTIMONIALS.length,
    );
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.12, rootMargin: "0px 0px -8%" },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className={styles.testimonialsSection}
      data-visible={isVisible}
      aria-labelledby="testimonials-title"
    >
      <header className={styles.testimonialsIntro}>
        <h2 id="testimonials-title">
          The Ageless <span className={styles.testimonialsTitleAccent}>Crew</span>
        </h2>
        <p>( The passionate people making it all happen )</p>
      </header>

      <div className={styles.testimonialsCarousel}>
        <div className={styles.testimonialsTrack}>
          {TESTIMONIALS.map((testimonial, index) => {
            const isFocused = index === focusedIndex;

            return (
              <article
                className={`${styles.testimonialCard} ${isFocused ? styles.testimonialFocused : ""}`}
                key={testimonial.name}
                data-index={index}
                data-focused={isFocused}
                role="button"
                tabIndex={0}
                onPointerEnter={() => setFocusedIndex(index)}
                onClick={() => setFocusedIndex(index)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    setFocusedIndex(index);
                  }
                }}
                onFocus={() => setFocusedIndex(index)}
              >
                <div className={styles.testimonialMedia}>
                  <Image
                    src={testimonial.image}
                    alt={testimonial.name}
                    width={900}
                    height={900}
                    unoptimized
                    className={styles.testimonialImage}
                  />
                  <div className={styles.testimonialLabel}>
                    <h3 className={styles.testimonialName}>
                      {testimonial.name}
                    </h3>
                    <p className={styles.testimonialRole}>
                      {testimonial.role}
                    </p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {TESTIMONIALS.length > 3 ? (
          <div className={styles.testimonialControls}>
            <button
              type="button"
              onClick={() => moveTestimonial(-1)}
              aria-label="Show previous testimonial"
            >
              <span aria-hidden="true">←</span>
            </button>
            <button
              type="button"
              onClick={() => moveTestimonial(1)}
              aria-label="Show next testimonial"
            >
              <span aria-hidden="true">→</span>
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
}

export function TuomSplitFeature() {
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);

  useEffect(() => {
    // The portal destination only exists once the mirrored Webflow DOM mounts.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPortalTarget(document.getElementById("ageless-tuom-feature-slot"));
  }, []);

  if (!portalTarget) return null;

  return createPortal(
    <section
      className={styles.recapSection}
      aria-labelledby="ageless-recap-title"
    >
      <h2 id="ageless-recap-title" className={styles.sectionTitle}>
        <span className={styles.titleLine}>Looking Back At</span>
        <span className={styles.titleLine}>
          Ageless <em className={styles.titleAccent}>Experiences</em>
        </span>
      </h2>

      <div className={styles.recapGrid}>
        <article className={styles.videoPanel} aria-label="Ageless 2025 recap">
          <RecapVideo src={RECAP_2025_VIDEO} />
          <span className={styles.year}>2025</span>
        </article>

        <article className={styles.videoPanel} aria-label="Ageless 2024 recap">
          <RecapVideo src={RECAP_2024_VIDEO} />
          <span className={styles.year}>2024</span>
        </article>
      </div>

      <section
        className={styles.pastSpeakersSection}
        aria-labelledby="past-speakers-title"
      >
        <h2 id="past-speakers-title" className={styles.pastSpeakersTitle}>
          <span className={styles.pastSpeakersFirstWord}>Past</span>
          <span className={styles.pastSpeakersSecondLine}>Speakers</span>
        </h2>
        <PastSpeakersCarousel />
      </section>
      <HomePricingSection />
      <SponsorsSection />
      <TestimonialsSection />
    </section>,
    portalTarget,
  );
}
