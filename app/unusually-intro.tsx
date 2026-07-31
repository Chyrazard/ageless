"use client";

import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import styles from "./unusually-intro.module.css";

const headlineLines = [
  <>3 years of Ageless:</>,
  <>be in the room where</>,
  <span className={styles.secondary}>
    <span className={styles.accentWord}>health</span> meets decisions.
  </span>,
];

export function UnusuallyIntro() {
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    setPortalTarget(document.getElementById("ageless-unusually-intro-slot"));
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setIsVisible(true);
        observer.disconnect();
      },
      { threshold: 0.16 },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, [portalTarget]);

  if (!portalTarget) return null;

  return createPortal(
    <section
      ref={sectionRef}
      className={`${styles.section} ${isVisible ? styles.visible : ""}`}
      aria-labelledby="ageless-intro-title"
    >
      <div className={styles.container}>
        <div className={styles.grid}>
          <div className={styles.eyebrowColumn}>
            <div className={styles.eyebrow}>
              <span className={styles.asterisk} aria-hidden="true">✱</span>
              <div className={styles.eyebrowMask}>
                <div className={styles.eyebrowTrack} aria-hidden="true">
                  <span>The Science of Aging Well /</span>
                  <span>The Science of Aging Well /</span>
                  <span>The Science of Aging Well /</span>
                  <span>The Science of Aging Well /</span>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.content}>
            <h2 id="ageless-intro-title" className={styles.headline}>
              {headlineLines.map((line, index) => (
                <span className={styles.lineClip} key={index}>
                  <span
                    className={styles.line}
                    style={{ "--line-index": index } as CSSProperties}
                  >
                    {line}
                  </span>
                </span>
              ))}
            </h2>

            <div className={styles.descriptionBlock}>
              <p className={styles.description}>
                When San Francisco becomes the epicenter of health and biotech
                innovation, you want to be right in the middle of it.
                <br />
                Ageless Evolution 2027 leverages that massive city-wide momentum,
                connecting you with forward-thinking decision-makers during the
                most electric week of the year.
              </p>

              <div className={styles.actions}>
                <a
                  className="ageless-cta ageless-cta--primary"
                  href="https://luma.com/ageless3"
                  target="_blank"
                  rel="noreferrer"
                >
                  <span className="ageless-cta__glow" aria-hidden="true" />
                  <span className="ageless-cta__label" data-text="Get your tickets">
                    Get your tickets
                  </span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>,
    portalTarget,
  );
}
