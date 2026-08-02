"use client";

import { useLayoutEffect } from "react";

export function HomeScrollReset() {
  useLayoutEffect(() => {
    const previousScrollRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";

    const targetId = window.location.hash.slice(1);
    if (targetId && targetId !== "home") {
      const scrollToTarget = () => {
        const target = document.getElementById(targetId);
        if (!target) return false;

        target.scrollIntoView({ block: "start", behavior: "auto" });
        return true;
      };

      if (scrollToTarget()) {
        window.history.scrollRestoration = previousScrollRestoration;
        return;
      }

      const observer = new MutationObserver(() => {
        if (scrollToTarget()) observer.disconnect();
      });
      observer.observe(document.body, { childList: true, subtree: true });
      const observerTimeout = window.setTimeout(() => observer.disconnect(), 4000);

      return () => {
        observer.disconnect();
        window.clearTimeout(observerTimeout);
        window.history.scrollRestoration = previousScrollRestoration;
      };
    }

    window.scrollTo({ top: 0, left: 0, behavior: "auto" });

    return () => {
      window.history.scrollRestoration = previousScrollRestoration;
    };
  }, []);

  return null;
}
