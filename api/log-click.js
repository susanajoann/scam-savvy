// Vercel serverless function — no JWT/auth gateway to fight, unlike Supabase Edge Functions.
// Handles clicks on tracked links inside simulated phishing test emails.

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

export default async function handler(req, res) {
  const { token } = req.query;

  if (!token) {
    res.writeHead(302, { Location: "/" });
    return res.end();
  }

  try {
    const patchRes = await fetch(
      `${SUPABASE_URL}/rest/v1/simulated_sends?token=eq.${token}`,
      {
        method: "PATCH",
        headers: {
          apikey: SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
          "Content-Type": "application/json",
          Prefer: "return=representation",
        },
        body: JSON.stringify({
          clicked: true,
          clicked_at: new Date().toISOString(),
        }),
      },
    );

    const rows = await patchRes.json();
    const templateId = rows[0]?.template_id ?? "unknown";

    res.writeHead(302, {
      Location: `/phishing-feedback?template=${templateId}`,
    });
    return res.end();
  } catch (err) {
    console.error("log-click error:", err);
    res.writeHead(302, { Location: "/phishing-feedback" });
    return res.end();
  }
}
