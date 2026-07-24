"use client";

import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import styles from "./cinery-aubrey-carousel.module.css";

const panels = Array.from({ length: 9 }, (_, index) => ({
  id: index,
  image: "/aubrey-de-grey.png",
  name: "Aubrey de Grey",
}));

export function CineryAubreyCarousel() {
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const wheelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setPortalTarget(document.getElementById("ageless-cinery-carousel-slot"));
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    const wheel = wheelRef.current;
    if (!portalTarget || !section || !wheel) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    let frame = 0;
    let previousTime = performance.now();
    let rotation = 0;
    let visible = false;

    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        previousTime = performance.now();
      },
      { rootMargin: "20% 0px", threshold: 0.01 },
    );

    const tick = (now: number) => {
      const delta = Math.min(now - previousTime, 64);
      previousTime = now;

      if (visible && !reducedMotion) {
        rotation = (rotation + delta * (360 / 40000)) % 360;
        wheel.style.setProperty("--cinery-rotation", `${rotation}deg`);
      }

      frame = window.requestAnimationFrame(tick);
    };

    observer.observe(section);
    frame = window.requestAnimationFrame(tick);

    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(frame);
    };
  }, [portalTarget]);

  if (!portalTarget) return null;

  return createPortal(
    <section
      ref={sectionRef}
      className={styles.section}
      aria-label="Aubrey de Grey featured speaker"
    >
      <div className={styles.ambientGlow} aria-hidden="true" />

      <div className={styles.identity}>
        <strong>Aubrey de Grey.</strong>
        <span>Longevity visionary®</span>
      </div>

      <p className={styles.giantTitle} aria-hidden="true">
        Aubrey
      </p>

      <div className={styles.scene} aria-hidden="true">
        <div ref={wheelRef} className={styles.wheel}>
          {panels.map((panel, index) => (
            <figure
              className={styles.panel}
              style={{ "--panel-index": index } as CSSProperties}
              key={panel.id}
            >
              <div className={styles.frame}>
                <img src={panel.image} alt="" draggable={false} />
                <figcaption>{panel.name}</figcaption>
              </div>
            </figure>
          ))}
        </div>
      </div>

      <div className={styles.scrollCue} aria-hidden="true">
        <span>↓</span>
        <small>Keep scrolling</small>
      </div>

      <p className={styles.location}>Ageless Evolution · San Francisco</p>
    </section>,
    portalTarget,
  );
}
