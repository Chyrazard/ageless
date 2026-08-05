"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import styles from "./countdown.module.css";

const TARGET_DATE = new Date("2027-01-14T00:00:00-08:00").getTime();
const TICKETS_SECTION_URL = "/#tickets";

type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

function getTimeLeft(): TimeLeft {
  const distance = Math.max(0, TARGET_DATE - Date.now());
  return {
    days: Math.floor(distance / 86_400_000),
    hours: Math.floor((distance / 3_600_000) % 24),
    minutes: Math.floor((distance / 60_000) % 60),
    seconds: Math.floor((distance / 1_000) % 60),
  };
}

function ParticleNumber({ value, label }: { value: string; label: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const currentValue = useRef(value);
  const rebuildTargets = useRef<(() => void) | null>(null);

  useEffect(() => {
    currentValue.current = value;
    rebuildTargets.current?.();
  }, [value]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d", { alpha: true });
    if (!context) return;

    let width = 1;
    let height = 1;
    let targets: Array<{ x: number; y: number }> = [];
    let dotRadius = 1;

    const createTargets = () => {
      const mask = document.createElement("canvas");
      mask.width = Math.max(1, Math.round(width));
      mask.height = Math.max(1, Math.round(height));
      const maskContext = mask.getContext("2d", { willReadFrequently: true });
      if (!maskContext) return [];

      const text = currentValue.current;
      const fontSize = Math.min(height * 0.67, width / Math.max(1.55, text.length * 0.58));
      maskContext.clearRect(0, 0, width, height);
      maskContext.fillStyle = "#ffffff";
      maskContext.font = `900 ${fontSize}px Arial Black, Helvetica Neue, Arial, sans-serif`;
      maskContext.textAlign = "center";
      maskContext.textBaseline = "middle";
      maskContext.fillText(text, width / 2, height / 2 + fontSize * 0.035);

      const pixels = maskContext.getImageData(0, 0, mask.width, mask.height).data;
      const gap = height < 62 ? 3 : 4;
      const offsetX = (width % gap) / 2;
      const offsetY = (height % gap) / 2;
      const nextTargets: Array<{ x: number; y: number }> = [];

      for (let y = offsetY; y < mask.height; y += gap) {
        for (let x = offsetX; x < mask.width; x += gap) {
          const pixelX = Math.min(mask.width - 1, Math.round(x));
          const pixelY = Math.min(mask.height - 1, Math.round(y));
          if (pixels[(pixelY * mask.width + pixelX) * 4 + 3] > 150) {
            nextTargets.push({ x, y });
          }
        }
      }

      dotRadius = gap * 0.34;
      return nextTargets;
    };

    const render = () => {
      context.clearRect(0, 0, width, height);
      context.fillStyle = "#000000";

      for (const target of targets) {
        context.beginPath();
        context.arc(target.x, target.y, dotRadius, 0, Math.PI * 2);
        context.fill();
      }
    };

    const rebuild = () => {
      targets = createTargets();
      render();
    };

    rebuildTargets.current = rebuild;

    const resize = () => {
      const bounds = canvas.getBoundingClientRect();
      width = Math.max(1, bounds.width);
      height = Math.max(1, bounds.height);
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      rebuild();
    };

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();

    return () => {
      rebuildTargets.current = null;
      observer.disconnect();
    };
  }, []);

  return (
    <div className={styles.timeUnit}>
      <canvas
        ref={canvasRef}
        className={styles.numberCanvas}
        aria-hidden="true"
      />
      <span className={styles.timeLabel}>{label}</span>
    </div>
  );
}

export function CountdownExperience() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const update = () => setTimeLeft(getTimeLeft());
    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    // The target is part of the mirrored DOM and is only available after mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPortalTarget(document.getElementById("ageless-countdown-slot"));
  }, []);

  const values = {
    days: String(timeLeft?.days ?? 0).padStart(3, "0"),
    hours: String(timeLeft?.hours ?? 0).padStart(2, "0"),
    minutes: String(timeLeft?.minutes ?? 0).padStart(2, "0"),
    seconds: String(timeLeft?.seconds ?? 0).padStart(2, "0"),
  };

  return (
    <>
      {portalTarget
        ? createPortal(
          <div className={styles.countdownExperience}>
            <section className={styles.compactCountdown} aria-label="Countdown to January 14, 2027">
              <div className={styles.countdownGrid}>
                <ParticleNumber value={values.days} label="Days" />
                <ParticleNumber value={values.hours} label="Hours" />
                <ParticleNumber value={values.minutes} label="Minutes" />
                <ParticleNumber value={values.seconds} label="Seconds" />
              </div>
              <p className={styles.srOnly} aria-live="polite">
                {timeLeft
                  ? `${timeLeft.days} days, ${timeLeft.hours} hours, ${timeLeft.minutes} minutes and ${timeLeft.seconds} seconds remaining`
                  : "Loading countdown"}
              </p>
            </section>
            <div className={styles.ticketActions}>
              <Link
                className={`${styles.ticketButton} ${styles.ticketButtonPrimary}`}
                href={TICKETS_SECTION_URL}
              >
                <span className={styles.ticketButtonGlow} aria-hidden="true" />
                <span className={styles.ticketButtonLabel} data-text="Buy tickets">Buy tickets</span>
              </Link>
              <Link
                className={`${styles.ticketButton} ${styles.ticketButtonDark}`}
                href="/contact"
              >
                <span className={styles.ticketButtonGlow} aria-hidden="true" />
                <span className={styles.ticketButtonLabel} data-text="Exhibit &amp; Sponsor">Exhibit &amp; Sponsor</span>
              </Link>
            </div>
          </div>,
          portalTarget,
        )
        : null}
    </>
  );
}
