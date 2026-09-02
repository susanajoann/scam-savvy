// src/workers/ttsWorker.js
//
// Runs entirely off the main thread so the page never freezes while the
// model loads (~150MB first time) or while audio is being generated.
//
// Loaded from a React hook via:
//   new Worker(new URL("../workers/ttsWorker.js", import.meta.url), { type: "module" })

import { KokoroTTS } from "kokoro-js";

const MODEL_ID = "onnx-community/Kokoro-82M-v1.0-ONNX";

let ttsPromise = null;

function getTTS() {
  if (!ttsPromise) {
    ttsPromise = KokoroTTS.from_pretrained(MODEL_ID, {
      // q8 keeps the download small with minimal quality loss.
      dtype: "q8",
      // "wasm" works everywhere. Switch to "webgpu" (with dtype "fp32")
      // later if you want faster generation on supported browsers.
      device: "wasm",
    });
  }
  return ttsPromise;
}

self.addEventListener("message", async (event) => {
  const { type, id, text, voice } = event.data;

  if (type === "load") {
    try {
      await getTTS();
      self.postMessage({ type: "ready" });
    } catch (err) {
      self.postMessage({ type: "error", error: String(err) });
    }
    return;
  }

  if (type === "generate") {
    try {
      const tts = await getTTS();
      const audio = await tts.generate(text, {
        voice: voice || "af_heart",
      });
      // RawAudio -> Blob, transferable back to the main thread.
      const blob = audio.toBlob();
      self.postMessage({ type: "chunk", id, blob });
    } catch (err) {
      self.postMessage({ type: "error", id, error: String(err) });
    }
  }
});
