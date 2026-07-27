// supabase/functions/send-phishing-test-batch/templates.ts
// Keep this in sync with src/phishingTemplates.js — same ids and explanations.

export const PHISHING_TEMPLATES = [
  {
    id: "usps-package",
    subject: "USPS: Your package is on hold — action required",
    fromDisplay: "USPS Delivery <delivery@scam-savvy.org>",
    bodyHtml: `
      <p>We attempted to deliver your package today but were unable to complete delivery.</p>
      <p>A redelivery fee of $2.99 is required to reschedule. Please confirm your address and pay the fee within 24 hours or your package will be returned to sender.</p>
      <p><a href="{{LINK}}">Schedule redelivery →</a></p>
    `,
  },
  {
    id: "bank-alert",
    subject: "Security Alert: Unusual sign-in to your account",
    fromDisplay: "Account Security <bankalerts@scam-savvy.org>",
    bodyHtml: `
      <p>We noticed a sign-in to your account from a new device. If this wasn't you, your account may be at risk.</p>
      <p>Please verify your identity immediately to prevent your account from being locked.</p>
      <p><a href="{{LINK}}">Verify my account →</a></p>
    `,
  },
  {
    id: "amazon-order",
    subject: "Your order of $799.00 has shipped",
    fromDisplay: "Amazon <order-update@scam-savvy.org>",
    bodyHtml: `
      <p>Thanks for your order! Your recent purchase of <strong>$799.00</strong> has shipped and is on its way.</p>
      <p>Didn't make this purchase? <a href="{{LINK}}">Click here to cancel and get a refund</a>.</p>
    `,
  },
];