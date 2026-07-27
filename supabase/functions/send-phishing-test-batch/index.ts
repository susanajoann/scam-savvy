import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const SUPABASE_URL     = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const SITE_URL         = "https://scam-savvy.org";

serve(async (req) => {
  const url = new URL(req.url);
  const token = url.searchParams.get("token");

  if (!token) {
    return Response.redirect(SITE_URL, 302);
  }

  const dbHeaders = {
    apikey: SERVICE_ROLE_KEY,
    Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
    "Content-Type": "application/json",
  };

  const patchRes = await fetch(
    `${SUPABASE_URL}/rest/v1/simulated_sends?token=eq.${token}`,
    {
      method: "PATCH",
      headers: { ...dbHeaders, Prefer: "return=representation" },
      body: JSON.stringify({ clicked: true, clicked_at: new Date().toISOString() }),
    },
  );

  const rows = await patchRes.json();
  const templateId = rows[0]?.template_id ?? "unknown";

  return Response.redirect(
    `${SITE_URL}/phishing-feedback?template=${templateId}`,
    302,
  );
});