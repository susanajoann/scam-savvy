// ─────────────────────────────────────────────────────────────────────────────
// App.jsx
// Root component with nav bar, routing, and audio controls.
// Audio state lives here so the 🔊 button can sit in the NavBar permanently.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useRef, useEffect } from "react";
import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import HomeScreen from "./homeScreen";
import QuizScreen from "./quizScreen";
import AnalyticsPage from "./AnalyticsPage";
import FeedbackPage from "./Feedbackpage";
import SignupPage from "./SignupPage";
import ConfirmPage from "./ConfirmPage";
import UnsubscribePage from "./UnsubscribePage";
import PhishingFeedbackPage from "./PhishingFeedbackPage";
import { speak as ttsSpeak, stop as ttsStop, preloadTTS } from "./ttsEngine";

// ─── Audio state helpers ──────────────────────────────────────────────────────

const SPEECH_SPEEDS = [
  { label: "Slow", rate: 0.85 },
  { label: "Normal", rate: 1.0 },
  { label: "Fast", rate: 1.15 },
];
const SPEECH_SPEED_KEY = "scamshield_speech_speed";
const AUTO_READ_KEY = "scamshield_auto_read";

function getSpeechRate() {
  try {
    const s = localStorage.getItem(SPEECH_SPEED_KEY);
    return s ? parseFloat(s) : 1.0;
  } catch {
    return 1.0;
  }
}
function saveSpeechRate(rate) {
  try {
    localStorage.setItem(SPEECH_SPEED_KEY, String(rate));
  } catch {}
}
function getAutoRead() {
  try {
    return localStorage.getItem(AUTO_READ_KEY) === "true";
  } catch {
    return false;
  }
}
function saveAutoRead(value) {
  try {
    localStorage.setItem(AUTO_READ_KEY, value ? "true" : "false");
  } catch {}
}

// ─── Nav bar ──────────────────────────────────────────────────────────────────

// Global speak function used by the NavBar's manual 🔊 button. Toggles —
// clicking again while it's speaking the same script stops it.
// Powered by OpenAI's TTS API via a serverless function (src/ttsEngine.js)
// instead of window.speechSynthesis — same external contract
// (speak/stop/toggle), just a more natural voice.
let _navLastText = "";
let _navSpeaking = false;

function navSpeak(text, onDone) {
  // Toggle off if already speaking the same script
  if (_navSpeaking && _navLastText === text) {
    ttsStop();
    _navSpeaking = false;
    _navLastText = "";
    onDone?.();
    return false; // now stopped
  }
  ttsStop();
  _navLastText = text;
  _navSpeaking = true;
  const rate = getSpeechRate();
  ttsSpeak(text, {
    rate,
    onDone: () => {
      _navSpeaking = false;
      onDone?.();
    },
  });
  return true; // now speaking
}

// Dedicated entry point for Auto-read — deliberately NOT a toggle.
//
// The bug this fixes: Auto-read's effect can fire twice in quick
// succession for the same screen (observed in testing — React re-running
// an effect, StrictMode, or just two renders close together). With the
// shared navSpeak() above, the second call would see "already speaking
// this exact text" and interpret that as a manual click-to-stop,
// cancelling the request before its network response even arrived —
// which is exactly why the network tab showed a successful 200 while the
// console showed no play() attempt at all: the request was already
// marked stopped by the time the audio came back.
//
// This version simply no-ops if the identical text is already playing or
// in flight, and only restarts when the text actually differs — there's
// no "click again to stop" concept for something the user didn't click.
function navAutoSpeak(text, onDone) {
  console.log(
    `[navAutoSpeak] called with (${text.length} chars):`,
    JSON.stringify(text),
  );
  if (_navSpeaking && _navLastText === text) {
    console.log(`[navAutoSpeak] deduped — already speaking this exact text`);
    return true; // already speaking (or fetching) this exact script — leave it alone
  }
  ttsStop();
  _navLastText = text;
  _navSpeaking = true;
  const rate = getSpeechRate();
  ttsSpeak(text, {
    rate,
    onDone: () => {
      _navSpeaking = false;
      onDone?.();
    },
  });
  return true;
}

// Used when turning Auto-read off — unlike navSpeak's toggle behavior,
// this unconditionally stops and resets state, regardless of what's
// currently playing or who started it.
function navStopAll() {
  ttsStop();
  _navSpeaking = false;
  _navLastText = "";
}

function NavBar({
  onLogoClick,
  autoRead,
  setAutoRead,
  readScriptRef,
  scriptVersion,
}) {
  const [audioOpen, setAudioOpen] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleAutoReadToggle = () => {
    const next = !autoRead;
    setAutoRead(next);
    saveAutoRead(next);
  };

  const handleSpeakBtn = () => {
    const script = readScriptRef?.current?.();
    if (!script) return;
    const nowSpeaking = navSpeak(script, () => setIsSpeaking(false));
    setIsSpeaking(nowSpeaking);
  };

  // Auto-read: fires whenever any page calls readScriptRef.announce() (see
  // createReadScriptRef below) while the toggle is on. Only genuine
  // content changes call .announce() — minor in-screen selections use the
  // silent .current = instead, so they don't interrupt narration that's
  // already in progress.
  useEffect(() => {
    if (!autoRead) {
      if (isSpeaking) {
        navStopAll();
        setIsSpeaking(false);
      }
      return;
    }
    const script = readScriptRef?.current?.();
    console.log(
      `[navbar] auto-read effect read script (${script?.length ?? 0} chars):`,
      JSON.stringify(script),
    );
    if (!script) return;
    const nowSpeaking = navAutoSpeak(script, () => setIsSpeaking(false));
    setIsSpeaking(nowSpeaking);
    // Intentionally re-runs on every scriptVersion bump, not on isSpeaking —
    // isSpeaking here is a *result* of this effect, not a trigger for it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scriptVersion, autoRead]);

  return (
    <nav
      style={{
        width: "100%",
        maxWidth: "100vw",
        boxSizing: "border-box",
        background: "#fff",
        borderBottom: "2px solid #E8E0F5",
        padding: "0 clamp(12px, 4vw, 48px)",
        display: "flex",
        alignItems: "center",
        gap: 0,
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}
    >
      {/* Logo */}
      <NavLink
        to='/'
        onClick={() => onLogoClick?.()}
        style={{
          textDecoration: "none",
          marginRight: "auto",
          padding: "12px 0",
          display: "flex",
          flexDirection: "column",
          gap: 3,
          minWidth: 0,
          overflow: "hidden",
        }}
      >
        {/* SS on mobile, full wordmark on desktop — controlled by CSS classes */}
        <style>{`
          .logo-full { display: inline; }
          .logo-short { display: none; }
          @media (max-width: 500px) {
            .logo-full { display: none; }
            .logo-short { display: inline; }
          }
        `}</style>
        <span
          className='logo-full'
          style={{
            fontWeight: 700,
            fontFamily: "Georgia, serif",
            letterSpacing: "-0.5px",
            lineHeight: 1,
            fontSize: 26,
            whiteSpace: "nowrap",
          }}
        >
          <span style={{ color: "#3D1580" }}>Scam</span>
          <span style={{ color: "#C8952A" }}>Savvy</span>
        </span>
        <span
          className='logo-short'
          style={{
            fontWeight: 700,
            fontFamily: "Georgia, serif",
            letterSpacing: "-1px",
            lineHeight: 1,
            fontSize: 24,
          }}
        >
          <span style={{ color: "#3D1580" }}>S</span>
          <span style={{ color: "#C8952A" }}>S</span>
        </span>
        <style>{`.tagline-nav { display: none; } @media (min-width: 501px) { .tagline-nav { display: inline; font-size: 11px; color: #7A5FAA; font-family: sans-serif; letter-spacing: 1.5px; line-height: 1; white-space: nowrap; } }`}</style>
        <span className='tagline-nav'>KNOW THE SCAM BEFORE IT KNOWS YOU</span>
      </NavLink>

      {/* Quiz tab */}
      <NavLink
        to='/'
        end
        style={({ isActive }) => ({
          padding: "16px clamp(8px, 2.5vw, 20px)",
          fontSize: "clamp(13px, 3vw, 16px)",
          fontFamily: "sans-serif",
          fontWeight: 600,
          color: isActive ? "#3D1580" : "#7A5FAA",
          textDecoration: "none",
          borderBottom: isActive
            ? "3px solid #3D1580"
            : "3px solid transparent",
          transition: "color 0.15s, border-color 0.15s",
          whiteSpace: "nowrap",
        })}
      >
        Quiz
      </NavLink>

      {/* Analytics tab */}
      <NavLink
        to='/analytics'
        style={({ isActive }) => ({
          padding: "16px clamp(8px, 2.5vw, 20px)",
          fontSize: "clamp(13px, 3vw, 16px)",
          fontFamily: "sans-serif",
          fontWeight: 600,
          color: isActive ? "#3D1580" : "#7A5FAA",
          textDecoration: "none",
          borderBottom: isActive
            ? "3px solid #C8952A"
            : "3px solid transparent",
          transition: "color 0.15s, border-color 0.15s",
          whiteSpace: "nowrap",
        })}
      >
        Research Data
      </NavLink>

      {/* Feedback tab */}
      <NavLink
        to='/feedback'
        style={({ isActive }) => ({
          padding: "16px clamp(8px, 2.5vw, 20px)",
          fontSize: "clamp(13px, 3vw, 16px)",
          fontFamily: "sans-serif",
          fontWeight: 600,
          color: isActive ? "#3D1580" : "#7A5FAA",
          textDecoration: "none",
          borderBottom: isActive
            ? "3px solid #3D1580"
            : "3px solid transparent",
          transition: "color 0.15s, border-color 0.15s",
          whiteSpace: "nowrap",
        })}
      >
        Feedback
      </NavLink>

      <NavLink
        to='/signup'
        style={({ isActive }) => ({
          padding: "16px clamp(8px, 2.5vw, 20px)",
          fontSize: "clamp(13px, 3vw, 16px)",
          fontFamily: "sans-serif",
          fontWeight: 600,
          color: isActive ? "#3D1580" : "#7A5FAA",
          textDecoration: "none",
          borderBottom: isActive
            ? "3px solid #C8952A"
            : "3px solid transparent",
          transition: "color 0.15s, border-color 0.15s",
          whiteSpace: "nowrap",
        })}
      >
        Email Sign-Up
      </NavLink>

      {/* Audio controls — 🔊 button reads/stops, ▾ opens auto-read dropdown */}
      <div
        style={{
          position: "relative",
          marginLeft: "clamp(6px, 2vw, 12px)",
          display: "flex",
          alignItems: "center",
        }}
      >
        {/* Unified audio button group — both buttons share identical sizing */}
        <button
          onClick={handleSpeakBtn}
          onMouseEnter={preloadTTS}
          style={{
            background: isSpeaking ? "#EDE8F8" : "#fff",
            border: "1.5px solid #C9B8E8",
            borderRadius: "8px 0 0 8px",
            borderRight: "none",
            width: 40,
            height: 36,
            fontSize: 16,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "background 0.15s",
            padding: 0,
          }}
          title={isSpeaking ? "Stop reading" : "Read page aloud"}
          aria-label={isSpeaking ? "Stop reading" : "Read page aloud"}
        >
          {isSpeaking ? "⏹" : "🔊"}
        </button>
        <button
          onClick={() => setAudioOpen((o) => !o)}
          style={{
            background: audioOpen ? "#EDE8F8" : "#fff",
            border: "1.5px solid #C9B8E8",
            borderRadius: "0 8px 8px 0",
            width: 24,
            height: 36,
            fontSize: 11,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#7A5FAA",
            transition: "background 0.15s",
            padding: 0,
          }}
          title='Audio settings'
          aria-label='Audio settings'
        >
          ▾
        </button>

        {/* Dropdown — auto-read only */}
        {audioOpen && (
          <div
            style={{
              position: "absolute",
              top: "calc(100% + 8px)",
              right: 0,
              background: "#fff",
              border: "1.5px solid #C9B8E8",
              borderRadius: 12,
              padding: "14px 16px",
              zIndex: 200,
              width: "min(200px, calc(100vw - 24px))",
              boxShadow: "0 4px 20px rgba(61,21,128,0.15)",
            }}
          >
            <button
              onClick={handleAutoReadToggle}
              style={{
                width: "100%",
                padding: "10px 14px",
                fontSize: 14,
                fontWeight: 600,
                border: "1.5px solid #2D6A4F",
                borderRadius: 8,
                cursor: "pointer",
                fontFamily: "sans-serif",
                background: autoRead ? "#2D6A4F" : "#fff",
                color: autoRead ? "#fff" : "#2D6A4F",
                transition: "background 0.15s",
                textAlign: "left",
              }}
            >
              {autoRead ? "✓ Auto-read ON" : "Auto-read OFF"}
            </button>
            <p
              style={{
                fontSize: 12,
                color: "#999",
                margin: "8px 0 0",
                fontFamily: "sans-serif",
                lineHeight: 1.4,
              }}
            >
              When on, each new screen is read aloud automatically.
            </p>
          </div>
        )}
      </div>
    </nav>
  );
}

// ─── Quiz flow ────────────────────────────────────────────────────────────────

function QuizFlow({ resetRef, readScriptRef }) {
  const [screen, setScreen] = useState("home");
  const [quizProps, setQuizProps] = useState(null);

  const goHome = () => {
    setQuizProps(null);
    setScreen("home");
  };
  if (resetRef) resetRef.current = goHome;

  const handleStart = (
    difficulty,
    shuffledScams,
    ageRange,
    sessionId,
    startedAt,
  ) => {
    setQuizProps({ difficulty, shuffledScams, ageRange, sessionId, startedAt });
    setScreen("quiz");
  };

  if (screen === "home")
    return <HomeScreen onStart={handleStart} readScriptRef={readScriptRef} />;

  if (screen === "quiz" && quizProps) {
    return (
      <QuizScreen
        difficulty={quizProps.difficulty}
        scams={quizProps.shuffledScams}
        ageRange={quizProps.ageRange}
        sessionId={quizProps.sessionId}
        startedAt={quizProps.startedAt}
        onPlayAgain={goHome}
        onHome={goHome}
        readScriptRef={readScriptRef}
      />
    );
  }
  return null;
}

// ─── Root app ─────────────────────────────────────────────────────────────────

// A drop-in replacement for useRef() with one addition: alongside the usual
// .current getter/setter (silent — used for the manual 🔊 button, which
// should always read whatever's most current when clicked), it exposes
// .announce(fn), which pages call explicitly when the visible content has
// genuinely changed in a way worth Auto-read re-triggering for — a new
// screen, a new quiz question, a submitted form swapping to a result card.
//
// The split matters: earlier, ANY assignment to .current triggered
// Auto-read, including minor in-screen updates (e.g. clicking a difficulty
// button just highlights a selection — it doesn't change what screen
// you're on) — which caused Auto-read to interrupt itself constantly.
// Pages still keep .current always fresh for on-demand reads; they just
// call .announce() only at the moments that should actually restart
// narration.
function createReadScriptRef(onAnnounce) {
  let fn = () => "";
  return {
    get current() {
      return fn;
    },
    set current(value) {
      fn = value; // silent — doesn't trigger Auto-read
    },
    announce(value) {
      fn = value;
      onAnnounce?.();
    },
  };
}

export default function App() {
  const quizResetRef = useRef(null);
  const [autoRead, setAutoRead] = useState(getAutoRead);
  const [scriptVersion, setScriptVersion] = useState(0);

  // Lazily created once and held in a ref so its identity — and the script
  // function stored inside it — survives the re-renders that scriptVersion
  // updates themselves cause.
  const readScriptRefHolder = useRef(null);
  if (!readScriptRefHolder.current) {
    readScriptRefHolder.current = createReadScriptRef(() =>
      setScriptVersion((v) => v + 1),
    );
  }
  const readScriptRef = readScriptRefHolder.current;

  return (
    <BrowserRouter>
      <NavBar
        onLogoClick={() => quizResetRef.current?.()}
        autoRead={autoRead}
        setAutoRead={setAutoRead}
        readScriptRef={readScriptRef}
        scriptVersion={scriptVersion}
      />
      <Routes>
        <Route
          path='/'
          element={
            <QuizFlow resetRef={quizResetRef} readScriptRef={readScriptRef} />
          }
        />
        <Route
          path='/analytics'
          element={<AnalyticsPage readScriptRef={readScriptRef} />}
        />
        <Route
          path='/feedback'
          element={<FeedbackPage readScriptRef={readScriptRef} />}
        />
        <Route
          path='/signup'
          element={<SignupPage readScriptRef={readScriptRef} />}
        />
        <Route
          path='/confirm'
          element={<ConfirmPage readScriptRef={readScriptRef} />}
        />
        <Route
          path='/unsubscribe'
          element={<UnsubscribePage readScriptRef={readScriptRef} />}
        />
        <Route
          path='/phishing-feedback'
          element={<PhishingFeedbackPage readScriptRef={readScriptRef} />}
        />
      </Routes>
    </BrowserRouter>
  );
}
