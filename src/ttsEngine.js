// src/ttsEngine.js
//
// Drop-in replacement for window.speechSynthesis, used by navSpeak() in
// App.jsx. Generates natural speech locally via Kokoro instead of the
// browser's built-in robotic voice. External shape stays the same:
// speak(text, { rate, onDone }) and stop().

let worker = null;
let modelReady = false;
let modelLoading = null;

let currentAudio = null;
let queue = [];
let pollTimer = null;

function getWorker() {
  if (!worker) {
    worker = new Worker(new URL("./workers/ttsWorker.js", import.meta.url), {
      type: "module",
    });
    worker.onmessage = (event) => {
      const { type, blob, error } = event.data;
      if (type === "ready") modelReady = true;
      if (type === "chunk") queue.push(blob);
      if (type === "error") console.error("TTS engine error:", error);
    };
  }
  return worker;
}

function ensureModelLoaded() {
  if (modelReady) return Promise.resolve();
  if (!modelLoading) {
    modelLoading = new Promise((resolve) => {
      const w = getWorker();
      const onReady = (event) => {
        if (event.data.type === "ready") {
          w.removeEventListener("message", onReady);
          resolve();
        }
      };
      w.addEventListener("message", onReady);
      w.postMessage({ type: "load" });
    });
  }
  return modelLoading;
}

// Call on hover of the 🔊 button (or on app mount) to hide the ~150MB
// first-time model download behind normal browsing time.
export function preloadTTS() {
  ensureModelLoaded();
}

function splitIntoChunks(text, maxLen = 300) {
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

function playNext(rate, onDone) {
  const blob = queue.shift();
  if (!blob) {
    currentAudio = null;
    onDone?.();
    return;
  }
  const url = URL.createObjectURL(blob);
  const audio = new Audio(url);
  audio.playbackRate = rate; // reuses your existing Slow/Normal/Fast rates directly
  currentAudio = audio;
  audio.onended = () => {
    URL.revokeObjectURL(url);
    playNext(rate, onDone);
  };
  audio.play();
}

// Fire-and-forget, mirrors speechSynthesis.speak()'s "started" semantics:
// the caller marks itself as speaking immediately, onDone fires later.
export function speak(text, { rate = 1, onDone } = {}) {
  const w = getWorker();

  ensureModelLoaded().then(() => {
    const chunks = splitIntoChunks(text);
    queue = [];
    chunks.forEach((chunk, i) =>
      w.postMessage({ type: "generate", id: i, text: chunk }),
    );

    clearInterval(pollTimer);
    pollTimer = setInterval(() => {
      if (queue.length > 0) {
        clearInterval(pollTimer);
        playNext(rate, onDone);
      }
    }, 100);
  });
}

export function stop() {
  clearInterval(pollTimer);
  queue = [];
  currentAudio?.pause();
  currentAudio = null;
}
