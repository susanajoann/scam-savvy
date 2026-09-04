// supabase/functions/test-send-summary/index.ts
//
// Manual test-send for the monthly performance summary email — same
// pattern as test-send-phishing: manually triggered (not the real cron),
// used to preview real content in your own inbox.
//
// Requires the monthly_summaries row to already exist for the given
// subscriber + month (generate it first via generate-monthly-summaries,
// scoped to just that email if you don't want to touch every
// subscriber — see its {"email": "..."} option).

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { buildSummaryEmailHtml, monthLabel } from "../generate-monthly-summaries/summaryEmailLayout.ts";

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

const dbHeaders = {
  apikey: SERVICE_ROLE_KEY,
  Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
  "Content-Type": "application/json",
};

function previousMonth(): string {
  const now = new Date();
  const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  return prev.toISOString().slice(0, 7); // "YYYY-MM"
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.headers.get("x-cron-secret") !== CRON_SECRET) {
    return new Response("Unauthorized", { status: 401, headers: corsHeaders });
  }

  try {
    const { email, month } = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ error: "Missing email" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const targetMonth: string = month || previousMonth();

    const subRes = await fetch(
      `${SUPABASE_URL}/rest/v1/subscribers?email=eq.${encodeURIComponent(email)}&select=id`,
      { headers: dbHeaders },
    );
    const subRows = await subRes.json();
    if (!subRows.length) {
      return new Response(
        JSON.stringify({ error: `No subscriber found with email ${email}` }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    const subscriberId = subRows[0].id;

    const summaryRes = await fetch(
      `${SUPABASE_URL}/rest/v1/monthly_summaries?subscriber_id=eq.${subscriberId}&month=eq.${targetMonth}&select=*`,
      { headers: dbHeaders },
    );
    const summaryRows = await summaryRes.json();
    if (!summaryRows.length) {
      return new Response(
        JSON.stringify({
          error: `No monthly_summaries row for ${email} in ${targetMonth}. Run generate-monthly-summaries first (optionally scoped with {"email": "${email}", "month": "${targetMonth}"}).`,
        }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    const summary = summaryRows[0];

    const unsubscribeLink = `${SITE_URL}/unsubscribe?id=${subscriberId}`;

    const html = buildSummaryEmailHtml({
      month: targetMonth,
      emailsSent: summary.emails_sent,
      clicked: summary.clicked,
      reported: summary.reported,
      scorePct: summary.score_pct,
      unsubscribeLink,
    });

    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "ScamSavvy <noreply@scam-savvy.org>",
        to: [email],
        subject: `[TEST] Your ScamSavvy summary for ${monthLabel(targetMonth)}`,
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
      JSON.stringify({ success: true, sentTo: email, month: targetMonth, summary }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Unexpected error", detail: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});