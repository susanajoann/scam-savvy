import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const ADMIN_EMAIL    = "admin@scam-savvy.org";
const FROM_EMAIL     = "ScamSavvy <noreply@scam-savvy.org>";

const corsHeaders = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  try {
    const { message } = await req.json();

    if (!message) {
      return new Response(
        JSON.stringify({ error: "Missing message" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const submittedAt = new Date().toLocaleString("en-US", {
      timeZone:    "America/New_York",
      dateStyle:   "medium",
      timeStyle:   "short",
    });

    const html = `
      <!DOCTYPE html>
      <html>
        <head><meta charset="utf-8" /></head>
        <body style="margin:0;padding:0;background:#FAF7FF;font-family:sans-serif;">
          <div style="max-width:520px;margin:40px auto;background:#fff;border-radius:14px;border:1.5px solid #C9B8E8;overflow:hidden;">

            <!-- Header -->
            <div style="padding:24px 28px 18px;border-bottom:2px solid #E8E0F5;">
              <span style="font-family:Georgia,serif;font-size:22px;font-weight:700;color:#3D1580;">Scam</span><span style="font-family:Georgia,serif;font-size:22px;font-weight:700;color:#C8952A;">Savvy</span>
              <p style="font-size:11px;color:#7A5FAA;letter-spacing:1.5px;margin:4px 0 0;text-transform:uppercase;">Admin Notification</p>
            </div>

            <!-- Body -->
            <div style="padding:24px 28px;">
              <h1 style="font-family:Georgia,serif;font-size:18px;font-weight:700;color:#3D1580;margin:0 0 6px;">
                New feedback submitted
              </h1>
              <p style="font-size:13px;color:#999;margin:0 0 20px;">${submittedAt} EST</p>

              <div style="background:#FAF7FF;border-left:4px solid #C8952A;border-radius:4px;padding:14px 18px;margin-bottom:20px;">
                <p style="font-size:15px;color:#1A0A3C;line-height:1.8;margin:0;">${message.replace(/\n/g, "<br/>")}</p>
              </div>

              <a href="https://hmkzttbkxafznlgkkyhh.supabase.co" 
                style="display:inline-block;background:#3D1580;color:#fff;font-size:14px;font-weight:600;font-family:sans-serif;padding:12px 24px;border-radius:8px;text-decoration:none;">
                View in Supabase →
              </a>
            </div>

            <!-- Footer -->
            <div style="padding:14px 28px;border-top:1.5px solid #E8E0F5;background:#FAF7FF;">
              <p style="font-size:12px;color:#999;margin:0;">
                This is an automated alert from ScamSavvy. All feedback is stored anonymously in Supabase.
              </p>
            </div>

          </div>
        </body>
      </html>
    `;

    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from:    FROM_EMAIL,
        to:      [ADMIN_EMAIL],
        subject: "📬 New feedback on ScamSavvy",
        html,
      }),
    });

    if (!resendRes.ok) {
      const err = await resendRes.text();
      console.error("Resend error:", err);
      return new Response(
        JSON.stringify({ error: "Failed to send email", detail: err }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await resendRes.json();
    return new Response(
      JSON.stringify({ success: true, id: data.id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response(
      JSON.stringify({ error: "Unexpected error", detail: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});