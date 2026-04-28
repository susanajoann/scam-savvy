// ─────────────────────────────────────────────────────────────────────────────
// analytics.js
//
// Handles all data collection for the Scam Shield research project.
// Sends anonymous session and answer data to a Supabase database.
//
// 3. Go to Project Settings → API and copy:
//      - Project URL  → paste as SUPABASE_URL below
//      - anon public key → paste as SUPABASE_ANON_KEY below
//
// 4. In Supabase go to Authentication → Policies and enable Row Level Security
//    on both tables, then add an INSERT policy allowing anonymous inserts:
//
//    Policy name : "Allow anonymous inserts"
//    Operation   : INSERT
//    Target roles: anon
//    Expression  : true
//
//    This lets the app write data without requiring user login,
//    while preventing anyone from reading or modifying existing rows
//    through the public API.
//

// ─── Configuration ────────────────────────────────────────────────────────────
// Replace these two values with your own Supabase project credentials.
// Do not commit real credentials to a public repository.
// In a production app, store these in environment variables:
//   VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY

const SUPABASE_URL      = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
// Base URL for the Supabase REST API.
// Supabase exposes each table at /rest/v1/<table_name>
const API_BASE = `${SUPABASE_URL}/rest/v1`;

// Headers required for every Supabase REST API request.
// apikey     — authenticates the request using the anon public key
// Authorization — same key used as a Bearer token
// Content-Type  — tells Supabase we are sending JSON
// Prefer        — "return=minimal" means Supabase returns no body on success,
//                 which keeps responses fast and avoids unnecessary data transfer
const BASE_HEADERS = {
  apikey: SUPABASE_ANON_KEY,
  Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
  "Content-Type": "application/json",
  Prefer: "return=minimal",
};

// ─── ID generation ────────────────────────────────────────────────────────────

// Generates a random UUID v4 string to uniquely identify each session.
// Uses the browser's built-in crypto API when available, with a
// Math.random() fallback for older browsers.
function generateUUID() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for older browsers
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// ─── Internal helper ──────────────────────────────────────────────────────────

// Sends a POST request to a Supabase table with the given row data.
// Returns true if the insert succeeded, false if it failed.
// Errors are logged to the console but never thrown — analytics failure
// should never interrupt the user's quiz experience.
async function insertRow(table, data) {
  try {
    const response = await fetch(`${API_BASE}/${table}`, {
      method: "POST",
      headers: BASE_HEADERS,
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      // Log the error details for debugging but do not surface to the user
      const text = await response.text();
      console.warn(`[analytics] Failed to insert into ${table}:`, response.status, text);
      return false;
    }
    return true;
  } catch (err) {
    // Network errors (offline, CORS, etc.) are caught here
    console.warn(`[analytics] Network error inserting into ${table}:`, err);
    return false;
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

// createSession
// ─────────────
// Called at the very start of a quiz session, before any questions are shown.
// Creates a row in the sessions table and returns the session_id so
// subsequent recordAnswer() and completeSession() calls can reference it.
//
// Parameters:
//   difficulty — "easy" | "medium" | "hard"
//   ageRange   — e.g. "65–69"
//
// Returns:
//   sessionId (string) — a UUID that identifies this session.
//   Store this in component state and pass it to recordAnswer() and
//   completeSession() throughout the quiz.
export async function createSession(difficulty, ageRange) {
  const sessionId = generateUUID();

  await insertRow("sessions", {
    session_id: sessionId,
    age_range:  ageRange,
    difficulty: difficulty,
    completed:  false,
    // total_time is intentionally omitted here — Supabase will store NULL.
    // It gets filled in by completeSession() if the user finishes.
  });

  return sessionId;
}

// recordAnswer
// ────────────
// Called after the user answers each question (multiple choice or hard mode).
// Inserts one row into the answers table.
//
// Parameters:
//   sessionId — the UUID returned by createSession()
//   answer    — object with the following fields:
//     scamId      (string)  — e.g. "phishing"
//     questionId  (string)  — e.g. "ph-e1"
//     ageRange    (string)  — e.g. "65–69"
//     difficulty  (string)  — "easy" | "medium" | "hard"
//     correct     (boolean) — whether the user answered correctly
//     timeTaken   (number)  — seconds the user spent on this question
export async function recordAnswer(sessionId, answer) {
  await insertRow("answers", {
    session_id:  sessionId,
    scam_id:     answer.scamId,
    question_id: answer.questionId,
    age_range:   answer.ageRange,
    difficulty:  answer.difficulty,
    correct:     answer.correct,
    time_taken:  answer.timeTaken,
  });
}

// completeSession
// ───────────────
// Called when the user answers the final question in the quiz.
// Updates the session row to mark it as completed and records the total time.
// If the user quits early this is never called, so completed stays false.
//
// Parameters:
//   sessionId — the UUID returned by createSession()
//   totalTime — total seconds from quiz start to final answer
export async function completeSession(sessionId, totalTime) {
  try {
    const response = await fetch(
      // Supabase REST API uses query params to filter which row to update.
      // ?session_id=eq.<id> means "update the row where session_id equals this value"
      `${API_BASE}/sessions?session_id=eq.${sessionId}`,
      {
        method: "PATCH",
        headers: BASE_HEADERS,
        body: JSON.stringify({
          completed:  true,
          total_time: totalTime,
        }),
      }
    );
    if (!response.ok) {
      const text = await response.text();
      console.warn("[analytics] Failed to complete session:", response.status, text);
    }
  } catch (err) {
    console.warn("[analytics] Network error completing session:", err);
  }
}