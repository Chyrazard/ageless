import type { Metadata } from "next";
import { SpeakersPageExperience } from "./speakers-page-experience";

export const metadata: Metadata = {
  title: "Speakers 2027 — Ageless Evolution Summit",
  description:
    "Meet the speakers shaping longevity, wellness and human performance at Ageless Evolution Summit 2027.",
};

export default function SpeakersPage() {
  return <SpeakersPageExperience />;
}
