// api/tts.js
//
// Converts text to speech via OpenAI's TTS API. The API key lives here
// (server-only env var) and is never shipped to the client — same pattern
// as log-click.js.
//
// Rate-limited per IP per day because this endpoint is reachable by
// anyone on the public site and every call costs real money. The check
// is enforced atomically in Postgres (see the migration below) rather
// than with a read-then-write in JS, which would have a race condition
// under concurrent requests.

const SUPABASE_URL = process.env.SUPABASE_URL;
// Same env var log-click.js uses. Name wasn't updated during the key
// rotation, but the value now holds the new-style secret key, not the
// disabled legacy service_role JWT.
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const MAX_CHARS_PER_REQUEST = 800; // keeps each call small, cheap, and fast
const DAILY_LIMIT_PER_IP = 200; // generous for real readers, blocks scripted abuse

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { text, voice } = req.body || {};
  if (!text || typeof text !== "string" || !text.trim()) {
    return res.status(400).json({ error: "Missing text" });
  }
  if (text.length > MAX_CHARS_PER_REQUEST) {
    return res.status(400).json({
      error: `Text too long (max ${MAX_CHARS_PER_REQUEST} chars per request)`,
    });
  }

  const ip =
    (req.headers["x-forwarded-for"] || "").split(",")[0].trim() ||
    req.socket?.remoteAddress ||
    "unknown";

  const allowed = await checkRateLimit(ip);
  if (!allowed) {
    return res
      .status(429)
      .json({ error: "Daily read-aloud limit reached, try again tomorrow" });
  }

  try {
    const openaiRes = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini-tts",
        input: text,
        voice: voice || "alloy",
        // WAV instead of MP3: browsers can mis-seek at the start and/or
        // misjudge when playback has actually ended for MP3 streams that
        // lack proper duration metadata (common with programmatically
        // generated MP3, since there's no full-file encoder pass to write
        // an accurate header) — this showed up as clipped opening words
        // and premature cutoffs. WAV is uncompressed with no such
        // ambiguity, at the cost of a larger response per request.
        response_format: "wav",
      }),
    });

    if (!openaiRes.ok) {
      const errText = await openaiRes.text();
      console.error("OpenAI TTS error:", errText);
      return res.status(502).json({ error: "TTS generation failed" });
    }

    const arrayBuffer = await openaiRes.arrayBuffer();
    res.setHeader("Content-Type", "audio/wav");
    res.setHeader("Cache-Control", "no-store");
    return res.status(200).send(Buffer.from(arrayBuffer));
  } catch (err) {
    console.error("tts handler error:", err);
    return res.status(500).json({ error: "Internal error" });
  }
}

async function checkRateLimit(ip) {
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD, UTC
  const key = `${ip}:${today}`;

  try {
    const rlRes = await fetch(
      `${SUPABASE_URL}/rest/v1/rpc/check_tts_rate_limit`,
      {
        method: "POST",
        headers: {
          apikey: SUPABASE_SECRET_KEY,
          Authorization: `Bearer ${SUPABASE_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ p_key: key, p_limit: DAILY_LIMIT_PER_IP }),
      },
    );

    if (!rlRes.ok) {
      console.error("Rate limit check failed:", await rlRes.text());
      return true; // fail open rather than break the feature on a DB hiccup
    }

    return await rlRes.json();
  } catch (err) {
    console.error("Rate limit check error:", err);
    return true;
  }
}
