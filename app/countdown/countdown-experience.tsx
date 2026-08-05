"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import styles from "./countdown.module.css";

const TARGET_DATE = new Date("2027-01-14T00:00:00-08:00").getTime();
const TICKETS_SECTION_URL = "/#tickets";
const DIGIT_SCALE = 0.46;

type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

type DotParticle = {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  velocityX: number;
  velocityY: number;
};

const DIGIT_MATRIX: Record<string, readonly string[]> = {
  "0": ["0111110", "1100011", "1100011", "1100011", "1100011", "1100011", "1100011", "1100011", "0111110"],
  "1": ["0001100", "0011100", "0111100", "0001100", "0001100", "0001100", "0001100", "0001100", "0111110"],
  "2": ["0111110", "1100011", "0000011", "0000110", "0001100", "0011000", "0110000", "1100000", "1111111"],
  "3": ["1111110", "0000011", "0000011", "0011110", "0000011", "0000011", "0000011", "0000011", "1111110"],
  "4": ["0000110", "0001110", "0011110", "0110110", "1100110", "1111111", "0000110", "0000110", "0000110"],
  "5": ["1111111", "1100000", "1100000", "1100000", "1111110", "0000011", "0000011", "0000011", "1111110"],
  "6": ["0111110", "1100000", "1100000", "1100000", "1111110", "1100011", "1100011", "1100011", "0111110"],
  "7": ["1111111", "0000011", "0000110", "0000110", "0001100", "0011000", "0011000", "0110000", "0110000"],
  "8": ["0111110", "1100011", "1100011", "1100011", "0111110", "1100011", "1100011", "1100011", "0111110"],
  "9": ["0111110", "1100011", "1100011", "1100011", "0111111", "0000011", "0000011", "0000011", "0111110"],
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
    let particles: DotParticle[] = [];
    let dotRadius = 1;
    let frame = 0;
    let pulse = 0;
    const pointer = { x: -1000, y: -1000, active: false };
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const createTargets = () => {
      const digits = currentValue.current.split("");
      const rowsPerDigit = 9;
      const columnsBetweenDigits = 0.75;
      const digitLayouts = digits.map((digit) => {
        const pattern = DIGIT_MATRIX[digit] ?? DIGIT_MATRIX["0"];
        let minColumn = 7;
        let maxColumn = 0;

        pattern.forEach((row) => {
          row.split("").forEach((cell, columnIndex) => {
            if (cell !== "1") return;
            minColumn = Math.min(minColumn, columnIndex);
            maxColumn = Math.max(maxColumn, columnIndex);
          });
        });

        return {
          pattern,
          minColumn,
          columnCount: maxColumn - minColumn + 1,
        };
      });
      const totalColumns =
        digitLayouts.reduce((total, digit) => total + digit.columnCount, 0) +
        Math.max(0, digits.length - 1) * columnsBetweenDigits;
      const availableStep = Math.min(
        6.2,
        (width - 18) / Math.max(1, totalColumns - 1),
        (height - 22) / (rowsPerDigit - 1),
      );
      const step = Math.max(1.55, availableStep * DIGIT_SCALE);
      const startX = width / 2 - ((totalColumns - 1) * step) / 2;
      const startY = height * 0.46 - ((rowsPerDigit - 1) * step) / 2;
      const nextTargets: Array<{ x: number; y: number }> = [];
      let digitColumnOffset = 0;

      digitLayouts.forEach(({ pattern, minColumn, columnCount }) => {
        pattern.forEach((row, rowIndex) => {
          row.split("").forEach((cell, columnIndex) => {
            if (cell !== "1") return;
            nextTargets.push({
              x:
                startX +
                (digitColumnOffset + columnIndex - minColumn) * step,
              y: startY + rowIndex * step,
            });
          });
        });

        digitColumnOffset += columnCount + columnsBetweenDigits;
      });

      dotRadius = step * 0.32;
      return nextTargets;
    };

    const assignTargets = (nextTargets: Array<{ x: number; y: number }>) => {
      if (particles.length === 0) {
        particles = nextTargets.map((target) => ({
          x: target.x,
          y: target.y,
          targetX: target.x,
          targetY: target.y,
          velocityX: 0,
          velocityY: 0,
        }));
        return;
      }

      const availableParticles = [...particles];
      particles = nextTargets.map((target) => {
        if (availableParticles.length === 0) {
          return {
            x: width / 2,
            y: height * 0.46,
            targetX: target.x,
            targetY: target.y,
            velocityX: 0,
            velocityY: 0,
          };
        }

        let nearestIndex = 0;
        let nearestDistance = Number.POSITIVE_INFINITY;
        availableParticles.forEach((particle, index) => {
          const dx = particle.x - target.x;
          const dy = particle.y - target.y;
          const distance = dx * dx + dy * dy;
          if (distance < nearestDistance) {
            nearestDistance = distance;
            nearestIndex = index;
          }
        });

        const particle = availableParticles.splice(nearestIndex, 1)[0];
        particle.targetX = target.x;
        particle.targetY = target.y;
        return particle;
      });

      if (reducedMotion) {
        particles.forEach((particle) => {
          particle.x = particle.targetX;
          particle.y = particle.targetY;
          particle.velocityX = 0;
          particle.velocityY = 0;
        });
      }
    };

    const render = () => {
      context.clearRect(0, 0, width, height);
      context.fillStyle = "#000000";

      for (const particle of particles) {
        context.beginPath();
        context.arc(particle.x, particle.y, dotRadius, 0, Math.PI * 2);
        context.fill();
      }
    };

    const rebuild = () => {
      targets = createTargets();
      assignTargets(targets);
      render();
    };

    const locatePointer = (event: PointerEvent) => {
      const bounds = canvas.getBoundingClientRect();
      pointer.x = event.clientX - bounds.left;
      pointer.y = event.clientY - bounds.top;
      pointer.active = true;
    };

    const onPointerMove = (event: PointerEvent) => locatePointer(event);
    const onPointerLeave = () => {
      pointer.active = false;
    };
    const onPointerDown = (event: PointerEvent) => {
      locatePointer(event);
      pulse = 1;
    };

    const animate = () => {
      for (const particle of particles) {
        if (pointer.active) {
          const dx = particle.x - pointer.x;
          const dy = particle.y - pointer.y;
          const distance = Math.sqrt(dx * dx + dy * dy) || 1;
          const influenceRadius = 34 + pulse * 58;

          if (distance < influenceRadius) {
            const force =
              (1 - distance / influenceRadius) * (0.38 + pulse * 1.45);
            particle.velocityX += (dx / distance) * force;
            particle.velocityY += (dy / distance) * force;
          }
        }

        particle.velocityX += (particle.targetX - particle.x) * 0.18;
        particle.velocityY += (particle.targetY - particle.y) * 0.18;
        particle.velocityX *= 0.68;
        particle.velocityY *= 0.68;
        particle.x += particle.velocityX;
        particle.y += particle.velocityY;

        if (
          !pointer.active &&
          Math.abs(particle.targetX - particle.x) < 0.025 &&
          Math.abs(particle.targetY - particle.y) < 0.025 &&
          Math.abs(particle.velocityX) < 0.025 &&
          Math.abs(particle.velocityY) < 0.025
        ) {
          particle.x = particle.targetX;
          particle.y = particle.targetY;
          particle.velocityX = 0;
          particle.velocityY = 0;
        }
      }

      render();
      pulse *= 0.84;
      frame = window.requestAnimationFrame(animate);
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
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerleave", onPointerLeave);
    canvas.addEventListener("pointerdown", onPointerDown);
    resize();
    if (!reducedMotion) frame = window.requestAnimationFrame(animate);

    return () => {
      rebuildTargets.current = null;
      observer.disconnect();
      window.cancelAnimationFrame(frame);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerleave", onPointerLeave);
      canvas.removeEventListener("pointerdown", onPointerDown);
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
