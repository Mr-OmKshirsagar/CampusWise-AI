# 🎓 CampusWise AI – Enterprise RAG-Based College Information Assistant

[![Version: v1.1.0](https://img.shields.io/badge/Version-v1.1.0-orange.svg)](https://github.com/Mr-OmKshirsagar/CampusWise-AI/releases/tag/v1.1.0)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-v20%2B-green.svg)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18.3-61dafb.svg)](https://reactjs.org)
[![Vite](https://img.shields.io/badge/Vite-6.1-646CFF.svg)](https://vitejs.dev)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-pgvector-336791.svg)](https://github.com/pgvector/pgvector)
[![Google Gemini](https://img.shields.io/badge/Google-Gemini_2.0_Flash-4285F4.svg)](https://ai.google.dev)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8.svg)](https://tailwindcss.com)

**CampusWise AI** is a production-grade, full-stack college information assistant built with **Retrieval-Augmented Generation (RAG)**. The platform empowers college administrators to drag-and-drop official PDFs and scanned circulars (academic calendars, admission guidelines, hostel rules, exam policies, fee schedules), while authenticated students can query the assistant in natural language and receive grounded, accurate answers backed by **exact document references and page citations**.

---

## 📌 1. Problem Statement & Solution

### The Problem:
* **Information Fragmentation:** College regulations, academic calendars, hostel curfews, exam schedules, and fee refund policies are scattered across dozens of lengthy PDF notices and circulars.
* **Student Confusion:** Students struggle to locate exact policy rules, often relying on hearsay or outdated notices.
* **LLM Hallucinations:** Generic AI chatbots frequently invent dates, exam rules, or fee percentages when answering campus-specific questions.

### The Solution:
* **CampusWise AI** implements a **strict Grounded RAG Pipeline**. Official documents are indexed into 768-dimensional vector space. Every student prompt is matched against institutional records using cosine similarity (`<=>`), injecting verified text passages into the system prompt and citing exact document titles, page numbers, and similarity confidence scores. Any out-of-scope question is deterministically rejected without hallucinating.

---

## 🚀 What's New in v1.1.0

* 🌟 **Hardware-Accelerated View Transitions Theme Engine:** Zero-flicker, continuous circular ripple theme switching (Dark "Obsidian Glass" ↔ Light "Pearl Glass") originating from the exact top-center (`50% 0%`) of the screen.
* 📄 **Fullscreen Document Viewer Modal:** React portal-backed responsive document viewer mounted at `document.body` with fluid maximize/minimize window animations and border-locked scrollbar tracking.
* 🔐 **One-Click Demo Credentials:** Pre-filled, verified Student (`StudentPassword123!`) and Admin (`AdminPassword123!`) test credentials for instant evaluation.
* ⚡ **Performance & GPU Pre-Warming:** Optimized layer rasterization, pre-warmed theme GPU cache on boot, and elimination of competing background color transitions.

---

## ✨ 2. Core & Advanced Features

### 🔹 Core Features:
- **Interactive Student Chat Interface:** Responsive chat dialogue, auto-scrolling, topic filtering, and suggested query chips.
- **Secure Authentication & RBAC:** Role-Based Access Control (`student` vs. `admin`), bcrypt salted hashing (cost factor: 12), and JWT session tokens.
- **Multimodal Document Upload & Ingestion:** Multer upload supporting PDFs and scanned image formats (PNG, JPG, WEBP) up to 15MB.
- **Semantic Text Extraction & Chunking:** Recursive character splitter (800-char target, 100-char overlap) preserving page numbers and metadata with UTF-8 null-byte sanitization.
- **High-Dimensional Embeddings:** Google Gemini `text-embedding-004` (768-dim) / OpenAI embeddings / deterministic cosine vectorizer.
- **pgvector Vector Store:** PostgreSQL `vector(768)` distance search (`<=>`) with threshold filtering ($\ge 0.25$).
- **Anti-Hallucination Grounding:** Answers conditioned strictly on retrieved context with deterministic out-of-scope fallback.
- **Source Citation Drawer:** Slide-over panel displaying exact document titles, page numbers, excerpts, and cosine similarity percentages.
- **Persistent Conversation Memory:** Multi-turn chat sessions stored in PostgreSQL.
- **Admin Document Management:** Admin dashboard with CRUD operations, search, category filters, 10-item pagination, file viewer modal, and cascading chunk deletion.

### 🌟 Bonus & Advanced Capabilities:
- **Optical Character Recognition (OCR):** Dual-layer vision OCR (Gemini Vision + Tesseract.js) for scanned college notices.
- **Centralized Database File Synchronization:** Base64 PDF storage allowing cross-environment previews across localhost and deployed servers.
- **Responsive Portal Modals:** Slide-over chat drawers, responsive table cards, and fullscreen portal-mounted document modals.
- **Analytics & Health Dashboard:** Vector chunk counts, storage metrics, category breakdown charts, and retrieval latency metrics.

---

## 🛠️ 3. Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite 6, Tailwind CSS, Lucide React, Zustand State Management, React Router DOM v7, View Transitions API |
| **Backend** | Node.js (v20+), Express.js, Multer, Helmet, CORS, Morgan, JWT, bcryptjs |
| **Database & Vector Store** | PostgreSQL + `pgvector` (Supabase Cloud / Local Postgres), Schema Migrations |
| **AI / LLM & Embeddings** | Google Gemini (`gemini-1.5-flash`, `text-embedding-004`), OpenAI API fallback, Tesseract.js OCR |
| **Deployment** | Vercel (Frontend SPA), Render (Backend Web Service), Supabase (PostgreSQL pgvector) |

---

## 🏗️ 4. Architecture & RAG Pipeline Flow

```mermaid
flowchart TD
    subgraph Ingestion["1. Admin Document Ingestion Pipeline"]
        A[Admin PDF / Image Upload] --> B[PDF & OCR Text Extraction]
        B --> C[Recursive Semantic Splitter\n800 chars / 100 overlap]
        C --> D[Embeddings Generator\ntext-embedding-004 / 768-dim]
        D --> E[(pgvector / Vector Store\nCosine Metric <=>)]
    end

    subgraph Query["2. Student RAG Query & Synthesis Pipeline"]
        F[Student Natural Language Query] --> G[Query Embedding Generator]
        G --> H[Vector Similarity Search\nTop-K=4, Threshold Filter]
        E -.->|Nearest Chunks| H
        H --> I{Similarity >= 0.25?}
        I -- No --> J[Deterministic Fallback:\n'Information not available in college documents']
        I -- Yes --> K[Prompt Injection & Context Synthesizer]
        K --> L[Google Gemini LLM]
        L --> M[Grounded Answer + Source Page Citations]
    end
```

---

## 🌐 5. Live Demo & Deployed URLs

- **Live Application (Frontend):** [https://campuswise-ai.vercel.app](https://campuswise-ai.vercel.app)
- **Live API Endpoint (Backend):** [https://campuswise-ai.onrender.com](https://campuswise-ai.onrender.com)
- **Database:** Supabase PostgreSQL with `pgvector` extension

---

## 💻 6. Step-by-Step Local Setup Instructions

### Prerequisites
- **Node.js** v18+ (tested on Node v20 & v24)
- **npm** v9+

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/Mr-OmKshirsagar/CampusWise-AI.git
cd CampusWise-AI

# Install Backend dependencies
cd backend
npm install

# Install Frontend dependencies
cd ../frontend
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` in `backend/`:
```bash
cd ../backend
cp .env.example .env
```

### 3. Generate Sample College PDFs
```bash
node src/utils/generateSamplePdfs.js
```

### 4. Run Test Suites
```bash
npm test
```

### 5. Start Development Servers
In Terminal 1 (Backend):
```bash
cd backend
npm run dev
# Running at http://localhost:5000
```

In Terminal 2 (Frontend):
```bash
cd frontend
npm run dev
# Running at http://localhost:5173
```

---

## 🔐 7. Environment Variables (`backend/.env.example`)

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Authentication
JWT_SECRET=your_super_secure_jwt_secret_key_2026
JWT_EXPIRES_IN=7d

# Google Gemini AI Configuration
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-1.5-flash
GEMINI_EMBEDDING_MODEL=text-embedding-004

# PostgreSQL Database URL with pgvector (Supabase Pooler URI or Local)
DATABASE_URL=postgresql://postgres.yourref:yourpass@aws-0-region.pooler.supabase.com:6543/postgres

# CORS Configuration
CORS_ORIGIN=http://localhost:5173,https://campuswise-ai.vercel.app
```

---

## 🧪 8. Verified Test Questions & Grounding Benchmarks

| Domain | Question | Matched Source | Grounded Result |
| :--- | :--- | :--- | :--- |
| **Attendance** | *"What is the minimum attendance required to appear for examinations?"* | `Academic Calendar 2026`, Page 1 | Minimum 75% attendance; condonation between 65-74% with medical certification; below 65% debarred. |
| **Curfew** | *"What are the hostel curfew timings on weekdays and weekends?"* | `Hostel Code of Conduct 2026`, Page 1 | 9:30 PM on weekdays; extended to 10:30 PM on weekends with prior warden permission. |
| **Admissions & Fees** | *"What is the B.Tech annual tuition fee and refund policy?"* | `Admission Guidelines 2026`, Page 2 | INR 1,80,000/year; 100% refund less INR 1000 before classes, 90% &lt;15 days before, 80% &lt;15 days after. |
| **Out-of-Scope Fallback** | *"What is the recipe for chocolate brownies in space?"* | No context match (Similarity &lt; 0.25) | **Anti-Hallucination Notice:** *"I am sorry, but that information is not available in the uploaded college documents..."* |

---

## 📄 9. License
This project is open-source and licensed under the [MIT License](LICENSE).
