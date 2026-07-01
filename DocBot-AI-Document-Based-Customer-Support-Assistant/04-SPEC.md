# Vibe Coding Spec — DocBot AI

## 1. Project Overview

DocBot AI is a single-page web application that lets users ask natural language questions
about a pre-loaded PDF document and receive answers grounded strictly in that document's
content. It consists of a React frontend and a Node.js/Express backend. The Claude API
handles all AI inference. There is no database, no authentication, and no file upload.

## 2. Tech Stack

- Frontend: React 18 + Vite, plain CSS with CSS variables
- Backend: Node.js 20 + Express 4
- AI: Anthropic Claude API (claude-haiku-4-5)
- PDF Parsing: pdf-parse (npm)
- Hosting: Vercel (frontend) + Render (backend)
- Environment: dotenv

## 3. File Structure
docbot-ai/

├── client/

│   ├── src/

│   │   ├── components/

│   │   │   ├── ChatWindow.jsx

│   │   │   ├── Message.jsx

│   │   │   ├── InputBar.jsx

│   │   │   ├── LoadingIndicator.jsx

│   │   │   └── ErrorBanner.jsx

│   │   ├── services/

│   │   │   └── api.js

│   │   ├── App.jsx

│   │   ├── App.css

│   │   └── main.jsx

│   ├── index.html

│   └── vite.config.js

├── server/

│   ├── lib/

│   │   ├── pdfLoader.js

│   │   ├── promptBuilder.js

│   │   └── claudeClient.js

│   ├── routes/

│   │   └── chat.js

│   ├── middleware/

│   │   └── errorHandler.js

│   ├── documents/

│   │   └── knowledge.pdf        ← the pre-loaded PDF goes here

│   └── server.js

├── .env.example

├── .gitignore

└── README.md

## 4. Environment Variables

### Server (.env in /server)
ANTHROPIC_API_KEY=your_key_here

PDF_PATH=./documents/knowledge.pdf

PORT=3001

ALLOWED_ORIGIN=http://localhost:5173

### Client (.env in /client)
VITE_API_BASE_URL=http://localhost:3001

### Production overrides (set in Render + Vercel dashboards)
- `ALLOWED_ORIGIN` → deployed Vercel URL
- `VITE_API_BASE_URL` → deployed Render URL

## 5. Component Specifications

### pdfLoader.js
- Import `pdf-parse` and `fs`
- Read `process.env.PDF_PATH` synchronously at module load
- Parse and export `pdfText` as a plain string
- Log character count on success: `PDF loaded: 42301 characters`
- Throw a named error `PDF_LOAD_ERROR` if file is missing or unreadable

### promptBuilder.js
- Export a single function `buildMessages(pdfText, question)`
- Returns `{ system, messages }` shaped for the Anthropic API
- System prompt must include:
  - The full PDF text inside clearly labelled delimiters
  - Explicit instruction: answer ONLY from the document
  - Explicit instruction: if the answer is not in the document, respond with exactly:
    "I could not find an answer to that question in the document."
  - Instruction to keep answers concise and plain (no markdown)

### claudeClient.js
- Export an async function `getAnswer(system, messages)`
- Calls `POST https://api.anthropic.com/v1/messages`
- Model: `claude-haiku-4-5`
- Max tokens: 1000
- Returns the text string from `response.content[0].text`
- Throws `AI_ERROR` on non-2xx response

### chat.js (route)
- `POST /api/chat`
- Validate: `question` present, non-empty string, ≤ 500 chars
- Return 400 with `MISSING_QUESTION` or `QUESTION_TOO_LONG` if invalid
- Call `promptBuilder` → `claudeClient` → return `{ answer, source }`
- Set `source: "not_found"` if answer contains the not-found sentinel string

### errorHandler.js
- Express error middleware (4 arguments)
- Map known error codes to HTTP status codes
- Never expose stack traces in response body
- Always return `{ error: { code, message } }`

### App.jsx
- State: `messages[]`, `isLoading`, `error`
- On send: append user message → set loading → call api.js →
  append assistant message → clear loading
- On API error: set error string → clear loading
- Pass all state and handlers as props to child components

### ChatWindow.jsx
- Accepts `messages[]` prop
- Renders a `<Message>` for each item
- `useEffect` on messages length to scroll to bottom via a ref

### Message.jsx
- Accepts `role` and `content` props
- Applies `.message--user` or `.message--assistant` CSS class
- No markdown rendering — plain text only

### InputBar.jsx
- Controlled input: `value` + `onChange`
- Disabled when `isLoading` is true
- Submits on button click OR Enter key (not Shift+Enter)
- Clears input on submit

### LoadingIndicator.jsx
- Three animated dots using CSS keyframes
- Rendered inside ChatWindow when `isLoading` is true
- Visually consistent with assistant message bubbles

### ErrorBanner.jsx
- Accepts `message` and `onDismiss` props
- Renders only when `message` is non-null
- Dismisses on button click or after 5 seconds (setTimeout in useEffect)

### api.js
- Export async function `sendQuestion(question)`
- POST to `${import.meta.env.VITE_API_BASE_URL}/api/chat`
- Throws with user-friendly message string on non-2xx or network failure
- Returns `{ answer, source }` on success

## 6. Styling Rules

- CSS variables defined in `:root` in `App.css`
- Two colour roles: `--color-user-bubble` and `--color-assistant-bubble`
- Chat layout: full viewport height, flex column, InputBar pinned to bottom
- Mobile-first: base styles for ≥ 375px, no horizontal scroll at any width
- No external CSS framework or component library
- Font: system font stack — no Google Fonts import

## 7. Acceptance Criteria

| Feature | Acceptance Criterion |
|---|---|
| Ask a question | User types a question, clicks Send or presses Enter, message appears in chat |
| Receive an answer | Assistant reply appears within 5 seconds under normal conditions |
| Loading state | Animated indicator visible from Send until response arrives |
| Not-found handling | Out-of-scope questions return the graceful refusal message, not an error |
| Error handling | API failures show a dismissible banner with plain English message |
| Input disabled during load | Send button and input are non-interactive while awaiting response |
| Mobile layout | UI renders correctly and is fully usable at 375px viewport width |
| API key hidden | No API key appears in browser network tab, page source, or client bundle |

## 8. Out of Scope (Do Not Build)

- File upload — the PDF is fixed and server-side only
- Chat history persistence — messages clear on page refresh
- User authentication — no login, sessions, or identity
- Multiple documents — one PDF only
- Markdown rendering in chat bubbles
- Streaming responses — standard request/response only
- Admin interface of any kind

---

## Change Request — Sprint 2 (Phase 6)

Stakeholder request: improve error clarity, mobile usability, and loading feedback across the chat experience.

### Impact Summary

| Area | Affected? | What changes |
|---|---|---|
| **Architecture** | No structural change | Existing frontend/backend split is sufficient. Errors continue to flow: `api.js` → `App.jsx` → `ErrorBanner` (client) and `chat.js` → `errorHandler` (server). |
| **Components** | Minor updates | `ErrorBanner`, `api.js`, `errorHandler.js`, `ChatWindow`, `InputBar`, `LoadingIndicator`, `App.css` |
| **New components** | None | No new files required |
| **Backend routes** | Audit only | `POST /api/chat` validation messages already plain English; confirm `errorHandler` covers all thrown errors |
| **Implementation plan** | Phase 6 added | Three polish tasks after core MVP (Phases 1–5) |

### Task 1: Audit all error messages — replace technical strings with plain English

**Goal:** Every user-visible error must be clear, actionable, and free of jargon (no HTTP codes, stack traces, API provider names, or file paths).

**Error message catalog (target state):**

| Source | Code (internal) | User-facing message |
|---|---|---|
| Client validation | `EMPTY_QUESTION` | Please enter a question. |
| Server validation | `MISSING_QUESTION` | Please enter a question before sending. |
| Server validation | `QUESTION_TOO_LONG` | Your question is too long. Please keep it under 500 characters. |
| Server startup | `PDF_LOAD_ERROR` | The document is not available right now. Please try again later. |
| AI provider | `AI_ERROR` | The assistant could not generate a response right now. Please try again. |
| Network failure | — | Could not connect to the server. Please check your connection. |
| Unknown server error | `INTERNAL_SERVER_ERROR` | Something went wrong. Please try again later. |

**Files to audit:**

- `client/src/App.jsx` — client-side validation message
- `client/src/services/api.js` — network and non-2xx handling
- `server/routes/chat.js` — 400 validation responses
- `server/middleware/errorHandler.js` — all thrown error codes
- `server/lib/geminiClient.js` (Groq client) — ensure thrown errors use `AI_ERROR` code only; never pass provider details to the client

**Acceptance criteria:**

- No user-facing string contains HTTP status codes, "Groq", "Gemini", "API", stack traces, or file paths
- Error `code` field remains in JSON for debugging but is never shown directly in the UI
- `ErrorBanner` displays only the `message` string

**Status:** Done — centralized in `server/lib/errorMessages.js` and `client/src/constants/errorMessages.js`. Provider details logged server-side only.

---

### Task 2: Mobile CSS for ChatWindow and InputBar at 375px

**Goal:** Chat is fully usable on a 375px-wide viewport with no horizontal scroll.

**Target layout at 375px:**

- `ChatWindow`: scrollable message area, bubbles max 75% width, text wraps without overflow
- `InputBar`: input and Send button stack full-width (column layout)
- `ErrorBanner`: readable without clipping; dismiss button remains tappable
- Touch targets: input and button padding ≥ 44px effective tap height

**Files to update:**

- `client/src/App.css` — mobile-first base styles; desktop breakpoint at `min-width: 640px`

**Acceptance criteria:**

- No horizontal scrollbar at 375px width
- Input and Send are full width on mobile
- Messages remain readable and scrollable
- InputBar stays pinned to bottom of viewport

**Status:** Done — mobile-first layout with 44px touch targets, flex scroll fix, and 375px-safe padding/overflow rules in `App.css`.

---

### Task 3: Verify LoadingIndicator is active on every fetch call

**Goal:** User always sees loading feedback while waiting for data.

**Current data-fetching operations:**

| Operation | File | Loading wired? |
|---|---|---|
| Send question | `api.js` → `App.jsx` `handleSend` | Yes — `isLoading` set `true` before fetch, `false` in `finally` |

**Loading behaviour (target state):**

1. User sends question → `isLoading = true`
2. `LoadingIndicator` renders inside `ChatWindow`
3. `InputBar` input and Send button are disabled
4. On success or error → `isLoading = false`

**Files to verify:**

- `client/src/App.jsx` — `isLoading` state lifecycle
- `client/src/components/ChatWindow.jsx` — renders `LoadingIndicator` when `isLoading`
- `client/src/components/InputBar.jsx` — respects `isLoading` disabled state
- `client/src/components/LoadingIndicator.jsx` — animated dots visible

**Acceptance criteria:**

- Loading dots appear on every question send until response or error
- Input and button are non-interactive during load
- Loading clears in both success and error paths (`finally` block)

**Status:** Done — `isLoading` lifecycle verified in `App.jsx`; `LoadingIndicator`, `InputBar`, and `ChatWindow` include `aria-busy` / `role="status"` for accessibility.

---

### Sprint 2 Implementation Order

1. **Task 1 — Error audit** (highest user impact; unblocks confident QA)
2. **Task 3 — Loading verification** (quick confirm; mostly complete)
3. **Task 2 — Mobile CSS polish** (visual QA at 375px; fix any overflow found)

### Sprint 2 Definition of Done

- [x] All user-facing errors match the message catalog above
- [x] UI tested at 375px with no horizontal scroll
- [x] Loading indicator confirmed on every `sendQuestion` call
- [x] No regression in chat answer flow or error banner dismiss behaviour
