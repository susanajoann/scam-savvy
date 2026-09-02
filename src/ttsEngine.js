// src/ttsEngine.js
//
// Drop-in replacement for window.speechSynthesis, used by navSpeak() in
// App.jsx. Generates natural speech via OpenAI's TTS API (through the
// /api/tts serverless function, which holds the API key server-side)
// instead of the browser's built-in robotic voice.
//
// Previously this ran Kokoro entirely client-side. That kept things free
// and key-free, but generation speed varied wildly by device/browser and
// wasn't reliable enough for production use. This version trades "free"
// for "fast and consistent" — OpenAI's TTS costs roughly $0.015/minute
// of generated audio, kept in check by the server-side rate limit in
// api/tts.js.

let currentAudio = null;
let activeRequest = null; // tracks the in-flight speak() call so stop()/new calls can invalidate it

function splitIntoChunks(text, maxLen = 700) {
  // Stays comfortably under api/tts.js's MAX_CHARS_PER_REQUEST (800).
  const sentences = text.match(/[^.!?]+[.!?]+(\s|$)/g) || [text];
  const chunks = [];
  let current = "";
  for (const sentence of sentences) {
    if (current && (current + sentence).length > maxLen) {
      chunks.push(current.trim());
      current = sentence;
    } else {
      current += sentence;
    }
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks;
}

async function requestChunk(text, voice) {
  const res = await fetch("/api/tts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, voice }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `TTS request failed (${res.status})`);
  }
  return res.blob();
}

// No client-side model to warm up anymore — kept as a no-op so App.jsx's
// onMouseEnter={preloadTTS} on the 🔊 button doesn't need to change.
export function preloadTTS() {}

// Fire-and-forget, mirrors speechSynthesis.speak()'s "started" semantics:
// the caller marks itself as speaking immediately, onDone fires later.
//
// Chunks are fetched with a little lookahead (stays ~2 requests ahead of
// playback) rather than all at once, so a long page doesn't fire dozens
// of simultaneous requests at the rate-limited endpoint. Playback is
// strictly ordered and "done" only fires once every chunk has actually
// played — same correctness fix as the Kokoro version, still needed here
// since network requests can also complete out of order.
export function speak(text, { rate = 1, voice = "alloy", onDone } = {}) {
  const request = { stopped: false };
  activeRequest = request;

  const chunks = splitIntoChunks(text);
  const total = chunks.length;
  const results = new Array(total);
  let nextToPlay = 0;
  let requestedUpTo = -1;

  function finish() {
    if (activeRequest === request) {
      currentAudio = null;
      activeRequest = null;
    }
    onDone?.();
  }

  function tryPlayNext() {
    if (request.stopped) return;
    if (currentAudio) return; // something's already playing; its onended calls this again
    if (nextToPlay >= total) {
      finish();
      return;
    }
    const blob = results[nextToPlay];
    if (blob === undefined) return; // still waiting on this chunk from the server

    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    audio.playbackRate = rate;
    currentAudio = audio;
    nextToPlay++;
    audio.onended = () => {
      URL.revokeObjectURL(url);
      currentAudio = null;
      tryPlayNext();
    };
    audio.play().catch((err) => {
      // Browsers can block programmatic audio.play() if it happens too far
      // from a direct user gesture — e.g. after an awaited network request,
      // like the Supabase call HomeScreen makes before transitioning into
      // the quiz. This previously failed completely silently (an unhandled
      // promise rejection), making it look like Auto-read just "didn't
      // work" with no clue why. Now at least it's visible in the console.
      console.warn(
        "[tts] audio.play() was blocked (likely an autoplay/gesture restriction):",
        err,
      );
      URL.revokeObjectURL(url);
      currentAudio = null;
      tryPlayNext();
    });
  }

  function requestMore() {
    if (request.stopped) return;
    while (requestedUpTo < total - 1 && requestedUpTo < nextToPlay + 1) {
      requestedUpTo++;
      const index = requestedUpTo;
      requestChunk(chunks[index], voice)
        .then((blob) => {
          if (request.stopped) return;
          results[index] = blob;
          tryPlayNext();
          requestMore();
        })
        .catch((err) => {
          console.error(`[tts] chunk ${index} failed:`, err);
          if (request.stopped) return;
          results[index] = new Blob(); // skip it rather than stall forever
          tryPlayNext();
          requestMore();
        });
    }
  }

  requestMore();
}

export function stop() {
  if (activeRequest) activeRequest.stopped = true;
  activeRequest = null;
  currentAudio?.pause();
  currentAudio = null;
}
