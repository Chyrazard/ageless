import type { Metadata } from "next";

import { AgelessUnusuallyHeader } from "../ageless-unusually-header";
import styles from "./agenda.module.css";

export const metadata: Metadata = {
  title: "Agenda — Ageless Summit",
  description: "The Ageless Evolution Summit 2027 agenda is coming soon.",
};

const agendaRows = [
  {
    time: "9:00 AM",
    title: "Opening Keynote: The Future of Human Longevity",
    speaker: "Ageless Evolution Summit",
  },
  {
    time: "9:30 AM",
    title: "The New Science of Aging Well",
    speaker: "World-class longevity leaders",
  },
  {
    time: "10:15 AM",
    title: "Health, Technology & Human Performance",
    speaker: "Expert panel",
  },
  {
    time: "11:00 AM",
    title: "Precision Medicine: From Insight to Impact",
    speaker: "Featured keynote",
  },
  {
    time: "11:45 AM",
    title: "Founders, Investors & the Future of Wellness",
    speaker: "Innovation panel",
  },
  {
    time: "12:30 PM",
    title: "Networking Lunch",
    speaker: "Ageless community",
  },
  {
    time: "2:00 PM",
    title: "Designing a Longer, Healthier Life",
    speaker: "Closing conversations",
  },
];

export default function AgendaPage() {
  const letters = Array.from("Coming soon.");

  return (
    <>
      <AgelessUnusuallyHeader alwaysBackdrop />
      <main className={styles.page}>
        <section className={styles.hero} aria-labelledby="agenda-status">
          <div className={styles.panel}>
            <div className={styles.schedule} aria-hidden="true">
              {agendaRows.map(({ time, title, speaker }) => (
                <div className={styles.row} key={`${time}-${title}`}>
                  <time>{time}</time>
                  <div>
                    <strong>{title}</strong>
                    <span>{speaker}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.status}>
              <p className={styles.eyebrow}>AGENDA · 2027</p>
              <h1
                id="agenda-status"
                className={styles.comingSoon}
                aria-label="Coming soon."
              >
                {letters.map((letter, index) => (
                  <span
                    key={`${letter}-${index}`}
                    className={letter === " " ? styles.space : undefined}
                    aria-hidden="true"
                  >
                    {letter === " " ? "\u00a0" : letter}
                  </span>
                ))}
              </h1>
              <p className={styles.note}>
                The full Ageless Evolution 2027 agenda is on its way.
              </p>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
