"use client";

import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import styles from "./renok-orbit-carousel.module.css";

const slides = [
  { image: "/aubrey-de-grey.png", name: "Aubrey de Grey" },
  { image: "/decimafoto.jpg", name: "Wellness Innovation" },
  { image: "/octavafoto.jpg", name: "Longevity Science" },
  { image: "/novenafoto.jpg", name: "Human Potential" },
  { image: "/oncefoto.jpg", name: "Future Health" },
  { image: "/docefoto.jpg", name: "San Francisco 2027" },
];

const easeInOutCubic = (progress: number) =>
  progress < 0.5
    ? 4 * progress ** 3
    : 1 - ((-2 * progress + 2) ** 3) / 2;

export function RenokOrbitCarousel() {
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);
  const [selectedSlide, setSelectedSlide] = useState<number | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const orbitRef = useRef<HTMLDivElement>(null);
  const rotationRef = useRef(0);
  const pausedRef = useRef(false);
  const draggingRef = useRef(false);
  const dragMovedRef = useRef(false);
  const pointerStartRef = useRef({ x: 0, rotation: 0 });
  const tweenRef = useRef<{
    from: number;
    to: number;
    startedAt: number;
    duration: number;
  } | null>(null);

  useEffect(() => {
    setPortalTarget(document.getElementById("ageless-renok-carousel-slot"));
  }, []);

  useEffect(() => {
    if (!portalTarget || !orbitRef.current) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    let frame = 0;
    let previousTime = performance.now();

    const paint = () => {
      orbitRef.current?.style.setProperty(
        "--orbit-rotation",
        `${rotationRef.current}deg`,
      );
    };

    const tick = (now: number) => {
      const delta = Math.min(now - previousTime, 64);
      previousTime = now;

      if (tweenRef.current) {
        const tween = tweenRef.current;
        const progress = Math.min((now - tween.startedAt) / tween.duration, 1);
        rotationRef.current =
          tween.from + (tween.to - tween.from) * easeInOutCubic(progress);

        if (progress >= 1) tweenRef.current = null;
      } else if (!pausedRef.current && !draggingRef.current && !reducedMotion) {
        rotationRef.current -= delta * (360 / 50000);
      }

      paint();
      frame = window.requestAnimationFrame(tick);
    };

    paint();
    frame = window.requestAnimationFrame(tick);

    return () => window.cancelAnimationFrame(frame);
  }, [portalTarget]);

  const rotateBy = (degrees: number) => {
    tweenRef.current = {
      from: rotationRef.current,
      to: rotationRef.current + degrees,
      startedAt: performance.now(),
      duration: 850,
    };
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLElement>) => {
    const target = event.target as HTMLElement;
    if (target.closest(`.${styles.arrow}`)) return;

    draggingRef.current = true;
    pausedRef.current = true;
    dragMovedRef.current = false;
    tweenRef.current = null;
    pointerStartRef.current = {
      x: event.clientX,
      rotation: rotationRef.current,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    if (!draggingRef.current) return;
    const distance = event.clientX - pointerStartRef.current.x;
    if (Math.abs(distance) > 5) dragMovedRef.current = true;
    rotationRef.current = pointerStartRef.current.rotation + distance * 0.18;
  };

  const handlePointerUp = (event: ReactPointerEvent<HTMLElement>) => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    const elementUnderPointer = document.elementFromPoint(
      event.clientX,
      event.clientY,
    );
    pausedRef.current =
      event.pointerType === "mouse" &&
      Boolean(elementUnderPointer?.closest(`.${styles.card}`));
  };

  if (!portalTarget) return null;

  return createPortal(
    <section
      ref={sectionRef}
      className={styles.section}
      aria-label="Ageless rotating experiences gallery"
      onPointerLeave={() => {
        if (!draggingRef.current) pausedRef.current = false;
        setSelectedSlide(null);
      }}
      onFocusCapture={() => {
        pausedRef.current = true;
      }}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          pausedRef.current = false;
        }
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      <div className={styles.gridLines} aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
        <i />
      </div>

      <div className={styles.viewport}>
        <div ref={orbitRef} className={styles.orbit}>
          {slides.map((slide, index) => (
            <button
              className={`${styles.card} ${
                selectedSlide === index ? styles.selected : ""
              }`}
              style={{ "--slide-index": index } as CSSProperties}
              type="button"
              key={slide.image}
              aria-label={`Show title for ${slide.name}`}
              onPointerEnter={(event) => {
                if (event.pointerType === "mouse") pausedRef.current = true;
              }}
              onPointerLeave={(event) => {
                if (event.pointerType === "mouse" && !draggingRef.current) {
                  pausedRef.current = false;
                }
              }}
              onClick={() => {
                if (dragMovedRef.current) {
                  dragMovedRef.current = false;
                  return;
                }
                setSelectedSlide((current) =>
                  current === index ? null : index,
                );
              }}
            >
              <img src={slide.image} alt="" draggable={false} />
              <span className={styles.imageShade} aria-hidden="true" />
              <span className={styles.caption}>
                <i aria-hidden="true" />
                {slide.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      <button
        className={`${styles.arrow} ${styles.previous}`}
        type="button"
        aria-label="Previous gallery image"
        onClick={() => rotateBy(60)}
      >
        ←
      </button>
      <button
        className={`${styles.arrow} ${styles.next}`}
        type="button"
        aria-label="Next gallery image"
        onClick={() => rotateBy(-60)}
      >
        →
      </button>

      <div className={styles.interactionHint} aria-hidden="true">
        Hover to pause · Drag to explore
      </div>
    </section>,
    portalTarget,
  );
}
