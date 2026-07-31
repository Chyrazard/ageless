"use client";

import Link from "next/link";
import {
  type FormEvent,
  type MouseEvent as ReactMouseEvent,
  useEffect,
  useRef,
  useState,
} from "react";

import styles from "./ageless-unusually-header.module.css";

const NAVIGATION_LINKS = [
  { label: "Home", href: "/#home" },
  { label: "Speakers", href: "/speakers" },
  { label: "Agenda", href: "/agenda" },
  {
    label: "Buy Tickets",
    href: "https://luma.com/ageless3",
    external: true,
  },
  { label: "Exhibit & Sponsor", href: "/contact" },
  { label: "Contact", href: "/contact" },
];

const DESKTOP_NAVIGATION_LINKS = NAVIGATION_LINKS.filter(
  ({ label }) => label !== "Home" && label !== "Contact",
);

function RollingText({ children }: { children: string }) {
  return (
    <span className={styles.rollingText} aria-label={children}>
      <span aria-hidden="true">{children}</span>
      <span aria-hidden="true">{children}</span>
    </span>
  );
}

type AgelessUnusuallyHeaderProps = {
  alwaysBackdrop?: boolean;
  darkBackdrop?: boolean;
};

export function AgelessUnusuallyHeader({
  alwaysBackdrop = false,
  darkBackdrop = false,
}: AgelessUnusuallyHeaderProps = {}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [sponsorModalOpen, setSponsorModalOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const firstMenuLink = useRef<HTMLAnchorElement>(null);
  const sponsorCloseButton = useRef<HTMLButtonElement>(null);
  const sponsorDialog = useRef<HTMLDivElement>(null);
  const sponsorTrigger = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const updateHeaderState = () => setIsScrolled(window.scrollY > 12);

    updateHeaderState();
    window.addEventListener("scroll", updateHeaderState, { passive: true });

    return () => window.removeEventListener("scroll", updateHeaderState);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;

    const focusTimer = window.setTimeout(() => firstMenuLink.current?.focus(), 850);

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => {
      window.clearTimeout(focusTimer);
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen && !sponsorModalOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [menuOpen, sponsorModalOpen]);

  useEffect(() => {
    if (!sponsorModalOpen) return;

    const focusTimer = window.setTimeout(
      () => sponsorCloseButton.current?.focus(),
      380,
    );

    const handleModalKeys = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSponsorModalOpen(false);
        return;
      }

      if (event.key !== "Tab") return;

      const focusableElements = Array.from(
        sponsorDialog.current?.querySelectorAll<HTMLElement>(
          'button, input, textarea, select, a[href], [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      ).filter((element) => !element.hasAttribute("disabled"));
      const firstElement = focusableElements[0];
      const lastElement = focusableElements.at(-1);
      if (!firstElement || !lastElement) return;

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    window.addEventListener("keydown", handleModalKeys);
    return () => {
      window.clearTimeout(focusTimer);
      window.removeEventListener("keydown", handleModalKeys);
      sponsorTrigger.current?.focus();
    };
  }, [sponsorModalOpen]);

  useEffect(() => {
    const openFromExternalTrigger = () => {
      if (document.activeElement instanceof HTMLElement) {
        sponsorTrigger.current = document.activeElement;
      }

      setMenuOpen(false);
      setSponsorModalOpen(true);
    };

    window.addEventListener(
      "ageless:open-sponsor-inquiry",
      openFromExternalTrigger,
    );

    return () => {
      window.removeEventListener(
        "ageless:open-sponsor-inquiry",
        openFromExternalTrigger,
      );
    };
  }, []);

  const openSponsorModal = (event: ReactMouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    sponsorTrigger.current = event.currentTarget;
    setMenuOpen(false);
    setSponsorModalOpen(true);
  };

  const submitSponsorInquiry = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const body = [
      `Name: ${formData.get("name") ?? ""}`,
      `Company: ${formData.get("company") ?? ""}`,
      `Email: ${formData.get("email") ?? ""}`,
      `Phone: ${formData.get("phone") ?? ""}`,
      "",
      String(formData.get("message") ?? ""),
    ].join("\n");

    window.location.href = `mailto:hello@agelessevo.com?subject=${encodeURIComponent(
      "Ageless sponsor and exhibitor inquiry",
    )}&body=${encodeURIComponent(body)}`;
  };

  return (
    <header
      className={`${styles.header} ${isScrolled || alwaysBackdrop ? styles.headerScrolled : ""} ${darkBackdrop ? styles.headerDark : ""}`}
    >
      <div className={styles.headerInner}>
        <div className={styles.headerBackground} aria-hidden="true" />

        <Link className={styles.brandGroup} href="/" aria-label="Ageless home">
          <span className={styles.brandLink}>
            <span className={styles.brandRoll}>
              <img src="/ageless-logo-transparent.png" alt="" />
              <img src="/ageless-logo-transparent.png" alt="" />
            </span>
          </span>
          <span className={styles.brandDivider} aria-hidden="true" />
          <span className={styles.brandDescriptor}>
            Longevity &amp; Wellness Summit
          </span>
        </Link>

        <div className={styles.navigationControls}>
          <nav className={styles.desktopNavigation} aria-label="Primary navigation">
            {DESKTOP_NAVIGATION_LINKS.map(({ label, href, external }) => (
              <a
                key={label}
                className={styles.desktopLink}
                href={href}
                target={external ? "_blank" : undefined}
                rel={external ? "noreferrer" : undefined}
                aria-haspopup={label === "Exhibit & Sponsor" ? "dialog" : undefined}
                aria-controls={label === "Exhibit & Sponsor" ? "ageless-sponsor-dialog" : undefined}
                onClick={label === "Exhibit & Sponsor" ? openSponsorModal : undefined}
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
                  aria-haspopup={label === "Exhibit & Sponsor" ? "dialog" : undefined}
                  aria-controls={label === "Exhibit & Sponsor" ? "ageless-sponsor-dialog" : undefined}
                  onClick={
                    label === "Exhibit & Sponsor"
                      ? openSponsorModal
                      : () => setMenuOpen(false)
                  }
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

      <div
        className={`${styles.sponsorModal} ${sponsorModalOpen ? styles.sponsorModalOpen : ""}`}
        aria-hidden={!sponsorModalOpen}
      >
        <button
          type="button"
          className={styles.sponsorModalBackdrop}
          aria-label="Close sponsor inquiry"
          tabIndex={sponsorModalOpen ? 0 : -1}
          onClick={() => setSponsorModalOpen(false)}
        />

        <div
          id="ageless-sponsor-dialog"
          ref={sponsorDialog}
          className={styles.sponsorDialog}
          role="dialog"
          aria-modal="true"
          aria-labelledby="ageless-sponsor-title"
        >
          <div className={styles.sponsorGlow} aria-hidden="true" />
          <button
            ref={sponsorCloseButton}
            type="button"
            className={styles.sponsorClose}
            aria-label="Close sponsor inquiry"
            tabIndex={sponsorModalOpen ? 0 : -1}
            onClick={() => setSponsorModalOpen(false)}
          >
            <span aria-hidden="true" />
          </button>

          <div className={styles.sponsorIntro}>
            <p>Exhibit · Sponsor</p>
            <h2 id="ageless-sponsor-title">
              Let&apos;s build something <em>meaningful.</em>
            </h2>
            <span>
              Tell us a little about you and your organization. Our team will
              help shape the right Ageless partnership.
            </span>
          </div>

          <form className={styles.sponsorForm} onSubmit={submitSponsorInquiry}>
            <label className={styles.sponsorField}>
              <span>Name</span>
              <input name="name" autoComplete="name" placeholder="Name" required />
            </label>
            <label className={styles.sponsorField}>
              <span>Company</span>
              <input name="company" autoComplete="organization" placeholder="Company" />
            </label>
            <label className={styles.sponsorField}>
              <span>Email</span>
              <input name="email" type="email" autoComplete="email" placeholder="Email" required />
            </label>
            <label className={styles.sponsorField}>
              <span>Phone</span>
              <input name="phone" type="tel" autoComplete="tel" placeholder="Phone" />
            </label>
            <label className={`${styles.sponsorField} ${styles.sponsorMessage}`}>
              <span>Message</span>
              <textarea name="message" placeholder="Message" required />
            </label>
            <button className={styles.sponsorSubmit} type="submit">
              <span>Submit inquiry</span>
              <i aria-hidden="true">↗</i>
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
