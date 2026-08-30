# 🚀 Production Deployment Guide: CampusWise AI

This step-by-step guide walks you through deploying the entire **CampusWise AI** full-stack RAG application to production using **GitHub**, **Supabase (PostgreSQL + pgvector)**, **Render (Backend API)**, and **Vercel (Frontend Client)**.

---

## 📋 Architecture & Deployment Overview

```mermaid
flowchart LR
    subgraph Client["Frontend (Vercel)"]
        A[React + Vite SPA]
    end

    subgraph Server["Backend (Render)"]
        B[Node.js + Express API]
        C[RAG Pipeline & Embeddings]
    end

    subgraph Data["Database (Supabase)"]
        D[(PostgreSQL + pgvector)]
    end

    subgraph AI["AI Providers"]
        E[Google Gemini API]
        F[xAI Grok Fallback]
    end

    A -->|HTTPS / API Requests| B
    B --> C
    C -->|Vector Similarity & Data| D
    C -->|Embeddings & Chat Synthesis| E
    C -.->|Failover| F
```

---

## 🛠️ Step 1: Push Code to GitHub

### 1.1 Commit your staged files
If you haven't committed yet in your project terminal:
```bash
# In the root directory (d:/NxtWave Projects/CampusWise-AI)
git add .
git commit -m "feat: Initial commit for CampusWise AI production deployment"
```

### 1.2 Create a repository on GitHub
1. Go to [GitHub](https://github.com/new) and log in.
2. Repository name: `CampusWise-AI` (or any name you choose).
3. Set visibility to **Public** or **Private**.
4. Leave *"Add a README"*, *".gitignore"*, and *"License"* unchecked.
5. Click **Create repository**.

### 1.3 Push your local repository to GitHub
Copy the commands shown on GitHub (replace `<YOUR_USERNAME>` with your GitHub username):
```bash
git branch -M main
git remote add origin https://github.com/<YOUR_USERNAME>/CampusWise-AI.git
git push -u origin main
```

---

## 🗄️ Step 2: Database Setup on Supabase (pgvector)

CampusWise AI uses PostgreSQL with the `pgvector` extension for storing and searching high-dimensional embeddings.

1. Go to [Supabase](https://supabase.com) and sign in.
2. Click **New Project**:
   - **Name**: `campuswise-db`
   - **Database Password**: Choose a strong password and save it securely.
   - **Region**: Choose the closest region to your users (e.g., `South Asia (Mumbai)` / `ap-south-1`).
3. Once the project is created:
   - Go to **Project Settings** (gear icon in sidebar) $\rightarrow$ **Database**.
   - Scroll to **Connection string** $\rightarrow$ select the **URI** tab.
   - Select **Session Pooler** (Port `5432`) or **Transaction Pooler** (Port `6543`).
   - Copy the URI. It will look like:
     ```text
     postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-ap-south-1.pooler.supabase.com:6543/postgres
     ```
   - Replace `[YOUR-PASSWORD]` with your actual database password.
4. *(Automatic)* When the backend starts up on Render, it automatically checks and runs the table schema migrations from `backend/src/models/schema.sql`.

---

## ⚙️ Step 3: Deploy Backend API to Render

1. Go to [Render](https://render.com) and sign in with GitHub.
2. Click **New +** in the top navigation and select **Web Service**.
3. Choose **Build and deploy from a Git repository** $\rightarrow$ click **Next**.
4. Select your **CampusWise-AI** repository.
5. Fill in the service configuration:

| Configuration Field | Value |
| :--- | :--- |
| **Name** | `campuswise-api` *(or your custom name)* |
| **Language** | `Node` |
| **Region** | Singapore / Frankfurt / Oregon *(closest to your DB)* |
| **Branch** | `main` |
| **Root Directory** | `backend` |
| **Build Command** | `npm install` |
| **Start Command** | `node src/server.js` |
| **Instance Type** | `Free` (or Starter for no cold-sleeps) |

6. Scroll down to **Environment Variables** and add the following keys:

| Key | Value | Description |
| :--- | :--- | :--- |
| `NODE_ENV` | `production` | Production environment mode |
| `PORT` | `10000` | Port assigned by Render (or leave default) |
| `JWT_SECRET` | *(Generate a 32+ character random string)* | Security secret for auth tokens |
| `JWT_EXPIRES_IN` | `7d` | Token expiry duration |
| `BCRYPT_SALT_ROUNDS` | `12` | Password hashing salt rounds |
| `DATABASE_URL` | `postgresql://...` | Your Supabase PostgreSQL Connection URI from Step 2 |
| `DB_ADAPTER` | `postgres` | Use PostgreSQL vector store mode |
| `GEMINI_API_KEY` | `AQ....` or `AIzaSy...` | Your Google Gemini API Key |
| `GEMINI_MODEL` | `gemini-2.0-flash` | LLM generation model |
| `GEMINI_EMBEDDING_MODEL` | `gemini-embedding-001` | High-dimensional embedding model |
| `GROK_API_KEY` | *(Optional)* | xAI Grok API key for failover |
| `GROK_MODEL` | `grok-2-latest` | Grok model name |
| `RAG_TOP_K` | `6` | Top chunk results to retrieve |
| `RAG_SIMILARITY_THRESHOLD` | `0.10` | Minimum similarity match score |
| `CHUNK_SIZE` | `800` | Chunk size in characters |
| `CHUNK_OVERLAP` | `100` | Overlap between chunks |
| `MAX_FILE_SIZE_MB` | `15` | Maximum PDF upload size |
| `UPLOAD_DIR` | `./uploads` | Local upload directory |
| `CORS_ORIGIN` | `http://localhost:5173` *(Update in Step 5 after Vercel URL is created)* | Whitelisted frontend origins |

7. Click **Create Web Service**.
8. Render will build and deploy your API. Once the build finishes, you will receive your public backend URL:
   ```text
   https://campuswise-api.onrender.com
   ```
9. Test the backend health endpoint in your browser or curl:
   ```text
   https://campuswise-api.onrender.com/api/health
   ```
   *Expected response:* `{"status":"ok","timestamp":"...","adapter":"postgres"}`.

---

## 💻 Step 4: Deploy Frontend Client to Vercel

1. Go to [Vercel](https://vercel.com) and log in with your GitHub account.
2. Click **Add New...** $\rightarrow$ **Project**.
3. Import your **CampusWise-AI** repository.
4. In the configuration screen:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click **Edit** and choose `frontend`.
   - **Build Command**: `npm run build` *(default)*
   - **Output Directory**: `dist` *(default)*
5. Open the **Environment Variables** accordion and add:

| Key | Value | Description |
| :--- | :--- | :--- |
| `VITE_API_URL` | `https://campuswise-api.onrender.com/api` | Your Render Backend API endpoint (with `/api` suffix) |

> [!IMPORTANT]
> Make sure `VITE_API_URL` ends with `/api` (e.g. `https://campuswise-api.onrender.com/api`), matching Axios routes configured in `frontend/src/services/api.js`.

6. Click **Deploy**.
7. In ~30-45 seconds, your application will be live at a URL like:
   ```text
   https://campuswise-ai.vercel.app
   ```

---

## 🔗 Step 5: Connect CORS & Finalize Production Link

1. Go back to your [Render Dashboard](https://dashboard.render.com).
2. Open your `campuswise-api` web service $\rightarrow$ navigate to **Environment**.
3. Find `CORS_ORIGIN` and update it with your new Vercel domain:
   ```text
   CORS_ORIGIN=https://campuswise-ai.vercel.app,http://localhost:5173
   ```
   *(Multiple origins can be comma-separated)*.
4. Click **Save Changes** (Render will trigger a zero-downtime redeploy).

---

## 🧪 Step 6: Production Verification Checklist

Follow this checklist to verify that the deployed system works end-to-end:

- [ ] **1. Health Check:** Visit `https://your-api.onrender.com/api/health` and verify `status: "ok"`.
- [ ] **2. Frontend Navigation:** Open `https://your-app.vercel.app` and verify landing page loads smoothly.
- [ ] **3. Student Account:** Register a new student account (`student@campus.edu`), log in, and verify JWT session persistence.
- [ ] **4. Admin Document Upload:**
  - Register or log in as an administrator (`admin@campus.edu`).
  - Open `/admin/documents`.
  - Upload a college PDF (e.g., `academic_calendar_2026.pdf`).
  - Verify OCR / text extraction, chunking, and embedding progress bar completes.
- [ ] **5. RAG Chat & Grounding:**
  - Open `/chat`.
  - Ask a question contained in the uploaded PDF (e.g., *"What is the minimum attendance requirement?"*).
  - Verify that the AI response streams and includes **Source Citation Badges** (Document name + Page number).
  - Click on the source citation to open the **Citation Drawer** and inspect the raw matching excerpt.
- [ ] **6. Anti-Hallucination Fallback:**
  - Ask an irrelevant query (e.g., *"What is the recipe for baking brownies?"*).
  - Verify the deterministic fallback is triggered without hallucinating.

---

## 🔍 Troubleshooting & FAQs

### 1. Render Free Tier Cold Starts
* **Symptom:** First request after 15 minutes takes 30-50 seconds to respond.
* **Fix:** Render spins down free instances when idle. You can use a free uptime monitor (such as [UptimeRobot](https://uptimerobot.com) or [Cron-Job.org](https://cron-job.org)) to ping `https://your-api.onrender.com/api/health` every 10 minutes.

### 2. CORS Error (`Access-Control-Allow-Origin`)
* **Symptom:** Browser console shows `CORS policy: No 'Access-Control-Allow-Origin' header is present`.
* **Fix:** Ensure `CORS_ORIGIN` on Render exactly matches your Vercel URL with no trailing slash (e.g., `https://campuswise-ai.vercel.app`).

### 3. Vercel 404 on Page Refresh
* **Symptom:** Navigating to `/chat` or `/admin/documents` works, but refreshing gives a 404.
* **Fix:** The `frontend/vercel.json` SPA rewrite file included in this repository routes all paths to `/index.html` automatically.

### 4. Supabase Database Connection Issues
* **Symptom:** Logs show `PostgreSQL connection failed. Falling back to embedded vector store.`
* **Fix:** Ensure you are using the **Pooler URI** with port `6543` or `5432` and that your database password is correctly URL-encoded if it contains special characters.
