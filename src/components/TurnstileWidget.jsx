import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import "../styles/components/turnstile.css";

const TURNSTILE_SCRIPT_ID = "cloudflare-turnstile-script";
const TURNSTILE_SCRIPT_URL =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

let turnstileScriptPromise = null;

function loadTurnstileScript() {
  if (window.turnstile) {
    return Promise.resolve(window.turnstile);
  }

  if (turnstileScriptPromise) {
    return turnstileScriptPromise;
  }

  turnstileScriptPromise = new Promise((resolve, reject) => {
    const existingScript = document.getElementById(TURNSTILE_SCRIPT_ID);

    const handleLoad = () => {
      if (window.turnstile) {
        resolve(window.turnstile);
        return;
      }

      document.getElementById(TURNSTILE_SCRIPT_ID)?.remove();
      reject(new Error("Cloudflare Turnstile did not initialize."));
    };

    const handleError = () => {
      document.getElementById(TURNSTILE_SCRIPT_ID)?.remove();
      reject(new Error("Cloudflare Turnstile could not be loaded."));
    };

    if (existingScript) {
      existingScript.addEventListener("load", handleLoad, { once: true });
      existingScript.addEventListener("error", handleError, { once: true });
      return;
    }

    const script = document.createElement("script");
    script.id = TURNSTILE_SCRIPT_ID;
    script.src = TURNSTILE_SCRIPT_URL;
    script.async = true;
    script.defer = true;
    script.addEventListener("load", handleLoad, { once: true });
    script.addEventListener("error", handleError, { once: true });
    document.head.appendChild(script);
  }).catch((error) => {
    turnstileScriptPromise = null;
    throw error;
  });

  return turnstileScriptPromise;
}

const TurnstileWidget = forwardRef(function TurnstileWidget(
  { siteKey, action, onTokenChange, onError, onExpire },
  ref
) {
  const containerRef = useRef(null);
  const widgetIdRef = useRef(null);
  const onTokenChangeRef = useRef(onTokenChange);
  const onErrorRef = useRef(onError);
  const onExpireRef = useRef(onExpire);
  const [scriptLoadFailed, setScriptLoadFailed] = useState(false);
  const [scriptLoadAttempt, setScriptLoadAttempt] = useState(0);

  onTokenChangeRef.current = onTokenChange;
  onErrorRef.current = onError;
  onExpireRef.current = onExpire;

  useImperativeHandle(ref, () => ({
    reset() {
      onTokenChangeRef.current("");

      if (window.turnstile && widgetIdRef.current !== null) {
        window.turnstile.reset(widgetIdRef.current);
      }
    },
  }), []);

  useEffect(() => {
    let cancelled = false;

    if (!siteKey) {
      onTokenChangeRef.current("");
      onErrorRef.current?.("missing-site-key");
      return undefined;
    }

    loadTurnstileScript()
      .then((turnstile) => {
        if (cancelled || !containerRef.current) {
          return;
        }

        setScriptLoadFailed(false);
        widgetIdRef.current = turnstile.render(containerRef.current, {
          sitekey: siteKey,
          action,
          theme: "light",
          size: "flexible",
          callback: (token) => onTokenChangeRef.current(token),
          "error-callback": (errorCode) => {
            onTokenChangeRef.current("");
            onErrorRef.current?.(errorCode);
          },
          "expired-callback": () => {
            onTokenChangeRef.current("");
            onExpireRef.current?.();

            if (widgetIdRef.current !== null) {
              turnstile.reset(widgetIdRef.current);
            }
          },
          "timeout-callback": () => {
            onTokenChangeRef.current("");
            onExpireRef.current?.();

            if (widgetIdRef.current !== null) {
              turnstile.reset(widgetIdRef.current);
            }
          },
        });
      })
      .catch((error) => {
        if (cancelled) {
          return;
        }

        console.error(error);
        setScriptLoadFailed(true);
        onTokenChangeRef.current("");
        onErrorRef.current?.("script-load-failed");
      });

    return () => {
      cancelled = true;

      if (window.turnstile && widgetIdRef.current !== null) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [action, scriptLoadAttempt, siteKey]);

  const retryScriptLoad = () => {
    if (!window.turnstile && !turnstileScriptPromise) {
      document.getElementById(TURNSTILE_SCRIPT_ID)?.remove();
    }

    setScriptLoadFailed(false);
    setScriptLoadAttempt((attempt) => attempt + 1);
  };

  return (
    <div className="turnstile-widget" aria-live="polite">
      {siteKey ? (
        <>
          <div ref={containerRef} />
          {scriptLoadFailed ? (
            <div className="turnstile-widget-retry">
              <p className="turnstile-widget-error">
                The security check could not be loaded.
              </p>
              <button type="button" onClick={retryScriptLoad}>
                Retry security check
              </button>
            </div>
          ) : null}
        </>
      ) : (
        <p className="turnstile-widget-error">
          Security verification is temporarily unavailable.
        </p>
      )}
    </div>
  );
});

export default TurnstileWidget;
