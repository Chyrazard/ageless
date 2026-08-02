const SITEVERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";

type TurnstileResponse = {
  action?: string;
  cdata?: string;
  "error-codes"?: string[];
  hostname?: string;
  metadata?: {
    result_with_testing_key?: boolean;
  };
  success?: boolean;
};

type VerifyTurnstileOptions = {
  expectedContext: "contact" | "sponsor";
  expectedHostname: string;
  remoteIp: string;
  token: string;
};

export async function verifyTurnstile({
  expectedContext,
  expectedHostname,
  remoteIp,
  token,
}: VerifyTurnstileOptions) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    throw new Error("Turnstile secret is not configured.");
  }

  const response = await fetch(SITEVERIFY_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      secret,
      response: token,
      remoteip: remoteIp === "unknown" ? undefined : remoteIp,
    }),
    cache: "no-store",
    signal: AbortSignal.timeout(10_000),
  });

  if (!response.ok) {
    throw new Error(`Turnstile verification failed with status ${response.status}.`);
  }

  const result = (await response.json()) as TurnstileResponse;
  const isDevelopmentTest =
    process.env.TURNSTILE_ALLOW_TEST_KEYS === "true" &&
    result.metadata?.result_with_testing_key === true;
  const hostnameMatches =
    isDevelopmentTest ||
    result.hostname?.toLowerCase() === expectedHostname.toLowerCase();
  const actionMatches = isDevelopmentTest || result.action === "inquiry";
  const contextMatches = isDevelopmentTest || result.cdata === expectedContext;

  if (!result.success || !hostnameMatches || !actionMatches || !contextMatches) {
    console.warn("Turnstile rejected an inquiry", {
      errorCodes: result["error-codes"] ?? [],
      hostnameMatches,
      actionMatches,
      contextMatches,
    });
    return false;
  }

  return true;
}
