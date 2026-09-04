import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { PHISHING_TEMPLATES } from "./templates.ts";
import { buildPhishingEmailHtml } from "./emailLayout.ts";

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
      `${SUPABASE_URL}/rest/v1/phishing_emails?subscriber_id=eq.${sub.id}&sent_at=gte.${startOfMonth.toISOString()}&select=id`,
      { headers: dbHeaders },
    );
    const sentThisMonth = await countRes.json();
    if (sentThisMonth.length >= MAX_PER_MONTH) continue;

    if (Math.random() > DAILY_PROBABILITY) continue;

    const template =
      PHISHING_TEMPLATES[Math.floor(Math.random() * PHISHING_TEMPLATES.length)];
    const token = crypto.randomUUID();
    const month = new Date().toISOString().slice(0, 7); // "YYYY-MM"

    await fetch(`${SUPABASE_URL}/rest/v1/phishing_emails`, {
      method: "POST",
      headers: { ...dbHeaders, Prefer: "return=minimal" },
      body: JSON.stringify({
        subscriber_id: sub.id,
        template_id: template.id,
        token,
        month,
      }),
    });

    // Tracked links point to Vercel API routes, not Supabase Edge Functions.
    // This avoids Supabase's JWT gateway entirely, since email links can't
    // carry auth headers. Both links share the same token — they update
    // different columns on the same phishing_emails row depending on
    // which one gets clicked.
    const trackedLink = `${SITE_URL}/api/log-phishing-click?token=${token}`;
    const reportLink = `${SITE_URL}/api/log-phishing-report?token=${token}`;
    const unsubscribeLink = `${SITE_URL}/unsubscribe?id=${sub.id}`;
    const bodyHtml = template.bodyHtml.replace("{{LINK}}", trackedLink);

    const html = buildPhishingEmailHtml({
      bodyHtml,
      reportLink,
      footerText: `This is a simulated phishing test from ScamSavvy, a program you opted into. <a href="${unsubscribeLink}" style="color:#999;">Unsubscribe</a>`,
    });

    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        // Sent from the consistent noreply address rather than each
        // template's fake sender identity — trades away testing "did you
        // notice the spoofed sender" for reliable deliverability, since
        // subscribers can whitelist one single address (see the
        // confirmation email) instead of a different fake domain per test.
        from: FROM_EMAIL,
        to: [sub.email],
        subject: template.subject,
        html,
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