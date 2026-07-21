import type { Metadata } from "next";
import { CountdownExperience } from "./countdown-experience";

export const metadata: Metadata = {
  title: "Countdown 2027 | Ageless Evolution Summit",
  description:
    "Live well. Age less. Countdown to the Ageless Evolution Longevity Summit on January 14, 2027 in Silicon Valley.",
};

export default function CountdownPage() {
  return <CountdownExperience />;
}
