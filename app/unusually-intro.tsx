"use client";

import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import styles from "./unusually-intro.module.css";

const headlineLines = [
  <>We design digital experiences</>,
  <>
    that empower <span className={styles.barcode}>𝄃𝄃𝄂𝄂𝄀𝄁𝄃𝄂𝄂𝄃</span>{" "}
    <span className={styles.secondary}>brands</span>
  </>,
  <span className={styles.secondary}>
    to stand out and engage their
  </span>,
  <span className={styles.secondary}>audiences™ .</span>,
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
                By combining strategy, design, and technology, we transform
                ideas into meaningful digital experiences. Our work blends
                imagination with precision to create bold outcomes that drive
                growth.
              </p>

              <div className={styles.actions}>
                <a className={styles.primaryButton} href="/about">
                  <span className={styles.buttonRoll}>
                    <span>Our story</span>
                    <span>Our story</span>
                  </span>
                  <span className={styles.buttonStar} aria-hidden="true">✦</span>
                </a>

                <a className={styles.textLink} href="/contact">
                  <span className={styles.linkRoll}>
                    <span>Contact us</span>
                    <span>Contact us</span>
                  </span>
                  <span className={styles.arrowRoll} aria-hidden="true">
                    <span>↗</span>
                    <span>↗</span>
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
