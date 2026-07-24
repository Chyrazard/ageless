"use client";

import type {
  CSSProperties,
  PointerEvent as ReactPointerEvent,
} from "react";
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
  const [isDragging, setIsDragging] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const wheelRef = useRef<HTMLDivElement>(null);
  const rotationRef = useRef(0);
  const visibleRef = useRef(false);
  const pausedRef = useRef(false);
  const draggingRef = useRef(false);
  const pointerStartRef = useRef({ y: 0, rotation: 0 });

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

    const observer = new IntersectionObserver(
      ([entry]) => {
        visibleRef.current = entry.isIntersecting;
        previousTime = performance.now();
      },
      { rootMargin: "20% 0px", threshold: 0.01 },
    );

    const tick = (now: number) => {
      const delta = Math.min(now - previousTime, 64);
      previousTime = now;

      if (
        visibleRef.current &&
        !pausedRef.current &&
        !draggingRef.current &&
        !reducedMotion
      ) {
        rotationRef.current =
          (rotationRef.current + delta * (360 / 40000)) % 360;
        wheel.style.setProperty(
          "--cinery-rotation",
          `${rotationRef.current}deg`,
        );
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

  const paintRotation = () => {
    wheelRef.current?.style.setProperty(
      "--cinery-rotation",
      `${rotationRef.current}deg`,
    );
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!event.isPrimary || event.button > 0) return;

    draggingRef.current = true;
    pausedRef.current = true;
    pointerStartRef.current = {
      y: event.clientY,
      rotation: rotationRef.current,
    };
    setIsDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current || !event.isPrimary) return;

    const distance = event.clientY - pointerStartRef.current.y;
    rotationRef.current = pointerStartRef.current.rotation - distance * 0.28;
    paintRotation();
    event.preventDefault();
  };

  const handlePointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;

    draggingRef.current = false;
    pausedRef.current = false;
    setIsDragging(false);

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  if (!portalTarget) return null;

  return createPortal(
    <section
      ref={sectionRef}
      className={styles.section}
      aria-label="Aubrey de Grey featured speaker"
    >
      <div className={styles.ambientGlow} aria-hidden="true" />

      <div className={styles.identity}>
        <strong>Ageless Speakers 2027</strong>
        <span>Longevity visionary®</span>
      </div>

      <p className={styles.giantTitle} aria-hidden="true">
        Speakers
      </p>

      <div
        className={`${styles.scene} ${isDragging ? styles.dragging : ""}`}
        aria-label="Drag vertically to browse the speakers"
        role="group"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
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
