import { useEffect, useRef } from "react";

const widgetScriptSrc =
  "https://app.mymusicstaff.com/Widget/v4/Widget.ashx?settings=eyJTY2hvb2xJRCI6InNjaF9EMFZKQiIsIldlYnNpdGVJRCI6Indic181ZzJKbCIsIldlYnNpdGVCbG9ja0lEIjoid2JiX2xnY1NKRCJ9";
const widgetOrigin = "https://app.mymusicstaff.com";

function ensureHeadLink({ rel, href, as, crossOrigin }) {
  if (typeof document === "undefined") {
    return;
  }

  const selector = `link[rel="${rel}"][href="${href}"]`;

  if (document.head.querySelector(selector)) {
    return;
  }

  const link = document.createElement("link");
  link.rel = rel;
  link.href = href;

  if (as) {
    link.as = as;
  }

  if (crossOrigin) {
    link.crossOrigin = crossOrigin;
  }

  document.head.appendChild(link);
}

export default function MyMusicStaffEmbed({
  src,
  title = "Pera Music School registration form",
  className = "mymusicstaff-embed",
}) {
  const ref = useRef(null);

  useEffect(() => {
    ensureHeadLink({ rel: "dns-prefetch", href: widgetOrigin });
    ensureHeadLink({ rel: "preconnect", href: widgetOrigin, crossOrigin: "anonymous" });

    if (src) {
      ensureHeadLink({ rel: "preload", href: src, as: "document" });
    }
  }, [src]);

  useEffect(() => {
    if (src || !ref.current) return;

    ref.current.innerHTML = "";

    const script = document.createElement("script");
    script.src = widgetScriptSrc;
    script.async = true;

    ref.current.appendChild(script);
  }, [src]);

  if (src) {
    return (
      <iframe
        title={title}
        src={src}
        className={className}
        loading="eager"
        referrerPolicy="strict-origin-when-cross-origin"
      />
    );
  }

  return <div ref={ref} className={className} />;
}
