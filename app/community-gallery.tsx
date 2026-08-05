"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import styles from "./community-gallery.module.css";

const galleryImages = [
  { src: "/assets/event-gallery/primerafoto.webp", alt: "Ageless speaker presenting on stage" },
  { src: "/assets/event-gallery/quintafoto.webp", alt: "Ageless attendees enjoying the summit" },
  { src: "/assets/event-gallery/oncefoto.webp", alt: "Ageless audience during a conference session" },
  { src: "/assets/event-gallery/swap.webp", alt: "Ageless community members at the summit" },
  { src: "/assets/event-gallery/septimafoto.webp", alt: "Ageless event experience" },
  { src: "/assets/event-gallery/decimafoto.webp", alt: "Ageless summit community" },
  { src: "/assets/event-gallery/octavafoto.webp", alt: "Ageless conference moment" },
  { src: "/assets/event-gallery/novenafoto.webp", alt: "Ageless attendees connecting" },
  { src: "/assets/event-gallery/cuartafoto.webp", alt: "Ageless longevity and wellness gathering" },
  { src: "/assets/event-gallery/sextafoto.webp", alt: "Ageless community experience" },
] as const;

const doubledGallery = [...galleryImages, ...galleryImages];

export function CommunityGallery() {
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const positionRef = useRef(0);
  const nudgeRef = useRef(0);

  useEffect(() => {
    // The slot belongs to the mirrored markup and is available after mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPortalTarget(document.getElementById("ageless-community-gallery-slot"));
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!portalTarget || !track) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    let frame = 0;
    let previousTime = performance.now();

    const animate = (time: number) => {
      const elapsed = Math.min(48, time - previousTime);
      previousTime = time;
      const loopWidth = track.scrollWidth / 2;

      if (loopWidth > 0) {
        if (!reducedMotion && !document.hidden) {
          positionRef.current += elapsed * 0.041;
        }

        if (Math.abs(nudgeRef.current) > 0.1) {
          const nudgeStep = nudgeRef.current * 0.105;
          positionRef.current += nudgeStep;
          nudgeRef.current -= nudgeStep;
        }

        positionRef.current =
          ((positionRef.current % loopWidth) + loopWidth) % loopWidth;
        track.style.transform = `translate3d(${-positionRef.current}px, 0, 0)`;
      }

      frame = window.requestAnimationFrame(animate);
    };

    frame = window.requestAnimationFrame(animate);
    return () => window.cancelAnimationFrame(frame);
  }, [portalTarget]);

  const moveByOneCard = (direction: -1 | 1) => {
    const track = trackRef.current;
    const firstCard = track?.firstElementChild as HTMLElement | null;
    if (!track || !firstCard) return;

    const gap = Number.parseFloat(window.getComputedStyle(track).columnGap) || 0;
    nudgeRef.current += direction * (firstCard.offsetWidth + gap);
  };

  if (!portalTarget) return null;

  return createPortal(
    <section className={`${styles.section} ageless-defer-render`} aria-labelledby="community-gallery-heading">
      <div className={styles.container}>
        <div className={styles.headingRow}>
          <h2 className={styles.heading} id="community-gallery-heading">
            Growing <em>together</em>, one <em>experience</em> at a time
          </h2>
          <div className={styles.arrows} aria-label="Gallery controls">
            <button
              className={styles.arrow}
              type="button"
              aria-label="Previous gallery image"
              onClick={() => moveByOneCard(-1)}
            >
              <span aria-hidden="true">←</span>
            </button>
            <button
              className={styles.arrow}
              type="button"
              aria-label="Next gallery image"
              onClick={() => moveByOneCard(1)}
            >
              <span aria-hidden="true">→</span>
            </button>
          </div>
        </div>
        <div className={styles.viewport}>
          <div className={styles.track} ref={trackRef}>
            {doubledGallery.map((image, index) => {
              const duplicate = index >= galleryImages.length;
              return (
                <figure
                  className={styles.card}
                  aria-hidden={duplicate || undefined}
                  key={`${image.src}-${index}`}
                >
                  <Image
                    className={styles.image}
                    src={image.src}
                    alt={duplicate ? "" : image.alt}
                    fill
                    priority={index < 5}
                    sizes="(max-width: 767px) calc(100vw - 32px), (max-width: 991px) 31vw, 20vw"
                  />
                </figure>
              );
            })}
          </div>
        </div>
      </div>
    </section>,
    portalTarget,
  );
}
