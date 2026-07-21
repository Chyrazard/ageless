"use client";

import { useEffect } from "react";
import type { MirroredPage, MirroredScript } from "./generated-pages";

declare global {
  interface Window {
    Webflow?: unknown;
  }
}

function injectScript(script: MirroredScript) {
  return new Promise<void>((resolve) => {
    const element = document.createElement("script");
    element.className = "ageless-mirrored-script";
    if (script.type) element.type = script.type;

    if (script.src) {
      element.src = script.src;
      element.async = false;
      element.onload = () => resolve();
      element.onerror = () => {
        console.warn(`Could not load mirrored script: ${script.src}`);
        resolve();
      };
    } else {
      element.textContent = script.code ?? "";
    }

    document.body.appendChild(element);
    if (!script.src) resolve();
  });
}

function isGsapDependency(script: MirroredScript) {
  return Boolean(
    script.src &&
      /(?:gsap(?:\.min)?\.js|ScrollTrigger(?:\.min)?\.js|SplitText(?:\.min)?\.js)/i.test(
        script.src,
      ),
  );
}

function orderScripts(scripts: MirroredScript[]) {
  const gsapDependencies = scripts.filter(isGsapDependency);
  const remainingScripts = scripts.filter((script) => !isGsapDependency(script));
  return [...gsapDependencies, ...remainingScripts];
}

export function WebflowRuntime({ page }: { page: MirroredPage }) {
  useEffect(() => {
    let active = true;
    const removeWebflowBadges = () => {
      document.querySelectorAll(".w-webflow-badge").forEach((badge) => badge.remove());
    };
    const badgeObserver = new MutationObserver(removeWebflowBadges);
    badgeObserver.observe(document.body, { childList: true, subtree: true });
    removeWebflowBadges();

    const root = document.documentElement;
    root.classList.add("w-mod-js");
    root.setAttribute("data-wf-domain", "bungee-pro.webflow.io");
    root.setAttribute("data-wf-page", page.wfPage);
    root.setAttribute("data-wf-site", page.wfSite);

    async function start() {
      // Several Webflow chunks build their timelines as soon as they execute.
      // GSAP must therefore exist globally before any of those chunks load.
      for (const script of orderScripts(page.scripts)) {
        if (!active) return;
        await injectScript(script);
      }
      if (active) window.dispatchEvent(new Event("resize"));
    }

    start().catch((error) => console.error("Bungee runtime failed", error));
    return () => {
      active = false;
      badgeObserver.disconnect();
      document.querySelectorAll(".ageless-mirrored-script").forEach((script) => script.remove());
    };
  }, [page]);

  return null;
}
