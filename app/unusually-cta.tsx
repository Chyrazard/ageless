"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import styles from "./unusually-cta.module.css";

const clamp = (value: number, minimum = 0, maximum = 1) =>
  Math.min(Math.max(value, minimum), maximum);

const range = (progress: number, start: number, end: number) =>
  clamp((progress - start) / (end - start));

export function UnusuallyCta() {
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    setPortalTarget(document.getElementById("ageless-unusually-cta-slot"));
  }, []);

  useEffect(() => {
    if (!portalTarget) return;

    const section = sectionRef.current;
    if (!section) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let frame = 0;
    let currentProgress = 0;
    let targetProgress = 0;

    const paint = (progress: number) => {
      const curtains = range(progress, 0, 0.38);
      const outsideWords = range(progress, 0.08, 0.42);
      const insideWords = range(progress, 0.32, 0.78);

      section.style.setProperty(
        "--cta-curtain-top",
        `${curtains * -100}%`,
      );
      section.style.setProperty(
        "--cta-curtain-bottom",
        `${curtains * 110}%`,
      );
      section.style.setProperty(
        "--cta-outer-down",
        `${(1 - outsideWords) * 110}%`,
      );
      section.style.setProperty(
        "--cta-outer-up",
        `${(1 - outsideWords) * -110}%`,
      );
      section.style.setProperty(
        "--cta-inner-down",
        `${(1 - insideWords) * 110}%`,
      );
      section.style.setProperty(
        "--cta-inner-up",
        `${(1 - insideWords) * -110}%`,
      );
    };

    const measure = () => {
      const rect = section.getBoundingClientRect();
      const distance = Math.max(section.offsetHeight - window.innerHeight, 1);
      targetProgress = clamp(-rect.top / distance);
    };

    const tick = () => {
      currentProgress += (targetProgress - currentProgress) * 0.14;
      paint(currentProgress);

      if (Math.abs(targetProgress - currentProgress) > 0.0005) {
        frame = window.requestAnimationFrame(tick);
      } else {
        currentProgress = targetProgress;
        paint(currentProgress);
        frame = 0;
      }
    };

    const update = () => {
      measure();
      if (!frame) frame = window.requestAnimationFrame(tick);
    };

    if (reducedMotion) {
      paint(1);
      return;
    }

    measure();
    currentProgress = targetProgress;
    paint(currentProgress);
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);

    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [portalTarget]);

  if (!portalTarget) return null;

  return createPortal(
    <section
      id="video-cortina"
      ref={sectionRef}
      className={`${styles.section} ${styles.videoCurtain}`}
      aria-label="Keep scrolling — Live Well, Age Less"
    >
      <div className={styles.stickyStage}>
        <video
          className={styles.video}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          aria-hidden="true"
        >
          <source
            src="/assets/ageless-recap-2025-optimo-v2.mp4"
            type="video/mp4"
          />
        </video>
        <div className={styles.videoShade} aria-hidden="true" />

        <div className={styles.scrollPrompt}>Keep scrolling</div>

        <div className={styles.content}>
          <div className={styles.titleRow}>
            <span className={`${styles.title} ${styles.outerDown}`}>Live</span>
            <span
              className={`${styles.title} ${styles.greenTitle} ${styles.innerDown}`}
            >
              Well
            </span>
          </div>
          <div className={styles.titleRow}>
            <span
              className={`${styles.title} ${styles.greenTitle} ${styles.innerUp}`}
            >
              Age
            </span>
            <span
              className={`${styles.title} ${styles.outerUp}`}
            >
              Less
            </span>
          </div>
        </div>

        <div className={styles.curtains} aria-hidden="true">
          <div className={styles.curtainTop} />
          <div className={styles.curtainBottom} />
        </div>
      </div>
    </section>,
    portalTarget,
  );
}
