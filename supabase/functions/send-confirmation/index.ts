import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const FROM_EMAIL      = "ScamSavvy <noreply@scam-savvy.org>";
const SITE_URL        = "https://scam-savvy.org";

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
    const { email, subscriber_id } = await req.json();

    if (!email || !subscriber_id) {
      return new Response(
        JSON.stringify({ error: "Missing email or subscriber_id" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const confirmUrl     = `${SITE_URL}/confirm?id=${subscriber_id}`;
    const unsubscribeUrl = `${SITE_URL}/unsubscribe?id=${subscriber_id}`;

    const html = `
      <!DOCTYPE html>
      <html>
        <head><meta charset="utf-8" /></head>
        <body style="margin:0;padding:0;background:#FAF7FF;font-family:sans-serif;">
          <div style="max-width:520px;margin:40px auto;background:#fff;border-radius:14px;border:1.5px solid #C9B8E8;overflow:hidden;">

            <!-- Header -->
            <div style="padding:24px 28px 18px;border-bottom:2px solid #E8E0F5;">
              <span style="font-family:Georgia,serif;font-size:22px;font-weight:700;color:#3D1580;">Scam</span><span style="font-family:Georgia,serif;font-size:22px;font-weight:700;color:#C8952A;">Savvy</span>
              <p style="font-size:11px;color:#7A5FAA;letter-spacing:1.5px;margin:4px 0 0;text-transform:uppercase;">Confirm your subscription</p>
            </div>

            <!-- Body -->
            <div style="padding:24px 28px;">
              <h1 style="font-family:Georgia,serif;font-size:18px;font-weight:700;color:#3D1580;margin:0 0 12px;">
                One step left — confirm your email
              </h1>
              <p style="font-size:15px;color:#1A0A3C;line-height:1.8;margin:0 0 20px;">
                Thanks for signing up for ScamSavvy phishing simulations! Click the button below to confirm
                <strong>${email}</strong> and start receiving simulated scam emails — 2 to 4 per month.
                Each one is a safe test designed to help you practise spotting real scams.
              </p>

              <a href="${confirmUrl}"
                style="display:inline-block;background:#3D1580;color:#fff;font-size:15px;font-weight:600;font-family:sans-serif;padding:14px 28px;border-radius:10px;text-decoration:none;margin-bottom:20px;">
                Confirm my subscription →
              </a>

              <div style="background:#FFF4E5;border:1.5px solid #F0C36D;border-radius:10px;padding:16px 18px;margin:20px 0 0;">
                <p style="font-size:14px;font-weight:700;color:#5C3D00;margin:0 0 8px;">
                  ⚠️ One more thing — whitelist us
                </p>
                <p style="font-size:13px;color:#5C3D00;line-height:1.7;margin:0 0 8px;">
                  Every email from this program — including the simulated phishing tests themselves — comes from
                  <strong>noreply@scam-savvy.org</strong>. Some email providers filter test emails like these into
                  spam, so add this address to your contacts now to make sure they actually reach your inbox:
                </p>
                <p style="font-size:13px;color:#5C3D00;line-height:1.7;margin:0 0 6px;">
                  <strong>Gmail:</strong> open any email from us, click the three-dot menu, and select "Add to
                  Contacts list."
                </p>
                <p style="font-size:13px;color:#5C3D00;line-height:1.7;margin:0;">
                  <strong>Outlook:</strong> right-click the sender's name in an email and choose "Add to Safe
                  Senders," or add it directly under Settings → Mail → Junk email → Safe senders.
                </p>
              </div>

              <p style="font-size:13px;color:#999;line-height:1.6;margin:20px 0 0;">
                If you didn't sign up for ScamSavvy, you can ignore this email, or
                <a href="${unsubscribeUrl}" style="color:#7A5FAA;">unsubscribe here</a>.
              </p>
            </div>

            <!-- Footer -->
            <div style="padding:14px 28px;border-top:1.5px solid #E8E0F5;background:#FAF7FF;">
              <p style="font-size:12px;color:#999;margin:0;">
                This email was sent because ${email} signed up at scam-savvy.org. All quiz data is anonymous.
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