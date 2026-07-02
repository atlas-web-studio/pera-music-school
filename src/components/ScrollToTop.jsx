import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const id = hash.replace("#", "");
      let attempts = 0;
      const maxAttempts = 60;
      let timeoutId;

      const scrollToHashTarget = () => {
        const element = document.getElementById(id);

        if (element) {
          element.classList.remove("hash-target-flash");
          void element.offsetWidth;
          element.classList.add("hash-target-flash");

          const headerOffset = 96;
          const elementTop =
            element.getBoundingClientRect().top + window.scrollY - headerOffset;

          window.scrollTo({
            top: Math.max(elementTop, 0),
            left: 0,
            behavior: "auto",
          });

          timeoutId = window.setTimeout(() => {
            element.classList.remove("hash-target-flash");
          }, 3600);
          return;
        }

        if (attempts < maxAttempts) {
          attempts += 1;
          timeoutId = window.setTimeout(scrollToHashTarget, 120);
          return;
        }

        window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      };

      requestAnimationFrame(scrollToHashTarget);
      return () => {
        if (timeoutId) {
          window.clearTimeout(timeoutId);
        }
      };
    }

    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname, hash]);

  return null;
}
