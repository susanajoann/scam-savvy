// ─────────────────────────────────────────────────────────────────────────────
// SignupPage.jsx
//
// Signup form for the ScamSavvy phishing simulation email program.
// Stores subscriber data in Supabase. Email sending handled separately.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// First check if this email already exists (subscribed or unsubscribed)
async function findSubscriber(email) {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/subscribers?email=eq.${encodeURIComponent(email)}&select=id,unsubscribed`,
    {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
      },
    },
  );
  if (!res.ok) return null;
  const rows = await res.json();
  return rows[0] ?? null;
}

// Reactivate a previously unsubscribed email
async function reactivateSubscriber(subscriberId) {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/subscribers?id=eq.${subscriberId}`,
    {
      method: "PATCH",
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify({
        unsubscribed: false,
        unsubscribed_at: null,
        confirmed: false,
        consent_given: true,
        created_at: new Date().toISOString(),
      }),
    },
  );
  if (!res.ok) throw new Error(await res.text());
  const rows = await res.json();
  return rows[0]?.id ?? subscriberId;
}

async function insertSubscriber(email) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/subscribers`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify({
      email,
      confirmed: false,
      consent_given: true,
      created_at: new Date().toISOString(),
    }),
  });

  if (res.status === 409) throw new Error("already_subscribed");
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text);
  }

  const rows = await res.json();
  return rows[0]?.id ?? null;
}

async function sendConfirmationEmail(email, subscriberId) {
  try {
    await fetch(`${SUPABASE_URL}/functions/v1/send-confirmation`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${SUPABASE_KEY}`,
      },
      body: JSON.stringify({ email, subscriber_id: subscriberId }),
    });
  } catch (err) {
    // Email failure should not block the signup success state
    console.warn("[signup] Failed to send confirmation email:", err);
  }
}

export default function SignupPage({ readScriptRef }) {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState("idle"); // idle | submitting | success | error | duplicate
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!readScriptRef) return;
    if (status === "success") {
      readScriptRef.current = () =>
        "You are signed up! Your email has been recorded. You will start receiving simulated scam emails within the next few weeks — 2 to 4 per month. Each one is a safe test designed to help you practise spotting real scams. You can unsubscribe at any time using the link at the bottom of any email you receive.";
    } else if (status === "duplicate") {
      readScriptRef.current = () =>
        "This email is already signed up. Check your inbox for our emails, or contact us if you have any issues.";
    } else if (status === "error") {
      readScriptRef.current = () => "Something went wrong. Please try again.";
    } else {
      readScriptRef.current = () =>
        "Sign up for ScamSavvy phishing simulations. Enter your email address and agree to the terms to receive 2 to 4 simulated scam emails per month. Each email is a safe test — if you click a suspicious link, you will see feedback explaining the scam tactic. At the end of each month you will receive a personal performance summary.";
    }
  }, [status, readScriptRef]);

  const handleSubmit = async () => {
    if (!email.trim() || !consent || status === "submitting") return;
    setStatus("submitting");
    setErrorMsg("");
    try {
      const normalizedEmail = email.trim().toLowerCase();
      let subscriberId;

      // Check if email already exists
      const existing = await findSubscriber(normalizedEmail);

      if (existing) {
        if (existing.unsubscribed) {
          // Previously unsubscribed — reactivate them
          subscriberId = await reactivateSubscriber(existing.id);
        } else {
          // Already actively subscribed
          setStatus("duplicate");
          return;
        }
      } else {
        // Brand new subscriber
        subscriberId = await insertSubscriber(normalizedEmail);
      }

      // Send confirmation email
      if (subscriberId) {
        sendConfirmationEmail(normalizedEmail, subscriberId);
      }
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setErrorMsg("Something went wrong. Please try again.");
    }
  };

  const isValid = email.trim().length > 0 && email.includes("@") && consent;

  if (status === "success") {
    return (
      <PageOuter>
        <div style={styles.successCard}>
          <p style={styles.successTitle}>✓ You're signed up!</p>
          <p style={styles.successBody}>
            Your email has been recorded. You will start receiving simulated
            scam emails within the next few weeks — 2 to 4 per month. Each one
            is a safe test designed to help you practise spotting real scams.
          </p>
          <p style={styles.successNote}>
            You can unsubscribe at any time using the link at the bottom of any
            email you receive.
          </p>
        </div>
      </PageOuter>
    );
  }

  return (
    <PageOuter>
      <h1 style={styles.title}>Sign up for scam simulations</h1>

      {/* What to expect */}
      <div style={styles.infoGrid}>
        {[
          {
            icon: "📧",
            title: "2–4 emails per month",
            desc: "Realistic simulated scam emails sent at random intervals",
          },
          {
            icon: "💡",
            title: "Instant feedback",
            desc: "Click a suspicious link and see exactly what made it a scam",
          },
          {
            icon: "📊",
            title: "Monthly summary",
            desc: "A personal report showing how you performed each month",
          },
          {
            icon: "🔒",
            title: "Safe & anonymous",
            desc: "No real links, no tracking beyond this program, unsubscribe any time",
          },
        ].map(({ icon, title, desc }) => (
          <div key={title} style={styles.infoCard}>
            <span style={styles.infoIcon}>{icon}</span>
            <p style={styles.infoTitle}>{title}</p>
            <p style={styles.infoDesc}>{desc}</p>
          </div>
        ))}
      </div>

      {/* Form */}
      <div style={styles.formCard}>
        <label style={styles.label}>Email address</label>
        <input
          type='email'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder='you@example.com'
          style={styles.input}
          onKeyDown={(e) => e.key === "Enter" && isValid && handleSubmit()}
        />

        {/* Consent */}
        <div style={styles.noticeBox}>
          <p style={styles.noticeTitle}>Before you sign up</p>
          <p style={styles.noticeBody}>
            By signing up you agree to receive 2–4 simulated phishing test
            emails per month from ScamSavvy. These emails are safe — they
            contain no real malicious links or attachments. Your email address
            will be stored securely and used only for this program. It will
            never be shared with third parties. You may unsubscribe at any time
            by clicking the unsubscribe link in any email, or by contacting us
            directly.
          </p>
          <label style={styles.checkLabel}>
            <input
              type='checkbox'
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              style={styles.checkbox}
            />
            <span>
              I understand and agree to receive simulated scam emails from
              ScamSavvy
            </span>
          </label>
        </div>

        {status === "duplicate" && (
          <p style={styles.duplicateMsg}>
            This email is already signed up. Check your inbox for our emails, or
            contact us if you have any issues.
          </p>
        )}

        {status === "error" && <p style={styles.errorMsg}>{errorMsg}</p>}

        <button
          onClick={handleSubmit}
          disabled={!isValid || status === "submitting"}
          style={{
            ...styles.submitBtn,
            background:
              !isValid || status === "submitting" ? "#D0D8E0" : "#3D1580",
            color: !isValid || status === "submitting" ? "#888" : "#fff",
            cursor:
              !isValid || status === "submitting" ? "not-allowed" : "pointer",
          }}
        >
          {status === "submitting" ? "Signing up..." : "Sign me up →"}
        </button>

        {!isValid && email.length > 0 && !email.includes("@") && (
          <p style={styles.hint}>Please enter a valid email address.</p>
        )}
        {!consent && email.length > 0 && (
          <p style={styles.hint}>Please agree to the terms above.</p>
        )}
      </div>

      <p style={styles.footer}>
        All data is stored securely in Supabase. Your email is used only for
        this program and will never be shared or sold.
      </p>
    </PageOuter>
  );
}

function PageOuter({ children }) {
  return (
    <div
      style={{
        width: "100%",
        maxWidth: "100vw",
        boxSizing: "border-box",
        padding: "40px clamp(16px, 5vw, 64px) 80px",
        fontFamily: "sans-serif",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <div style={{ width: "100%", maxWidth: 680 }}>{children}</div>
    </div>
  );
}

const styles = {
  title: {
    fontSize: "clamp(24px, 4vw, 32px)",
    fontWeight: 700,
    color: "#3D1580",
    fontFamily: "Georgia, serif",
    margin: "0 0 12px",
  },
  subtitle: {
    fontSize: "clamp(15px, 2vw, 17px)",
    color: "#444",
    lineHeight: 1.8,
    margin: "0 0 32px",
  },
  infoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
    gap: 12,
    marginBottom: 32,
  },
  infoCard: {
    background: "#FAF7FF",
    border: "1.5px solid #C9B8E8",
    borderRadius: 12,
    padding: "18px 16px",
    textAlign: "center",
  },
  infoIcon: { fontSize: 28, display: "block", marginBottom: 8 },
  infoTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: "#3D1580",
    margin: "0 0 6px",
  },
  infoDesc: { fontSize: 13, color: "#555", margin: 0, lineHeight: 1.6 },

  formCard: {
    background: "#FAF7FF",
    border: "1.5px solid #C9B8E8",
    borderRadius: 14,
    padding: "clamp(20px, 4vw, 32px)",
    marginBottom: 24,
  },
  label: {
    fontSize: "clamp(15px, 2vw, 17px)",
    fontWeight: 600,
    color: "#3D1580",
    display: "block",
    marginBottom: 8,
  },
  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "14px 16px",
    fontSize: "clamp(15px, 2vw, 17px)",
    fontFamily: "sans-serif",
    color: "#1A0A3C",
    background: "#fff",
    border: "1.5px solid #C9B8E8",
    borderRadius: 10,
    outline: "none",
    marginBottom: 20,
  },
  noticeBox: {
    background: "#fff",
    border: "1.5px solid #C9B8E8",
    borderRadius: 10,
    padding: "20px 22px",
    marginBottom: 20,
  },
  noticeTitle: {
    fontSize: "clamp(15px, 2vw, 17px)",
    fontWeight: 700,
    color: "#3D1580",
    margin: "0 0 10px",
  },
  noticeBody: {
    fontSize: "clamp(14px, 1.8vw, 15px)",
    lineHeight: 1.8,
    color: "#333",
    margin: "0 0 16px",
  },
  checkLabel: {
    display: "flex",
    alignItems: "flex-start",
    gap: 14,
    fontSize: "clamp(14px, 1.8vw, 16px)",
    color: "#3D1580",
    cursor: "pointer",
    lineHeight: 1.6,
  },
  checkbox: {
    width: 26,
    height: 26,
    marginTop: 2,
    cursor: "pointer",
    flexShrink: 0,
    accentColor: "#3D1580",
  },
  submitBtn: {
    width: "100%",
    padding: "18px 24px",
    fontSize: "clamp(16px, 2.5vw, 18px)",
    fontWeight: 600,
    fontFamily: "sans-serif",
    border: "none",
    borderRadius: 12,
    transition: "background 0.2s",
    lineHeight: 1.4,
  },
  hint: {
    fontSize: 13,
    color: "#888",
    textAlign: "center",
    margin: "10px 0 0",
    fontStyle: "italic",
  },
  duplicateMsg: {
    fontSize: 14,
    color: "#B5621A",
    background: "#FDE8D0",
    border: "1.5px solid #B5621A",
    borderRadius: 8,
    padding: "10px 14px",
    margin: "0 0 16px",
    lineHeight: 1.6,
  },
  errorMsg: {
    fontSize: 14,
    color: "#9B2335",
    margin: "0 0 16px",
  },
  successCard: {
    background: "#D8F3DC",
    border: "1.5px solid #2D6A4F",
    borderRadius: 14,
    padding: "28px 32px",
  },
  successTitle: {
    fontSize: 22,
    fontWeight: 700,
    color: "#1B4332",
    margin: "0 0 12px",
    fontFamily: "Georgia, serif",
  },
  successBody: {
    fontSize: 16,
    lineHeight: 1.8,
    color: "#1B4332",
    margin: "0 0 12px",
  },
  successNote: {
    fontSize: 14,
    color: "#2D6A4F",
    margin: 0,
    lineHeight: 1.6,
  },
  footer: {
    fontSize: 13,
    color: "#999",
    textAlign: "center",
    lineHeight: 1.6,
    margin: 0,
  },
};
