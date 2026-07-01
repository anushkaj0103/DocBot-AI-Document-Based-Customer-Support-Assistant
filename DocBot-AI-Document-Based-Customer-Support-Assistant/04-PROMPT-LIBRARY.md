# Annotated Prompt Library — DocBot AI

Each entry includes: the prompt template, what it does,
which component it targets, and when to use it.

---

## Prompt 1 — Project Scaffold

**Target:** Root project structure  
**When to use:** First prompt in Cursor, before any code exists
Create the initial project scaffold for DocBot AI with this exact structure:
docbot-ai/

├── client/         (Vite + React 18)

├── server/         (Node.js + Express)

├── .gitignore      (node_modules, .env, dist)

├── .env.example    (with placeholder values)

└── README.md       (title and placeholder sections only)
Requirements:

Run npm create vite@latest client -- --template react for the frontend
Run npm init -y and install express, dotenv, cors, pdf-parse in /server
Do NOT install any CSS framework
Do NOT create any application logic yet — scaffold only
Confirm each directory was created and list the files


---

## Prompt 2 — PDF Loader Module

**Target:** `server/lib/pdfLoader.js`  
**When to use:** First backend module — must work before anything else
Create server/lib/pdfLoader.js with these exact requirements:

Import pdf-parse and fs from Node.js
Read the file at process.env.PDF_PATH
Parse it using pdf-parse and export the extracted text as pdfText (string)
On success, log: [pdfLoader] PDF loaded: {charCount} characters
If the file is missing or pdf-parse throws, throw a new Error with

code PDF_LOAD_ERROR and a human-readable message
This module runs at require/import time — not inside a function

Do not add any other logic. One responsibility only.

---

## Prompt 3 — System Prompt Builder

**Target:** `server/lib/promptBuilder.js`  
**When to use:** After pdfLoader works — this shapes all AI behaviour
Create server/lib/promptBuilder.js that exports a single function:

buildMessages(pdfText, question)
The function must return an object with:

system: string (the Claude system prompt)
messages: array (the user message array for the Anthropic API)

The system prompt must:

Open with: "You are a document assistant. You answer questions ONLY

using the document provided below."
Include the PDF text wrapped in XML tags:

<document>{pdfText}</document>
State explicitly: "If the answer cannot be found in the document,

respond with exactly: I could not find an answer to that question

in the document."
State: "Do not use any knowledge outside the document.

Do not include markdown formatting in your answers."

The messages array must be:

[{ role: "user", content: question }]
No other logic. No API calls. Pure string construction only.

---

## Prompt 4 — Claude API Client

**Target:** `server/lib/claudeClient.js`  
**When to use:** After promptBuilder — this is the only file that touches the API
Create server/lib/claudeClient.js that exports an async function:

getAnswer(system, messages)
Requirements:

Use native fetch (Node 18+) — do not install the Anthropic SDK
POST to https://api.anthropic.com/v1/messages
Headers:

x-api-key: process.env.ANTHROPIC_API_KEY

anthropic-version: 2023-06-01

content-type: application/json
Body:

model: claude-haiku-4-5

max_tokens: 1000

system: [the system string]

messages: [the messages array]
On success: return response.content[0].text as a string
On non-2xx: throw new Error with code AI_ERROR and the

HTTP status in the message
Do not log the API key anywhere


---

## Prompt 5 — Chat Route

**Target:** `server/routes/chat.js`  
**When to use:** After all three lib modules are complete and individually tested
Create server/routes/chat.js as an Express router with one route:

POST /
Requirements:

Import pdfText from pdfLoader, buildMessages from promptBuilder,

getAnswer from claudeClient
Validate the request body:

question must be present → 400, code MISSING_QUESTION
question must be a non-empty string → 400, code MISSING_QUESTION
question.length must be ≤ 500 → 400, code QUESTION_TOO_LONG


On valid input:

Call buildMessages(pdfText, question)
Call getAnswer(system, messages)
If the answer includes "I could not find an answer":

return { answer, source: "not_found" }
Otherwise:

return { answer, source: "document" }


Pass any thrown errors to next(err) — do not handle them here
Status 200 for all successful responses including not_found


---

## Prompt 6 — Frontend API Service

**Target:** `client/src/services/api.js`  
**When to use:** First frontend file — all components depend on it
Create client/src/services/api.js that exports one async function:

sendQuestion(question)
Requirements:

POST to ${import.meta.env.VITE_API_BASE_URL}/api/chat
Body: JSON.stringify({ question })
Headers: { "Content-Type": "application/json" }
On success (2xx): return the parsed JSON { answer, source }
On non-2xx: throw a new Error with this user-friendly message:

"Something went wrong. Please try again."
On network failure (fetch throws): throw a new Error with:

"Could not connect to the server. Please check your connection."
Do not console.log anything
No retry logic


---

## Prompt 7 — Chat UI Components

**Target:** `Message.jsx`, `ChatWindow.jsx`, `LoadingIndicator.jsx`, `ErrorBanner.jsx`  
**When to use:** After api.js — build all display components before wiring state
Create these four React components in client/src/components/:

Message.jsx

Props: role ("user" | "assistant"), content (string)
Render a <div> with className "message message--{role}"
Render content in a <p> tag
No markdown, no dangerouslySetInnerHTML


ChatWindow.jsx

Props: messages (array), isLoading (bool)
Render a scrollable <div> containing a <Message> for each item
Add a ref to a dummy <div> at the bottom
useEffect: scroll that ref into view whenever messages.length changes
If isLoading is true, render <LoadingIndicator /> after the last message


LoadingIndicator.jsx

No props
Render three <span> elements with className "dot"
Animate them with a CSS keyframe: fade in/out staggered by 0.2s each
Wrap in a <div className="message message--assistant loading">


ErrorBanner.jsx

Props: message (string | null), onDismiss (function)
Render nothing if message is null
Render a <div className="error-banner"> with the message text

and a dismiss <button>
Call onDismiss on button click
useEffect: auto-dismiss after 5000ms; clear timeout on unmount



Use no external libraries. Plain JSX and CSS classes only.

---

## Prompt 8 — App Assembly and State Wiring

**Target:** `client/src/App.jsx`  
**When to use:** Final step — after all components and api.js are complete
Rewrite client/src/App.jsx to wire the complete chat application.
State:

messages: []         (array of { id, role, content, timestamp })

isLoading: false

error: null
Handler — handleSend(questionText):

If questionText.trim() is empty: set error "Please enter a question."

and return
Append { id: crypto.randomUUID(), role: "user", content: questionText,

timestamp: new Date().toISOString() } to messages
Set isLoading to true, clear error
Call sendQuestion(questionText) from services/api.js
On success: append assistant message with the returned answer
On error: set error to the thrown error's message
Always: set isLoading to false

Render:
  <div className="app">
    <header className="app-header"><h1>DocBot AI</h1></header>
    <ChatWindow messages={messages} isLoading={isLoading} />
    <ErrorBanner message={error} onDismiss={() => setError(null)} />
    <InputBar onSend={handleSend} isLoading={isLoading} />
  </div>
InputBar props:

onSend: called with the question string on submit
isLoading: disables input and button when true

Do not put any fetch logic in App.jsx — use sendQuestion from api.js only.

---

## Prompt 9 — Mobile-Responsive CSS

**Target:** `client/src/App.css`  
**When to use:** After all components render correctly on desktop
Write the complete App.css for DocBot AI with these requirements:
Layout:

.app: full viewport height flex column, no overflow
.app-header: fixed height, title centred
ChatWindow container: flex-grow 1, overflow-y scroll
InputBar: fixed to bottom, full width

CSS variables in :root:

--color-bg: #0f1117

--color-surface: #1a1d27

--color-user-bubble: #2563eb

--color-assistant-bubble: #1e2130

--color-text: #e2e8f0

--color-text-muted: #64748b

--color-error: #ef4444

--radius: 12px

--font: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif
Bubbles:

.message--user: right-aligned, --color-user-bubble background
.message--assistant: left-aligned, --color-assistant-bubble background
Max width 75%, border-radius --radius, padding 12px 16px

Mobile (base, no media query needed — mobile-first):

Input and send button full width on small screens
No horizontal scroll at 375px viewport

Desktop (min-width: 640px):

Max chat width 720px centred
Input row: flex row with button beside input

Do not use any CSS framework. Variables only — no hardcoded colour values

outside :root.

---

## Prompt 10 — Error Handler Middleware

**Target:** `server/middleware/errorHandler.js`  
**When to use:** Added to server.js after all routes are registered
Create server/middleware/errorHandler.js as an Express error middleware.
Requirements:

Function signature: (err, req, res, next)
Map these error codes to HTTP status codes:

MISSING_QUESTION  → 400

QUESTION_TOO_LONG → 400

PDF_LOAD_ERROR    → 503

AI_ERROR          → 502

(default)         → 500
Always respond with:

{ error: { code: string, message: string } }
The message field must be human-readable, no technical jargon,

no stack traces, no file paths
Log the full error (including stack) to console.error server-side only
Export as default