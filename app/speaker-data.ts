export type AgelessSpeaker = {
  image: string;
  pageImage?: string;
  name: string;
  hidden?: boolean;
};

export const speakers2027: AgelessSpeaker[] = [
  {
    image: "/speakers/eric-verdin.webp",
    pageImage: "/assets/current-speakers/eric-verdin.png",
    name: "Eric Verdin",
  },
  {
    image: "/speakers/zak-williams.webp",
    pageImage: "/assets/current-speakers/zak-williams.png",
    name: "Zak Williams",
  },
  {
    image: "/speakers/alex-williams.webp",
    pageImage: "/assets/current-speakers/alex-williams.png",
    name: "Alex Williams",
  },
  {
    image: "/speakers/aubrey-degrey.webp",
    pageImage: "/assets/current-speakers/aubrey-de-grey.png",
    name: "Aubrey de Grey",
  },
  {
    image: "/speakers/daniel-kraft.webp",
    pageImage: "/assets/current-speakers/daniel-kraft.png",
    name: "Dr. Daniel Kraft",
  },
  {
    image: "/speakers/niko.webp",
    pageImage: "/assets/current-speakers/niko-dimitriadis.png",
    name: "Dr. Niko Dimitriadis",
  },
  {
    image: "/speakers/david-kim.webp",
    pageImage: "/assets/current-speakers/david-kim.png",
    name: "David Kim",
  },
  {
    image: "/speakers/josejb.webp",
    pageImage: "/assets/current-speakers/jose-bitar.png",
    name: "José Bitar",
  },
  {
    image: "/speakers/peter-crone.webp",
    pageImage: "/assets/current-speakers/peter-crone.png",
    name: "Peter Crone",
    hidden: true,
  },
];

export const visibleSpeakers2027 = speakers2027.filter(
  (speaker) => !speaker.hidden,
);
