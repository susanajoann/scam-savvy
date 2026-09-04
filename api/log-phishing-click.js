// api/log-phishing-click.js
//
// Vercel serverless function — handles clicks on the tracked "bad" link
// inside REAL phishing simulation emails (sent via
// supabase/functions/send-phishing-test-batch). Targets phishing_emails,
// the production log table.
//
// Deliberately separate from api/log-click.js, which stays pointed at
// simulated_sends — your personal test-send table — so the two flows
// don't collide.

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

export default async function handler(req, res) {
  const { token } = req.query;

  if (!token) {
    res.writeHead(302, { Location: "/" });
    return res.end();
  }

  try {
    const patchRes = await fetch(
      `${SUPABASE_URL}/rest/v1/phishing_emails?token=eq.${token}`,
      {
        method: "PATCH",
        headers: {
          apikey: SUPABASE_SECRET_KEY,
          Authorization: `Bearer ${SUPABASE_SECRET_KEY}`,
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
    console.error("log-phishing-click error:", err);
    res.writeHead(302, { Location: "/phishing-feedback" });
    return res.end();
  }
}
