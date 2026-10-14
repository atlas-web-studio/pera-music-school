const TURNSTILE_SITEVERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";
const TURNSTILE_REQUEST_TIMEOUT_MS = 8_000;
const TURNSTILE_TEST_SECRET_KEYS = new Set([
  "1x0000000000000000000000000000000AA",
  "2x0000000000000000000000000000000AA",
  "3x0000000000000000000000000000000AA",
]);

function normalizeHostname(value) {
  return typeof value === "string"
    ? value.trim().toLowerCase().replace(/\.$/, "")
    : "";
}

function getAllowedHostnames() {
  return new Set(
    (process.env.TURNSTILE_ALLOWED_HOSTNAMES || "")
      .split(",")
      .map(normalizeHostname)
      .filter(Boolean)
  );
}

function verificationErrorResponse(result) {
  const errorCodes = Array.isArray(result?.["error-codes"])
    ? result["error-codes"]
    : [];

  if (errorCodes.includes("timeout-or-duplicate")) {
    return {
      code: "TURNSTILE_TOKEN_EXPIRED_OR_USED",
      message:
        "Security verification expired or was already used. Please complete the check again.",
    };
  }

  return {
    code: "TURNSTILE_VERIFICATION_FAILED",
    message: "Security verification failed. Please complete the check again.",
  };
}

export default function requireTurnstile(expectedAction) {
  return async function verifyTurnstile(req, res, next) {
    const token = req.body?.turnstileToken;
    const normalizedToken = typeof token === "string" ? token.trim() : "";

    if (!normalizedToken) {
      return res.status(400).json({
        code: "TURNSTILE_TOKEN_MISSING",
        message: "Please complete the security verification.",
      });
    }

    if (normalizedToken.length > 2_048) {
      return res.status(400).json({
        code: "TURNSTILE_VERIFICATION_FAILED",
        message: "Security verification failed. Please complete the check again.",
      });
    }

    const secretKey = process.env.TURNSTILE_SECRET_KEY;

    if (!secretKey) {
      console.error("TURNSTILE_SECRET_KEY is not configured.");
      return res.status(503).json({
        code: "TURNSTILE_UNAVAILABLE",
        message:
          "Security verification is temporarily unavailable. Please try again shortly.",
      });
    }

    const isTestSecretKey = TURNSTILE_TEST_SECRET_KEYS.has(secretKey);

    if (isTestSecretKey && process.env.NODE_ENV === "production") {
      console.error("Turnstile test keys cannot be used in production.");
      return res.status(503).json({
        code: "TURNSTILE_UNAVAILABLE",
        message:
          "Security verification is temporarily unavailable. Please try again shortly.",
      });
    }

    const allowedHostnames = getAllowedHostnames();

    if (!isTestSecretKey && allowedHostnames.size === 0) {
      console.error("TURNSTILE_ALLOWED_HOSTNAMES is not configured.");
      return res.status(503).json({
        code: "TURNSTILE_UNAVAILABLE",
        message:
          "Security verification is temporarily unavailable. Please try again shortly.",
      });
    }

    const body = new URLSearchParams({
      secret: secretKey,
      response: normalizedToken,
    });

    if (req.ip) {
      body.set("remoteip", req.ip);
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      TURNSTILE_REQUEST_TIMEOUT_MS
    );

    try {
      const response = await fetch(TURNSTILE_SITEVERIFY_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body,
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`Turnstile Siteverify returned HTTP ${response.status}.`);
      }

      const result = await response.json();
      const verifiedHostname = normalizeHostname(result.hostname);
      const actionMatches =
        isTestSecretKey || !expectedAction || result.action === expectedAction;
      const hostnameMatches =
        isTestSecretKey || allowedHostnames.has(verifiedHostname);

      if (!result.success || !actionMatches || !hostnameMatches) {
        console.warn("Turnstile verification rejected a form submission:", {
          action: result.action || "",
          expectedAction,
          hostname: verifiedHostname,
          hostnameAllowed: hostnameMatches,
          errorCodes: result["error-codes"] || [],
        });

        return res.status(400).json(verificationErrorResponse(result));
      }

      return next();
    } catch (error) {
      console.error("Turnstile verification request failed:", error);
      return res.status(503).json({
        code: "TURNSTILE_UNAVAILABLE",
        message:
          "Security verification is temporarily unavailable. Please try again shortly.",
      });
    } finally {
      clearTimeout(timeoutId);
    }
  };
}
