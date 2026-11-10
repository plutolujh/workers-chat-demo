// Sanitizing helpers for everything a client sends.
//
// Everything a client sends is untrusted input: it ends up in HTML on every
// other participant's screen. These helpers make sure only what we expect can
// survive the trip through the Durable Object.

// Durable Object storage values are limited to 128 KB.
export const MAX_MESSAGE_BYTES = 100 * 1024;

// Maximum size of an audio upload forwarded to the ASR provider (MiniMax
// accepts up to 50 MB, we keep some headroom).
export const MAX_ASR_BODY_BYTES = 25 * 1024 * 1024;

// Size of a string in bytes (not characters).
export function byteLength(str) {
  return new TextEncoder().encode(str).length;
}

// A media URL may only point at our own upload service. Video messages carry
// "thumbUrl::VIDEO::videoUrl" (old format: "thumbUrl|VIDEO|videoUrl").
export function sanitizeMediaUrl(image, env) {
  if (typeof image !== "string" || !image) return null;

  const base = (env && env.SHOTSYNC_URL) || "https://shotsync.hao123456.cn";
  let allowedHost = null;
  try {
    allowedHost = new URL(base).hostname;
  } catch {
    allowedHost = null;
  }

  const check = (url) => {
    if (typeof url !== "string" || !url) return "";
    let parsed;
    try {
      parsed = new URL(url);
    } catch {
      return "";
    }
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return "";
    // Only our own upload service (or a subdomain of it) may be referenced.
    if (allowedHost) {
      const host = parsed.hostname;
      if (host !== allowedHost && !host.endsWith("." + allowedHost)) return "";
    }
    return parsed.href;
  };

  if (image.includes("::VIDEO::")) {
    const [thumb, video] = image.split("::VIDEO::");
    const t = check(thumb);
    const v = check(video);
    return t && v ? `${t}::VIDEO::${v}` : null;
  }
  if (image.includes("|VIDEO|")) {
    const [thumb, video] = image.split("|VIDEO|");
    const t = check(thumb);
    const v = check(video);
    return t && v ? `${t}|VIDEO|${v}` : null;
  }

  return check(image) || null;
}

// The quoted message is rendered on every screen too - keep it small and simple.
export function sanitizeQuote(quote) {
  if (!quote || typeof quote !== "object") return null;
  const id = quote.id;
  const name = "" + (quote.name || "");
  const text = "" + (quote.text || "");
  if (!name && !text) return null;
  return {
    id: Number.isFinite(id) ? id : null,
    name: name.slice(0, 64),
    text: text.slice(0, 500)
  };
}
