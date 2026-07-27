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
    <section className={styles.recapSection} aria-labelledby="ageless-recap-title">
      <h2 id="ageless-recap-title" className={styles.sectionTitle}>
        Looking Back at Ageless Experience
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
    </section>,
    portalTarget,
  );
}
