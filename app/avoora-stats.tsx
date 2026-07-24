"use client";

import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import styles from "./avoora-stats.module.css";

const metrics = [
  {
    prefix: "$",
    value: 74,
    suffix: "M",
    label: "Driving growth with strategy.",
  },
  {
    prefix: "",
    value: 95,
    suffix: "%",
    label: "Building trusted partnerships.",
  },
  {
    prefix: "+",
    value: 225,
    suffix: "",
    label: "Delivering industry success.",
  },
  {
    prefix: "",
    value: 92,
    suffix: "%",
    label: "Turning traffic into growth.",
  },
];

const easeOutPower2 = (progress: number) => 1 - (1 - progress) ** 2;

export function AvooraStats() {
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [values, setValues] = useState(() => metrics.map(() => 0));
  const [bouncing, setBouncing] = useState(() => metrics.map(() => false));
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    setPortalTarget(document.getElementById("ageless-avoora-stats-slot"));
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!portalTarget || !section) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const frames: number[] = [];
    const timers: number[] = [];

    const startCounters = () => {
      setIsVisible(true);

      if (reducedMotion) {
        setValues(metrics.map((metric) => metric.value));
        return;
      }

      metrics.forEach((metric, index) => {
        const timer = window.setTimeout(() => {
          const startedAt = performance.now();

          const tick = (now: number) => {
            const progress = Math.min((now - startedAt) / 3500, 1);
            const nextValue = Math.floor(
              metric.value * easeOutPower2(progress),
            );

            setValues((current) => {
              if (current[index] === nextValue) return current;
              const next = [...current];
              next[index] = nextValue;
              return next;
            });

            if (progress < 1) {
              frames.push(window.requestAnimationFrame(tick));
              return;
            }

            setValues((current) => {
              const next = [...current];
              next[index] = metric.value;
              return next;
            });
            setBouncing((current) => {
              const next = [...current];
              next[index] = true;
              return next;
            });

            const bounceTimer = window.setTimeout(() => {
              setBouncing((current) => {
                const next = [...current];
                next[index] = false;
                return next;
              });
            }, 1450);
            timers.push(bounceTimer);
          };

          frames.push(window.requestAnimationFrame(tick));
        }, index * 300);

        timers.push(timer);
      });
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        startCounters();
        observer.disconnect();
      },
      { threshold: 0.15, rootMargin: "0px 0px -15% 0px" },
    );

    observer.observe(section);

    return () => {
      observer.disconnect();
      frames.forEach((frame) => window.cancelAnimationFrame(frame));
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [portalTarget]);

  if (!portalTarget) return null;

  return createPortal(
    <section
      ref={sectionRef}
      className={`${styles.section} ${isVisible ? styles.visible : ""}`}
      aria-label="Ageless impact statistics"
    >
      <div className={styles.container}>
        <div className={styles.metrics}>
          {metrics.map((metric, index) => {
            const digits = String(values[index]).split("");

            return (
              <div
                className={styles.metric}
                style={{ "--metric-index": index } as CSSProperties}
                key={metric.label}
              >
                <div
                  className={styles.number}
                  aria-label={`${metric.prefix}${metric.value}${metric.suffix}`}
                >
                  {metric.prefix && (
                    <span aria-hidden="true">{metric.prefix}</span>
                  )}
                  <span
                    className={`${styles.animatedValue} ${
                      bouncing[index] ? styles.bouncing : ""
                    }`}
                    aria-hidden="true"
                  >
                    {digits.map((digit, digitIndex) => (
                      <span
                        className={styles.digit}
                        style={
                          { "--digit-index": digitIndex } as CSSProperties
                        }
                        key={`${digitIndex}-${digit}`}
                      >
                        {digit}
                      </span>
                    ))}
                  </span>
                  {metric.suffix && (
                    <span aria-hidden="true">{metric.suffix}</span>
                  )}
                </div>
                <p className={styles.label}>{metric.label}</p>
              </div>
            );
          })}
        </div>
        <div className={styles.bottomDivider} aria-hidden="true" />
      </div>
    </section>,
    portalTarget,
  );
}
