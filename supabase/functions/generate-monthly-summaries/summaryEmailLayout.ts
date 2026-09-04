// supabase/functions/generate-monthly-summaries/summaryEmailLayout.ts
//
// Shared HTML + copy for the monthly performance summary email. Used by
// both generate-monthly-summaries (the real automated send) and
// test-send-summary (manual preview, which adds its own [TEST] prefix on
// top of this — this file has no "test" wording in it at all, so nothing
// here can leak into a real subscriber's inbox).

export function encouragementText(scorePct: number): string {
  if (scorePct >= 80) {
    return "Great job staying sharp this month — you're spotting these well.";
  }
  if (scorePct >= 50) {
    return "Good progress. A little more practice and these will get even easier to spot.";
  }
  return "A few tricky ones got through this month — that's exactly what this practice is for.";
}

export function monthLabel(month: string): string {
  const [year, monthNum] = month.split("-");
  const date = new Date(Number(year), Number(monthNum) - 1, 1);
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

export function buildSummaryEmailHtml({
  month,
  emailsSent,
  clicked,
  reported,
  scorePct,
  unsubscribeLink,
}: {
  month: string;
  emailsSent: number;
  clicked: number;
  reported: number;
  scorePct: number;
  unsubscribeLink: string;
}) {
  return `
    <div style="max-width:520px;margin:0 auto;font-family:'Segoe UI',Arial,sans-serif;color:#1A0A3C;">
      <h1 style="font-size:22px;color:#3D1580;margin:0 0 8px;">Your ScamSavvy summary</h1>
      <p style="font-size:14px;color:#7A5FAA;margin:0 0 24px;">${monthLabel(month)}</p>

      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
        <tr>
          <td style="padding:14px 16px;background:#FAF7FF;border:1.5px solid #C9B8E8;border-radius:10px 10px 0 0;font-size:14px;">
            Test emails sent
          </td>
          <td style="padding:14px 16px;background:#FAF7FF;border:1.5px solid #C9B8E8;border-left:none;border-radius:0 10px 0 0;font-size:14px;text-align:right;font-weight:600;">
            ${emailsSent}
          </td>
        </tr>
        <tr>
          <td style="padding:14px 16px;background:#fff;border:1.5px solid #C9B8E8;border-top:none;font-size:14px;">
            Clicked
          </td>
          <td style="padding:14px 16px;background:#fff;border:1.5px solid #C9B8E8;border-top:none;border-left:none;font-size:14px;text-align:right;font-weight:600;color:#9B2335;">
            ${clicked}
          </td>
        </tr>
        <tr>
          <td style="padding:14px 16px;background:#FAF7FF;border:1.5px solid #C9B8E8;border-top:none;font-size:14px;">
            Reported
          </td>
          <td style="padding:14px 16px;background:#FAF7FF;border:1.5px solid #C9B8E8;border-top:none;border-left:none;font-size:14px;text-align:right;font-weight:600;color:#2D6A4F;">
            ${reported}
          </td>
        </tr>
        <tr>
          <td style="padding:16px;background:#3D1580;border-radius:0 0 10px 10px;font-size:15px;color:#fff;font-weight:700;">
            Your score
          </td>
          <td style="padding:16px;background:#3D1580;border-radius:0 0 10px 10px;font-size:20px;color:#fff;text-align:right;font-weight:700;">
            ${scorePct}%
          </td>
        </tr>
      </table>

      <p style="font-size:15px;line-height:1.7;color:#333;margin:0 0 24px;">
        ${encouragementText(scorePct)}
      </p>

      <hr style="border:none;border-top:1px solid #ddd;margin:24px 0;" />
      <p style="font-size:10px;color:#999;margin:0;line-height:1.5;">
        This is your monthly performance summary from ScamSavvy, a program you opted into.
        <a href="${unsubscribeLink}" style="color:#999;">Unsubscribe</a>
      </p>
    </div>
  `;
}