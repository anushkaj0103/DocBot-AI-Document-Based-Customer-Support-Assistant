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