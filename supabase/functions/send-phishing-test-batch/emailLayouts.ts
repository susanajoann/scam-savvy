// supabase/functions/send-phishing-test-batch/emailLayout.ts
//
// Shared HTML wrapper for phishing simulation emails. Table-based layout
// with inline styles throughout — this isn't a style preference, it's a
// compatibility requirement: Outlook desktop renders email HTML through
// Word's layout engine, which ignores flexbox/grid and most modern CSS.
//
// The banner styling approximates Outlook's own "external sender" safety
// banner + a report-phishing action button (dark red, the color Outlook
// itself uses for its Report add-in), so the simulation teaches
// recipients to recognize a pattern they'll actually see in real Outlook,
// not an arbitrary custom design.

export function buildPhishingEmailHtml({
  bodyHtml,
  reportLink,
  footerText,
}: {
  bodyHtml: string;
  reportLink: string;
  footerText: string;
}) {
  return `
    <div style="max-width:520px;margin:0 auto;font-family:'Segoe UI',Arial,sans-serif;color:#1A0A3C;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FFF4E5;border:1px solid #F0C36D;border-radius:4px;margin-bottom:20px;">
        <tr>
          <td style="padding:10px 14px;font-family:'Segoe UI',Arial,sans-serif;font-size:13px;color:#5C3D00;">
            ⚠️ This sender could not be verified.
            <a href="${reportLink}" style="margin-left:8px;background:#C42B1C;color:#ffffff;padding:5px 12px;border-radius:3px;text-decoration:none;font-weight:600;font-size:12px;display:inline-block;">
              Report phishing
            </a>
          </td>
        </tr>
      </table>
      ${bodyHtml}
      <hr style="border:none;border-top:1px solid #ddd;margin:24px 0;" />
      <p style="font-size:10px;color:#999;margin:0;line-height:1.5;">
        ${footerText}
      </p>
    </div>
  `;
}