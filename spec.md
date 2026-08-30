# Software Design Document (SDD): RAG-Based College Information Assistant (CampusWise AI)

---

## 1. Project Overview
Build a full-stack, AI-powered college information assistant called **CampusWise AI** using Retrieval-Augmented Generation (RAG)[cite: 1]. The platform enables college administrators to upload, process, and manage official institutional documents (PDFs, admission brochures, examination rules, hostel regulations, and academic calendars)[cite: 1]. Authenticated students can query the assistant in natural language and receive grounded, accurate answers backed by precise document references and page citations[cite: 1]. The system strictly avoids hallucination by executing vector similarity searches over processed document embeddings, gracefully handling unknown queries when context is missing, and persisting conversation histories for multi-turn dialogues[cite: 1].

---

## 2. Tech Stack

* **Frontend:** Next.js (App/Pages Router) or React (Vite), Tailwind CSS, Zustand / React Context, Axios, Lucide React icons, and React Markdown with syntax highlighting.
* **Backend:** Node.js with Express.js (or Python FastAPI), LangChain / LlamaIndex core utilities, Multer (multipart upload), PDF-Parse / LangChain Community PDF Loaders, JSON Web Tokens (JWT), Helmet, Morgan, Express Validator, and Bcrypt.js.
* **Database & Vector Store:** Supabase (PostgreSQL with `pgvector` extension) or MongoDB Atlas (Vector Search index) for relational metadata and high-dimensional vector embeddings[cite: 1].
* **AI & Embeddings:** Google Generative AI SDK (`text-embedding-004` / Gemini 1.5 Flash / Gemini 2.0) with OpenAI API (`text-embedding-3-small` / GPT-4o-mini) as an interchangeable fallback.
* **Deployment Platforms:** Vercel (Frontend Client) and Render (Backend REST API & Worker)[cite: 1].

---

## 3. Core Features

* **Admin Document Ingestion Pipeline:** Multipart PDF upload, text extraction, semantic chunking (500–1000 characters with 100-character overlap), embedding generation, and vector database upsert[cite: 1].
* **Vector Similarity & Semantic Retrieval:** Cosine similarity search over indexed chunks matching top-$k$ relevant passages ($k=4$) with confidence score calculation[cite: 1].
* **Grounded LLM Generation:** Prompt synthesis injecting retrieved passages into the system prompt to enforce grounded answering without external hallucinations[cite: 1].
* **Exact Source Citation:** Displays the source document name, page number, and matched chunk excerpt alongside each assistant response[cite: 1].
* **Strict Unknown Handling:** Deterministic fallback when retrieval similarity scores fall below the minimum threshold[cite: 1].
* **Multi-Turn Chat Sessions:** Persistent conversation threads storing message history and maintaining contextual memory[cite: 1].
* **Document Management Console:** Admin overview to view indexed files, chunk statistics, categories, and perform cascading deletions[cite: 1].
* **Streaming AI Responses (Bonus):** Server-Sent Events (SSE) for word-by-word streaming generation to minimize perceived latency[cite: 1].

---

## 4. Authentication

* **Session Handling:** Stateless JWT-based authentication with access tokens stored securely in client state/HTTP-only cookies[cite: 1].
* **Role-Based Access Control (RBAC):** Strict separation between `student` and `admin` roles[cite: 1].
* **Password Security:** Salted password hashing with `bcryptjs` (cost factor: 12)[cite: 1].
* **Protected Routes:** Route guards on frontend navigation and middleware verification on backend API routes[cite: 1].
* **Session Persistence:** Persistent authentication state synchronized with Zustand / LocalStorage[cite: 1].

---

## 5. Frontend Pages

* `/` – Landing page highlighting platform capabilities, search coverage (Admissions, Fees, Placements, Exams), and auth CTA triggers.
* `/login` – Split-panel authentication interface with validation, role redirection, and error banners[cite: 1].
* `/register` – Student registration form with college ID validation, password strength meter, and state persistence[cite: 1].
* `/chat` – Main student interface featuring collapsible conversation sidebar, query input with suggested prompt chips, message stream, and source citation drawer[cite: 1].
* `/chat/[id]` – Dynamic route loading past conversation sessions, message history, and referenced document tags[cite: 1].
* `/admin/documents` – Protected administrative console displaying uploaded document metrics, upload dropzone, processing progress bars, category tagging, and file deletion controls[cite: 1].
* `/admin/analytics` – Overview of most frequently asked topics, failed queries (unanswered queries), and document index health[cite: 1].

---

## 6. Backend Architecture

* **Routes Layer:** HTTP route declarations with Express Validator rule composition and auth/role middleware binding[cite: 1].
* **Controllers Layer:** Request parameter sanitization, file payload validation, and response formatting (no direct database manipulation)[cite: 1].
* **Services Layer:** Business logic implementation (`authService`, `documentService`, `embeddingService`, `ragService`, `chatService`)[cite: 1].
* **RAG Pipeline Engine:** Encapsulates text extraction, recursive character splitting, vector generation, threshold filtering, and LLM prompt assembly[cite: 1].
* **Vector Store Client:** Abstracted database adapter interfacing with `pgvector` via Supabase RPC / raw SQL similarity queries[cite: 1].
* **Config Layer:** Environment variable enforcement, CORS settings, database connection pooling, and AI client instantiations[cite: 1].

---

## 7. Database Collections / Tables

### `users`
* `id` (UUID, Primary Key)[cite: 1]
* `name` (String)
* `email` (String, Unique, Indexed)[cite: 1]
* `password` (String, `select: false`)[cite: 1]
* `role` (Enum: `student`, `admin`, Default: `student`)[cite: 1]
* `created_at` (Timestamp)[cite: 1]

### `documents`
* `id` (UUID, Primary Key)[cite: 1]
* `title` (String)[cite: 1]
* `filename` (String)[cite: 1]
* `file_url` (String)[cite: 1]
* `category` (Enum: `Admissions`, `Academics`, `Hostel`, `Fees`, `Exams`, `Placements`, `General`)[cite: 1]
* `file_size` (Integer)
* `chunk_count` (Integer)
* `uploaded_by` (UUID $\rightarrow$ `users.id`)[cite: 1]
* `created_at` (Timestamp)[cite: 1]

### `document_chunks`
* `id` (UUID, Primary Key)[cite: 1]
* `document_id` (UUID $\rightarrow$ `documents.id` ON DELETE CASCADE)[cite: 1]
* `content` (Text: chunk textual body)[cite: 1]
* `chunk_index` (Integer)[cite: 1]
* `page_number` (Integer)[cite: 1]
* `embedding` (Vector: dimension 768 or 1536, indexed with HNSW / IVFFlat)[cite: 1]
* `metadata` (JSONB: document title, category, byte offset)[cite: 1]

### `conversations`
* `id` (UUID, Primary Key)[cite: 1]
* `user_id` (UUID $\rightarrow$ `users.id` ON DELETE CASCADE)[cite: 1]
* `title` (String, Default: "New Conversation")[cite: 1]
* `created_at` (Timestamp)[cite: 1]
* `updated_at` (Timestamp)

### `messages`
* `id` (UUID, Primary Key)[cite: 1]
* `conversation_id` (UUID $\rightarrow$ `conversations.id` ON DELETE CASCADE)[cite: 1]
* `sender` (Enum: `user`, `assistant`)[cite: 1]
* `content` (Text)[cite: 1]
* `sources` (JSONB: Array of `{ document_title, page_number, similarity_score, excerpt }`)[cite: 1]
* `created_at` (Timestamp)[cite: 1]

---

## 8. API Endpoints

### Authentication & User Management
* `POST /api/auth/register` – Register new user account[cite: 1].
* `POST /api/auth/login` – Validate credentials and issue JWT[cite: 1].
* `GET /api/auth/me` – Retrieve current authenticated user profile[cite: 1].

### Admin Document Management
* `GET /api/admin/documents` – List all indexed institutional documents with stats[cite: 1].
* `POST /api/admin/documents/upload` – Upload PDF $\rightarrow$ chunk $\rightarrow$ embed $\rightarrow$ index[cite: 1].
* `DELETE /api/admin/documents/:id` – Remove document and cascade-delete its vector chunks[cite: 1].
* `GET /api/admin/stats` – Aggregate metrics on indexed chunks and query counts[cite: 1].

### RAG Chat & Retrieval
* `POST /api/chat/conversations` – Create a new conversation session[cite: 1].
* `GET /api/chat/conversations` – Fetch user's conversation history[cite: 1].
* `GET /api/chat/conversations/:id` – Fetch conversation message history[cite: 1].
* `POST /api/chat/conversations/:id/query` – Main RAG execution endpoint (generates answer with sources or streams via SSE)[cite: 1].
* `DELETE /api/chat/conversations/:id` – Delete conversation thread[cite: 1].

---

## 9. Folder Structure

```text
campuswise-rag/
├── .gitignore
├── README.md
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout/
│   │   │   │   ├── Navbar.jsx
│   │   │   │   ├── Sidebar.jsx
│   │   │   │   └── ProtectedRoute.jsx
│   │   │   ├── Chat/
│   │   │   │   ├── ChatContainer.jsx
│   │   │   │   ├── MessageBubble.jsx
│   │   │   │   ├── SourceCard.jsx
│   │   │   │   ├── SuggestedQuestions.jsx
│   │   │   │   └── ChatInput.jsx
│   │   │   └── Admin/
│   │   │       ├── FileDropzone.jsx
│   │   │       ├── DocumentTable.jsx
│   │   │       └── IngestionProgress.jsx
│   │   ├── pages/ (or app/)
│   │   │   ├── index.jsx
│   │   │   ├── login.jsx
│   │   │   ├── register.jsx
│   │   │   ├── chat/
│   │   │   │   ├── index.jsx
│   │   │   │   └── [id].jsx
│   │   │   └── admin/
│   │   │       ├── documents.jsx
│   │   │       └── analytics.jsx
│   │   ├── store/
│   │   │   ├── authStore.js
│   │   │   └── chatStore.js
│   │   ├── services/
│   │   │   └── api.js
│   │   └── styles/
│   │       └── globals.css
│   ├── package.json
│   └── vite.config.js (or next.config.js)
└── backend/
    ├── src/
    │   ├── config/
    │   │   ├── db.js
    │   │   └── env.js
    │   ├── middleware/
    │   │   ├── authMiddleware.js
    │   │   ├── adminMiddleware.js
    │   │   ├── uploadMiddleware.js
    │   │   └── validatorMiddleware.js
    │   ├── routes/
    │   │   ├── authRoutes.js
    │   │   ├── documentRoutes.js
    │   │   └── chatRoutes.js
    │   ├── controllers/
    │   │   ├── authController.js
    │   │   ├── documentController.js
    │   │   └── chatController.js
    │   ├── services/
    │   │   ├── authService.js
    │   │   ├── pdfService.js
    │   │   ├── embeddingService.js
    │   │   ├── vectorStoreService.js
    │   │   └── ragService.js
    │   ├── models/
    │   │   ├── schema.sql (or Mongoose Models)
    │   │   └── index.js
    │   └── server.js
    ├── sample_data/
    │   ├── academic_calendar_2026.pdf
    │   ├── admission_guidelines.pdf
    │   └── hostel_regulations.pdf
    ├── .env.example
    └── package.json

```

---

## 10. Development Phases

* **Phase 1 (Foundation & Auth):** Initialize mono-repo, configure PostgreSQL with `pgvector` / MongoDB Atlas, implement JWT authentication, RBAC middleware, and basic user dashboard layouts.


* **Phase 2 (Document Ingestion & Chunking):** Build Multer upload middleware, integrate PDF text parser, implement recursive text splitter, and build the Admin Document Upload UI with status indicators.


* **Phase 3 (Embedding & Vector Storage):** Integrate Google Generative AI / OpenAI embeddings, create `match_documents` similarity search RPC functions, and store vector chunks with metadata.


* **Phase 4 (RAG Pipeline & Chat Engine):** Implement prompt injection template, context filtering with similarity threshold, source tracking, and unknown question fallback logic.


* **Phase 5 (Chat Interface & Streaming):** Build chat UI with auto-scrolling, multi-turn history persistence, collapsible source citation drawer, and SSE response streaming.


* **Phase 6 (Testing, Optimization & Deployment):** Add suggested follow-up questions, benchmark retrieval accuracy, write comprehensive `README.md`, deploy backend to Render and frontend to Vercel with verified environment variables.



---

## 11. UI and UX Requirements

* **Design Aesthetic:** Modern, clean campus portal aesthetic using Tailwind CSS with dark/light mode toggle support.
* **Scannability & Layout:** Collapsible sidebar for past conversation threads, prominent chat window, and distinct message bubbles separating student input from AI responses.


* **Source Transparency:** Inline source tags (e.g., `[Doc: Hostel Rules, Page 4]`) that expand into a sliding side drawer or modal displaying the raw chunk excerpt.


* **Interaction Feedback:** Skeleton loaders during document indexing, animated typing/streaming indicators, and disabled input states during generation.


* **Error Handling:** Clear banner notifications for invalid file formats, unreadable scanned PDFs, network timeouts, and unauthorized admin access attempts.



---

## 12. Security Requirements

* **Password Security:** Hash passwords using `bcryptjs` with salt round 12.


* **Secret Protection:** Isolate all JWT secrets, database connection strings, and LLM API keys in environment variables; zero credential commits to GitHub.


* **Input Sanitization & Validation:** Validate and sanitize every request payload with `express-validator` to prevent SQL/NoSQL injection and XSS.


* **File Upload Constraints:** Restrict uploads exclusively to valid MIME-type `application/pdf` with a maximum file size limit of 15MB.


* **API Security Headers:** Enforce `helmet` security headers, strict CORS whitelisting restricted to the frontend production URL, and rate limiting on `/api/auth` and `/api/chat` endpoints.

---

## 13. Final Expected Outcome

A fully deployed, end-to-end operational RAG application where administrators can drag and drop official college PDFs and have them indexed into a vector store in seconds. Students can register, open a conversation, and ask complex campus questions (e.g., *"What is the minimum attendance required to appear for mid-semester exams?"* or *"What is the refund policy if I cancel my hostel admission before October?"*). The system will stream accurate, grounded responses accompanied by interactive source badges pointing directly to the reference document and page number, while gracefully stating inability to answer when asked out-of-context questions.

---

## 14. Codex & AI Agent Implementation Instructions

* **Phase-by-Phase Execution:** Implement each module systematically adhering strictly to the defined development phases; do not jump ahead to frontend UI before validating API endpoints.
* **Separation of Concerns:** Keep controllers thin; route handlers must delegate all business logic, embedding math, and PDF processing to dedicated services.


* **Pure Services:** The `ragService` and `embeddingService` must remain framework-agnostic with zero direct dependency on Express `req`/`res` objects.
* **Strict Grounding:** Ensure the system prompt explicitly commands the model: *"Answer strictly using the provided context chunks. If the answer cannot be determined from the context, state clearly: 'I am sorry, but that information is not available in the uploaded college documents.'"*

* **Environment Integrity:** Use `process.env` exclusively; provide a fully annotated `.env.example` file with mock values for developer onboarding.


* **Progress Verification:** At the conclusion of each phase, output the complete list of created or modified files along with validation instructions (e.g., curl commands or UI test flows).

```
