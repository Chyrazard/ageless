"use client";

import { useEffect } from "react";

type IdleWindow = Window & {
  requestIdleCallback?: (
    callback: () => void,
    options?: { timeout: number },
  ) => number;
  cancelIdleCallback?: (handle: number) => void;
};

function activateVideo(video: HTMLVideoElement) {
  if (video.dataset.agelessLoaded === "true") return;
  video.dataset.agelessLoaded = "true";

  video.querySelectorAll<HTMLSourceElement>("source[data-src]").forEach((source) => {
    const src = source.dataset.src;
    if (src) source.src = src;
  });
  video.load();

  if (video.autoplay) {
    void video.play().catch(() => undefined);
  }
}

export function DeferredMedia() {
  useEffect(() => {
    const idleWindow = window as IdleWindow;
    let idleHandle = 0;
    let timer = 0;
    let initialPaintPassed = false;
    const registered = new WeakSet<HTMLVideoElement>();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          activateVideo(entry.target as HTMLVideoElement);
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "600px 0px", threshold: 0.01 },
    );

    const scan = () => {
      document
        .querySelectorAll<HTMLVideoElement>("video[data-ageless-deferred-video]")
        .forEach((video) => {
          if (registered.has(video)) return;
          registered.add(video);

          if (video.dataset.agelessDeferredVideo === "after-paint") {
            if (initialPaintPassed) activateVideo(video);
            return;
          }

          observer.observe(video);
        });
    };

    scan();

    const activateAfterPaint = () => {
      initialPaintPassed = true;
      document
        .querySelectorAll<HTMLVideoElement>(
          'video[data-ageless-deferred-video="after-paint"]',
        )
        .forEach(activateVideo);
    };

    if (idleWindow.requestIdleCallback) {
      idleHandle = idleWindow.requestIdleCallback(activateAfterPaint, {
        timeout: 900,
      });
    } else {
      timer = window.setTimeout(activateAfterPaint, 280);
    }

    const mutationObserver = new MutationObserver(scan);
    mutationObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      mutationObserver.disconnect();
      observer.disconnect();
      window.clearTimeout(timer);
      if (idleHandle) idleWindow.cancelIdleCallback?.(idleHandle);
    };
  }, []);

  return null;
}
