// supabase/functions/generate-monthly-summaries/index.ts
//
// Aggregates last month's phishing_emails into one row per subscriber in
// monthly_summaries, AND sends each subscriber their real summary email —
// no "[TEST]" wording anywhere in this path, since this is what actually
// runs against real subscribers via the monthly cron (see
// .github/workflows/generate-monthly-summaries.yml).
//
// Scoring (score_pct): reported ÷ (reported + clicked), as a percentage.
// Emails a subscriber neither clicked nor reported (ignored entirely)
// don't count toward this at all. If a subscriber never clicked OR
// reported anything all month, that defaults to 100 (nothing bad
// happened) — an assumption worth revisiting against real data.
//
// A row is only marked as sent (and the email only actually goes out) if
// the upsert into monthly_summaries succeeds first — so the DB record
// and the real send can't drift apart from each other.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { buildSummaryEmailHtml, monthLabel } from "./summaryEmailLayout.ts";

const SUPABASE_URL     = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const RESEND_API_KEY   = Deno.env.get("RESEND_API_KEY")!;
const CRON_SECRET      = Deno.env.get("CRON_SECRET")!;
const SITE_URL         = "https://scam-savvy.org";

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
  if (req.headers.get("x-cron-secret") !== CRON_SECRET) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Allows manual testing for an arbitrary month, and/or scoped to a
  // single subscriber by email, via workflow_dispatch or a direct curl
  // with a JSON body, e.g. {"month": "2026-08", "email": "you@example.com"}.
  // dryRun:true skips actually sending emails — logs to monthly_summaries
  // as normal, but useful for testing the aggregation alone without
  // risking a real send while iterating on this function.
  const body = await req.json().catch(() => ({}));
  const targetMonth: string = body.month || previousMonth();
  const dryRun: boolean = body.dryRun === true;

  let scopedSubscriberId: string | null = null;
  if (body.email) {
    const subRes = await fetch(
      `${SUPABASE_URL}/rest/v1/subscribers?email=eq.${encodeURIComponent(body.email)}&select=id`,
      { headers: dbHeaders },
    );
    const subRows = await subRes.json();
    if (!subRows.length) {
      return new Response(
        JSON.stringify({ error: `No subscriber found with email ${body.email}` }),
        { status: 404, headers: { "Content-Type": "application/json" } },
      );
    }
    scopedSubscriberId = subRows[0].id;
  }

  const phishingEmailsUrl = scopedSubscriberId
    ? `${SUPABASE_URL}/rest/v1/phishing_emails?month=eq.${targetMonth}&subscriber_id=eq.${scopedSubscriberId}&select=subscriber_id,clicked,reported`
    : `${SUPABASE_URL}/rest/v1/phishing_emails?month=eq.${targetMonth}&select=subscriber_id,clicked,reported`;

  const rowsRes = await fetch(phishingEmailsUrl, { headers: dbHeaders });

  if (!rowsRes.ok) {
    const detail = await rowsRes.text();
    return new Response(
      JSON.stringify({ error: "Failed to fetch phishing_emails", detail }),
      { status: 502, headers: { "Content-Type": "application/json" } },
    );
  }

  const rows: { subscriber_id: string | null; clicked: boolean; reported: boolean }[] =
    await rowsRes.json();

  const bySubscriber: Record<
    string,
    { emails_sent: number; clicked: number; reported: number }
  > = {};

  for (const row of rows) {
    if (!row.subscriber_id) continue;
    if (!bySubscriber[row.subscriber_id]) {
      bySubscriber[row.subscriber_id] = { emails_sent: 0, clicked: 0, reported: 0 };
    }
    const s = bySubscriber[row.subscriber_id];
    s.emails_sent++;
    if (row.clicked) s.clicked++;
    if (row.reported) s.reported++;
  }

  const subscriberIds = Object.keys(bySubscriber);
  let subscriberEmails: Record<string, string> = {};

  if (subscriberIds.length) {
    const idsFilter = subscriberIds.join(",");
    const subsRes = await fetch(
      `${SUPABASE_URL}/rest/v1/subscribers?id=in.(${idsFilter})&select=id,email`,
      { headers: dbHeaders },
    );
    const subs = await subsRes.json();
    subscriberEmails = Object.fromEntries(subs.map((s: any) => [s.id, s.email]));
  }

  let written = 0;
  let emailsSent = 0;
  const errors: string[] = [];

  for (const [subscriberId, stats] of Object.entries(bySubscriber)) {
    const engaged = stats.reported + stats.clicked;
    const scorePct = engaged > 0 ? Math.round((stats.reported / engaged) * 100) : 100;

    const upsertRes = await fetch(`${SUPABASE_URL}/rest/v1/monthly_summaries`, {
      method: "POST",
      headers: {
        ...dbHeaders,
        Prefer: "resolution=merge-duplicates,return=minimal",
      },
      body: JSON.stringify({
        subscriber_id: subscriberId,
        month: targetMonth,
        emails_sent: stats.emails_sent,
        clicked: stats.clicked,
        reported: stats.reported,
        score_pct: scorePct,
        sent_at: new Date().toISOString(),
      }),
    });

    if (!upsertRes.ok) {
      errors.push(`${subscriberId}: upsert failed — ${await upsertRes.text()}`);
      continue; // don't send an email for a summary that failed to save
    }
    written++;

    const email = subscriberEmails[subscriberId];
    if (!email) {
      errors.push(`${subscriberId}: no email found, summary saved but not sent`);
      continue;
    }

    if (dryRun) continue; // aggregation + save only, no real send

    const unsubscribeLink = `${SITE_URL}/unsubscribe?id=${subscriberId}`;
    const html = buildSummaryEmailHtml({
      month: targetMonth,
      emailsSent: stats.emails_sent,
      clicked: stats.clicked,
      reported: stats.reported,
      scorePct,
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
        subject: `Your ScamSavvy summary for ${monthLabel(targetMonth)}`,
        html,
      }),
    });

    if (resendRes.ok) {
      emailsSent++;
    } else {
      errors.push(`${subscriberId}: send failed — ${await resendRes.text()}`);
    }
  }

  return new Response(
    JSON.stringify({
      success: errors.length === 0,
      month: targetMonth,
      dryRun,
      subscribersConsidered: subscriberIds.length,
      summariesWritten: written,
      emailsSent,
      errors,
    }),
    { headers: { "Content-Type": "application/json" } },
  );
});