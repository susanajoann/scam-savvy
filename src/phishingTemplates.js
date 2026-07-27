// Shared between the send-phishing-test edge function and PhishingFeedbackPage.
// {{LINK}} is replaced with the tracked click URL at send time.

export const PHISHING_TEMPLATES = [
  {
    id: "usps-package",
    subject: "USPS: Your package is on hold — action required",
    fromDisplay: "USPS Delivery <delivery@usps-mail-tracking.net>",
    bodyHtml: `
      <p>We attempted to deliver your package today but were unable to complete delivery.</p>
      <p>A redelivery fee of $2.99 is required to reschedule. Please confirm your address and pay the fee within 24 hours or your package will be returned to sender.</p>
      <p><a href="{{LINK}}">Schedule redelivery →</a></p>
    `,
    explanation:
      "This test used a fake domain (usps-mail-tracking.net) and a small urgent fee — a classic phishing hook. The real USPS never charges a fee to redeliver a package, and legitimate delivery notices come from usps.com only.",
  },
  {
    id: "bank-alert",
    subject: "Security Alert: Unusual sign-in to your account",
    fromDisplay: "Account Security <alerts@secure-bank-verify.com>",
    bodyHtml: `
      <p>We noticed a sign-in to your account from a new device. If this wasn't you, your account may be at risk.</p>
      <p>Please verify your identity immediately to prevent your account from being locked.</p>
      <p><a href="{{LINK}}">Verify my account →</a></p>
    `,
    explanation:
      "This test used a fake domain and urgency ('may be at risk', 'prevent being locked') to pressure a quick click. Always go to your bank's site directly by typing the address yourself, never through a link in an email.",
  },
  {
    id: "amazon-order",
    subject: "Your order of $799.00 has shipped",
    fromDisplay: "Amazon <order-update@amazon-shipping-confirm.com>",
    bodyHtml: `
      <p>Thanks for your order! Your recent purchase of <strong>$799.00</strong> has shipped and is on its way.</p>
      <p>Didn't make this purchase? <a href="{{LINK}}">Click here to cancel and get a refund</a>.</p>
    `,
    explanation:
      "This test relied on a fake large purchase to trigger alarm and get you clicking fast. The sending domain wasn't amazon.com. Always log in to amazon.com directly to check your real order history instead of clicking links in unexpected emails.",
  },
];
