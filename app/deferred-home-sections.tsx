"use client";

import type { ComponentType } from "react";
import { useEffect, useRef, useState } from "react";

type DeferredSections = {
  AvooraStats: ComponentType;
  CineryAubreyCarousel: ComponentType;
  TuomSplitFeature: ComponentType;
  UnusuallyIntro: ComponentType;
};

type IdleWindow = Window & {
  requestIdleCallback?: (
    callback: () => void,
    options?: { timeout: number },
  ) => number;
  cancelIdleCallback?: (handle: number) => void;
};

export function DeferredHomeSections() {
  const [sections, setSections] = useState<DeferredSections | null>(null);
  const started = useRef(false);

  useEffect(() => {
    let active = true;
    let timer = 0;
    let idleHandle = 0;
    const idleWindow = window as IdleWindow;

    const load = () => {
      if (started.current) return;
      started.current = true;

      Promise.all([
        import("./avoora-stats"),
        import("./cinery-aubrey-carousel"),
        import("./tuom-split-feature"),
        import("./unusually-intro"),
      ]).then(([stats, carousel, feature, intro]) => {
        if (!active) return;
        setSections({
          AvooraStats: stats.AvooraStats,
          CineryAubreyCarousel: carousel.CineryAubreyCarousel,
          TuomSplitFeature: feature.TuomSplitFeature,
          UnusuallyIntro: intro.UnusuallyIntro,
        });
      });
    };

    if (idleWindow.requestIdleCallback) {
      idleHandle = idleWindow.requestIdleCallback(load, { timeout: 1400 });
    } else {
      timer = window.setTimeout(load, 650);
    }

    const firstSlot = document.getElementById("ageless-cinery-carousel-slot");
    let observer: IntersectionObserver | null = null;
    if (firstSlot) {
      observer = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) return;
          load();
          observer?.disconnect();
        },
        { rootMargin: "160px 0px" },
      );
    }
    if (firstSlot && observer) observer.observe(firstSlot);

    return () => {
      active = false;
      observer?.disconnect();
      window.clearTimeout(timer);
      if (idleHandle) idleWindow.cancelIdleCallback?.(idleHandle);
    };
  }, []);

  if (!sections) return null;

  const {
    AvooraStats,
    CineryAubreyCarousel,
    TuomSplitFeature,
    UnusuallyIntro,
  } = sections;

  return (
    <>
      <CineryAubreyCarousel />
      <AvooraStats />
      <UnusuallyIntro />
      <TuomSplitFeature />
    </>
  );
}
