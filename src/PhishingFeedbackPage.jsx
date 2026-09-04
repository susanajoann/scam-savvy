// ─────────────────────────────────────────────────────────────────────────────
// PhishingFeedbackPage.jsx
//
// Shown after a subscriber clicks the link in a simulated phishing test email.
// Reads ?template= from the URL and displays the matching explanation.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import { PHISHING_TEMPLATES } from "./phishingTemplates.js";
import { announceDomReadScript } from "./readPageContent.js";

export default function PhishingFeedbackPage({ readScriptRef }) {
  const [template, setTemplate] = useState(null);
  const [reported, setReported] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("template");
    setTemplate(PHISHING_TEMPLATES.find((t) => t.id === id) ?? null);
    setReported(params.get("reported") === "true");
  }, []);

  // Reads whatever's actually rendered below and announces once the
  // template resolves from the URL param.
  useEffect(() => {
    announceDomReadScript(readScriptRef, "phishing-feedback-content");
  }, [template, reported]);

  return (
    <PageOuter>
      <div style={reported ? styles.cardSuccess : styles.card}>
        <span style={styles.bigIcon}>{reported ? "✅" : "⚠️"}</span>

        <h1 style={reported ? styles.titleSuccess : styles.title}>
          {reported
            ? "Nice catch — that was a simulated phishing test"
            : "This was a simulated phishing test"}
        </h1>

        <p style={reported ? styles.bodySuccess : styles.body}>
          {reported
            ? "You correctly identified this as suspicious and reported it instead of clicking through — exactly the right move. No real harm was possible either way; this email was sent by ScamSavvy as part of the program you signed up for."
            : "Don't worry — no real harm was done. This email was sent by ScamSavvy as part of the program you signed up for."}
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
      <div
        id='phishing-feedback-content'
        style={{ width: "100%", maxWidth: 560 }}
      >
        {children}
      </div>
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
  cardSuccess: {
    background: "#D8F3DC",
    border: "1.5px solid #2D6A4F",
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
  titleSuccess: {
    fontSize: "clamp(22px, 4vw, 28px)",
    fontWeight: 700,
    fontFamily: "Georgia, serif",
    color: "#1B4332",
    margin: "0 0 14px",
  },
  body: {
    fontSize: "clamp(15px, 2vw, 17px)",
    lineHeight: 1.8,
    color: "#6B1020",
    margin: 0,
  },
  bodySuccess: {
    fontSize: "clamp(15px, 2vw, 17px)",
    lineHeight: 1.8,
    color: "#1B4332",
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
