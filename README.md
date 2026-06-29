# ScamSavvy

**Know the scam before it knows you.**

ScamSavvy is an interactive web quiz designed to help older adults recognise the most common online and phone scams targeting them. It collects anonymous research data to help understand which scam tactics are hardest to identify — and for whom.

---

## What it does

Users take a short quiz covering five common scam categories, drawn from FBI IC3 data:

- **Phishing & Spoofing** — fake emails, texts, and calls impersonating trusted organisations
- **Tech Support Scams** — fake virus warnings and remote access fraud
- **Investment Fraud** — cryptocurrency and Ponzi scheme deception
- **Romance & Confidence Scams** — manufactured relationships leading to financial requests
- **Government Impersonation** — fake IRS, SSA, Medicare, and law enforcement calls

Three difficulty levels are available:

| Difficulty | Format |
|---|---|
| Easy | Multiple choice — pick the safe action |
| Medium | Multiple choice — identify the scam tactic |
| Hard | Highlight red flags in a realistic email or phone transcript |

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + Vite 8 |
| Routing | React Router v7 |
| Charts | Recharts |
| Backend / DB | Supabase (Postgres + Edge Functions) |
| Email | Resend |
| Hosting | Vercel |

---

## Project structure

```
src/
├── App.jsx               # Root component, nav bar, routing, audio controls
├── homeScreen.jsx        # Landing page and difficulty selector
├── quizScreen.jsx        # Quiz engine (easy, medium, hard modes + results)
├── scamData.js           # All quiz questions, scenarios, and explanations
├── analytics.js          # Supabase data recording (sessions + answers)
├── AnalyticsPage.jsx     # Research dashboard with live charts
├── FeedbackPage.jsx      # Anonymous feedback form
├── SignupPage.jsx        # Email simulation programme sign-up
├── ConfirmPage.jsx       # Email confirmation handler
└── UnsubscribePage.jsx   # Unsubscribe handler

supabase/
├── config.toml
└── functions/
    ├── send-confirmation/    # Sends confirmation email on sign-up
    └── send-feedback-alert/  # Alerts admin when feedback is submitted
```

---

## Supabase database tables

### `sessions`
Tracks each quiz attempt.

| Column | Type | Notes |
|---|---|---|
| session_id | uuid | Primary key, generated client-side |
| age_range | text | e.g. `65–74` |
| difficulty | text | `easy` / `medium` / `hard` |
| completed | boolean | Set to true when the final question is answered |
| total_time | integer | Seconds from first question to last |
| started_at | timestamptz | |
| finished_at | timestamptz | |

### `answers`
One row per question answered.

| Column | Type | Notes |
|---|---|---|
| session_id | uuid | Foreign key to sessions |
| scam_id | text | e.g. `phishing`, `techsupport` |
| question_id | text | e.g. `ph-e1` |
| age_range | text | Copied from session |
| difficulty | text | |
| correct | boolean | |
| time_taken | integer | Seconds |
| flags_correct | integer | Hard mode only — red flags correctly identified |
| flags_missed | integer | Hard mode only |
| false_positives | integer | Hard mode only |

### `subscribers`
Email simulation programme sign-ups.

| Column | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| email | text | Unique |
| confirmed | boolean | Set true when confirmation link is clicked |
| confirmed_at | timestamptz | |
| consent_given | boolean | |
| unsubscribed | boolean | |
| unsubscribed_at | timestamptz | |

### `feedback`
Anonymous feedback messages.

| Column | Type | Notes |
|---|---|---|
| id | uuid | |
| message | text | |
| created_at | timestamptz | |

---

## Supabase RLS policies required

Run this in the Supabase SQL editor before deploying:

```sql
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE answers  ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;

-- Sessions
CREATE POLICY "Allow anonymous inserts" ON sessions
  AS PERMISSIVE FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow anonymous updates" ON sessions
  AS PERMISSIVE FOR UPDATE TO anon USING (true) WITH CHECK (true);

-- Answers
CREATE POLICY "Allow anonymous inserts" ON answers
  AS PERMISSIVE FOR INSERT TO anon WITH CHECK (true);

-- Feedback
CREATE POLICY "Allow anonymous inserts" ON feedback
  AS PERMISSIVE FOR INSERT TO anon WITH CHECK (true);

-- Subscribers
CREATE POLICY "Allow anonymous inserts" ON subscribers
  AS PERMISSIVE FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow anonymous updates" ON subscribers
  AS PERMISSIVE FOR UPDATE TO anon USING (true) WITH CHECK (true);

-- Analytics read access (for the Research Data page)
CREATE POLICY "Allow anonymous reads" ON sessions
  AS PERMISSIVE FOR SELECT TO anon USING (true);

CREATE POLICY "Allow anonymous reads" ON answers
  AS PERMISSIVE FOR SELECT TO anon USING (true);
```

---

## Environment variables

Create a `.env` file at the project root (never commit this):

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

For Supabase Edge Functions, set these secrets via the Supabase dashboard or CLI:

```
RESEND_API_KEY=re_...
```

---

## Getting started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

Deploy to Vercel by connecting the repository. The `vercel.json` file at the project root handles SPA routing.

---

## Edge functions

Both Edge Functions are deployed to Supabase and triggered from the frontend. They use [Resend](https://resend.com) to send transactional email.

| Function | Trigger | Purpose |
|---|---|---|
| `send-confirmation` | Sign-up form submission | Sends a confirmation link to the subscriber |
| `send-feedback-alert` | Feedback form submission | Notifies the admin of new feedback |

Both functions have `verify_jwt = false` so they can be called by unauthenticated users.

To deploy:

```bash
supabase functions deploy send-confirmation
supabase functions deploy send-feedback-alert
```

---

## Accessibility features

- **Read aloud** — every screen has a script registered with the nav bar's 🔊 button, which reads the page content using the Web Speech API
- **Auto-read** — optionally reads each new screen automatically
- **Large text and tap targets** — sized for older users via `clamp()` throughout
- **Printable results** — the results screen generates a formatted print page with all questions, correct answers, and explanations

---

## Keeping Supabase active

A GitHub Actions workflow (`.github/workflows/keep-supabase-alive.yml`) pings the Supabase REST API every 6 days to prevent the free-tier project from pausing. Set the following repository secrets:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

---

## Privacy

All quiz data is anonymous. No names, email addresses, or identifying information are collected during the quiz. Age range is collected solely to support research into which demographics find particular scam types most difficult. The email simulation programme collects email addresses only with explicit consent, stored securely in Supabase, and never shared with third parties.

---

## Licence

MIT
