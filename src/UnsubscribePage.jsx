// ─────────────────────────────────────────────────────────────────────────────
// UnsubscribePage.jsx
//
// Handles the unsubscribe link clicked from any ScamSavvy email.
// Reads the subscriber ID from the URL, updates unsubscribed: true in Supabase,
// and shows a confirmation screen.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

async function unsubscribeById(subscriberId) {
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
        unsubscribed: true,
        unsubscribed_at: new Date().toISOString(),
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

export default function UnsubscribePage({ readScriptRef }) {
  const [status, setStatus] = useState("loading"); // loading | success | already | missing | error
  const [email, setEmail] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const subscriberId = params.get("id");

    if (!subscriberId) {
      setStatus("missing");
      return;
    }

    unsubscribeById(subscriberId)
      .then((row) => {
        setEmail(row.email ?? "");
        setStatus(row.unsubscribed ? "success" : "success");
      })
      .catch((err) => {
        if (err.message === "not_found") setStatus("missing");
        else setStatus("error");
      });
  }, []);

  useEffect(() => {
    if (!readScriptRef) return;
    const scripts = {
      loading: "Processing your unsubscribe request. Please wait.",
      success: `You have been unsubscribed${email ? " for " + email : ""}. You will no longer receive simulated scam emails from ScamSavvy. If you change your mind you can sign up again at any time.`,
      missing: "This unsubscribe link is invalid or has already been used.",
      error: "Something went wrong. Please try again.",
    };
    readScriptRef.current = () => scripts[status] ?? "";
  }, [status, email, readScriptRef]);

  return (
    <PageOuter>
      {status === "loading" && (
        <div style={styles.card}>
          <p style={styles.loadingText}>Processing your request…</p>
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
            You've been unsubscribed
          </h1>
          {email && (
            <p style={{ ...styles.body, color: "#1B4332", marginBottom: 8 }}>
              <strong>{email}</strong> has been removed from our email list.
            </p>
          )}
          <p style={{ ...styles.body, color: "#1B4332" }}>
            You will no longer receive simulated scam emails from ScamSavvy.
            Your quiz data is not affected — it remains anonymous in our
            research database.
          </p>
          <div style={styles.infoBox}>
            <p style={styles.infoText}>
              Changed your mind? You can sign up again at any time from the
              Email Sign-up page.
            </p>
          </div>
          <a href='/signup' style={{ ...styles.btn, background: "#2D6A4F" }}>
            Sign up again →
          </a>
          <a href='/' style={{ ...styles.btnSecondary }}>
            Back to ScamSavvy
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
            This unsubscribe link is invalid or has already been used. If you
            are still receiving emails and want to unsubscribe, please click the
            unsubscribe link in one of our recent emails.
          </p>
          <a href='/' style={{ ...styles.btn, background: "#9B2335" }}>
            Back to ScamSavvy
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
            We could not process your unsubscribe request. Please try clicking
            the link in your email again.
          </p>
          <a href='/' style={{ ...styles.btn, background: "#9B2335" }}>
            Back to ScamSavvy
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
    margin: "0 0 12px",
  },
  loadingText: {
    fontSize: 17,
    color: "#7A5FAA",
    fontStyle: "italic",
    margin: 0,
  },
  infoBox: {
    background: "#fff",
    border: "1.5px solid #2D6A4F",
    borderRadius: 10,
    padding: "14px 18px",
    margin: "20px 0",
    textAlign: "left",
  },
  infoText: {
    fontSize: 14,
    color: "#2D6A4F",
    margin: 0,
    lineHeight: 1.7,
  },
  btn: {
    display: "inline-block",
    marginTop: 8,
    padding: "14px 28px",
    fontSize: 15,
    fontWeight: 600,
    fontFamily: "sans-serif",
    background: "#3D1580",
    color: "#fff",
    borderRadius: 10,
    textDecoration: "none",
  },
  btnSecondary: {
    display: "block",
    marginTop: 14,
    fontSize: 14,
    color: "#7A5FAA",
    textDecoration: "underline",
    fontFamily: "sans-serif",
  },
};
