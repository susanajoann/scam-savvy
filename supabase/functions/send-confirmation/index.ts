import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const APP_URL = Deno.env.get("APP_URL") ?? "http://localhost:5173";
const FROM_EMAIL = "ScamSavvy <onboarding@resend.dev>";

const corsHeaders = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", {
      status: 405,
      headers: corsHeaders,
    });
  }

  try {
    const { email, subscriber_id } = await req.json();

    if (!email || !subscriber_id) {
      return new Response(
        JSON.stringify({ error: "Missing email or subscriber_id" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const confirmUrl     = `${APP_URL}/confirm?id=${subscriber_id}`;
    const unsubscribeUrl = `${APP_URL}/unsubscribe?id=${subscriber_id}`;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </head>
        <body style="margin:0;padding:0;background:#FAF7FF;font-family:sans-serif;">
          <div style="max-width:560px;margin:40px auto;background:#fff;border-radius:14px;border:1.5px solid #C9B8E8;overflow:hidden;">

            <!-- Header -->
            <div style="padding:28px 32px 20px;border-bottom:2px solid #E8E0F5;">
              <span style="font-family:Georgia,serif;font-size:26px;font-weight:700;color:#3D1580;letter-spacing:-0.5px;">Scam</span><span style="font-family:Georgia,serif;font-size:26px;font-weight:700;color:#C8952A;letter-spacing:-0.5px;">Savvy</span>
              <p style="font-size:11px;color:#7A5FAA;letter-spacing:1.5px;margin:4px 0 0;text-transform:uppercase;">Know the scam before it knows you</p>
            </div>

            <!-- Body -->
            <div style="padding:28px 32px;">
              <h1 style="font-family:Georgia,serif;font-size:22px;font-weight:700;color:#3D1580;margin:0 0 14px;">Confirm your email address</h1>
              <p style="font-size:15px;line-height:1.8;color:#333;margin:0 0 20px;">
                Thanks for signing up for ScamSavvy phishing simulations. You will receive
                2–4 realistic but safe simulated scam emails each month to help you practise
                spotting real scams.
              </p>
              <p style="font-size:15px;line-height:1.8;color:#333;margin:0 0 28px;">
                Please confirm your email address by clicking the button below.
              </p>

              <!-- CTA button -->
              <a href="${confirmUrl}"
                style="display:inline-block;background:#3D1580;color:#fff;font-size:16px;font-weight:600;font-family:sans-serif;padding:16px 32px;border-radius:10px;text-decoration:none;margin-bottom:24px;">
                Confirm my email →
              </a>

              <p style="font-size:13px;color:#888;margin:0 0 8px;">
                Or copy and paste this link into your browser:
              </p>
              <p style="font-size:13px;color:#7A5FAA;word-break:break-all;margin:0 0 28px;">
                ${confirmUrl}
              </p>

              <div style="background:#FAF7FF;border:1.5px solid #C9B8E8;border-radius:10px;padding:16px 18px;">
                <p style="font-size:13px;color:#555;margin:0;line-height:1.7;">
                  <strong style="color:#3D1580;">Not you?</strong> If you did not sign up for ScamSavvy,
                  you can safely ignore this email. No account will be created.
                </p>
              </div>
            </div>

            <!-- Footer -->
            <div style="padding:16px 32px;border-top:1.5px solid #E8E0F5;background:#FAF7FF;">
              <p style="font-size:12px;color:#999;margin:0;line-height:1.7;">
                ScamSavvy — educational scam awareness tool. All data is anonymous and used for research only.
                <br />
                <a href="${unsubscribeUrl}" style="color:#7A5FAA;">Unsubscribe</a>
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
        to:      [email],
        subject: "Confirm your ScamSavvy subscription",
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