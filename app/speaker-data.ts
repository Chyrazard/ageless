export type AgelessSpeaker = {
  image: string;
  pageImage?: string;
  name: string;
  focus?: string;
  description?: string;
  hidden?: boolean;
};

export const speakers2027: AgelessSpeaker[] = [
  {
    image: "/speakers/eric-verdin.webp",
    pageImage: "/assets/current-speakers/optimized/eric-verdin.webp",
    name: "Eric Verdin",
    focus: "Biological Longevity",
    description:
      "As CEO of the Buck Institute, leading longevity expert Dr. Eric Verdin leverages over 300 peer-reviewed studies across virology, metabolism, and immune aging to establish rigorous science. By targeting chronic inflammation, his work translates deep biological insights into responsible, implementable therapies designed to extend the healthy human healthspan.",
  },
  {
    image: "/speakers/zak-williams.webp",
    pageImage: "/assets/current-speakers/optimized/zak-williams.webp",
    name: "Zak Williams",
    focus: "Mental Health",
    description:
      "Prominent mental health advocate and speaker Zak Williams drives scalable infrastructure at the intersection of AI, prestige media, and clinical healthcare. As Co-President of Hypothesis and a seasoned venture builder, he scales cognitive architecture, premium film portfolios, and data-driven systems of care.",
  },
  {
    image: "/speakers/alex-williams.webp",
    pageImage: "/assets/current-speakers/optimized/alex-williams.webp",
    name: "Alex Williams",
    focus: "Holistic Hyperbarics",
    description:
      "Founder and CEO of Holistic Hyperbarics, Alex Williams leverages patents in research modalities and chamber innovation to provide leading hyperbaric medicine and patient-centered care. Drawing from a diverse background as an EMT, birth doula, and athlete, she focuses acutely on health optimization and reversing the impact of structural systems on minority communities to deliver whole-person healing.",
  },
  {
    image: "/speakers/aubrey-de-grey-home-bw.webp",
    pageImage: "/assets/current-speakers/optimized/aubrey-de-grey.webp",
    name: "Aubrey de Grey",
    focus: "Anti-Aging Science",
    description:
      "As Founder, President, and Chief Science Officer of the LEV Foundation, visionary biomedical gerontologist Dr. Aubrey de Grey develops medical innovations that can postpone all forms of age-related ill-health. His main focus is on rejuvenation—the active repair of the various types of molecular and cellular damage which eventually cause age-related disease and disability, as opposed to the mere retardation of its accumulation.",
  },
  {
    image: "/speakers/daniel-kraft.webp",
    pageImage: "/assets/current-speakers/optimized/daniel-kraft.webp",
    name: "Dr. Daniel Kraft",
    focus: "Predictive Medicine",
    description:
      "Stanford and Harvard-trained physician-scientist Dr. Daniel Kraft operates at the intersection of medicine, AI, and biotech to shift healthcare from reactive to proactive, data-driven optimization. As the founder of NextMed Health, a General Partner at Continuum Health Ventures, and an XPRIZE health innovator who chaired the Pandemic & Health Alliance, he leverages 25 years of clinical innovation and systems thinking to scale technologies that democratize the future of human health.",
  },
  {
    image: "/speakers/niko.webp",
    pageImage: "/assets/current-speakers/optimized/nikolae-sin-fondo.webp",
    name: "Dr. Niko Dimitriadis",
    focus: "Neuro-Performance",
    description:
      "Award-winning communications professional and author Dr. Nikolaos Dimitriadis has spent two decades applying brain science to optimize business, leadership, and education systems as Director of the Applied Neuroscience Lab at EY Greece. Having scanned over 9,000 brains across 25 countries, he leverages pioneering neuro-data to design cutting-edge neuromarketing, neuro-HR, and enterprise health frameworks that elevate human performance.",
  },
  {
    image: "/speakers/david-kim.webp",
    pageImage: "/assets/current-speakers/optimized/david-kim.webp",
    name: "David Kim",
    focus: "Peptide Engineering",
    description:
      "As the Founder of General Biotechnologies, Oxford-trained medical doctor David Kim operates at the forefront of programming biology to manufacture oral GLP-1 and peptide drugs. Drawing from his foundational background as a British Army doctor and his success building CyanoCapture, he leverages deep domain expertise to invest in and engineer next-generation synthetic biology platforms that scale frontier bio-manufacturing technologies.",
  },
  {
    image: "/speakers/josejb.webp",
    pageImage: "/assets/current-speakers/optimized/jose-bitar.webp",
    name: "José Bitar",
    focus: "Mood Optimization",
    description:
      "As the Founder and CEO of TUOM, José Joaquin Bitar pioneers science-driven emotional alchemy through precise natural formulas designed to steady the inner state, elevate mood, and deepen human connection. By leveraging advanced oral strip delivery systems engineered for optimal absorption, his work scales clean, third-party tested wellness innovations that optimize mental well-being and daily performance.",
  },
  {
    image: "/speakers/peter-crone.webp",
    pageImage: "/assets/current-speakers/optimized/peter-crone.webp",
    name: "Peter Crone",
    hidden: true,
  },
];

export const visibleSpeakers2027 = speakers2027.filter(
  (speaker) => !speaker.hidden,
);
