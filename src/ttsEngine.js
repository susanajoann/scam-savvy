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
//
// Playback uses the Web Audio API (decodeAudioData + AudioBufferSourceNode)
// rather than a plain <audio> element. This was a deliberate fix, not a
// stylistic choice: <audio> elements played from blob URLs stream via
// byte-range requests (visible as 206 Partial Content in the network
// tab), and real, reproducible audio truncation was observed on longer
// narration — confirmed NOT to be a text or generation problem (the raw
// file, played via macOS's own afplay, was complete and correct every
// time) but specifically a browser decoding/streaming issue with that
// playback path. Web Audio decodes the entire buffer into memory before
// playback ever starts, which has no range-request/streaming layer to
// have this class of bug in the first place.

let currentAudio = null;
let activeRequest = null; // tracks the in-flight speak() call so stop()/new calls can invalidate it
let audioContext = null;

function getAudioContext() {
  if (!audioContext) {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    audioContext = new Ctx();
  }
  return audioContext;
}

// A ~0.1s silent WAV, base64-encoded. Used only to unlock audio playback.
const SILENT_AUDIO_DATA_URI =
  "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=";

// Call this SYNCHRONOUSLY inside a real click/tap handler, before any
// `await`, whenever that click will eventually lead to Auto-read speaking
// — but only after an async gap (a network request, etc.) breaks the
// direct link between the gesture and the resulting playback.
//
// Browsers tie autoplay permission to genuine user gestures — this
// applies to AudioContext too, which starts "suspended" until resumed
// within a gesture. Without this, later programmatic playback can be
// silently blocked, which is exactly what was happening when Auto-read
// didn't speak after "Start quiz" (whose handler awaits a Supabase call
// before the quiz screen — and its narration — ever appears).
export function primeAudioPlayback() {
  try {
    const ctx = getAudioContext();
    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }
    // Belt-and-suspenders: also unlock the legacy <audio> path in case
    // anything else in the browser cares about that specifically.
    const unlock = new Audio(SILENT_AUDIO_DATA_URI);
    unlock.play().catch(() => {});
  } catch {
    // no-op — worst case, we're back to the original (occasionally blocked) behavior
  }
}

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

// Fetches one chunk and decodes it into an AudioBuffer up front — by the
// time this resolves, the ENTIRE chunk's audio is already fully decoded
// in memory, ready to play with no further streaming/seeking involved.
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
  const arrayBuffer = await res.arrayBuffer();
  return getAudioContext().decodeAudioData(arrayBuffer);
}

// No client-side model to warm up anymore — kept as a no-op so App.jsx's
// onMouseEnter={preloadTTS} on the 🔊 button doesn't need to change.
export function preloadTTS() {}

// Fire-and-forget, mirrors speechSynthesis.speak()'s "started" semantics:
// the caller marks itself as speaking immediately, onDone fires later.
//
// Chunks are fetched (and decoded) with a little lookahead (stays ~2
// requests ahead of playback) rather than all at once, so a long page
// doesn't fire dozens of simultaneous requests at the rate-limited
// endpoint. Playback is strictly ordered and "done" only fires once
// every chunk has actually played — network requests can complete out
// of order even though decoding happens before anything is stored.
export function speak(text, { rate = 1, voice = "alloy", onDone } = {}) {
  const request = { stopped: false };
  activeRequest = request;

  const chunks = splitIntoChunks(text);
  const total = chunks.length;
  const results = new Array(total); // holds decoded AudioBuffers
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
    const buffer = results[nextToPlay];
    if (buffer === undefined) return; // still waiting on this chunk to fetch/decode

    const ctx = getAudioContext();
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.playbackRate.value = rate;
    source.connect(ctx.destination);
    currentAudio = source;
    const chunkIndex = nextToPlay;
    nextToPlay++;
    source.onended = () => {
      currentAudio = null;
      tryPlayNext();
    };
    console.log(
      `[tts] playing chunk ${chunkIndex} (${buffer.duration.toFixed(1)}s)`,
    );
    source.start(0);
  }

  function requestMore() {
    if (request.stopped) return;
    while (requestedUpTo < total - 1 && requestedUpTo < nextToPlay + 1) {
      requestedUpTo++;
      const index = requestedUpTo;
      requestChunk(chunks[index], voice)
        .then((buffer) => {
          if (request.stopped) return;
          results[index] = buffer;
          tryPlayNext();
          requestMore();
        })
        .catch((err) => {
          console.error(`[tts] chunk ${index} failed:`, err);
          if (request.stopped) return;
          // Tiny silent buffer as a placeholder, so playback doesn't
          // stall forever waiting on a chunk that failed.
          results[index] = getAudioContext().createBuffer(1, 1, 22050);
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
  if (currentAudio) {
    try {
      currentAudio.stop();
    } catch {
      // already stopped/finished — fine to ignore
    }
    currentAudio = null;
  }
}
