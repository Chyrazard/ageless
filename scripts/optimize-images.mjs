import { mkdir, readdir, stat } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const results = [];

async function optimize(sourceRelative, destinationRelative, options = {}) {
  const source = path.join(root, sourceRelative);
  const destination = path.join(root, destinationRelative);
  await mkdir(path.dirname(destination), { recursive: true });

  const pipeline = sharp(source).rotate().toColourspace("srgb");
  if (options.width) {
    pipeline.resize({
      width: options.width,
      withoutEnlargement: true,
      fit: "inside",
    });
  }

  await pipeline
    .webp({
      quality: options.quality ?? 88,
      alphaQuality: 100,
      smartSubsample: true,
    })
    .toFile(destination);

  const [before, after] = await Promise.all([stat(source), stat(destination)]);
  results.push({ sourceRelative, destinationRelative, before: before.size, after: after.size });
}

async function optimizeDirectory(sourceDirectory, destinationDirectory, predicate) {
  const entries = await readdir(path.join(root, sourceDirectory));
  for (const filename of entries.filter(predicate).sort()) {
    await optimize(
      path.join(sourceDirectory, filename),
      path.join(destinationDirectory, `${path.parse(filename).name}.webp`),
      { width: 900, quality: 88 },
    );
  }
}

await optimizeDirectory(
  "public/assets/current-speakers",
  "public/assets/current-speakers/optimized",
  (filename) => filename.endsWith(".png"),
);

await optimizeDirectory(
  "public/assets/past-speakers",
  "public/assets/past-speakers/optimized",
  (filename) => filename.endsWith("-final-v2.png"),
);

await optimize(
  "public/assets/past-speakers/source/mark-cofano.png",
  "public/assets/past-speakers/optimized/mark-cofano.webp",
  { width: 900, quality: 88 },
);

await optimizeDirectory(
  "public/assets/crew/members",
  "public/assets/crew/optimized",
  (filename) => filename.endsWith(".png"),
);

for (const name of [
  "cuartafoto",
  "decimafoto",
  "novenafoto",
  "octavafoto",
  "oncefoto",
  "primerafoto",
  "quintafoto",
  "septimafoto",
  "sextafoto",
  "swap",
]) {
  await optimize(
    `public/${name}.webp`,
    `public/assets/event-gallery/${name}.webp`,
    { width: 960, quality: 86 },
  );
}

await optimize(
  "public/ageless-logo-transparent.png",
  "public/ageless-logo-transparent.webp",
  { quality: 92 },
);
await optimize(
  "public/colorful-centered-poster.png",
  "public/colorful-centered-poster.webp",
  { quality: 90 },
);
await optimize(
  "public/assets/speakers/colorful3-background-poster.png",
  "public/assets/speakers/colorful3-background-poster.webp",
  { quality: 90 },
);
await optimize(
  "public/speakers/aubrey-de-grey-home-bw.png",
  "public/speakers/aubrey-de-grey-home-bw.webp",
  { width: 900, quality: 88 },
);

const beforeTotal = results.reduce((total, result) => total + result.before, 0);
const afterTotal = results.reduce((total, result) => total + result.after, 0);
const percentage = Math.round((1 - afterTotal / beforeTotal) * 100);

console.log(
  `Optimized ${results.length} images: ${(beforeTotal / 1_048_576).toFixed(1)} MB -> ${(afterTotal / 1_048_576).toFixed(1)} MB (${percentage}% smaller).`,
);
