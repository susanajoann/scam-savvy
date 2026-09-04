// supabase/functions/generate-monthly-summaries/index.ts
//
// Aggregates last month's phishing_emails into one row per subscriber in
// monthly_summaries. Meant to run via a monthly cron (see
// .github/workflows/generate-monthly-summaries.yml), same pattern as the
// existing daily phishing-send cron.
//
// Scoring (score_pct): reported ÷ (reported + clicked), as a percentage.
// Emails a subscriber neither clicked nor reported (ignored entirely)
// don't count toward this at all — it measures "when you did engage,
// did you engage correctly," not overall engagement volume. If a
// subscriber never clicked OR reported anything all month, there's
// nothing to divide by; that case defaults to 100 (nothing bad happened),
// which is an assumption worth revisiting if it doesn't feel right in
// practice once there's real data to look at.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const SUPABASE_URL     = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const CRON_SECRET      = Deno.env.get("CRON_SECRET")!;

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
  // Defaults to last month / all subscribers, which is what the real
  // monthly cron uses.
  const body = await req.json().catch(() => ({}));
  const targetMonth: string = body.month || previousMonth();

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
    if (!row.subscriber_id) continue; // skip any rows with no subscriber (shouldn't normally occur for real sends)
    if (!bySubscriber[row.subscriber_id]) {
      bySubscriber[row.subscriber_id] = { emails_sent: 0, clicked: 0, reported: 0 };
    }
    const s = bySubscriber[row.subscriber_id];
    s.emails_sent++;
    if (row.clicked) s.clicked++;
    if (row.reported) s.reported++;
  }

  let written = 0;
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

    if (upsertRes.ok) {
      written++;
    } else {
      errors.push(`${subscriberId}: ${await upsertRes.text()}`);
    }
  }

  return new Response(
    JSON.stringify({
      success: errors.length === 0,
      month: targetMonth,
      subscribersConsidered: Object.keys(bySubscriber).length,
      summariesWritten: written,
      errors,
    }),
    { headers: { "Content-Type": "application/json" } },
  );
});