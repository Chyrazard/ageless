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
          <div className={styles.blackPanel}>
            <h2 className={styles.recapTitle}>Recap of Ageless 2024</h2>
          </div>
        </div>
      </article>

      <article className={styles.section} aria-label="Ageless 2025 recap">
        <div className={styles.mediaGrid}>
          <div className={styles.blackPanel}>
            <h2 className={styles.recapTitle}>Recap of Ageless 2025</h2>
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
