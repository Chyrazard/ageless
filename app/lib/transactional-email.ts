import "server-only";

type TransactionalEmail = {
  html: string;
  idempotencyKey: string;
  replyTo?: string;
  subject: string;
  text: string;
  to: string;
};

type ResendResponse = {
  id?: string;
  message?: string;
};

export async function sendTransactionalEmail({
  html,
  idempotencyKey,
  replyTo,
  subject,
  text,
  to,
}: TransactionalEmail) {
  const apiKey = process.env.RESEND_API_KEY;
  const from =
    process.env.EMAIL_FROM ??
    "Ageless Evolution Website <forms@agelessevo.com>";

  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not configured");
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "Idempotency-Key": idempotencyKey,
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject,
      html,
      text,
      reply_to: replyTo,
      tags: [{ name: "source", value: "ageless_website" }],
    }),
    signal: AbortSignal.timeout(12_000),
  });

  const result = (await response.json().catch(() => ({}))) as ResendResponse;

  if (!response.ok || !result.id) {
    console.error("Transactional email provider rejected the request", {
      status: response.status,
      providerMessage: result.message ?? "Unknown provider response",
    });
    throw new Error("Transactional email could not be sent");
  }

  return { id: result.id };
}
