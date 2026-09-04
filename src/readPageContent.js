// src/readPageContent.js
//
// For simple, mostly-static pages (confirmation/unsubscribe/feedback status
// screens), maintaining a separate hand-written narration string per status
// is pure duplication of what's already rendered — and it's easy for the two
// to drift (see: FeedbackPage's old script, which never updated after a
// successful submission because its effect had an empty dependency array).
//
// These pages instead read their own visible text directly, live, every
// time narration is requested — so whatever's on screen is exactly what
// gets read, with no separate copy to keep in sync.
//
// NOT used by HomeScreen, QuizScreen (interactive state needs curated
// narration — e.g. reading option lists in a sensible spoken order) or
// AnalyticsPage (chart data isn't readable DOM text) — those keep their
// hand-written scripts intentionally.

const SKIP_SELECTORS = [
  "nav",
  "header",
  "footer",
  "script",
  "style",
  "noscript",
  "svg",
  "[aria-hidden='true']",
  ".no-read-aloud",
];

export function extractReadableText(container) {
  if (!container) return "";

  const clone = container.cloneNode(true);
  SKIP_SELECTORS.forEach((selector) => {
    clone.querySelectorAll(selector).forEach((el) => el.remove());
  });

  return (clone.textContent || "").replace(/\s+/g, " ").trim();
}

// Silent registration — keeps the manual 🔊 button's script fresh without
// triggering Auto-read. Use for content that doesn't represent a genuine
// screen/state change.
export function registerDomReadScript(readScriptRef, containerId) {
  if (!readScriptRef) return;
  readScriptRef.current = () =>
    extractReadableText(document.getElementById(containerId));
}

// Announcing registration — same DOM read, but also triggers Auto-read.
// Use when the visible content has genuinely changed in a way worth
// re-announcing (e.g. a form swapping to a success/error card) — call
// this from an effect keyed to the state that actually changes the
// rendered content (e.g. [status]), not on every render.
//
// Deferred by 400ms: a real timing race was observed specifically on
// pages that transition automatically and fast (an async network call
// resolving in milliseconds, going straight from "loading" to a final
// status) — confirmed by comparing text actually sent to the TTS API
// against a manual, later check of the same element, which had the full
// content. A double-requestAnimationFrame defer wasn't enough to fully
// fix it, meaning the two back-to-back announces (loading, then final
// status) were still racing faster than that provided — a flat delay
// gives more headroom.
export function announceDomReadScript(readScriptRef, containerId) {
  if (!readScriptRef?.announce) return;
  const scheduledAt = performance.now();
  setTimeout(() => {
    const text = extractReadableText(document.getElementById(containerId));
    console.log(
      `[narration] #${containerId} — scheduled at ${scheduledAt.toFixed(0)}ms, captured at ${performance.now().toFixed(0)}ms:`,
      JSON.stringify(text),
    );
    readScriptRef.announce(() => text);
  }, 400);
}
