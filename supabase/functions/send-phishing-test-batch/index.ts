import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { PHISHING_TEMPLATES } from "../send-phishing-test-batch/templates.ts";
import { buildPhishingEmailHtml } from "../send-phishing-test-batch/emailLayout.ts";

const SUPABASE_URL     = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const RESEND_API_KEY   = Deno.env.get("RESEND_API_KEY")!;
const CRON_SECRET      = Deno.env.get("CRON_SECRET")!;
const SITE_URL         = "https://scam-savvy.org";

const corsHeaders = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-cron-secret",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.headers.get("x-cron-secret") !== CRON_SECRET) {
    return new Response("Unauthorized", { status: 401, headers: corsHeaders });
  }

  try {
    const { email, template_id } = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ error: "Missing email" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const template = template_id
      ? PHISHING_TEMPLATES.find((t) => t.id === template_id)
      : PHISHING_TEMPLATES[Math.floor(Math.random() * PHISHING_TEMPLATES.length)];

    if (!template) {
      return new Response(
        JSON.stringify({ error: `Unknown template_id: ${template_id}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const token = crypto.randomUUID();

    const dbHeaders = {
      apikey: SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
    };

    // Unchanged: still your personal test table, not the real phishing_emails log.
    await fetch(`${SUPABASE_URL}/rest/v1/simulated_sends`, {
      method: "POST",
      headers: { ...dbHeaders, Prefer: "return=minimal" },
      body: JSON.stringify({
        subscriber_id: null,
        template_id: template.id,
        token,
        is_test: true,
      }),
    });

    // Tracked link now points to the Vercel API route, not a Supabase Edge Function.
    const trackedLink = `${SITE_URL}/api/log-click?token=${token}`;
    const bodyHtml = template.bodyHtml.replace("{{LINK}}", trackedLink);

    // The report button isn't tracked here (simulated_sends is just for
    // visual QA of your own test sends) — it goes straight to the
    // feedback page so you can preview what a real recipient would land
    // on after reporting.
    const reportLink = `${SITE_URL}/phishing-feedback?template=${template.id}&reported=true`;

    const html = buildPhishingEmailHtml({
      bodyHtml,
      reportLink,
      footerText: "🧪 TEST SEND — this is a manual test of the ScamSavvy phishing simulation system.",
    });

    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: template.fromDisplay,
        to: [email],
        subject: `[TEST] ${template.subject}`,
        html,
      }),
    });

    if (!resendRes.ok) {
      const err = await resendRes.text();
      return new Response(
        JSON.stringify({ error: "Resend failed", detail: err }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({ success: true, template: template.id, sentTo: email }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Unexpected error", detail: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});