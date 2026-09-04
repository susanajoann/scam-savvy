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

| Difficulty | Format                                                       |
| ---------- | ------------------------------------------------------------ |
| Easy       | Multiple choice — pick the safe action                       |
| Medium     | Multiple choice — identify the scam tactic                   |
| Hard       | Highlight red flags in a realistic email or phone transcript |

---

## Tech stack

| Layer          | Technology                                                                   |
| -------------- | ---------------------------------------------------------------------------- |
| Frontend       | React 19 + Vite 8                                                            |
| Routing        | React Router v7                                                              |
| Charts         | Recharts, with pan/zoom via `react-zoom-pan-pinch` on the research dashboard |
| Text-to-speech | OpenAI TTS API, called from a Vercel serverless function                     |
| Backend / DB   | Supabase (Postgres + Edge Functions)                                         |
| Email          | Resend                                                                       |
| Hosting        | Vercel                                                                       |

---

## Project structure

```
src/
├── App.jsx                    # Root component, nav bar, routing, Auto-read wiring
├── homeScreen.jsx              # Landing page and difficulty selector
├── quizScreen.jsx               # Quiz engine (easy, medium, hard modes + results)
├── scamData.js                  # All quiz questions, scenarios, and explanations
├── analytics.js                 # Supabase data recording (sessions + answers)
├── AnalyticsPage.jsx             # Research dashboard — live charts, pan/zoom, legend isolation
├── PanZoomChart.jsx              # Reusable pan/zoom wrapper around any chart (react-zoom-pan-pinch)
├── ttsEngine.js                  # Read-aloud engine — calls /api/tts, handles chunking & playback
├── readPageContent.js            # Live DOM-read narration for simple/static pages
├── Feedbackpage.jsx               # Anonymous feedback form
├── SignupPage.jsx                  # Email simulation programme sign-up
├── ConfirmPage.jsx                  # Email confirmation handler
├── UnsubscribePage.jsx               # Unsubscribe handler
├── PhishingFeedbackPage.jsx            # Landing page after a phishing test click/report
└── phishingTemplates.js                # Phishing email templates (frontend copy, for explanations)

api/                              # Vercel serverless functions
├── tts.js                          # OpenAI TTS proxy, rate-limited per IP/day
├── log-click.js                     # Click tracking for simulated_sends (personal test table)
├── log-phishing-click.js             # Click tracking for the real phishing_emails table
└── log-phishing-report.js             # "Report phishing" tracking for phishing_emails

supabase/
├── config.toml
├── migrations/                       # SQL run manually via the Supabase SQL editor
└── functions/
    ├── send-confirmation/               # Sends confirmation email on sign-up
    ├── send-feedback-alert/              # Alerts admin when feedback is submitted
    ├── send-phishing-test-batch/          # REAL automated phishing send — daily cron
    │   ├── templates.ts                     # Phishing email templates (server copy)
    │   └── emailLayout.ts                    # Shared Outlook-style banner + report button HTML
    ├── test-send-phishing/                 # Manual test send — preview in your own inbox
    ├── generate-monthly-summaries/          # REAL automated monthly aggregation + send — monthly cron
    │   └── summaryEmailLayout.ts              # Shared summary email HTML
    └── test-send-summary/                  # Manual test send of a summary email
```

---

## Supabase database tables

### `sessions`

Tracks each quiz attempt.

| Column      | Type        | Notes                                           |
| ----------- | ----------- | ----------------------------------------------- |
| session_id  | uuid        | Primary key, generated client-side              |
| age_range   | text        | e.g. `65–74`                                    |
| difficulty  | text        | `easy` / `medium` / `hard`                      |
| completed   | boolean     | Set to true when the final question is answered |
| total_time  | integer     | Seconds from first question to last             |
| started_at  | timestamptz |                                                 |
| finished_at | timestamptz |                                                 |

### `answers`

One row per question answered.

| Column          | Type    | Notes                                           |
| --------------- | ------- | ----------------------------------------------- |
| session_id      | uuid    | Foreign key to sessions                         |
| scam_id         | text    | e.g. `phishing`, `techsupport`                  |
| question_id     | text    | e.g. `ph-e1`                                    |
| age_range       | text    | Copied from session                             |
| difficulty      | text    |                                                 |
| correct         | boolean |                                                 |
| time_taken      | integer | Seconds                                         |
| flags_correct   | integer | Hard mode only — red flags correctly identified |
| flags_missed    | integer | Hard mode only                                  |
| false_positives | integer | Hard mode only                                  |

### `subscribers`

Email simulation programme sign-ups.

| Column          | Type        | Notes                                      |
| --------------- | ----------- | ------------------------------------------ |
| id              | uuid        | Primary key                                |
| email           | text        | Unique                                     |
| confirmed       | boolean     | Set true when confirmation link is clicked |
| confirmed_at    | timestamptz |                                            |
| consent_given   | boolean     |                                            |
| unsubscribed    | boolean     |                                            |
| unsubscribed_at | timestamptz |                                            |

### `feedback`

Anonymous feedback messages.

| Column     | Type        | Notes |
| ---------- | ----------- | ----- |
| id         | uuid        |       |
| message    | text        |       |
| created_at | timestamptz |       |

### `phishing_emails`

One row per real simulated phishing email sent to a subscriber. This is the production log table — see [Phishing simulation programme](#phishing-simulation-programme) below.

| Column        | Type        | Notes                                                             |
| ------------- | ----------- | ----------------------------------------------------------------- |
| id            | uuid        | Primary key                                                       |
| subscriber_id | uuid        | Foreign key to subscribers                                        |
| template_id   | text        | Which template was sent                                           |
| token         | uuid        | Unique per email; identifies the row for click/report tracking    |
| sent_at       | timestamptz |                                                                   |
| clicked       | boolean     | Set true if the subscriber clicked the tracked link               |
| clicked_at    | timestamptz |                                                                   |
| reported      | boolean     | Set true if the subscriber clicked "Report phishing" instead      |
| reported_at   | timestamptz |                                                                   |
| month         | text        | `YYYY-MM`, used for the monthly cap check and summary aggregation |

### `monthly_summaries`

One row per subscriber per month, generated automatically from `phishing_emails`.

| Column        | Type      | Notes                                                                                                                                                                                |
| ------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| id            | uuid      |                                                                                                                                                                                      |
| subscriber_id | uuid      |                                                                                                                                                                                      |
| month         | text      | `YYYY-MM`                                                                                                                                                                            |
| emails_sent   | int4      |                                                                                                                                                                                      |
| clicked       | int4      |                                                                                                                                                                                      |
| reported      | int4      |                                                                                                                                                                                      |
| score_pct     | int4      | `reported ÷ (reported + clicked)`, as a percentage. Emails neither clicked nor reported don't count toward this. Defaults to 100 if nothing was ever clicked or reported that month. |
| sent_at       | timestamp | When the summary email was actually sent                                                                                                                                             |

> **`simulated_sends`** also still exists in the database — it's a personal testing table (used by `test-send-phishing`, never by the real batch sender) and isn't part of the production schema described here.

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

`phishing_emails` and `monthly_summaries` are never queried from the frontend — only from Supabase Edge Functions and Vercel API routes using the service role key, which bypasses RLS entirely. Enable RLS on them anyway with no permissive policies, as defense-in-depth in case the anon key is ever accidentally used against them:

```sql
ALTER TABLE phishing_emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_summaries ENABLE ROW LEVEL SECURITY;
```

---

## Environment variables

Create a `.env` file at the project root (never commit this):

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

For Vercel (server-only — no `VITE_` prefix, never exposed to the client), set these in the project's Environment Variables settings, scoped to Production, Preview, **and** Development (a variable missing from Preview specifically caused a real deploy failure once — worth double-checking all three are ticked):

```
OPENAI_API_KEY=sk-...
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=...
```

For Supabase Edge Functions, set these secrets via the Supabase dashboard or CLI:

```
RESEND_API_KEY=re_...
CRON_SECRET=...
```

`CRON_SECRET` is a value you generate yourself (e.g. `openssl rand -hex 32`) — it's what GitHub Actions sends in the `x-cron-secret` header so the scheduled functions know a request is genuinely from your own cron, not a stranger hitting the public URL. The same value needs to match in **both** Supabase's secrets and your GitHub repo's Actions secrets.

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

All Edge Functions are deployed to Supabase and use [Resend](https://resend.com) to send transactional email. Every one of them needs `--no-verify-jwt` at deploy time — Supabase's platform-level JWT gateway will otherwise reject requests before your function's own auth check (the `x-cron-secret` header) ever runs, even with `verify_jwt = false` set in `config.toml`.

| Function                     | Trigger                                         | Purpose                                                                                                                                                                                                                                     |
| ---------------------------- | ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `send-confirmation`          | Sign-up form submission                         | Sends a confirmation link, including whitelisting instructions for the noreply address                                                                                                                                                      |
| `send-feedback-alert`        | Feedback form submission                        | Notifies the admin of new feedback                                                                                                                                                                                                          |
| `send-phishing-test-batch`   | Daily cron (GitHub Actions)                     | **Real** phishing simulation sender — picks eligible subscribers, sends up to 4/month per person, logs to `phishing_emails`                                                                                                                 |
| `test-send-phishing`         | Manual (curl)                                   | Sends a single test phishing email to any address you specify, without touching real subscriber data — logs to `simulated_sends` instead                                                                                                    |
| `generate-monthly-summaries` | Monthly cron, 1st of the month (GitHub Actions) | **Real** — aggregates last month's `phishing_emails` into `monthly_summaries` and sends each subscriber their real summary email. Supports `{"email": "...", "month": "...", "dryRun": true}` for scoped/manual testing without a real send |
| `test-send-summary`          | Manual (curl)                                   | Sends a test summary email for one subscriber (requires a `monthly_summaries` row to already exist for them)                                                                                                                                |

To deploy any of them:

```bash
supabase functions deploy send-confirmation --no-verify-jwt
supabase functions deploy send-feedback-alert --no-verify-jwt
supabase functions deploy send-phishing-test-batch --no-verify-jwt
supabase functions deploy test-send-phishing --no-verify-jwt
supabase functions deploy generate-monthly-summaries --no-verify-jwt
supabase functions deploy test-send-summary --no-verify-jwt
```

Two GitHub Actions workflows trigger the real, automated functions on a schedule:

- `.github/workflows/send-phishing-batch-daily.yml` — daily at 3pm UTC
- `.github/workflows/generate-monthly-summaries.yml` — 6am UTC on the 1st of each month

Both need `SUPABASE_URL` and `CRON_SECRET` set as GitHub repo secrets (Settings → Secrets and variables → Actions), matching the same values configured in Supabase.

---

## Accessibility features

- **Read aloud** — every screen registers a script with the nav bar's 🔊 button. Narration is generated by OpenAI's TTS API (`gpt-4o-mini-tts`) via a rate-limited Vercel serverless function (`api/tts.js`), not the browser's built-in voice — HomeScreen/QuizScreen/AnalyticsPage use hand-curated scripts that capture live state (selections, quiz progress); the simpler status pages read whatever's actually rendered on screen via `readPageContent.js`, so their narration can't drift out of sync with what's visible.
- **Auto-read** — genuinely wired, not just a toggle: turning it on speaks the current screen immediately and automatically re-announces on real content changes (a new quiz question, a submitted form's result). Minor in-screen selections (picking an age range, a difficulty) update the manual button's script but deliberately don't interrupt Auto-read narration already in progress.
- **Large text and tap targets** — sized for older users via `clamp()` throughout
- **Printable results** — the results screen generates a formatted print page with all questions, correct answers, and explanations

The research dashboard's scatter plot supports scroll/pinch-to-zoom and drag-to-pan (via `react-zoom-pan-pinch`), plus click-to-isolate on either legend (difficulty or age range) — click an entry to filter to just that group, click again to restore everything.

---

## Phishing simulation programme

Confirmed subscribers receive up to 4 simulated phishing test emails per month (spread randomly across the month, not on a fixed schedule) plus one summary email at the start of each following month.

**Each test email includes:**

- A realistic phishing scenario (fake USPS delivery, bank alert, Amazon order, etc.) drawn from `templates.ts`
- An Outlook-style safety banner ("This sender could not be verified") with a **Report phishing** button, styled to resemble Outlook's own safety UI — built with table-based HTML and inline styles throughout, since Outlook desktop's rendering engine (Word's layout engine) ignores modern CSS
- A tracked link that, if clicked, logs `clicked`/`clicked_at` on the corresponding `phishing_emails` row and redirects to a neutral "this was a test" explanation page
- A tracked Report button that instead logs `reported`/`reported_at` and redirects to a distinctly positive "nice catch" page

All simulation emails — including the tests themselves — send from the same address (`noreply@scam-savvy.org`), rather than each template's fake sender identity. That's a deliberate trade-off: it means subscribers can't practice spotting a spoofed _sender_ address specifically, but it makes "whitelist this one address" (covered in the confirmation email) actually solve deliverability, rather than asking subscribers to whitelist a different fake domain every time.

**Monthly summary:** on the 1st of each month, `generate-monthly-summaries` aggregates the previous month's data per subscriber and emails them their stats — emails sent, clicked, reported, and a score (`reported ÷ (reported + clicked)`, as a percentage — ignoring emails they neither clicked nor reported).

**Manual testing tools**, both hitting your own inbox rather than real subscribers:

```bash
# Preview a phishing test email (random template, or specify one)
curl -X POST "$SUPABASE_URL/functions/v1/test-send-phishing" \
  -H "x-cron-secret: $CRON_SECRET" -H "Content-Type: application/json" \
  -d '{"email": "you@example.com"}'

# Preview a summary email (requires generate-monthly-summaries to have run
# for that email + month first — pass "dryRun": true there to only populate
# the table without sending a real summary to anyone)
curl -X POST "$SUPABASE_URL/functions/v1/test-send-summary" \
  -H "x-cron-secret: $CRON_SECRET" -H "Content-Type: application/json" \
  -d '{"email": "you@example.com", "month": "2026-08"}'
```

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
