"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { AgelessUnusuallyHeader } from "../ageless-unusually-header";
import { AGELESS_PRICING_PLANS } from "../ageless-pricing-data";
import { visibleSpeakers2027 } from "../speaker-data";
import { TurnstileWidget } from "../turnstile-widget";
import styles from "./speakers.module.css";

type SubmissionStatus = "error" | "idle" | "security" | "sending" | "success";

const frequentlyAskedQuestions = [
  {
    question: "What’s included in a the monthly package?",
    answer:
      "Each monthly package includes a set number of design or development hours, dedicated project management, weekly updates, and priority support. We tailor it to fit your needs — whether that’s ongoing branding, web updates, or new creative assets.",
  },
  {
    question: "How long does a project usually take?",
    answer:
      "Timelines depend on the scope, but most branding projects take 2–3 weeks, and full website builds range from 3–6 weeks. We’ll always give you a clear timeline upfront — and stick to it.",
  },
  {
    question: "Do you offer ongoing support after launch?",
    answer:
      "Absolutely. We offer ongoing maintenance, design tweaks, updates, and new feature support. Think of us as your creative partner, not just a one-time service.",
  },
  {
    question: "Can I hire you for just a logo or one-off design?",
    answer:
      "Yes — we take on one-off projects like logos, pitch decks, or landing pages. If it’s a good fit, we’re happy to jump in and help.",
  },
  {
    question: "What platforms do you build websites on?",
    answer:
      "We primarily work with Framer, Webflow, and Shopify — but we’re flexible depending on your project needs and tech stack.",
  },
  {
    question: "How do payments work?",
    answer:
      "For fixed-scope projects, we split payments into 50% upfront and 50% upon completion. For monthly retainers, payments are made at the start of each billing cycle. We accept most major payment methods.",
  },
  {
    question: "What if I’m not happy with the first concept?",
    answer:
      "No problem — that’s part of the process. We include multiple rounds of revisions to ensure you’re completely happy with the final result. Your feedback helps us shape it just right.",
  },
  {
    question: "Do you work with clients from any country?",
    answer:
      "Yes! We work with clients around the world — across time zones, industries, and cultures. Remote collaboration is our default, and we’ve got it down to a science.",
  },
] as const;

export function SpeakersPageExperience() {
  const rootRef = useRef<HTMLElement>(null);
  const [submissionStatus, setSubmissionStatus] =
    useState<SubmissionStatus>("idle");
  const [formStartedAt] = useState(() => Date.now());
  const [turnstileToken, setTurnstileToken] = useState("");
  const [turnstileReset, setTurnstileReset] = useState(0);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const items = Array.from(root.querySelectorAll<HTMLElement>("[data-reveal]"));
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).dataset.visible = "true";
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -6%" },
    );

    items.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, []);

  const submitForm = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    if (!turnstileToken) {
      setSubmissionStatus("security");
      return;
    }
    setSubmissionStatus("sending");

    try {
      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "contact",
          name: formData.get("name"),
          company: "",
          email: formData.get("email"),
          phone: formData.get("phone"),
          message: formData.get("message"),
          website: formData.get("website"),
          startedAt: formStartedAt,
          turnstileToken,
        }),
      });

      if (!response.ok) throw new Error("Contact request failed");

      form.reset();
      setSubmissionStatus("success");
    } catch {
      setSubmissionStatus("error");
    } finally {
      setTurnstileToken("");
      setTurnstileReset((current) => current + 1);
    }
  };

  const contactButtonLabel =
    submissionStatus === "sending"
      ? "Sending…"
      : submissionStatus === "success"
        ? "Message sent"
        : "Send message";

  return (
    <>
      <AgelessUnusuallyHeader alwaysBackdrop darkBackdrop />
      <main ref={rootRef} className={styles.page}>
        <div className={styles.fixedBackdrop} aria-hidden="true">
          <video autoPlay loop muted playsInline preload="auto" poster="/assets/speakers/colorful3-background-poster.png?v=1">
            <source src="/assets/speakers/colorful3-background-hevc.mov?v=1" type='video/quicktime; codecs="hvc1"' />
            <source src="/assets/speakers/colorful3-background.webm?v=1" type="video/webm" />
          </video>
        </div>

        <section className={styles.results} aria-labelledby="speakers-page-title">
          <header className={`${styles.sectionIntro} ${styles.resultsIntro}`} data-reveal>
            <h1 id="speakers-page-title">
              <span>Meet Our</span>
              <span>World-Class <em>Speakers</em></span>
            </h1>
          </header>

          <div className={styles.speakerGrid}>
            {visibleSpeakers2027.map((speaker, index) => (
              <article className={styles.speakerCard} data-reveal key={speaker.name}>
                <div className={styles.speakerImageWrap}>
                  <img
                    src={speaker.pageImage ?? speaker.image}
                    alt={speaker.name}
                    loading={index < 3 ? "eager" : "lazy"}
                  />
                </div>
                <div className={styles.speakerContent}>
                  <span>{speaker.focus ?? "Ageless Speaker 2027"}</span>
                  <h2>{speaker.name}</h2>
                  <p>{speaker.description}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.pricing} aria-labelledby="pricing-title">
          <header className={styles.sectionIntro} data-reveal>
            <h2 id="pricing-title">
              <span>Invest In Your Longevity</span>
              <span>
                Choose <em>Your Pass</em>
              </span>
            </h2>
          </header>
          <div className={styles.pricingGrid}>
            {AGELESS_PRICING_PLANS.map((plan) => (
              <article
                className={`${styles.planCard} ${plan.featured ? styles.featuredPlan : ""} ${plan.id === "become-a-sponsor" ? styles.sponsorCard : ""}`}
                data-reveal
                key={plan.label}
              >
                <div>
                  <div className={styles.planLabel}>
                    <h3 aria-label={plan.label}>
                      {plan.labelLines.map((line) => (
                        <span key={line}>{line}</span>
                      ))}
                    </h3>
                    {plan.featured ? <em>Featured</em> : null}
                  </div>
                  {plan.price ? (
                    <div className={styles.priceRow}>
                      <div className={styles.primaryPrice}>
                        {"priceLabel" in plan ? (
                          <span>{plan.priceLabel}</span>
                        ) : null}
                        <strong>{plan.price}</strong>
                      </div>
                      {"regularPrice" in plan ? (
                        <div className={styles.regularPrice}>
                          <span>{plan.regularPriceLabel}</span>
                          <del>{plan.regularPrice}</del>
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                  <div className={styles.included}>
                    <h4>What&apos;s Included:</h4>
                    <ul>
                      {plan.items.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                <a
                  className={`ageless-cta ${
                    plan.id === "become-a-sponsor" ? "" : "ageless-cta--primary"
                  }`}
                  href={
                    plan.id === "become-a-sponsor"
                      ? "/contact"
                      : "https://luma.com/ageless3"
                  }
                  target={plan.id === "become-a-sponsor" ? undefined : "_blank"}
                  rel={plan.id === "become-a-sponsor" ? undefined : "noreferrer"}
                >
                  <span className="ageless-cta__glow" aria-hidden="true" />
                  <span
                    className="ageless-cta__label"
                    data-text={plan.id === "become-a-sponsor" ? "Submit a Request" : "Buy Tickets"}
                  >
                    {plan.id === "become-a-sponsor" ? "Submit a Request" : "Buy Tickets"}
                  </span>
                </a>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.ticketFaq} aria-labelledby="ticket-faq-title">
          <div className={styles.faqGlow} aria-hidden="true" />
          <header className={styles.ticketFaqIntro} data-reveal>
            <p>Questions · Answers</p>
            <h2 id="ticket-faq-title">FAQ.</h2>
          </header>

          <div className={styles.ticketFaqList} data-reveal>
            {frequentlyAskedQuestions.map(({ question, answer }, index) => (
              <details className={styles.ticketFaqItem} key={question}>
                <summary>
                  <span className={styles.faqNumber}>
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className={styles.faqQuestion}>{question}</span>
                  <span className={styles.faqToggle} aria-hidden="true" />
                </summary>
                <div className={styles.ticketFaqAnswer}>
                  <p>{answer}</p>
                </div>
              </details>
            ))}
          </div>
        </section>

        <section className={styles.contact} id="contact" aria-labelledby="contact-title">
          <div className={styles.contactCopy} data-reveal>
            <h2 id="contact-title">Get in Touch</h2>
            <p>Reach out and get clear answers before getting started.</p>
            <div className={styles.faq}>
              <h3>1. Is coaching suitable for beginners?</h3>
              <p>Yes. Coaching and programs are designed to work for all experience levels.</p>
              <h3>2. Do I need gym equipment?</h3>
              <p>Some programs require gym access, while others can be completed at home.</p>
              <h3>3. How soon can I expect results?</h3>
              <p>Most clients notice improvements within the first few weeks of consistent training.</p>
            </div>
          </div>

          <form className={styles.form} onSubmit={submitForm} data-reveal>
            <label className={styles.formTrap} aria-hidden="true">
              Website<input name="website" tabIndex={-1} autoComplete="off" />
            </label>
            <label>* Name:<input name="name" placeholder="Your full name" minLength={2} maxLength={100} required /></label>
            <label>* Email:<input name="email" type="email" placeholder="me@mail.com" maxLength={254} required /></label>
            <label>Phone:<input name="phone" type="tel" placeholder="Your phone number" maxLength={50} /></label>
            <label>* Message:<textarea name="message" placeholder="Your message..." minLength={10} maxLength={5000} required /></label>
            <TurnstileWidget
              className={styles.formTurnstile}
              context="contact"
              onTokenChange={setTurnstileToken}
              resetSignal={turnstileReset}
            />
            <button
              className="ageless-cta ageless-cta--primary"
              type="submit"
              disabled={submissionStatus === "sending" || submissionStatus === "success"}
            >
              <span className="ageless-cta__glow" aria-hidden="true" />
              <span className="ageless-cta__label" data-text={contactButtonLabel}>
                {contactButtonLabel}
              </span>
            </button>
            <p
              className={`${styles.success} ${submissionStatus === "error" || submissionStatus === "security" ? styles.formError : ""}`}
              role="status"
              aria-live="polite"
            >
              {submissionStatus === "success"
                ? "Thank you! Your message was sent successfully."
                : submissionStatus === "security"
                  ? "Please wait a moment for the security check, then try again."
                : submissionStatus === "error"
                  ? "We couldn’t send your message. Please try again."
                  : ""}
            </p>
          </form>
        </section>
      </main>
    </>
  );
}
