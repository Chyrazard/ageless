"use client";

import type {
  CSSProperties,
  PointerEvent as ReactPointerEvent,
} from "react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import styles from "./cinery-aubrey-carousel.module.css";

const confirmedPanels = [
  { image: "/speakers/alex-williams.webp", name: "Alex Williams" },
  { image: "/speakers/aubrey-degrey.webp", name: "Aubrey de Grey" },
  { image: "/speakers/daniel-kraft.webp", name: "Dr. Daniel Kraft" },
  { image: "/speakers/david-kim.webp", name: "David Kim" },
  { image: "/speakers/eric-verdin.webp", name: "Eric Verdin" },
  { image: "/speakers/josejb.webp", name: "José Bitar" },
  { image: "/speakers/niko.webp", name: "Dr. Niko Dimitriadis" },
  { image: "/speakers/peter-crone.webp", name: "Peter Crone" },
  { image: "/speakers/zak-williams.webp", name: "Zak Williams" },
];

const panels = confirmedPanels;
const wheelSlotCount = 9;
const panelRadius = 21;
const scenePerspective = panelRadius * 3.6;
const rotationDuration = 40000;

const wrapIndex = (value: number, length: number) =>
  ((value % length) + length) % length;

const getSlotPanelIndexes = (rotation: number) =>
  Array.from({ length: wheelSlotCount }, (_, slotIndex) => {
    const angle = slotIndex * (360 / wheelSlotCount);
    const completedTurns = Math.floor((rotation - angle + 180) / 360);
    return wrapIndex(
      slotIndex + completedTurns * wheelSlotCount,
      panels.length,
    );
  });

export function CineryAubreyCarousel() {
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [slotPanelIndexes, setSlotPanelIndexes] = useState(() =>
    getSlotPanelIndexes(0),
  );
  const sectionRef = useRef<HTMLElement>(null);
  const backWheelRef = useRef<HTMLDivElement>(null);
  const frontWheelRef = useRef<HTMLDivElement>(null);
  const backPanelRefs = useRef<Array<HTMLElement | null>>([]);
  const frontPanelRefs = useRef<Array<HTMLElement | null>>([]);
  const rotationRef = useRef(0);
  const visibleRef = useRef(false);
  const pausedRef = useRef(false);
  const draggingRef = useRef(false);
  const slotPanelIndexesRef = useRef(slotPanelIndexes);
  const pointerStartRef = useRef({ y: 0, rotation: 0 });

  useEffect(() => {
    setPortalTarget(document.getElementById("ageless-cinery-carousel-slot"));
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!portalTarget || !section) return;

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
          rotationRef.current + delta * (360 / rotationDuration);
        paintRotation();
      }

      frame = window.requestAnimationFrame(tick);
    };

    observer.observe(section);
    paintRotation();
    frame = window.requestAnimationFrame(tick);

    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(frame);
    };
  }, [portalTarget]);

  const paintRotation = () => {
    const rotation = rotationRef.current;
    const rotationValue = `${rotation}deg`;

    backWheelRef.current?.style.setProperty("--cinery-rotation", rotationValue);
    frontWheelRef.current?.style.setProperty("--cinery-rotation", rotationValue);

    Array.from({ length: wheelSlotCount }).forEach((_, index) => {
      const angle = index * (360 / wheelSlotCount);
      const depth = Math.cos(((angle - rotation) * Math.PI) / 180);
      const frontOpacity = Math.max(0, Math.min(1, (depth + 0.06) / 0.12));
      const backOpacity = 1 - frontOpacity;
      const frontPanel = frontPanelRefs.current[index];
      const backPanel = backPanelRefs.current[index];

      if (frontPanel) {
        frontPanel.style.opacity = `${frontOpacity}`;
        frontPanel.style.visibility = frontOpacity > 0.01 ? "visible" : "hidden";
      }

      if (backPanel) {
        backPanel.style.opacity = `${backOpacity}`;
        backPanel.style.visibility = backOpacity > 0.01 ? "visible" : "hidden";
      }
    });

    const nextSlotPanelIndexes = getSlotPanelIndexes(rotation);
    const panelContentChanged = nextSlotPanelIndexes.some(
      (panelIndex, slotIndex) =>
        panelIndex !== slotPanelIndexesRef.current[slotIndex],
    );

    if (panelContentChanged) {
      slotPanelIndexesRef.current = nextSlotPanelIndexes;
      setSlotPanelIndexes(nextSlotPanelIndexes);
    }
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

  const slotPanels = slotPanelIndexes.map((panelIndex) => panels[panelIndex]);

  return createPortal(
    <section
      id="speakers"
      ref={sectionRef}
      className={styles.section}
      aria-label="Ageless Speakers 2027"
      style={
        {
          "--cinery-radius": `${panelRadius}rem`,
          "--cinery-perspective": `${scenePerspective}rem`,
        } as CSSProperties
      }
    >
      <video
        className={styles.backgroundVideo}
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
        aria-hidden="true"
      >
        <source src="/cinery-light-background.mp4" type="video/mp4" />
      </video>
      <div className={styles.ambientGlow} aria-hidden="true" />

      <div className={styles.identity}>
        <strong>Ageless Speakers 2027</strong>
        <span>Longevity visionary®</span>
      </div>

      <div
        className={`${styles.scene} ${styles.sceneBack}`}
        aria-hidden="true"
      >
        <div ref={backWheelRef} className={styles.wheel}>
          {slotPanels.map((panel, index) => {
            const angle = index * (360 / wheelSlotCount);
            const isBack = Math.cos((angle * Math.PI) / 180) < 0;

            return (
              <figure
                ref={(element) => {
                  backPanelRefs.current[index] = element;
                }}
                className={styles.panel}
                style={
                  {
                    "--panel-angle": `${angle}deg`,
                    opacity: isBack ? 1 : 0,
                    visibility: isBack ? "visible" : "hidden",
                  } as CSSProperties
                }
                key={`back-slot-${index}`}
              >
                <div className={styles.frame}>
                  <img
                    src={panel.image}
                    alt=""
                    draggable={false}
                    loading="lazy"
                    decoding="async"
                  />
                  <figcaption>{panel.name}</figcaption>
                </div>
              </figure>
            );
          })}
        </div>
      </div>

      <p className={styles.giantTitle} aria-hidden="true">
        Speakers
      </p>

      <div
        className={`${styles.scene} ${styles.sceneFront} ${isDragging ? styles.dragging : ""}`}
        aria-label="Drag vertically to browse the speakers"
        role="group"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <div ref={frontWheelRef} className={styles.wheel}>
          {slotPanels.map((panel, index) => {
            const angle = index * (360 / wheelSlotCount);
            const isFront = Math.cos((angle * Math.PI) / 180) >= 0;

            return (
              <figure
                ref={(element) => {
                  frontPanelRefs.current[index] = element;
                }}
                className={styles.panel}
                style={
                  {
                    "--panel-angle": `${angle}deg`,
                    opacity: isFront ? 1 : 0,
                    visibility: isFront ? "visible" : "hidden",
                  } as CSSProperties
                }
                key={`front-slot-${index}`}
              >
                <div className={styles.frame}>
                  <img
                    src={panel.image}
                    alt={panel.name}
                    draggable={false}
                    loading="lazy"
                    decoding="async"
                  />
                  <figcaption>{panel.name}</figcaption>
                </div>
              </figure>
            );
          })}
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
