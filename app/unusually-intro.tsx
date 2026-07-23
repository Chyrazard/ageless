"use client";

import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import styles from "./unusually-intro.module.css";

const headlineLines = [
  <>2 Years of Ageless:</>,
  <>Be in the Room Where</>,
  <span className={`${styles.secondary} ${styles.accentItalic}`}>
    Wellness &amp; Science meets
  </span>,
  <span className={styles.secondary}>decisions makers</span>,
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
                  <span>Driven by Design —</span>
                  <span>Driven by Design —</span>
                  <span>Driven by Design —</span>
                  <span>Driven by Design —</span>
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
                Ageless Evolution 2027 is timed to coincide with the JP Morgan
                Healthcare Conference week in San Francisco—one of the largest
                global conferences in the region. Connect with the world&apos;s
                most important health, wellness, and biotech decision-makers,
                and YOU&apos;LL be in the room alongside it.
              </p>

              <div className={styles.actions}>
                <a
                  className={styles.primaryButton}
                  href="https://lu.ma/agelessevolution2025"
                  target="_blank"
                  rel="noreferrer"
                >
                  <span className={styles.buttonRoll}>
                    <span>Get your tickets</span>
                    <span>Get your tickets</span>
                  </span>
                  <span className={styles.buttonStar} aria-hidden="true">✦</span>
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
