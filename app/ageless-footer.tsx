"use client";

import Image from "next/image";
import Link from "next/link";
import type { MouseEvent } from "react";
import styles from "./ageless-footer.module.css";

export function AgelessFooter() {
  const openSponsorModal = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    window.dispatchEvent(new Event("ageless:open-sponsor-inquiry"));
  };

  return (
    <footer className={styles.footer} aria-label="Ageless footer">
      <div className={styles.inner}>
        <div className={styles.top}>
          <Link href="/" className={styles.brand} aria-label="Ageless home">
            <Image
              src="/ageless-logo-transparent.png"
              alt="Ageless"
              width={1450}
              height={392}
              className={styles.logo}
            />
          </Link>
          <div className={styles.meta}>
            <span>JP Morgan Week</span><span>San Francisco</span><span>January 14th, 2027</span>
          </div>
        </div>

        <div className={styles.main}>
          <div className={styles.message}>
            <p>We&apos;d love to hear from you — <span>whether you&apos;re attending, partnering with us, or just want to say hi.</span></p>
            <a className={styles.email} href="mailto:hello@agelessevo.com">hello@agelessevo.com</a>
          </div>
          <div className={styles.event}>
            <h2>Ageless Evolution Summit</h2>
            <p>Longevity, wellness, science, and meaningful connections.</p>
            <div className={styles.actions}>
              <a href="https://luma.com/ageless3" target="_blank" rel="noreferrer">Buy Tickets</a>
              <a
                href="#sponsor-inquiry"
                aria-haspopup="dialog"
                aria-controls="ageless-sponsor-dialog"
                onClick={openSponsorModal}
              >
                Exhibit &amp; Sponsor
              </a>
            </div>
          </div>
        </div>

        <div className={styles.bottom}>
          <nav className={styles.links} aria-label="Footer navigation">
            <Link href="/">Home</Link><Link href="/speakers">Speakers</Link>
            <a href="https://luma.com/ageless3" target="_blank" rel="noreferrer">Buy Tickets</a>
            <a href="mailto:hello@agelessevo.com">Contact</a>
          </nav>
          <p className={styles.credit}>Ageless · by <a href="https://becltech.com" target="_blank" rel="noreferrer">Belctech</a></p>
        </div>
      </div>
    </footer>
  );
}
