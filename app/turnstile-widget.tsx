"use client";

import { useEffect, useRef, useState } from "react";

const PRODUCTION_SITE_KEY = "0x4AAAAAAEEQ_nOwFayCxlM3";
const DEVELOPMENT_SITE_KEY = "1x00000000000000000000AA";
const SCRIPT_ID = "cloudflare-turnstile-script";
const SCRIPT_URL =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

type TurnstileWidgetId = string;

type TurnstileApi = {
  remove(widgetId: TurnstileWidgetId): void;
  render(
    container: HTMLElement,
    options: {
      action: string;
      appearance: "interaction-only";
      callback: (token: string) => void;
      cData: string;
      "error-callback": () => void;
      "expired-callback": () => void;
      sitekey: string;
      size: "flexible";
      theme: "light";
    },
  ): TurnstileWidgetId;
  reset(widgetId: TurnstileWidgetId): void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

let turnstileLoader: Promise<TurnstileApi> | null = null;

function loadTurnstile() {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  if (turnstileLoader) return turnstileLoader;

  turnstileLoader = new Promise<TurnstileApi>((resolve, reject) => {
    const finishLoading = () => {
      if (window.turnstile) {
        resolve(window.turnstile);
      } else {
        reject(new Error("Turnstile did not initialize."));
      }
    };

    const existingScript = document.getElementById(SCRIPT_ID);
    if (existingScript) {
      existingScript.addEventListener("load", finishLoading, { once: true });
      existingScript.addEventListener(
        "error",
        () => reject(new Error("Turnstile could not be loaded.")),
        { once: true },
      );
      return;
    }

    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = SCRIPT_URL;
    script.async = true;
    script.defer = true;
    script.addEventListener("load", finishLoading, { once: true });
    script.addEventListener(
      "error",
      () => reject(new Error("Turnstile could not be loaded.")),
      { once: true },
    );
    document.head.append(script);
  }).catch((error) => {
    turnstileLoader = null;
    throw error;
  });

  return turnstileLoader;
}

function siteKey() {
  return ["localhost", "127.0.0.1", "0.0.0.0"].includes(
    window.location.hostname,
  )
    ? DEVELOPMENT_SITE_KEY
    : PRODUCTION_SITE_KEY;
}

type TurnstileWidgetProps = {
  active?: boolean;
  className?: string;
  context: "contact" | "sponsor";
  onTokenChange: (token: string) => void;
  resetSignal: number;
};

export function TurnstileWidget({
  active = true,
  className,
  context,
  onTokenChange,
  resetSignal,
}: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<TurnstileWidgetId | null>(null);
  const onTokenChangeRef = useRef(onTokenChange);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    onTokenChangeRef.current = onTokenChange;
  }, [onTokenChange]);

  useEffect(() => {
    if (!active || !containerRef.current) return;

    let cancelled = false;
    setLoadFailed(false);

    void loadTurnstile()
      .then((turnstile) => {
        if (cancelled || !containerRef.current) return;

        widgetIdRef.current = turnstile.render(containerRef.current, {
          sitekey: siteKey(),
          action: "inquiry",
          cData: context,
          appearance: "interaction-only",
          size: "flexible",
          theme: "light",
          callback: (token) => onTokenChangeRef.current(token),
          "expired-callback": () => onTokenChangeRef.current(""),
          "error-callback": () => onTokenChangeRef.current(""),
        });
      })
      .catch(() => {
        if (!cancelled) {
          setLoadFailed(true);
          onTokenChangeRef.current("");
        }
      });

    return () => {
      cancelled = true;
      onTokenChangeRef.current("");
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
      }
      widgetIdRef.current = null;
    };
  }, [active, context]);

  useEffect(() => {
    if (!widgetIdRef.current || !window.turnstile) return;
    onTokenChangeRef.current("");
    window.turnstile.reset(widgetIdRef.current);
  }, [resetSignal]);

  if (!active) return null;

  return (
    <div className={className}>
      <div ref={containerRef} />
      {loadFailed ? (
        <p role="status">
          The security check could not load. Please refresh and try again.
        </p>
      ) : null}
    </div>
  );
}
