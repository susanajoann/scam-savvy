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

async function getTTS() {
  if (ttsPromise) return ttsPromise;

  ttsPromise = (async () => {
    // WebGPU is significantly faster than WASM when available. Try it
    // first; if the browser/GPU doesn't support it, fall back cleanly.
    try {
      console.time("[tts] load (webgpu)");
      const tts = await KokoroTTS.from_pretrained(MODEL_ID, {
        dtype: "fp32",
        device: "webgpu",
      });
      console.timeEnd("[tts] load (webgpu)");
      return tts;
    } catch (err) {
      console.warn("[tts] WebGPU unavailable, falling back to WASM:", err);
      console.time("[tts] load (wasm)");
      const tts = await KokoroTTS.from_pretrained(MODEL_ID, {
        dtype: "q8",
        device: "wasm",
      });
      console.timeEnd("[tts] load (wasm)");
      return tts;
    }
  })();

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
      console.time(`[tts] generate chunk ${id}`);
      const audio = await tts.generate(text, {
        voice: voice || "af_heart",
      });
      console.timeEnd(`[tts] generate chunk ${id}`);
      // RawAudio -> Blob, transferable back to the main thread.
      const blob = audio.toBlob();
      self.postMessage({ type: "chunk", id, blob });
    } catch (err) {
      self.postMessage({ type: "error", id, error: String(err) });
    }
  }
});
