"use client";

import { useEffect, useRef, useState } from "react";
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

const PARTICLE_COLORS = ["#f8f4e8", "#f6a667", "#e8a8ff", "#9fe8d2"];

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
      const gap = width < 230 ? 4 : 5;
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
          size: 0.75 + Math.random() * 1.15,
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

  useEffect(() => {
    const update = () => setTimeLeft(getTimeLeft());
    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, []);

  const values = {
    days: String(timeLeft?.days ?? 0).padStart(3, "0"),
    hours: String(timeLeft?.hours ?? 0).padStart(2, "0"),
    minutes: String(timeLeft?.minutes ?? 0).padStart(2, "0"),
    seconds: String(timeLeft?.seconds ?? 0).padStart(2, "0"),
  };

  return (
    <main className={styles.page}>
      <div className={styles.aurora} aria-hidden="true" />
      <div className={styles.orbitOne} aria-hidden="true" />
      <div className={styles.orbitTwo} aria-hidden="true" />

      <header className={styles.header}>
        <a className={styles.brand} href="/" aria-label="Ageless Evolution home">
          <span className={styles.brandMark} aria-hidden="true">
            <span />
          </span>
          <span>
            AGELESS EVOLUTION
            <small>LONGEVITY SUMMIT</small>
          </span>
        </a>
        <div className={styles.headerDate}>
          <span>01.14.27</span>
          <span>Silicon Valley</span>
        </div>
      </header>

      <section className={styles.hero}>
        <div className={styles.kicker}>
          <span className={styles.liveDot} /> The next evolution begins in
        </div>

        <h1>
          Live well.
          <em>Age less.</em>
        </h1>
        <p className={styles.intro}>Reimagine the future of longevity.</p>

        <section className={styles.countdownShell} aria-label="Countdown to January 14, 2027">
          <div className={styles.counterInstruction}>
            <span>Particles in motion</span>
            <span>Move or tap to interact</span>
          </div>
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

        <div className={styles.heroFooter}>
          <div className={styles.eventMeta}>
            <span>January 14th, 2027</span>
            <span>The Ameswell · Silicon Valley</span>
          </div>
          <a className={styles.ticketButton} href={TICKETS_URL} target="_blank" rel="noreferrer">
            <span>Purchase tickets</span>
            <span className={styles.buttonArrow} aria-hidden="true">↗</span>
          </a>
        </div>
      </section>

      <section className={styles.manifesto}>
        <p className={styles.sectionNumber}>01 — The summit</p>
        <div className={styles.manifestoCopy}>
          <h2>Reimagine the future of longevity.</h2>
          <p>
            Join founders, investors, scientists, and wellness leaders for a transformative
            gathering at the frontiers of human health and lifespan extension.
          </p>
        </div>
        <div className={styles.pillars}>
          <article>
            <span>01</span>
            <h3>Science</h3>
            <p>Breakthrough ideas translating longevity research into real human impact.</p>
          </article>
          <article>
            <span>02</span>
            <h3>Vitality</h3>
            <p>New rituals and technologies designed for longer, healthier lives.</p>
          </article>
          <article>
            <span>03</span>
            <h3>Connection</h3>
            <p>Curated conversations with the people shaping what comes next.</p>
          </article>
        </div>
      </section>

      <footer className={styles.footer}>
        <p>Live Well. Age Less.</p>
        <a href={TICKETS_URL} target="_blank" rel="noreferrer">Purchase tickets ↗</a>
        <p>© 2027 Ageless Evolution</p>
      </footer>
    </main>
  );
}
