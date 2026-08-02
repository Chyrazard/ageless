import { NextRequest, NextResponse } from "next/server";

import { sendTransactionalEmail } from "@/app/lib/transactional-email";
import { verifyTurnstile } from "@/app/lib/turnstile";

export const runtime = "nodejs";

const MAX_BODY_BYTES = 16_384;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 6;
const attemptsByIp = new Map<string, number[]>();

type InquiryKind = "contact" | "sponsor";

type Inquiry = {
  company: string;
  email: string;
  kind: InquiryKind;
  message: string;
  name: string;
  phone: string;
  startedAt: number;
  turnstileToken: string;
  website: string;
};

function escapeHtml(value: string) {
  return value.replace(
    /[&<>'"]/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "'": "&#39;",
        '"': "&quot;",
      })[character] ?? character,
  );
}

function singleLine(value: string) {
  return value.replace(/[\r\n]+/g, " ").trim();
}

function readString(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function parseInquiry(payload: unknown): Inquiry | null {
  if (!payload || typeof payload !== "object") return null;

  const data = payload as Record<string, unknown>;
  const kind = data.kind === "sponsor" || data.kind === "contact" ? data.kind : null;
  if (!kind) return null;

  return {
    kind,
    name: readString(data.name, 100),
    company: readString(data.company, 120),
    email: readString(data.email, 254).toLowerCase(),
    phone: readString(data.phone, 50),
    message: readString(data.message, 5_000),
    website: readString(data.website, 200),
    startedAt: typeof data.startedAt === "number" ? data.startedAt : 0,
    turnstileToken: readString(data.turnstileToken, 2_048),
  };
}

function isValidInquiry(inquiry: Inquiry) {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return (
    inquiry.name.length >= 2 &&
    emailPattern.test(inquiry.email) &&
    inquiry.message.length >= 10 &&
    inquiry.startedAt > 0 &&
    Date.now() - inquiry.startedAt >= 1_500
  );
}

function requestIp(request: NextRequest) {
  return (
    request.headers.get("x-real-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown"
  );
}

function requestHostname(request: NextRequest) {
  const forwardedHost = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  const host = forwardedHost ?? request.headers.get("host") ?? "";
  return host.replace(/:\d+$/, "").toLowerCase();
}

function hasRateLimitCapacity(ip: string) {
  const now = Date.now();
  const recentAttempts = (attemptsByIp.get(ip) ?? []).filter(
    (timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS,
  );

  if (recentAttempts.length >= RATE_LIMIT_MAX_REQUESTS) {
    attemptsByIp.set(ip, recentAttempts);
    return false;
  }

  recentAttempts.push(now);
  attemptsByIp.set(ip, recentAttempts);

  if (attemptsByIp.size > 5_000) {
    for (const [storedIp, timestamps] of attemptsByIp) {
      if (timestamps.every((timestamp) => now - timestamp >= RATE_LIMIT_WINDOW_MS)) {
        attemptsByIp.delete(storedIp);
      }
    }
  }

  return true;
}

function isSameOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  const forwardedHost = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  const requestHost = forwardedHost ?? request.headers.get("host");
  if (!origin || !requestHost) return false;

  try {
    return new URL(origin).host === requestHost;
  } catch {
    return false;
  }
}

function inquiryEmail(inquiry: Inquiry) {
  const typeLabel =
    inquiry.kind === "sponsor" ? "Sponsor / Exhibitor inquiry" : "Website contact";
  const rows = [
    ["Name", inquiry.name],
    ["Company", inquiry.company || "—"],
    ["Email", inquiry.email],
    ["Phone", inquiry.phone || "—"],
  ] as const;

  const text = [
    typeLabel,
    "",
    ...rows.map(([label, value]) => `${label}: ${value}`),
    "",
    "Message:",
    inquiry.message,
  ].join("\n");

  const htmlRows = rows
    .map(
      ([label, value]) => `
        <tr>
          <td style="padding:8px 16px 8px 0;color:#777;vertical-align:top">${label}</td>
          <td style="padding:8px 0;color:#111;font-weight:600">${escapeHtml(value)}</td>
        </tr>`,
    )
    .join("");

  const html = `<!doctype html>
    <html lang="en">
      <body style="margin:0;background:#f3f1ed;color:#111;font-family:Arial,sans-serif">
        <div style="max-width:640px;margin:0 auto;padding:32px 18px">
          <div style="overflow:hidden;background:#fff;border:1px solid #dedbd5;border-radius:24px">
            <div style="padding:28px 32px;background:#111;color:#fff">
              <div style="font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#bdff39">Ageless Evolution</div>
              <h1 style="margin:10px 0 0;font-size:28px;line-height:1.1">${typeLabel}</h1>
            </div>
            <div style="padding:24px 32px 32px">
              <table role="presentation" style="width:100%;border-collapse:collapse">${htmlRows}</table>
              <div style="margin-top:22px;padding:20px;background:#f3f1ed;border-radius:16px">
                <div style="margin-bottom:8px;color:#777;font-size:12px;letter-spacing:.08em;text-transform:uppercase">Message</div>
                <div style="color:#111;font-size:16px;line-height:1.55;white-space:pre-wrap">${escapeHtml(inquiry.message)}</div>
              </div>
              <p style="margin:22px 0 0;color:#777;font-size:12px;line-height:1.5">Reply to this email to contact ${escapeHtml(inquiry.name)} directly.</p>
            </div>
          </div>
        </div>
      </body>
    </html>`;

  return { html, text, typeLabel };
}

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ ok: false, error: "Invalid request origin." }, { status: 403 });
  }

  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > MAX_BODY_BYTES) {
    return NextResponse.json({ ok: false, error: "Request is too large." }, { status: 413 });
  }

  if (!request.headers.get("content-type")?.startsWith("application/json")) {
    return NextResponse.json({ ok: false, error: "Invalid content type." }, { status: 415 });
  }

  const rawBody = await request.text();
  if (new TextEncoder().encode(rawBody).byteLength > MAX_BODY_BYTES) {
    return NextResponse.json({ ok: false, error: "Request is too large." }, { status: 413 });
  }

  const inquiry = parseInquiry(
    (() => {
      try {
        return JSON.parse(rawBody) as unknown;
      } catch {
        return null;
      }
    })(),
  );
  if (!inquiry) {
    return NextResponse.json({ ok: false, error: "Invalid form data." }, { status: 400 });
  }

  // Honeypot submissions receive a neutral success response without sending mail.
  if (inquiry.website) {
    return NextResponse.json({ ok: true });
  }

  if (!isValidInquiry(inquiry)) {
    return NextResponse.json(
      { ok: false, error: "Please check the form fields and try again." },
      { status: 400 },
    );
  }

  if (!hasRateLimitCapacity(requestIp(request))) {
    return NextResponse.json(
      { ok: false, error: "Too many requests. Please try again later." },
      { status: 429, headers: { "Retry-After": "900" } },
    );
  }

  if (!inquiry.turnstileToken) {
    return NextResponse.json(
      { ok: false, error: "Please complete the security check and try again." },
      { status: 400 },
    );
  }

  try {
    const turnstileIsValid = await verifyTurnstile({
      token: inquiry.turnstileToken,
      remoteIp: requestIp(request),
      expectedHostname: requestHostname(request),
      expectedContext: inquiry.kind,
    });

    if (!turnstileIsValid) {
      return NextResponse.json(
        { ok: false, error: "The security check expired. Please try again." },
        { status: 403 },
      );
    }
  } catch (error) {
    console.error("Turnstile verification unavailable", {
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return NextResponse.json(
      { ok: false, error: "The security check is unavailable. Please try again." },
      { status: 503 },
    );
  }

  const { html, text, typeLabel } = inquiryEmail(inquiry);

  try {
    const delivery = await sendTransactionalEmail({
      to: process.env.EMAIL_RECIPIENT ?? "hello@agelessevo.com",
      replyTo: inquiry.email,
      subject: `${typeLabel} — ${singleLine(inquiry.name)}`,
      html,
      text,
      idempotencyKey: `inquiry-${crypto.randomUUID()}`,
    });

    console.info("Website inquiry email accepted", {
      id: delivery.id,
      kind: inquiry.kind,
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Website inquiry email failed", {
      kind: inquiry.kind,
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return NextResponse.json(
      { ok: false, error: "We could not send your message. Please try again." },
      { status: 502 },
    );
  }
}
