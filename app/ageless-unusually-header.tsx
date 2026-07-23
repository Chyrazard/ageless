"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import styles from "./ageless-unusually-header.module.css";

const NAVIGATION_LINKS = [
  { label: "Home", href: "/#home" },
  { label: "Speakers", href: "/#speakers" },
  { label: "Agenda", href: "/#agenda" },
  {
    label: "Buy Ticket",
    href: "https://lu.ma/agelessevolution2025",
    external: true,
  },
  { label: "Exhibit & Sponsor", href: "/contact" },
  { label: "Contact", href: "/contact" },
];

function RollingText({ children }: { children: string }) {
  return (
    <span className={styles.rollingText} aria-label={children}>
      <span aria-hidden="true">{children}</span>
      <span aria-hidden="true">{children}</span>
    </span>
  );
}

export function AgelessUnusuallyHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const firstMenuLink = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (!menuOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusTimer = window.setTimeout(() => firstMenuLink.current?.focus(), 850);

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => {
      window.clearTimeout(focusTimer);
      window.removeEventListener("keydown", closeOnEscape);
      document.body.style.overflow = previousOverflow;
    };
  }, [menuOpen]);

  return (
    <header className={styles.header}>
      <div className={styles.headerInner}>
        <div className={styles.headerBackground} aria-hidden="true" />

        <div className={styles.brandGroup}>
          <a className={styles.brandLink} href="/#home" aria-label="Ageless home">
            <span className={styles.brandRoll}>
              <img src="/logo.jpeg" alt="" />
              <img src="/logo.jpeg" alt="" />
            </span>
          </a>
          <span className={styles.brandDivider} aria-hidden="true" />
          <span className={styles.brandDescriptor}>
            Longevity &amp; Wellness Summit
          </span>
        </div>

        <div className={styles.navigationControls}>
          <nav className={styles.desktopNavigation} aria-label="Primary navigation">
            {NAVIGATION_LINKS.map(({ label, href, external }) => (
              <a
                key={label}
                className={styles.desktopLink}
                href={href}
                target={external ? "_blank" : undefined}
                rel={external ? "noreferrer" : undefined}
              >
                <RollingText>{label}</RollingText>
              </a>
            ))}
          </nav>

          <button
            className={`${styles.menuButton} ${menuOpen ? styles.menuButtonOpen : ""}`}
            type="button"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="ageless-navigation-overlay"
            onClick={() => setMenuOpen((current) => !current)}
          >
            <span className={styles.menuLines} aria-hidden="true">
              <span className={styles.menuLineTop} />
              <span className={styles.menuLineBottom} />
            </span>
          </button>
        </div>
      </div>

      <div
        id="ageless-navigation-overlay"
        className={`${styles.overlay} ${menuOpen ? styles.overlayOpen : ""}`}
        aria-hidden={!menuOpen}
      >
        <button
          type="button"
          className={styles.overlayShade}
          aria-label="Close menu"
          tabIndex={menuOpen ? 0 : -1}
          onClick={() => setMenuOpen(false)}
        />

        <div className={styles.overlayPanel}>
          <div className={styles.overlayPanelBackground} aria-hidden="true" />
          <nav className={styles.overlayNavigation} aria-label="Menu navigation">
            {NAVIGATION_LINKS.map(({ label, href, external }, index) => (
              <div
                className={styles.overlayLinkClip}
                key={label}
              >
                <a
                  ref={index === 0 ? firstMenuLink : undefined}
                  className={styles.overlayLink}
                  href={href}
                  target={external ? "_blank" : undefined}
                  rel={external ? "noreferrer" : undefined}
                  tabIndex={menuOpen ? 0 : -1}
                  onClick={() => setMenuOpen(false)}
                >
                  <span className={styles.overlayLinkRoll}>
                    <span>{label}</span>
                    <span aria-hidden="true">{label}</span>
                  </span>
                  <span className={styles.overlayLinkNumber}>
                    ({String(index + 1).padStart(2, "0")})
                  </span>
                </a>
              </div>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
