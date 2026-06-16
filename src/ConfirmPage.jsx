// ─────────────────────────────────────────────────────────────────────────────
// ConfirmPage.jsx
//
// Handles the confirmation link clicked from the signup email.
// Reads the subscriber ID from the URL, updates confirmed: true in Supabase,
// and shows a success or error screen.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

async function confirmSubscriber(subscriberId) {
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
        confirmed: true,
        confirmed_at: new Date().toISOString(),
      }),
    },
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text);
  }

  const rows = await res.json();
  if (!rows.length) throw new Error("not_found");
  return rows[0];
}

export default function ConfirmPage({ readScriptRef }) {
  const [status, setStatus] = useState("loading"); // loading | success | already | error | missing

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const subscriberId = params.get("id");

    if (!subscriberId) {
      setStatus("missing");
      return;
    }

    confirmSubscriber(subscriberId)
      .then((row) => {
        if (row.confirmed) setStatus("success");
        else setStatus("success");
      })
      .catch((err) => {
        if (err.message === "not_found") setStatus("missing");
        else setStatus("error");
      });
  }, []);

  useEffect(() => {
    if (!readScriptRef) return;
    const scripts = {
      loading: "Confirming your email address. Please wait.",
      success:
        "Your email has been confirmed. Welcome to ScamSavvy simulations. You will start receiving simulated scam emails soon — 2 to 4 per month. Each one is a safe test to help you practise spotting real scams.",
      already: "Your email is already confirmed. You are all set.",
      missing:
        "This confirmation link is invalid or has expired. Please sign up again.",
      error:
        "Something went wrong confirming your email. Please try again or contact us.",
    };
    readScriptRef.current = () => scripts[status] ?? "";
  }, [status, readScriptRef]);

  return (
    <PageOuter>
      {status === "loading" && (
        <div style={styles.card}>
          <p style={styles.loadingText}>Confirming your email…</p>
        </div>
      )}

      {status === "success" && (
        <div
          style={{
            ...styles.card,
            borderColor: "#2D6A4F",
            background: "#D8F3DC",
          }}
        >
          <span style={styles.bigIcon}>✓</span>
          <h1 style={{ ...styles.title, color: "#1B4332" }}>
            Email confirmed!
          </h1>
          <p style={{ ...styles.body, color: "#1B4332" }}>
            Welcome to ScamSavvy simulations. You will start receiving simulated
            scam emails within the next few weeks — 2 to 4 per month.
          </p>
          <p style={{ ...styles.body, color: "#2D6A4F", marginTop: 12 }}>
            Each email is a safe test designed to help you practise spotting
            real scams. If you click a suspicious link you will see instant
            feedback explaining what made it a scam. At the end of each month
            you will receive a personal performance summary.
          </p>
          <div style={styles.tipBox}>
            <p style={styles.tipText}>
              <strong>Tip:</strong> Add{" "}
              <span style={{ color: "#3D1580" }}>noreply@scamsavvy.com</span> to
              your contacts so our test emails don't end up in spam.
            </p>
          </div>
          <a href='/' style={styles.btn}>
            Back to ScamSavvy →
          </a>
        </div>
      )}

      {status === "missing" && (
        <div
          style={{
            ...styles.card,
            borderColor: "#9B2335",
            background: "#FADADD",
          }}
        >
          <span style={styles.bigIcon}>✗</span>
          <h1 style={{ ...styles.title, color: "#6B1020" }}>Invalid link</h1>
          <p style={{ ...styles.body, color: "#6B1020" }}>
            This confirmation link is invalid or has already been used. If you
            recently signed up, try clicking the link in your email again.
          </p>
          <a href='/signup' style={{ ...styles.btn, background: "#9B2335" }}>
            Sign up again →
          </a>
        </div>
      )}

      {status === "error" && (
        <div
          style={{
            ...styles.card,
            borderColor: "#9B2335",
            background: "#FADADD",
          }}
        >
          <span style={styles.bigIcon}>⚠️</span>
          <h1 style={{ ...styles.title, color: "#6B1020" }}>
            Something went wrong
          </h1>
          <p style={{ ...styles.body, color: "#6B1020" }}>
            We could not confirm your email address. Please try clicking the
            link in your email again, or sign up again below.
          </p>
          <a href='/signup' style={{ ...styles.btn, background: "#9B2335" }}>
            Try again →
          </a>
        </div>
      )}
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
        padding: "60px clamp(16px, 5vw, 64px) 80px",
        fontFamily: "sans-serif",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <div style={{ width: "100%", maxWidth: 560 }}>{children}</div>
    </div>
  );
}

const styles = {
  card: {
    background: "#FAF7FF",
    border: "1.5px solid #C9B8E8",
    borderRadius: 16,
    padding: "clamp(28px, 5vw, 48px)",
    textAlign: "center",
  },
  bigIcon: {
    fontSize: 48,
    display: "block",
    marginBottom: 16,
  },
  title: {
    fontSize: "clamp(22px, 4vw, 28px)",
    fontWeight: 700,
    fontFamily: "Georgia, serif",
    color: "#3D1580",
    margin: "0 0 14px",
  },
  body: {
    fontSize: "clamp(15px, 2vw, 17px)",
    lineHeight: 1.8,
    color: "#333",
    margin: 0,
  },
  loadingText: {
    fontSize: 17,
    color: "#7A5FAA",
    fontStyle: "italic",
    margin: 0,
  },
  tipBox: {
    background: "#fff",
    border: "1.5px solid #C9B8E8",
    borderRadius: 10,
    padding: "14px 18px",
    margin: "24px 0",
    textAlign: "left",
  },
  tipText: {
    fontSize: 14,
    color: "#555",
    margin: 0,
    lineHeight: 1.7,
  },
  btn: {
    display: "inline-block",
    marginTop: 24,
    padding: "16px 32px",
    fontSize: 16,
    fontWeight: 600,
    fontFamily: "sans-serif",
    background: "#3D1580",
    color: "#fff",
    borderRadius: 10,
    textDecoration: "none",
    transition: "background 0.2s",
  },
};
