# PRD - DocBot AI

## 1. Problem Statement

Users who need information from long PDF documents — such as manuals, policy files, or reports — are forced to read through them manually or use basic keyword search, which is slow, error-prone, and frustrating. There is no way to ask a natural language question and get a direct, accurate answer grounded in the document. DocBot AI solves this by letting users have a conversational interface with a single PDF, returning precise answers sourced strictly from that document's content.

---

## 2. Users

- **Students** reading academic papers, textbooks, or course materials who need quick answers without reading the entire document.
- **Employees** consulting internal company policy documents, HR handbooks, or compliance guides.
- **Customers** looking up product manuals, warranty documents, or technical specifications.
- **Researchers** extracting specific facts or figures from reports and whitepapers.

---

## 3. User Stories

1. **As a user**, I want to type a question in plain English so that I can get a direct answer from the document without reading through it manually.
2. **As a user**, I want the answer to clearly reflect what the document says so that I can trust the response is accurate and not invented.
3. **As a user**, I want to be told clearly when the document does not contain an answer so that I do not act on missing or fabricated information.
4. **As a user**, I want the interface to feel fast and responsive so that I do not have to wait long between asking a question and receiving a reply.
5. **As a user**, I want to use the chatbot on my phone or tablet so that I can access it from any device without needing a desktop.

---

## 4. Features (MVP Only)

- **Chat interface** — A clean single-page UI with a text input field, send button, and scrollable message history.
- **Fixed PDF knowledge base** — One pre-loaded PDF document is the sole source of truth; users cannot upload or change it.
- **AI-based answering system** — Uses Claude API to process user questions and generate answers grounded in the PDF content.
- **Strict "answer only from document" rule** — The system prompt instructs the model to refuse or flag answers that are not supported by the document text.
- **Loading indicator** — A visible spinner or typing animation is shown while the API response is being fetched.
- **Error handling** — User-facing error messages for API failures, empty inputs, and timeout scenarios.

---

## 5. Non-Functional Requirements

| Requirement | Target |
|---|---|
| Response time | < 5 seconds per query under normal load |
| Hallucination prevention | System prompt enforces strict document-grounding; model must not answer from general knowledge |
| Mobile responsiveness | UI must render correctly on screens ≥ 375px wide (iPhone SE and above) |
| API key security | Claude API key is stored server-side only; never exposed to the frontend or browser |
| PDF parsing reliability | Text extraction must handle standard single-column and multi-column PDF layouts without garbling content |
| Availability | Hosted on a free tier platform (e.g. Render, Vercel) with reasonable uptime for demo purposes |

---

## 6. Out of Scope

1. **User authentication / login** — No accounts, sessions, or identity management of any kind.
2. **Multiple document support** — Users cannot switch between PDFs; only the pre-loaded document is used.
3. **File upload system** — Users cannot upload their own PDFs through the interface.
4. **Chat history persistence** — Conversations are not saved; refreshing the page clears all messages.
5. **Admin dashboard** — No backend UI for managing documents, monitoring usage, or reviewing queries.
6. **Voice input / output** — No speech-to-text or text-to-speech functionality.
7. **Multi-language support** — The chatbot operates in English only.
8. **Feedback or rating system** — No thumbs up/down or answer quality rating mechanism.

---

## 7. Success Metrics

- **Answer accuracy** — At least 90% of test questions drawn directly from the PDF receive a correct, document-grounded answer.
- **Response time** — 95% of queries return a response within 5 seconds under normal conditions.
- **Graceful refusal rate** — When asked a question clearly outside the document's scope, the system correctly declines to answer at least 85% of the time.
- **Error-free sessions** — A full demo walkthrough of 10 consecutive questions completes without unhandled errors or crashes.
- **Mobile usability** — The interface is fully functional and readable on a standard mobile browser without horizontal scrolling.

---

## 8. Open Questions

1. **Document size vs. context window** — If the PDF exceeds the model's context limit, should the content be chunked, summarised, or retrieved using a vector similarity search? What is the threshold that triggers this?
2. **Chunking strategy** — If chunking is needed, should chunks be fixed-size (e.g. 500 tokens), paragraph-based, or section-based? How does chunk overlap affect answer quality?
3. **Model selection** — Which Claude model (e.g. claude-haiku-4-5 vs. claude-sonnet-4-6) offers the best balance of cost, speed, and accuracy for this use case?
4. **Strictness enforcement** — Should the system return a hard refusal ("This information is not in the document") or a soft hedge ("I couldn't find this in the document, but generally...") when the answer is absent? Which is safer for a production demo?
5. **PDF parsing edge cases** — How should the system handle PDFs with scanned images, tables, or non-standard encodings where text extraction may fail or produce garbled output?

---

## 9. Constraints

- **Single document only** — The system is designed for exactly one pre-loaded PDF; multi-document support is out of scope.
- **No database** — All state is in-memory; no persistent storage layer is used.
- **No authentication** — The application is fully public-facing with no login gate.
- **API dependency** — The system requires a valid Claude (Anthropic) API key; it cannot function without it.
- **Free hosting tier** — The application must be deployable on free-tier infrastructure (e.g. Render, Vercel, Railway) with no paid cloud services.
- **No native mobile app** — Delivery is a responsive web application only; no iOS or Android builds.