# Technical Architecture — DocBot AI

## 1. Tech Stack

| Layer | Technology | Justification |
|---|---|---|
| **Frontend** | React 18 + Vite | Component model suits a chat UI; Vite gives fast dev server with no config overhead |
| **Styling** | Plain CSS (CSS variables) | No build complexity; fully mobile-responsive without a framework |
| **Backend** | Node.js + Express | Lightweight HTTP server; sufficient for a single-endpoint API; easy Render deployment |
| **AI** | Claude API (`claude-haiku-4-5`) | Fast, low-cost, strong instruction-following for document-grounded Q&A |
| **PDF Parsing** | `pdf-parse` (npm) | Extracts raw text from PDF at server startup; no runtime re-parsing |
| **Environment** | `dotenv` | API key stored server-side only; never shipped to the frontend build |
| **Hosting — Frontend** | Vercel (free tier) | Zero-config React deployment; automatic HTTPS |
| **Hosting — Backend** | Render (free tier) | Node.js web service; persistent environment variables; no Docker required |
| **Version Control** | GitHub | Public repo; commit history is a capstone deliverable |

---

## 2. Components

### Backend (`/server`)

| Component | File | Responsibility |
|---|---|---|
| **Entry Point** | `server.js` | Initialises Express, loads environment variables, starts the HTTP server on the configured port |
| **PDF Loader** | `lib/pdfLoader.js` | Reads the PDF file from disk at startup, extracts full text via `pdf-parse`, and exports it as a string |
| **Prompt Builder** | `lib/promptBuilder.js` | Constructs the Claude system prompt and user message, injecting the extracted PDF text and user question |
| **Claude Client** | `lib/claudeClient.js` | Wraps the Anthropic API call, passes the built messages, and returns the text response |
| **Chat Route** | `routes/chat.js` | Handles POST `/api/chat` — validates input, calls Prompt Builder and Claude Client, returns the answer |
| **Error Middleware** | `middleware/errorHandler.js` | Catches all unhandled errors and returns structured JSON error responses with no stack traces |
| **CORS Middleware** | built into `server.js` | Restricts API access to the deployed frontend origin only |

### Frontend (`/client/src`)

| Component | File | Responsibility |
|---|---|---|
| **App** | `App.jsx` | Root component; owns the message list state and orchestrates layout |
| **ChatWindow** | `components/ChatWindow.jsx` | Renders the scrollable list of messages; auto-scrolls to the latest message |
| **Message** | `components/Message.jsx` | Renders a single chat bubble with role-based styling (user vs. assistant) |
| **InputBar** | `components/InputBar.jsx` | Controlled text input and send button; handles Enter key submission; disables during loading |
| **LoadingIndicator** | `components/LoadingIndicator.jsx` | Animated typing dots shown while awaiting an API response |
| **ErrorBanner** | `components/ErrorBanner.jsx` | Dismissible banner for API errors and empty-input validation messages |
| **api.js** | `services/api.js` | Single fetch wrapper for POST `/api/chat`; handles non-2xx responses and network failures |

---

## 3. Data Model

There is no database. All state is in-memory and scoped to the current browser session.

### Server-side (in-memory, loaded once at startup)

```
pdfText: string
  — Full extracted text of the loaded PDF document.
  — Loaded by pdfLoader.js at process start.
  — Passed into every Claude API call as part of the system prompt.
  — Never sent to the client.
```

### Client-side (React state, lost on page refresh)

```
messages: Message[]

Message {
  id:        string      — uuid generated client-side
  role:      "user" | "assistant"
  content:   string      — the message text
  timestamp: ISO string  — when the message was created
}

isLoading: boolean       — true while awaiting API response
error:     string | null — current error message, null when clear
```

### API Request / Response shapes (see Section 4)

---

## 4. API Design

### Base URL
- Development: `http://localhost:3001`
- Production: `https://docbot-api.onrender.com` *(example — set at deploy time)*

---

### `POST /api/chat`

Ask a question against the loaded PDF document.

**Auth:** None (public endpoint — API key is server-side only)

**Request**
```json
Content-Type: application/json

{
  "question": "What is the return policy for defective items?"
}
```

**Validation rules:**
- `question` must be present
- `question` must be a non-empty string
- `question` must be ≤ 500 characters

**Success Response — 200 OK**
```json
{
  "answer": "According to the document, defective items may be returned within 30 days with proof of purchase.",
  "source": "document"
}
```

**Not-found Response — 200 OK** *(question valid but answer not in document)*
```json
{
  "answer": "I could not find an answer to that question in the document.",
  "source": "not_found"
}
```

**Error Responses**

| Status | Code | When |
|---|---|---|
| 400 | `MISSING_QUESTION` | `question` field absent or empty |
| 400 | `QUESTION_TOO_LONG` | `question` exceeds 500 characters |
| 500 | `AI_ERROR` | Claude API call failed or timed out |
| 500 | `PDF_NOT_LOADED` | PDF failed to parse at startup |

```json
{
  "error": {
    "code": "MISSING_QUESTION",
    "message": "Please enter a question before sending."
  }
}
```

---

### `GET /api/health`

Health check endpoint — confirms server and PDF are ready.

**Auth:** None

**Success Response — 200 OK**
```json
{
  "status": "ok",
  "pdfLoaded": true
}
```

**Error Response — 503 Service Unavailable**
```json
{
  "status": "error",
  "pdfLoaded": false,
  "message": "PDF failed to load at startup."
}
```

---

## 5. Implementation Sequence

Build in this order — each step depends on the previous one being complete.

```
PHASE 1 — Backend Foundation
  [1] Project scaffold: /server and /client directories, package.json, .gitignore, .env.example
  [2] pdfLoader.js — load and parse the PDF, log character count on startup
  [3] claudeClient.js — bare Anthropic API call with a hardcoded test prompt (verify key works)
  [4] promptBuilder.js — inject PDF text + question into system prompt template
  [5] chat route (POST /api/chat) — wire pdfLoader → promptBuilder → claudeClient → response
  [6] errorHandler middleware — catch all thrown errors, return structured JSON
  [7] health route (GET /api/health) — confirm PDF loaded status
  ✓ Checkpoint: test all routes with curl or Postman before touching the frontend

PHASE 2 — Frontend Foundation
  [8]  Vite + React scaffold in /client
  [9]  api.js service — fetch wrapper for POST /api/chat
  [10] Message component — single bubble, role-based styling
  [11] ChatWindow component — message list + auto-scroll
  [12] LoadingIndicator component
  [13] ErrorBanner component
  [14] InputBar component — controlled input, Enter key, disabled state
  [15] App.jsx — assemble all components, wire state and API call
  ✓ Checkpoint: full end-to-end question → answer flow working locally

PHASE 3 — Sprint 2 (Change Request)
  [16] Error messages — audit all user-facing strings, remove all technical jargon
  [17] Mobile-responsive layout — InputBar and ChatWindow responsive at ≥ 375px
  [18] Loading states — LoadingIndicator active on every API call, InputBar disabled during load

PHASE 4 — Deploy
  [19] Deploy backend to Render — set ANTHROPIC_API_KEY and PDF_PATH env vars
  [20] Deploy frontend to Vercel — set VITE_API_BASE_URL env var pointing to Render URL
  [21] Smoke test live URLs end-to-end
```

---

## 6. Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| **PDF text extraction fails** — scanned image PDFs produce no usable text | Medium | High | Test `pdf-parse` against the chosen PDF before committing to it; fall back to a text-only file if needed |
| **PDF too large for Claude's context window** — extracted text exceeds token limit | Low–Medium | High | Measure character count at startup; if > 150k chars, truncate to first 150k with a warning log |
| **Claude answers outside the document** — model uses general knowledge instead of PDF | Medium | High | System prompt explicitly instructs the model to refuse if the answer is not in the document; test with out-of-scope questions during QA |
| **CORS misconfiguration on deploy** — frontend requests blocked by browser | Medium | Medium | Set `ALLOWED_ORIGIN` env var on Render and configure Express CORS middleware before deploying |
| **Render free tier cold start** — first request after inactivity takes 30–50 seconds | High | Low | Show a persistent "Connecting…" state on the first load; document cold start behaviour in the README |
| **API key accidentally committed to Git** — `.env` file pushed to GitHub | Low | Critical | `.env` in `.gitignore` from day one; `git status` check before every commit; `.env.example` ships instead |

---

## Architecture Review Checklist

Before proceeding to Phase 4 (Vibe Coding Spec):

- [x] Every component has exactly one responsibility
- [x] API key is server-side only — never referenced in `/client`
- [x] Every API endpoint has method, path, auth, request, response, and error cases defined
- [x] No database dependency — all state is in-memory or client React state
- [x] Implementation sequence respects dependency order (backend before frontend)
- [x] Deployment platform chosen and justified for both frontend and backend
- [x] All six architecture sections are complete