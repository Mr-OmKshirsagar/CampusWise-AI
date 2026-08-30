# 🎓 CampusWise AI – Enterprise RAG-Based College Information Assistant

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-v20%2B-green.svg)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18.3-61dafb.svg)](https://reactjs.org)
[![Vite](https://img.shields.io/badge/Vite-6.1-646CFF.svg)](https://vitejs.dev)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-pgvector-336791.svg)](https://github.com/pgvector/pgvector)
[![Google Gemini](https://img.shields.io/badge/Google-Gemini_2.0_Flash-4285F4.svg)](https://ai.google.dev)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8.svg)](https://tailwindcss.com)

**CampusWise AI** is a production-ready, full-stack college information assistant built with **Retrieval-Augmented Generation (RAG)**. The platform empowers college administrators to drag-and-drop official PDFs (academic calendars, admission guidelines, hostel rules, exam policies, fee schedules), while authenticated students can query the assistant in natural language and receive grounded, accurate answers backed by **exact document references and page citations**.

---

## 🌟 Key Highlights & Architectural Strengths

- **Strict Document Grounding & Anti-Hallucination:** System prompts enforce that all responses are synthesized strictly from retrieved vector context chunks. Out-of-scope queries (e.g. quantum physics or world history) trigger deterministic fallback notices without hallucinating.
- **Exact Source Transparency:** Every answer displays interactive citation badges showing the referenced document title, page number, and similarity match percentage, opening into a slide-over citation drawer with raw excerpt context.
- **High-Dimensional Vector Retrieval:** Employs 768-dimensional embeddings (`text-embedding-004`) with Cosine distance indexing (`<=>`), recursive semantic text chunking (800-character target, 100-character overlap), and metadata preservation.
- **Role-Based Access Control (RBAC):** Strict separation between `student` and `admin` roles, salted bcrypt password hashing (cost factor: 12), and JWT authentication.
- **Multi-Turn Persistent Dialogue:** Conversation threads and message histories are persisted in PostgreSQL, supporting multi-turn conversational context memory.
- **Streaming Response Architecture (SSE):** Server-Sent Events support for real-time, low-latency token streaming into the student chat window.
- **Modern Glassmorphic UI:** Built with React 18, Vite, Tailwind CSS, Lucide icons, and responsive layouts designed for campus portals.

---

## 🏗️ Architecture & RAG Pipeline Flow

```mermaid
flowchart TD
    subgraph Ingestion["1. Admin Document Ingestion Pipeline"]
        A[Admin PDF Upload] --> B[PDF Page & Text Extraction]
        B --> C[Recursive Semantic Splitter\n800 chars / 100 overlap]
        C --> D[Embeddings Generator\ntext-embedding-004 / 768-dim]
        D --> E[(pgvector / Vector Store\nCosine Metric <=>)]
    end

    subgraph Query["2. Student RAG Query & Synthesis Pipeline"]
        F[Student Natural Language Query] --> G[Query Embedding Generator]
        G --> H[Vector Similarity Search\nTop-K=4, Threshold Filter]
        E -.->|Nearest Chunks| H
        H --> I{Similarity >= Threshold?}
        I -- No --> J[Deterministic Fallback:\n'Information not available in college documents']
        I -- Yes --> K[Prompt Injection & Context Synthesizer]
        K --> L[Google Gemini / OpenAI LLM]
        L --> M[Grounded Answer + Source Page Citations]
    end
```

---

## 🗄️ Database Schema & Tables

| Table | Primary Key | Key Columns & Foreign Keys | Description |
| :--- | :--- | :--- | :--- |
| `users` | `id` (UUID) | `name`, `email` (Unique), `password` (Hash), `role` (`student` / `admin`), `created_at` | Authenticated campus accounts |
| `documents` | `id` (UUID) | `title`, `filename`, `file_url`, `category`, `file_size`, `chunk_count`, `uploaded_by` (FK $\rightarrow$ `users.id`) | Official uploaded institutional PDF records |
| `document_chunks` | `id` (UUID) | `document_id` (FK $\rightarrow$ `documents.id` ON DELETE CASCADE), `content`, `chunk_index`, `page_number`, `embedding` (`vector(768)`), `metadata` (JSONB) | Semantic vector chunks with embeddings & page tracking |
| `conversations` | `id` (UUID) | `user_id` (FK $\rightarrow$ `users.id` ON DELETE CASCADE), `title`, `created_at`, `updated_at` | Multi-turn chat session threads |
| `messages` | `id` (UUID) | `conversation_id` (FK $\rightarrow$ `conversations.id` ON DELETE CASCADE), `sender` (`user`/`assistant`), `content`, `sources` (JSONB) | Persistent chat dialogue messages & citations |

---

## 📡 REST API Reference

### 1. Authentication Endpoints (`/api/auth`)
- `POST /api/auth/register` – Register a new student or administrator account (`name`, `email`, `password`, `role`).
- `POST /api/auth/login` – Authenticate credentials and receive a signed JWT token.
- `GET /api/auth/me` – Retrieve the profile of the current authenticated user (`Bearer <token>`).

### 2. Admin Document Management (`/api/admin`) *(Admin Role Required)*
- `GET /api/admin/documents` – List all indexed college documents with chunk counts and size metrics.
- `POST /api/admin/documents/upload` – Multipart PDF upload ($\rightarrow$ extraction $\rightarrow$ semantic chunking $\rightarrow$ vector embedding $\rightarrow$ index).
- `GET /api/admin/documents/:id` – Retrieve a specific document with all its indexed chunks.
- `DELETE /api/admin/documents/:id` – Cascade-delete a document and all its vector embeddings.
- `GET /api/admin/stats` – Aggregate statistics on total documents, vector chunks, storage size, and category distribution.

### 3. Chat & RAG Retrieval (`/api/chat`) *(Authenticated)*
- `POST /api/chat/conversations` – Create a new conversation thread session.
- `GET /api/chat/conversations` – Retrieve user's conversation history.
- `GET /api/chat/conversations/:id` – Retrieve conversation message history and referenced source tags.
- `POST /api/chat/conversations/:id/query` – Main RAG execution endpoint (generates grounded answers with sources or streams via SSE).
- `DELETE /api/chat/conversations/:id` – Delete a conversation thread and its message history.

---

## 🚀 Quickstart & Local Setup

### Prerequisites
- **Node.js** v18+ (tested on Node v20 & v24)
- **npm** v9+
- Optional: **PostgreSQL** with `pgvector` extension (or Supabase URL). *An embedded local vector store is built-in for zero-dependency offline development and testing.*

### 1. Clone & Configure Environment Variables
```bash
cd "CampusWise-AI"

# Backend setup
cd backend
cp .env.example .env
npm install
```

### 2. Populate `.env` Secrets
Configure the following in `backend/.env`:
```env
PORT=5000
NODE_ENV=development
JWT_SECRET=your_super_secure_jwt_secret_key_2026
JWT_EXPIRES_IN=7d

# Optional: Google Gemini API Key for production LLM generation
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-1.5-flash
GEMINI_EMBEDDING_MODEL=text-embedding-004

# Optional: PostgreSQL Database URL with pgvector (Supabase or Local)
# DATABASE_URL=postgresql://postgres:postgres@localhost:5432/campuswise
```

### 3. Seed Sample Institutional PDFs
Generate official multi-page PDFs in `backend/sample_data/`:
```bash
node src/utils/generateSamplePdfs.js
```

### 4. Run Automated Backend Test Suites
Verify authentication, RBAC, document ingestion, vector retrieval, and grounding:
```bash
npm test
```

### 5. Start the Application
In terminal 1 (Backend):
```bash
cd backend
npm run dev
# Server running at http://localhost:5000
```

In terminal 2 (Frontend):
```bash
cd frontend
npm install
npm run dev
# Frontend running at http://localhost:5173
```

---

## 🧪 Verified Test Questions & Grounding Benchmarks

| Domain | Question | Matched Source | Grounded Result |
| :--- | :--- | :--- | :--- |
| **Attendance** | *"What is the minimum attendance required to appear for examinations?"* | `Academic Calendar 2026`, Page 1 | Minimum 75% attendance; condonation between 65-74% with medical certification; below 65% debarred. |
| **Curfew** | *"What are the hostel curfew timings on weekdays and weekends?"* | `Hostel Code of Conduct 2026`, Page 1 | 9:30 PM on weekdays; extended to 10:30 PM on weekends with prior warden permission. |
| **Admissions & Fees** | *"What is the B.Tech annual tuition fee and refund policy?"* | `Admission Guidelines 2026`, Page 2 | INR 1,80,000/year; 100% refund less INR 1000 before classes, 90% &lt;15 days before, 80% &lt;15 days after. |
| **Out-of-Scope Fallback** | *"What is the recipe for chocolate brownies in space?"* | No context match (Similarity &lt; 0.25) | **Anti-Hallucination Notice:** *"I am sorry, but that information is not available in the uploaded college documents..."* |

---

## 🌐 Deployment Guide

### Deploying Backend to Render
1. Create a **Web Service** on [Render](https://render.com).
2. Set Root Directory to `backend`.
3. Build Command: `npm install`
4. Start Command: `node src/server.js`
5. Add Environment Variables: `PORT=5000`, `NODE_ENV=production`, `JWT_SECRET`, `GEMINI_API_KEY`, `DATABASE_URL` (Supabase Postgres URI), `CORS_ORIGIN` (Your Vercel URL).

### Deploying Frontend to Vercel
1. Import repository to [Vercel](https://vercel.com).
2. Set Root Directory to `frontend`.
3. Framework Preset: **Vite**.
4. Environment Variables: `VITE_API_URL=https://your-backend-api.onrender.com/api`.
5. Deploy!

---

## 📄 License
This project is open-source and licensed under the [MIT License](LICENSE).
