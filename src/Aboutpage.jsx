// ─────────────────────────────────────────────────────────────────────────────
// AboutPage.jsx
//
// The story behind ScamSavvy, the methodology behind the quiz, and a
// transparent privacy / data risk assessment for anyone deciding whether
// to trust the app with their (anonymous) responses.
//
// Read-aloud: this page uses useReadPage(), which reads directly from the
// rendered DOM (via ref.innerText) instead of a hand-maintained script.
// Change the visible text below and the 🔊 button picks it up automatically —
// no separate script to keep in sync. Elements marked aria-hidden are
// skipped (decorative arrows, redundant numbering).
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
const PURPLE = "#3D1580";
const GOLD = "#C8952A";
const MUTED = "#7A5FAA";
const GREEN = "#2D6A4F";

export default function AboutPage({ readScriptRef }) {
  return (
    <PageOuter containerRef={containerRef}>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div style={s.hero}>
        <p style={s.eyebrow}>About ScamSavvy</p>
        <h1 style={s.heroTitle}>Why I Built ScamSavvy</h1>
        <p style={s.heroLede}>
          A personal story, the research behind the questions, and a risk
          assessment of our external vendors.
        </p>
      </div>

      <Spacer h={40} />

      {/* ── My story ─────────────────────────────────────────────────────── */}
      <Section label='01' title='My story'>
        <p style={s.body}>
          A few years ago, my grandfather was a target of a scam. Posing as his
          grandson, they called and requested thousands of dollars as a bond to
          be released from jail. Over the course of the next few hours, my
          grandfather proceeded to remove the money from the bank, call various
          family members, and get ready to drive across state-lines to the
          "jail". Throughout this whole ordeal, he did not think to call his
          grandson. However, other family members did call and confirm that it
          was all a scam. My grandfather was lucky to have people around him
          with some cyber awareness, but not everyone does.
        </p>
      </Section>

      <Divider />

      {/* ── What it is ───────────────────────────────────────────────────── */}
      <Section label='02' title='What ScamSavvy is'>
        <p style={s.body}>
          ScamSavvy is a quiz designed to help older adults learn how to
          identify scams before they fall victim to them. Using the Internet
          Crime Complaint Center's 2025 report, I developed questions based on
          the most common and costly scam tactics for older generations. While
          the app is aimed at older individuals, it is accessible (and
          encouraged) for the general audience as well.
        </p>
        <Spacer h={20} />
        <div style={s.diffGrid}>
          {[
            {
              level: "Easy",
              desc: "Choose the safe action",
              color: GREEN,
              bg: "#D8F3DC",
            },
            {
              level: "Medium",
              desc: "Spot the scam tactic",
              color: "#B5621A",
              bg: "#FDE8D0",
            },
            {
              level: "Hard",
              desc: "Highlight the red flags in a realistic message",
              color: "#9B2335",
              bg: "#FADADD",
            },
          ].map((d) => (
            <div key={d.level} style={{ ...s.diffCard, background: d.bg }}>
              <p style={{ ...s.diffLevel, color: d.color }}>{d.level}</p>
              <p style={s.diffDesc}>{d.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      <Divider />

      {/* ── How it was built ─────────────────────────────────────────────── */}
      <Section label='03' title='How it was built'>
        <p style={s.body}>
          I built ScamSavvy using React with a Supabase backend to track
          anonymous response data for my research, and it includes a live
          analytics dashboard. As I had never coded with React before, I used
          Codeacademy and Claude AI's to help me flesh out my vision.
        </p>
      </Section>

      <Divider />

      {/* ── Privacy & risk assessment ────────────────────────────────────── */}
      <Section label='04' title='Privacy &amp; risk assessment'>
        <p style={s.body}>
          Trust matters most for an app built to protect people from being
          deceived. Here's exactly what ScamSavvy does and doesn't do with your
          data.
        </p>
        <Spacer h={20} />

        <RiskRow
          status='low'
          title='Quiz responses are anonymous'
          text='Your age range, chosen difficulty, and answers are recorded for research, but nothing links them to your identity. No names, emails, or IP addresses are stored alongside quiz data.'
        />
        <RiskRow
          status='low'
          title='No account or login required'
          text='You can take the quiz without creating an account, entering a password, or providing any identifying detail.'
        />
        <RiskRow
          status='medium'
          title='Email sign-up is separate and optional'
          text='If you opt in to receive simulated phishing emails, your email address is stored only for that purpose, kept separate from quiz data, and never shared with third parties. You can unsubscribe at any time using the link in any email.'
        />
        <RiskRow
          status='medium'
          title='Third-party services are involved'
          text='ScamSavvy runs on Supabase (database), Vercel (hosting), and Resend (email delivery). Each processes the minimum data needed to perform its function, under their own security and privacy practices.'
        />
        <RiskRow
          status='low'
          title='Simulated scam emails are never real threats'
          text='Emails sent through the optional simulation program never contain real malicious links or attachments. They exist solely to give you safe practice at recognizing tactics.'
        />

        <Spacer h={8} />
        <p style={s.footnote}>
          Have a security or privacy concern? Reach out through the{" "}
          <a href='/feedback' style={s.inlineLink}>
            feedback page
          </a>{" "}
          — I read every submission.
        </p>
      </Section>

      <Divider />

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <div style={s.ctaBox}>
        <p style={s.ctaTitle}>Try it, then tell me what you think</p>
        <p style={s.ctaBody}>
          I'd appreciate any feedback to help improve the app — and if you know
          someone who could use it, please share it with them.
        </p>
        <div style={s.ctaButtons}>
          <a href='/' style={s.ctaPrimary}>
            Take the quiz <span aria-hidden='true'>→</span>
          </a>
          <a href='/feedback' style={s.ctaSecondary}>
            Share feedback
          </a>
        </div>
      </div>
    </PageOuter>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Section({ label, title, children }) {
  return (
    <section>
      <div style={s.sectionHeader}>
        {/* Numbering is a visual anchor only — skip it in read-aloud */}
        <span style={s.sectionLabel} aria-hidden='true'>
          {label}
        </span>
        <h2 style={s.sectionTitle}>{title}</h2>
      </div>
      <Spacer h={14} />
      {children}
    </section>
  );
}

function RiskRow({ status, title, text }) {
  const statusMap = {
    low: { color: GREEN, bg: "#D8F3DC", label: "Low risk" },
    medium: { color: "#B5621A", bg: "#FDE8D0", label: "Good to know" },
  };
  const cfg = statusMap[status] ?? statusMap.low;
  return (
    <div style={s.riskRow}>
      <span style={{ ...s.riskTag, background: cfg.bg, color: cfg.color }}>
        {cfg.label}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={s.riskTitle}>{title}</p>
        <p style={s.riskText}>{text}</p>
      </div>
    </div>
  );
}

function PageOuter({ children, containerRef }) {
  return (
    <div
      ref={containerRef}
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
      <div style={{ width: "100%", maxWidth: 760 }}>{children}</div>
    </div>
  );
}

function Divider() {
  return (
    <div style={{ padding: "32px 0" }} aria-hidden='true'>
      <hr
        style={{ border: "none", borderTop: "1.5px solid #E8E0F5", margin: 0 }}
      />
    </div>
  );
}

function Spacer({ h }) {
  return <div style={{ height: h }} aria-hidden='true' />;
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = {
  hero: {
    borderLeft: `4px solid ${GOLD}`,
    paddingLeft: "clamp(16px, 3vw, 24px)",
  },
  eyebrow: {
    fontSize: 13,
    fontWeight: 700,
    color: MUTED,
    textTransform: "uppercase",
    letterSpacing: "1.5px",
    margin: "0 0 10px",
  },
  heroTitle: {
    fontSize: "clamp(26px, 4.5vw, 38px)",
    fontWeight: 700,
    color: PURPLE,
    fontFamily: "Georgia, serif",
    lineHeight: 1.25,
    margin: "0 0 14px",
  },
  heroLede: {
    fontSize: "clamp(15px, 2vw, 18px)",
    color: "#444",
    lineHeight: 1.8,
    margin: 0,
  },
  sectionHeader: {
    display: "flex",
    alignItems: "baseline",
    gap: 14,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: 700,
    color: GOLD,
    fontFamily: "Georgia, serif",
    flexShrink: 0,
  },
  sectionTitle: {
    fontSize: "clamp(20px, 3vw, 25px)",
    fontWeight: 700,
    color: PURPLE,
    fontFamily: "Georgia, serif",
    margin: 0,
  },
  body: {
    fontSize: "clamp(15px, 2vw, 17px)",
    lineHeight: 1.85,
    color: "#333",
    margin: 0,
  },
  diffGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 12,
  },
  diffCard: {
    borderRadius: 12,
    padding: "16px 18px",
  },
  diffLevel: {
    fontSize: 15,
    fontWeight: 700,
    margin: "0 0 4px",
    fontFamily: "sans-serif",
  },
  diffDesc: {
    fontSize: 13,
    color: "#444",
    margin: 0,
    lineHeight: 1.6,
  },
  riskRow: {
    display: "flex",
    gap: 16,
    alignItems: "flex-start",
    padding: "16px 0",
    borderBottom: "1px solid #EDE8F8",
  },
  riskTag: {
    fontSize: 11,
    fontWeight: 700,
    borderRadius: 20,
    padding: "5px 12px",
    whiteSpace: "nowrap",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    flexShrink: 0,
    marginTop: 2,
  },
  riskTitle: {
    fontSize: 15,
    fontWeight: 700,
    color: "#1A0A3C",
    margin: "0 0 4px",
  },
  riskText: {
    fontSize: 14,
    color: "#555",
    lineHeight: 1.7,
    margin: 0,
  },
  footnote: {
    fontSize: 13,
    color: "#999",
    lineHeight: 1.6,
    margin: 0,
  },
  inlineLink: {
    color: PURPLE,
    fontWeight: 600,
  },
  ctaBox: {
    background: "#FAF7FF",
    border: "1.5px solid #C9B8E8",
    borderRadius: 16,
    padding: "clamp(24px, 4vw, 36px)",
    textAlign: "center",
  },
  ctaTitle: {
    fontSize: "clamp(19px, 3vw, 23px)",
    fontWeight: 700,
    color: PURPLE,
    fontFamily: "Georgia, serif",
    margin: "0 0 10px",
  },
  ctaBody: {
    fontSize: 15,
    color: "#444",
    lineHeight: 1.7,
    margin: "0 0 22px",
  },
  ctaButtons: {
    display: "flex",
    gap: 12,
    justifyContent: "center",
    flexWrap: "wrap",
  },
  ctaPrimary: {
    padding: "14px 28px",
    fontSize: 15,
    fontWeight: 600,
    fontFamily: "sans-serif",
    background: PURPLE,
    color: "#fff",
    borderRadius: 10,
    textDecoration: "none",
  },
  ctaSecondary: {
    padding: "14px 28px",
    fontSize: 15,
    fontWeight: 600,
    fontFamily: "sans-serif",
    background: "#fff",
    color: PURPLE,
    border: `1.5px solid ${PURPLE}`,
    borderRadius: 10,
    textDecoration: "none",
  },
};
