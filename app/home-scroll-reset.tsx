"use client";

import { useLayoutEffect } from "react";

export function HomeScrollReset() {
  useLayoutEffect(() => {
    const previousScrollRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";

    let observer: MutationObserver | null = null;
    let scrollTimers: number[] = [];

    const clearPendingScrolls = () => {
      scrollTimers.forEach((timer) => window.clearTimeout(timer));
      scrollTimers = [];
      observer?.disconnect();
      observer = null;
    };

    const scrollToTarget = (targetId: string) => {
      const target = document.getElementById(targetId);
      if (!target) return false;

      target.scrollIntoView({ block: "start", behavior: "auto" });
      return true;
    };

    const settleOnTarget = (targetId: string) => {
      clearPendingScrolls();

      const confirmTargetPosition = () => {
        // The tickets block is mounted through a portal. Reconfirming its
        // position while the surrounding home sections settle prevents the
        // browser from keeping an early, footer-adjacent hash position.
        [0, 80, 220, 500, 900].forEach((delay) => {
          scrollTimers.push(
            window.setTimeout(() => scrollToTarget(targetId), delay),
          );
        });
      };

      if (scrollToTarget(targetId)) {
        confirmTargetPosition();
        return;
      }

      observer = new MutationObserver(() => {
        if (!scrollToTarget(targetId)) return;
        observer?.disconnect();
        observer = null;
        confirmTargetPosition();
      });
      observer.observe(document.body, { childList: true, subtree: true });
      scrollTimers.push(
        window.setTimeout(() => {
          observer?.disconnect();
          observer = null;
        }, 5000),
      );
    };

    const handleLocation = () => {
      const targetId = window.location.hash.slice(1);

      if (targetId && targetId !== "home") {
        settleOnTarget(targetId);
        return;
      }

      clearPendingScrolls();
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    };

    handleLocation();
    window.addEventListener("hashchange", handleLocation);

    return () => {
      window.removeEventListener("hashchange", handleLocation);
      clearPendingScrolls();
      window.history.scrollRestoration = previousScrollRestoration;
    };
  }, []);

  return null;
}
