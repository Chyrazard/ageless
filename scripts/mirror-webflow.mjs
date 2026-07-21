import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const sourceOrigin = "https://bungee-pro.webflow.io";
const projectRoot = path.resolve(import.meta.dirname, "..");
const outputRoot = path.join(projectRoot, "public", "webflow");
const assetsRoot = path.join(outputRoot, "assets");
const generatedFile = path.join(projectRoot, "app", "generated-pages.ts");

const downloadableHosts = new Set([
  "cdn.prod.website-files.com",
  "d3e54v103j8qbb.cloudfront.net",
  "ajax.googleapis.com",
  "cdnjs.cloudflare.com",
  "unpkg.com",
  "fonts.googleapis.com",
  "fonts.gstatic.com",
  "i.ytimg.com",
  "cdn.embedly.com",
]);

const contentTypeExtensions = new Map([
  ["text/css", ".css"],
  ["text/javascript", ".js"],
  ["application/javascript", ".js"],
  ["application/json", ".json"],
  ["image/jpeg", ".jpg"],
  ["image/png", ".png"],
  ["image/avif", ".avif"],
  ["image/webp", ".webp"],
  ["image/gif", ".gif"],
  ["image/svg+xml", ".svg"],
  ["video/mp4", ".mp4"],
  ["video/webm", ".webm"],
  ["font/woff", ".woff"],
  ["font/woff2", ".woff2"],
]);

const pageQueue = ["/"];
const pageHtml = new Map();
const assetQueue = [];
const urlToAsset = new Map();
const downloaded = new Map();

function decodeEntities(value) {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#x27;", "'");
}

function normalizeUrl(value, base = `${sourceOrigin}/`) {
  try {
    const cleaned = decodeEntities(value).trim();
    if (!cleaned || cleaned.startsWith("data:") || cleaned.startsWith("blob:")) return null;
    const resolved = new URL(cleaned, base);
    resolved.hash = "";
    return resolved.href;
  } catch {
    return null;
  }
}

function enqueueAsset(value, base) {
  const url = normalizeUrl(value, base);
  if (!url) return;
  const parsed = new URL(url);
  if (!downloadableHosts.has(parsed.hostname) || urlToAsset.has(url)) return;
  urlToAsset.set(url, null);
  assetQueue.push(url);
}

function enqueuePage(value) {
  const url = normalizeUrl(value);
  if (!url) return;
  const parsed = new URL(url);
  if (parsed.origin !== sourceOrigin) return;
  const route = parsed.pathname.replace(/\/$/, "") || "/";
  if (/\.[a-z0-9]{2,5}$/i.test(route) || pageHtml.has(route) || pageQueue.includes(route)) return;
  pageQueue.push(route);
}

function discoverHtml(html, pageUrl) {
  for (const match of html.matchAll(/\b(?:src|href|data-poster-url|data-video-urls)=["']([^"']+)["']/gi)) {
    const value = decodeEntities(match[1]);
    if (/^\//.test(value) && !value.startsWith("//")) enqueuePage(value);
    for (const candidate of value.split(/,(?=https?:\/\/)/)) enqueueAsset(candidate.trim(), pageUrl);
  }

  for (const match of html.matchAll(/\bsrcset=["']([^"']+)["']/gi)) {
    for (const item of decodeEntities(match[1]).split(",")) {
      enqueueAsset(item.trim().split(/\s+/)[0], pageUrl);
    }
  }

  discoverTextUrls(html, pageUrl);
}

function discoverTextUrls(text, base) {
  for (const match of text.matchAll(/https?:\/\/[^\s"'<>]+/g)) {
    const candidate = match[0].replace(/[;,]+$/, "").split(",https://")[0];
    enqueueAsset(candidate, base);
  }
  for (const match of text.matchAll(/url\(\s*['"]?([^'"\)]+)['"]?\s*\)/gi)) {
    enqueueAsset(match[1], base);
  }
}

function assetName(url, contentType) {
  const parsed = new URL(url);
  const hash = createHash("sha1").update(url).digest("hex").slice(0, 10);
  let base = decodeURIComponent(path.basename(parsed.pathname)) || "asset";
  base = base.replace(/[^a-zA-Z0-9._-]+/g, "_").slice(-100);
  if (!path.extname(base)) {
    base += contentTypeExtensions.get(contentType.split(";")[0]) || "";
  }
  return `${hash}-${base}`;
}

async function fetchPage(route) {
  const url = `${sourceOrigin}${route}`;
  const response = await fetch(url, { headers: { "user-agent": "AGELESS local migration" } });
  if (!response.ok) {
    console.warn(`Skipped page ${route}: ${response.status}`);
    return;
  }
  const html = await response.text();
  if (/<title>Not Found<\/title>/i.test(html)) {
    console.warn(`Skipped missing page ${route}`);
    return;
  }
  pageHtml.set(route, html);
  discoverHtml(html, url);
}

async function downloadAsset(url) {
  const response = await fetch(url, { headers: { "user-agent": "AGELESS local migration" } });
  if (!response.ok) throw new Error(`${response.status}`);
  const contentType = response.headers.get("content-type") || "application/octet-stream";
  const buffer = Buffer.from(await response.arrayBuffer());
  const name = assetName(url, contentType);
  const publicPath = `/webflow/assets/${name}`;
  const textual = /(?:css|javascript|json|text)/i.test(contentType);
  const text = textual ? buffer.toString("utf8") : null;
  urlToAsset.set(url, publicPath);
  downloaded.set(url, { name, publicPath, contentType, buffer, text });
  if (text) discoverTextUrls(text, url);
}

function rewriteUrls(text, base = `${sourceOrigin}/`) {
  let result = text;
  const entries = [...urlToAsset.entries()]
    .filter((entry) => entry[1])
    .sort((a, b) => b[0].length - a[0].length);

  for (const [url, localPath] of entries) {
    result = result.replaceAll(url, localPath);
    result = result.replaceAll(url.replaceAll("&", "&amp;"), localPath);
  }

  return result.replace(/url\(\s*(['"]?)([^'"\)]+)\1\s*\)/gi, (full, quote, value) => {
    const normalized = normalizeUrl(value, base);
    const local = normalized ? urlToAsset.get(normalized) : null;
    return local ? `url("${local}")` : full;
  });
}

function attr(tag, name) {
  return tag.match(new RegExp(`\\b${name}=["']([^"']+)["']`, "i"))?.[1];
}

await mkdir(assetsRoot, { recursive: true });

while (pageQueue.length) {
  const route = pageQueue.shift();
  if (!pageHtml.has(route)) await fetchPage(route);
}

while (assetQueue.length) {
  const url = assetQueue.shift();
  try {
    await downloadAsset(url);
  } catch (error) {
    console.warn(`Skipped asset ${url}: ${error.message}`);
  }
}

for (const [url, asset] of downloaded) {
  const output = asset.text ? rewriteUrls(asset.text, url) : asset.buffer;
  await writeFile(path.join(assetsRoot, asset.name), output);
}

const cssParts = [];
const stylesheetPaths = new Set();
const pages = {};

for (const [route, originalHtml] of pageHtml) {
  const rewritten = rewriteUrls(originalHtml, `${sourceOrigin}${route}`);
  for (const match of rewritten.matchAll(/<link\b[^>]*>/gi)) {
    const tag = match[0];
    const rel = attr(tag, "rel");
    const href = attr(tag, "href");
    if (rel?.split(/\s+/).includes("stylesheet") && href?.startsWith("/webflow/assets/")) {
      stylesheetPaths.add(href);
    }
  }
  for (const match of rewritten.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)) {
    cssParts.push(match[1]);
  }

  const scripts = [];
  for (const match of rewritten.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
    const src = attr(match[1], "src");
    const type = attr(match[1], "type");
    if (src) scripts.push({ src, type });
    else if (match[2].trim()) scripts.push({ code: match[2], type });
  }

  const body = rewritten.match(/<body\b[^>]*>([\s\S]*?)<\/body>/i)?.[1];
  if (!body) continue;
  const content = body
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "")
    .trim();
  const htmlTag = rewritten.match(/<html\b[^>]*>/i)?.[0] || "";
  const title = rewritten.match(/<title>([\s\S]*?)<\/title>/i)?.[1] || "Bungee";
  const description = rewritten.match(/<meta\b[^>]*name=["']description["'][^>]*content=["']([^"']*)["'][^>]*>/i)?.[1]
    || rewritten.match(/<meta\b[^>]*content=["']([^"']*)["'][^>]*name=["']description["'][^>]*>/i)?.[1]
    || "Creative studio based in Gotham.";

  pages[route] = {
    title,
    description,
    wfPage: attr(htmlTag, "data-wf-page") || "",
    wfSite: attr(htmlTag, "data-wf-site") || "",
    html: content,
    scripts,
  };
}

for (const href of stylesheetPaths) {
  const filename = path.basename(href);
  const matchingAsset = [...downloaded.values()].find((asset) => asset.name === filename);
  if (matchingAsset?.text) cssParts.unshift(rewriteUrls(matchingAsset.text));
}

await writeFile(path.join(outputRoot, "original.css"), [...new Set(cssParts)].join("\n\n"));
await writeFile(
  path.join(outputRoot, "manifest.json"),
  JSON.stringify({ source: sourceOrigin, routes: [...pageHtml.keys()], assets: [...urlToAsset.entries()] }, null, 2),
);

const generated = `export type MirroredScript = { src?: string; code?: string; type?: string };
export type MirroredPage = { title: string; description: string; wfPage: string; wfSite: string; html: string; scripts: MirroredScript[] };
export const mirroredPages: Record<string, MirroredPage> = ${JSON.stringify(pages)};
`;
await writeFile(generatedFile, generated);

console.log(`Mirrored ${Object.keys(pages).length} pages and ${downloaded.size} assets.`);
