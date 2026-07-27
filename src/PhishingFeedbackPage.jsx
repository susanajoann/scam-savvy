// ─────────────────────────────────────────────────────────────────────────────
// PhishingFeedbackPage.jsx
//
// Shown after a subscriber clicks the link in a simulated phishing test email.
// Reads ?template= from the URL and displays the matching explanation.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import { PHISHING_TEMPLATES } from "./phishingTemplates.js";

export default function PhishingFeedbackPage({ readScriptRef }) {
  const [template, setTemplate] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("template");
    setTemplate(PHISHING_TEMPLATES.find((t) => t.id === id) ?? null);
  }, []);

  useEffect(() => {
    if (!readScriptRef) return;
    readScriptRef.current = () =>
      template
        ? `You clicked a simulated phishing test email. ${template.explanation}`
        : "This was a simulated phishing test.";
  }, [template, readScriptRef]);

  return (
    <PageOuter>
      <div style={styles.card}>
        <span style={styles.bigIcon}>⚠️</span>

        <h1 style={styles.title}>This was a simulated phishing test</h1>

        <p style={styles.body}>
          Don't worry — no real harm was done. This email was sent by ScamSavvy
          as part of the program you signed up for.
        </p>

        {template && (
          <div style={styles.explanationBox}>
            <p style={styles.explanationText}>{template.explanation}</p>
          </div>
        )}

        <a href='/' style={styles.btn}>
          Back to ScamSavvy →
        </a>
      </div>
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
    background: "#FADADD",
    border: "1.5px solid #9B2335",
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
    color: "#6B1020",
    margin: "0 0 14px",
  },
  body: {
    fontSize: "clamp(15px, 2vw, 17px)",
    lineHeight: 1.8,
    color: "#6B1020",
    margin: 0,
  },
  explanationBox: {
    background: "#fff",
    border: "1.5px solid #C9B8E8",
    borderRadius: 10,
    padding: "16px 20px",
    margin: "20px 0 0",
    textAlign: "left",
  },
  explanationText: {
    fontSize: 15,
    color: "#333",
    lineHeight: 1.7,
    margin: 0,
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
