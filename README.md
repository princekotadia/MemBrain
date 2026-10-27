# MemBrain 🧠
### AI-Powered Personal Second Brain & Memory Sanctuary

---

## 📌 Problem Statement

In today's fast-paced digital world, people constantly generate ideas, daily reflections, project logs, and insights. However, traditional note-taking tools fail them in three fundamental ways:

1. **High Friction in Capture:** Most productivity tools demand rigid hierarchies, folders, and tags up front, which interrupts the creative flow and discourages spontaneous writing.
2. **The "Note Graveyard" Problem:** As notes accumulate, they become difficult to rediscover. Keyword-based search fails when you cannot recall the exact words you used weeks or months ago.
3. **Context-Blind AI Assistants:** Standard conversational AI models have no memory of your life, habits, past challenges, or creative breakthroughs, requiring you to re-explain your background in every prompt.

---

## 👥 Target Users

MemBrain is built for anyone who thinks for a living or values continuous self-reflection:

- **Developers & Engineers:** To quickly record debugging sessions, architectural epiphanies, and project updates without breaking focus.
- **Writers & Content Creators:** To capture fragments of dialogue, outlines, and raw ideas, and later synthesize them through conversation.
- **Journalers & Reflective Thinkers:** To maintain an honest, unstructured mental diary that uncovers mood patterns, habits, and recurring thoughts.
- **Knowledge Workers & Researchers:** Who need a private "second brain" that acts as an intelligent sounding board capable of connecting disparate concepts over time.

---

## 💡 Solution

**MemBrain** is a cognitive companion that combines **frictionless stream-of-consciousness journaling** with **automatic semantic indexing** and a **dual-memory conversational AI**.

- **Zero-Filing Capture:** Users simply dump raw thoughts into an auto-expanding writing sanctuary. No folders, no tags, and no organization required.
- **Autonomous Atomic Decomposition:** Upon saving, the backend uses Google Gemini to deconstruct the raw thought into standalone atomic insight chunks.
- **Semantic Vector Storage:** Each chunk is converted into high-dimensional vector embeddings and indexed into a dedicated user namespace in Pinecone.
- **Dual-Memory Conversational Retrieval:** When chatting with MemBrain in *Recall & Reflect*, the system merges **short-term context** (recent messages from PostgreSQL) with **long-term memory** (semantically relevant past journal chunks from Pinecone) to deliver deeply personal, context-aware answers.

---

## ⚡ Key Features

| Feature | Description |
|---|---|
| **✍️ Brain Dump Sanctuary** | Distraction-free, auto-expanding composer with live word & character telemetry, mood/starter pills, and keyboard shortcut (`⌘/Ctrl + Enter`) saving. |
| **💬 Memory Chat (Recall & Reflect)** | Conversational interface with dual-memory retrieval. Answers cite memories using visual badge counters. Full Markdown, bullet lists, and code blocks supported. |
| **📅 Timeline History** | Visual timeline of raw journal entries grouped chronologically by day with custom node markers and click-to-expand modal reading cards. |
| **🔒 Strict Per-User Isolation** | Multi-tenant isolation at both the database level (PostgreSQL foreign keys) and vector level (Pinecone user-specific namespaces + metadata filters). |
| **🛡️ Secure JWT Authentication** | Cookie-based session authentication with bcrypt-hashed credentials, profile hydration, and one-click demo testing. |
| **🎨 Dynamic Typography & Micro-Interactions** | Styled with Google Font *Major Mono Display*, featuring real-time typographic letter-casing pulse animations, diffused ambient glow blobs, and tailored dark aesthetics. |
| **🗑️ Chat Conversation Management** | Delete previous chat sessions with instant UI feedback and database cascade deletion of message threads. |

---

## 💻 Tech Stack

### Frontend
- **Framework:** React 18 + Vite
- **Styling:** Tailwind CSS (Custom dark theme & Gemini-inspired ambient lighting)
- **Typography:** Major Mono Display (Google Fonts)
- **Icons:** Lucide React
- **Markdown Rendering:** React Markdown + Remark GFM

### Backend
- **Runtime & Server:** Node.js + Express 5
- **Authentication:** JSON Web Tokens (JWT) via `httpOnly` cookies + `bcrypt`
- **Database Client:** `pg` (node-postgres connection pool)
- **Security & Utilities:** `cookie-parser`, `cors`, `dotenv`

### Data & AI Infrastructure
- **Relational Database:** PostgreSQL (Structured tables: `users`, `chat_sessions`, `messages`, `journal_entries`)
- **Vector Database:** Pinecone (`braindump1` index on AWS `us-east-1`, embeddings model: `multilingual-e5-large`)
- **Large Language Model:** Google Gemini 2.5 / Flash (`@google/genai`)

---

## 🏛️ Architecture

```mermaid
flowchart TD
    subgraph Client ["Frontend (React 18 + Vite)"]
        UI["Brain Dump / Memory Chat / Timeline"]
        Auth["JWT Cookie Auth State"]
    end

    subgraph Server ["Backend (Node.js + Express 5)"]
        Router["/try API Routes"]
        AuthMW["verifyToken Middleware"]
        InputCtrl["Input Controller"]
        ChatCtrl["Chat Controller"]
        AuthCtrl["Auth Controller"]
    end

    subgraph Storage ["Databases & External AI"]
        PG[("PostgreSQL\n(Users, Chat Sessions, Messages, Raw Journals)")]
        Pinecone[("Pinecone Vector DB\n(Namespaced Semantic Embeddings)")]
        Gemini["Google Gemini API\n(Idea Deconstruction & Context Synthesis)"]
    end

    UI <-->|HTTP / Credentials| Router
    Router --> AuthMW
    AuthMW --> InputCtrl
    AuthMW --> ChatCtrl
    AuthMW --> AuthCtrl

    InputCtrl -->|Save Raw Note| PG
    InputCtrl -->|Deconstruct Ideas| Gemini
    InputCtrl -->|Upsert Chunks to User Namespace| Pinecone

    ChatCtrl -->|Fetch Short-Term History| PG
    ChatCtrl -->|Semantic Search across User Namespace| Pinecone
    ChatCtrl -->|Synthesize History + Context Chunks| Gemini
    ChatCtrl -->|Save User & AI Turns| PG

    AuthCtrl <-->|Bcrypt Verify / User Records| PG
```

### The Dual-Memory Retrieval Pipeline
1. **Short-Term Memory:** Fetches recent conversation turns from PostgreSQL (`messages` filtered by `session_id` ordered chronologically).
2. **Long-Term Memory:** Queries Pinecone scoped strictly to `index.namespace(userId)` with top-K cosine similarity search to retrieve relevant past journal chunks.
3. **LLM Synthesis:** Injects retrieved past memories as system context alongside conversation history, prompting Gemini to answer the user's inquiry with personal recall.

---

## ⚙️ Local Setup

### Prerequisites
- **Node.js** (v18.0.0 or higher)
- **PostgreSQL** (running locally or a cloud database URL)
- **Pinecone Account** with an index named `braindump1`
- **Google AI Studio API Key** ([Get key](https://aistudio.google.com/))

---

### Step 1: Clone the Repository
```bash
git clone https://github.com/your-username/membrain.git
cd membrain
```

---

### Step 2: Initialize PostgreSQL Database
Create a database named `braindump` and execute the schema:

```bash
# Using PostgreSQL CLI
createdb braindump
psql -d braindump -f backend/schema.sql
```

The schema sets up tables (`users`, `chat_sessions`, `messages`, `journal_entries`), cascade foreign key rules, performance indexes, and a default seed user (`demo@secondbrain.local`).

---

### Step 3: Configure and Start the Backend

1. Navigate to the backend directory:
   ```bash
   cd backend
   npm install
   ```

2. Copy the environment variables template:
   ```bash
   cp .env.example .env
   ```

3. Fill in your credentials in `backend/.env` (see table below).

4. Start the backend development server:
   ```bash
   npm run dev
   ```
   *The backend will boot up at `http://localhost:3000`.*

---

### Step 4: Configure and Start the Frontend

1. Open a new terminal tab and navigate to the frontend directory:
   ```bash
   cd frontend
   npm install
   ```

2. Start the Vite development server:
   ```bash
   npm run dev
   ```

3. Open your browser and navigate to:
   ```
   http://localhost:5173
   ```

---

## 🔐 Environment Variables

All sensitive values are stored in `backend/.env`. An example template is provided in `backend/.env.example`:

| Variable | Description | Example / Default |
|---|---|---|
| `PORT` | Port for the Express server to listen on | `3000` |
| `CLIENT_URL` | Allowed CORS origin for the frontend | `http://localhost:5173` |
| `DATABASE_URL` | Full PostgreSQL connection string | `postgresql://postgres:password@localhost:5432/braindump` |
| `JWT_SECRET` | Secret key used to sign and verify session tokens | `super_secret_jwt_key_here` |
| `GENAI_API_KEY` | Google Gemini API key for embeddings and completions | `AIzaSy...` |
| `PINECONE_API_KEY`| API key for Pinecone vector database | `pcsk_...` |

> **Security Note:** Never commit `.env` to Git. The repository includes pre-configured `.gitignore` rules that prevent environment files from being tracked.

---

## 🌐 Deployment

### 1. Database Deployment
- **PostgreSQL:** Deploy on [Supabase](https://supabase.com/), [Neon](https://neon.tech/), or [AWS RDS]. Run the contents of `backend/schema.sql` via the provider's SQL editor.
- **Pinecone:** Create a Serverless Index named `braindump1` (AWS, region `us-east-1`, model: `multilingual-e5-large`, field map: `chunk_text`).

### 2. Backend Deployment (Render, Railway, Fly.io, or AWS EC2)
1. Set the root directory or working directory to `backend/`.
2. Set the build command to `npm install` and start command to `npm start`.
3. Add the production environment variables (`DATABASE_URL`, `JWT_SECRET`, `GENAI_API_KEY`, `PINECONE_API_KEY`, `PORT`, `CLIENT_URL`).
4. Ensure cookie settings in `auth.controller.js` use `sameSite: 'none'` and `secure: true` when frontend and backend run on different domains over HTTPS.

### 3. Frontend Deployment (Vercel, Netlify, or Cloudflare Pages)
1. Set the root directory to `frontend/`.
2. Build command: `npm run build`
3. Output directory: `dist`
4. Update `API_BASE_URL` in `frontend/src/constants/index.js` to point to your deployed backend domain (e.g., `https://api.yourdomain.com/try`).

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
