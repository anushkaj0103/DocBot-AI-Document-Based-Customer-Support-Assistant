# DocBot AI

DocBot AI is a document-based customer support chatbot. Users ask natural-language questions in a web chat, and the assistant answers using **only** the text extracted from a pre-loaded PDF knowledge base.

There is no file upload, no database, and no user login. The PDF is loaded once when the backend starts.

---

## Features

- **PDF-grounded answers** — The full handbook is parsed at server startup and included in every AI request.
- **Out-of-scope detection** — If the answer is not in the document, the bot replies with a clear refusal instead of guessing.
- **Real-time chat UI** — Send questions with Enter or the Send button; messages scroll automatically.
- **Loading feedback** — Animated dots and disabled input while waiting for a response.
- **Plain-English errors** — Network, validation, and server failures show user-friendly messages (no jargon or stack traces).
- **Mobile-friendly layout** — Usable at 375px width with stacked input controls and no horizontal scroll.
- **Health check** — `GET /api/health` confirms the server and PDF are ready.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite, plain CSS |
| Backend | Node.js + Express |
| AI | Groq API (`llama-3.3-70b-versatile` by default) |
| PDF parsing | `pdf-parse` |
| Hosting (recommended) | Vercel (frontend) + Render (backend) |

---

## Prerequisites

- **Node.js** 20 or later
- **npm**
- A **Groq API key** from [console.groq.com](https://console.groq.com/)
- Your knowledge-base PDF placed at `server/documents/knowledge.pdf` (or update `PDF_PATH`)

---

## Project Structure

```
docbot-ai/
├── client/                 # React frontend (Vite)
│   ├── src/
│   │   ├── components/     # ChatWindow, InputBar, Message, etc.
│   │   ├── services/       # api.js — calls the backend
│   │   └── constants/      # Shared user-facing error messages
│   └── .env                # Frontend env (create from .env.example)
├── server/                 # Express backend
│   ├── lib/                # pdfLoader, promptBuilder, Groq client
│   ├── routes/             # POST /api/chat
│   ├── middleware/         # errorHandler
│   ├── documents/          # knowledge.pdf lives here
│   ├── server.js           # Entry point
│   └── .env                # Backend env (create from .env.example)
└── README.md
```

---

## Setup (Local Development)

### 1. Clone and install dependencies

```bash
cd docbot-ai

# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

### 2. Add your knowledge-base PDF

Place your PDF at:

```
server/documents/knowledge.pdf
```

Or set `PDF_PATH` in `server/.env` to another path (relative to the `server/` folder).

### 3. Configure environment variables

**Backend** — copy the example file and edit values:

```bash
cd server
copy .env.example .env        # Windows
# cp .env.example .env        # macOS / Linux
```

**Frontend** — copy the example file:

```bash
cd client
copy .env.example .env        # Windows
# cp .env.example .env        # macOS / Linux
```

See [Environment Variables](#environment-variables) below for what each variable does.

### 4. Start both servers

Use **two terminals**.

**Terminal 1 — Backend**

```bash
cd server
npm start
```

Expected output:

```text
[pdfLoader] PDF loaded: XXXXX characters
[server] Listening on port 3001
[server] Press Ctrl+C to stop
```

**Terminal 2 — Frontend**

```bash
cd client
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### 5. Verify everything works

| Check | URL / action |
|---|---|
| Backend health | [http://localhost:3001/api/health](http://localhost:3001/api/health) → `{"status":"ok","pdfLoaded":true}` |
| Chat UI | Ask a question about your PDF at [http://localhost:5173](http://localhost:5173) |

---

## Sample Questions

The default knowledge base is the **Nexora Technologies Employee Handbook (2024)**. Try these in the chat UI to see how DocBot answers from the document.

### Leave and time off

- What is Nexora's PTO policy for IC1–IC3 employees?
- How many weeks of paid parental leave do employees get?
- How many sick days are employees entitled to per year?
- When am I eligible for a sabbatical?

### Remote work and hybrid policy

- How many days per week are hybrid employees expected in the office?
- What are Nexora's core collaboration hours?
- Can I work from another country for more than two weeks?

### Benefits and perks

- What mental health support does Nexora offer?
- How much is the annual learning and development budget?
- What is the home office stipend for remote employees?
- Does Nexora offer a 401(k) match?

### Compensation and employment

- When does Nexora conduct its annual compensation review?
- How long is the probationary period for new employees?
- What happens during the Nexora Start onboarding programme?

### Performance and culture

- What are Nexora's five core values?
- How often are formal performance reviews conducted?
- What rating scale does Nexora use in reviews?

### Out-of-scope (should refuse)

These topics are **not** in the handbook — DocBot should reply that it could not find an answer:

- What is the stock price of Nexora?
- Who won the World Cup in 2022?
- What is the weather in San Francisco today?

---

## Environment Variables

### Server (`server/.env`)

| Variable | Required | Example | Description |
|---|---|---|---|
| `GROQ_API_KEY` | Yes | `gsk_...` | Your Groq API key. Never commit this file. |
| `GROQ_MODEL` | No | `llama-3.3-70b-versatile` | Groq model name. Use a model that supports your PDF size. |
| `PDF_PATH` | Yes | `./documents/knowledge.pdf` | Path to the PDF, relative to `server/` |
| `PORT` | No | `3001` | Port the backend listens on |
| `ALLOWED_ORIGIN` | Yes | `http://localhost:5173` | Frontend URL allowed by CORS |

### Client (`client/.env`)

| Variable | Required | Example | Description |
|---|---|---|---|
| `VITE_API_BASE_URL` | Yes | `http://localhost:3001` | Backend URL the browser calls (no trailing slash) |

> **Note:** After changing `client/.env`, restart the Vite dev server (`npm run dev`).

---

## Deployment

Recommended split: **Vercel** for the frontend, **Render** for the backend.

### Backend — Render

1. Push your repo to GitHub (do **not** commit `.env` files).
2. In [Render](https://render.com/), create a new **Web Service** pointing at your repo.
3. Set:
   - **Root directory:** `docbot-ai/server`
   - **Build command:** `npm install`
   - **Start command:** `npm start`
4. Add environment variables in the Render dashboard:

   | Key | Value |
   |---|---|
   | `GROQ_API_KEY` | Your Groq API key |
   | `GROQ_MODEL` | `llama-3.3-70b-versatile` |
   | `PDF_PATH` | `./documents/knowledge.pdf` |
   | `PORT` | `3001` (or leave Render to inject `PORT`) |
   | `ALLOWED_ORIGIN` | Your Vercel URL, e.g. `https://your-app.vercel.app` |

5. Ensure `server/documents/knowledge.pdf` is committed to the repo (or upload via another method Render supports).
6. Note your Render service URL, e.g. `https://docbot-api.onrender.com`.

### Frontend — Vercel

1. In [Vercel](https://vercel.com/), import the same GitHub repo.
2. Set:
   - **Root directory:** `docbot-ai/client`
   - **Framework preset:** Vite
   - **Build command:** `npm run build`
   - **Output directory:** `dist`
3. Add environment variable:

   | Key | Value |
   |---|---|
   | `VITE_API_BASE_URL` | Your Render backend URL, e.g. `https://docbot-api.onrender.com` |

4. Deploy. Vercel gives you a URL like `https://your-app.vercel.app`.
5. Go back to Render and set `ALLOWED_ORIGIN` to that exact Vercel URL, then redeploy the backend if needed.

### Post-deploy checks

- `https://your-render-url.onrender.com/api/health` returns `pdfLoaded: true`
- The Vercel app loads and answers questions from the handbook

---

## Troubleshooting

| Problem | Likely cause | Fix |
|---|---|---|
| `PDF file not found` on startup | Wrong `PDF_PATH` or missing file | Place PDF at `server/documents/knowledge.pdf` or update `PDF_PATH` |
| Backend starts then terminal returns immediately | Port 3001 already in use | Run `netstat -ano \| findstr :3001` (Windows), kill the old process, restart |
| `Could not connect to the server` in UI | Backend not running or wrong `VITE_API_BASE_URL` | Start backend; check `client/.env` matches backend URL |
| `Something went wrong` / no answer | Groq quota or model too small for PDF | Use `llama-3.3-70b-versatile`; check Groq console for limits |
| CORS error in browser | `ALLOWED_ORIGIN` mismatch | Set `ALLOWED_ORIGIN` to the exact frontend URL (including `http://` vs `https://`) |

---

## API Reference

### `GET /api/health`

Returns server and PDF status.

```json
{ "status": "ok", "pdfLoaded": true }
```

### `POST /api/chat`

**Body:**

```json
{ "question": "What is the leave policy?" }
```

**Success (200):**

```json
{ "answer": "...", "source": "document" }
```

`source` is `"not_found"` when the answer is not in the PDF.

**Errors (400 / 502 / 503):**

```json
{ "error": { "code": "MISSING_QUESTION", "message": "Please enter a question before sending." } }
```

---

## License

ISC
