"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import styles from "./countdown.module.css";

const TARGET_DATE = new Date("2027-01-14T00:00:00-08:00").getTime();
const TICKETS_URL = "https://lu.ma/agelessevolution2025";

type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

type Particle = {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  velocityX: number;
  velocityY: number;
  size: number;
  color: string;
};

const PARTICLE_COLORS = ["#000000"];

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
    let frame = 0;
    let pulse = 0;
    let particles: Particle[] = [];
    const pointer = { x: -1000, y: -1000, active: false };
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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
      const gap = width < 120 ? 3 : width < 230 ? 4 : 5;
      const targets: Array<{ x: number; y: number }> = [];

      for (let y = 0; y < mask.height; y += gap) {
        for (let x = 0; x < mask.width; x += gap) {
          if (pixels[(y * mask.width + x) * 4 + 3] > 100) targets.push({ x, y });
        }
      }
      return targets;
    };

    const rebuild = () => {
      const targets = createTargets();
      while (particles.length < targets.length) {
        const angle = Math.random() * Math.PI * 2;
        const distance = 18 + Math.random() * Math.min(width, height) * 0.35;
        particles.push({
          x: width / 2 + Math.cos(angle) * distance,
          y: height / 2 + Math.sin(angle) * distance,
          targetX: width / 2,
          targetY: height / 2,
          velocityX: 0,
          velocityY: 0,
          size: width < 120 ? 0.68 + Math.random() * 0.28 : 0.75 + Math.random() * 1.15,
          color: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
        });
      }
      particles.length = targets.length;
      targets.forEach((target, index) => {
        particles[index].targetX = target.x;
        particles[index].targetY = target.y;
      });
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
      pulse = reducedMotion ? 0 : 1;
    };

    const animate = () => {
      context.clearRect(0, 0, width, height);

      for (const particle of particles) {
        if (!reducedMotion && pointer.active) {
          const dx = particle.x - pointer.x;
          const dy = particle.y - pointer.y;
          const distance = Math.sqrt(dx * dx + dy * dy) || 1;
          const radius = 38 + pulse * 74;
          if (distance < radius) {
            const force = (1 - distance / radius) * (0.32 + pulse * 1.85);
            particle.velocityX += (dx / distance) * force;
            particle.velocityY += (dy / distance) * force;
          }
        }

        particle.velocityX += (particle.targetX - particle.x) * 0.055;
        particle.velocityY += (particle.targetY - particle.y) * 0.055;
        particle.velocityX *= 0.81;
        particle.velocityY *= 0.81;
        particle.x += particle.velocityX;
        particle.y += particle.velocityY;

        context.beginPath();
        context.fillStyle = particle.color;
        context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        context.fill();
      }

      pulse *= 0.9;
      frame = requestAnimationFrame(animate);
    };

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerleave", onPointerLeave);
    canvas.addEventListener("pointerdown", onPointerDown);
    resize();
    animate();

    return () => {
      rebuildTargets.current = null;
      observer.disconnect();
      cancelAnimationFrame(frame);
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
  const [preloaderVisible, setPreloaderVisible] = useState(true);
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const update = () => setTimeLeft(getTimeLeft());
    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => setPreloaderVisible(false), 820);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
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
      {preloaderVisible ? (
        <div className={styles.preloader} aria-label="Loading Ageless Evolution Summit">
          <img src="/logo.jpeg" alt="Ageless Evolution" />
          <span aria-hidden="true" />
        </div>
      ) : null}

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
            <a
              className={styles.ticketButton}
              href={TICKETS_URL}
              target="_blank"
              rel="noreferrer"
            >
              <span className={styles.ticketButtonGlow} aria-hidden="true" />
              <span className={styles.ticketButtonLabel}>Purchase your tickets</span>
              <span className={styles.ticketButtonArrow} aria-hidden="true">↗</span>
            </a>
          </div>,
          portalTarget,
        )
        : null}
    </>
  );
}
