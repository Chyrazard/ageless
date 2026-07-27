"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import styles from "./tuom-split-feature.module.css";

const RECAP_2024_VIDEO = "/assets/ageless-recap-2024-web.mp4";
const RECAP_2025_VIDEO = "/assets/ageless-recap-2025-web.mp4";

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

export function TuomSplitFeature() {
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setPortalTarget(document.getElementById("ageless-tuom-feature-slot"));
  }, []);

  if (!portalTarget) return null;

  return createPortal(
    <section className={styles.recaps} aria-label="Ageless event recaps">
      <article className={styles.section} aria-label="Ageless 2024 recap">
        <div className={styles.mediaGrid}>
          <div className={styles.videoPanel}>
            <RecapVideo src={RECAP_2024_VIDEO} />
          </div>
          <div className={styles.textPanel}>
            <h2 className={styles.recapTitle} aria-label="Looking Back at Ageless 2024 experience">
              <span className={styles.recapLine}>Looking Back at</span>
              <span className={styles.recapLine}>Ageless 2024</span>
              <span className={styles.recapLine}>Experience</span>
            </h2>
          </div>
        </div>
      </article>

      <article className={styles.section} aria-label="Ageless 2025 recap">
        <div className={styles.mediaGrid}>
          <div className={styles.textPanel}>
            <h2 className={styles.recapTitle} aria-label="Looking Back at Ageless 2025 experience">
              <span className={styles.recapLine}>Looking Back at</span>
              <span className={styles.recapLine}>Ageless 2025</span>
              <span className={styles.recapLine}>Experience</span>
            </h2>
          </div>
          <div className={styles.videoPanel}>
            <RecapVideo src={RECAP_2025_VIDEO} />
          </div>
        </div>
      </article>
    </section>,
    portalTarget,
  );
}
