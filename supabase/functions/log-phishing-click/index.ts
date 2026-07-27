import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { PHISHING_TEMPLATES } from "../../../src/phishingTemplates.js";

const SUPABASE_URL       = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY   = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const RESEND_API_KEY     = Deno.env.get("RESEND_API_KEY")!;
const CRON_SECRET        = Deno.env.get("CRON_SECRET")!;
const FROM_EMAIL         = "ScamSavvy <noreply@scam-savvy.org>";
const SITE_URL           = "https://scam-savvy.org";
const MAX_PER_MONTH      = 4;
const DAILY_PROBABILITY  = MAX_PER_MONTH / 30; // ~0.133 chance per eligible day

const dbHeaders = {
  apikey: SERVICE_ROLE_KEY,
  Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
  "Content-Type": "application/json",
};

serve(async (req) => {
  if (req.headers.get("x-cron-secret") !== CRON_SECRET) {
    return new Response("Unauthorized", { status: 401 });
  }

  const subsRes = await fetch(
    `${SUPABASE_URL}/rest/v1/subscribers?confirmed=eq.true&unsubscribed=eq.false&select=id,email`,
    { headers: dbHeaders },
  );
  const subscribers = await subsRes.json();

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  let sentCount = 0;

  for (const sub of subscribers) {
    const countRes = await fetch(
      `${SUPABASE_URL}/rest/v1/simulated_sends?subscriber_id=eq.${sub.id}&sent_at=gte.${startOfMonth.toISOString()}&select=id`,
      { headers: dbHeaders },
    );
    const sentThisMonth = await countRes.json();
    if (sentThisMonth.length >= MAX_PER_MONTH) continue;

    if (Math.random() > DAILY_PROBABILITY) continue;

    const template =
      PHISHING_TEMPLATES[Math.floor(Math.random() * PHISHING_TEMPLATES.length)];
    const token = crypto.randomUUID();

    await fetch(`${SUPABASE_URL}/rest/v1/simulated_sends`, {
      method: "POST",
      headers: { ...dbHeaders, Prefer: "return=minimal" },
      body: JSON.stringify({
        subscriber_id: sub.id,
        template_id: template.id,
        token,
      }),
    });

    const trackedLink = `${SUPABASE_URL}/functions/v1/log-phishing-click?token=${token}`;
    const unsubscribeLink = `${SITE_URL}/unsubscribe?id=${sub.id}`;
    const bodyHtml = template.bodyHtml.replace("{{LINK}}", trackedLink);

    const html = `
      <div style="max-width:520px;margin:0 auto;font-family:sans-serif;color:#1A0A3C;">
        ${bodyHtml}
        <hr style="border:none;border-top:1px solid #ddd;margin:24px 0;" />
        <p style="font-size:11px;color:#999;">
          This is a simulated phishing test from ScamSavvy, a program you opted into.
          <a href="${unsubscribeLink}">Unsubscribe</a>
        </p>
      </div>
    `;

    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: template.fromDisplay,
        to: [sub.email],
        subject: template.subject,
        html,
        // Optional: set reply-to as your real domain so replies don't bounce nowhere
        reply_to: FROM_EMAIL,
      }),
    });

    if (resendRes.ok) sentCount++;
    else console.error("Send failed for", sub.email, await resendRes.text());
  }

  return new Response(
    JSON.stringify({ success: true, checked: subscribers.length, sent: sentCount }),
    { headers: { "Content-Type": "application/json" } },
  );
});