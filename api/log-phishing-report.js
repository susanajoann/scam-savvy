// api/log-phishing-report.js
//
// Vercel serverless function — handles clicks on the "Report phishing"
// button inside real phishing simulation emails. Same token as the
// click-tracking link (api/log-phishing-click.js), but marks the
// opposite, positive outcome: the subscriber correctly identified the
// test rather than falling for it.

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
          reported: true,
          reported_at: new Date().toISOString(),
        }),
      },
    );

    const rows = await patchRes.json();
    const templateId = rows[0]?.template_id ?? "unknown";

    res.writeHead(302, {
      Location: `/phishing-feedback?template=${templateId}&reported=true`,
    });
    return res.end();
  } catch (err) {
    console.error("log-phishing-report error:", err);
    res.writeHead(302, { Location: "/phishing-feedback?reported=true" });
    return res.end();
  }
}
