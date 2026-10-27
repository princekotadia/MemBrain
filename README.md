# MemBrain 🧠
### AI-Powered Personal Second Brain & Memory Sanctuary

> A distraction-free luxury dark-mode sanctuary to capture raw, unstructured thoughts, recall them semantically through interactive AI conversation, and trace your mental timeline.

---

## ✨ Features

- **✍️ Brain Dump Writing Sanctuary**  
  A fluid, auto-expanding composer box with mood pills and thought starters. Upon saving, raw entries are stored in PostgreSQL while Google Gemini deconstructs your unstructured stream into standalone atomic insights and indexes them into Pinecone.

- **💬 Memory Chat (Recall & Reflect)**  
  A dual-memory conversational interface combining:
  - **Short-Term Memory:** Previous conversation turns preserved chronologically in PostgreSQL.
  - **Long-Term Memory:** User-isolated semantic retrieval from Pinecone vector database.
  - Full Markdown rendering with syntax highlighting, custom memory badge chips, and auto-scrolling.

- **📅 Timeline History**  
  Chronologically grouped journal reflections by date with an interactive timeline bar, node dots, and click-to-expand preview cards.

- **🔒 Strict Multi-Tenancy & User Isolation**  
  Every vector record is isolated inside Pinecone using user-dedicated namespaces (`index.namespace(userId)`) and filter constraints (`userId = $userId`). Users can never search or access notes from other accounts.

- **🛡️ Secure JWT Cookie Authentication**  
  PostgreSQL-backed authentication using `httpOnly` cookies, bcrypt password hashing, input sanitization, and seamless session persistence.

- **🎨 Modern Typography & Dynamic Aesthetics**  
  Features Google Font **Major Mono Display** with a real-time periodic letter-pulse animation on the brand title, ambient diffused background lighting, and subtle micro-interactions.

---

## 🛠️ Tech Stack

### Frontend
- **React 18** + **Vite**
- **Tailwind CSS** (Custom dark theme & Gemini aesthetics)
- **Lucide React** (Minimalist iconography)
- **React Markdown** + **Remark GFM** (Rich text synthesis)
- **Major Mono Display** (Google Web Font)

### Backend
- **Node.js** & **Express 5**
- **PostgreSQL** (`pg` connection pool with cascading foreign keys)
- **Pinecone Vector Database** (Hosted embeddings with `multilingual-e5-large`)
- **Google Gemini API** (`@google/genai`)
- **JSON Web Tokens (JWT)** & **bcrypt**
- **cookie-parser** & **CORS**

---

## 📂 Project Structure

```
brn-dmp/
├── backend/
│   ├── controllers/
│   │   ├── auth.controller.js       # Register, login, profile, logout
│   │   ├── chat.controller.js       # Chat sessions, messages, cascade delete
│   │   └── input.controller.js      # Brain dump capture, search, timeline
│   ├── middleware/
│   │   └── auth.middleware.js       # JWT cookie authentication & UUID validator
│   ├── routes/
│   │   └── route.js                 # Authenticated API endpoints
│   ├── db.js                        # PostgreSQL connection pool & schema verify
│   ├── schema.sql                   # Database tables, cascade rules, indexes
│   ├── .env.example                 # Template for required environment variables
│   ├── index.js                     # Express server entry point
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── chat/                # ChatSidebar, ChatMessageList, ChatInput
│   │   │   ├── common/              # AmbientBackground, Header, Toast, UserMenu, AnimatedAppName
│   │   │   └── history/             # MemoryModal
│   │   ├── constants/               # API URL, prompt presets, thought starters
│   │   ├── pages/                   # AuthPage, BrainDumpPage, MemoryChatPage, TimelinePage
│   │   ├── App.jsx                  # Main application orchestrator
│   │   ├── main.jsx                 # React root mount
│   │   └── index.css                # Tailwind directives & dark scrollbars
│   ├── index.html                   # HTML document & Google font imports
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
├── .gitignore                       # Ignored build files, node_modules, and secrets
├── LICENSE                          # MIT License
├── package.json                     # Root scripts coordinator
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [PostgreSQL](https://www.postgresql.org/) (Local instance or hosted on Supabase / Neon / RDS)
- [Pinecone Account](https://www.pinecone.io/) (Free serverless tier)
- [Google AI Studio API Key](https://aistudio.google.com/)

---

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/membrain.git
cd membrain
```

---

### 2. Database Setup (PostgreSQL)

Create a PostgreSQL database named `braindump` (or your preferred name):

```bash
createdb braindump
```

Run the initialization script from `backend/schema.sql`:

```bash
psql -d braindump -f backend/schema.sql
```

---

### 3. Backend Setup

Navigate into the backend directory and install dependencies:

```bash
cd backend
npm install
```

Create your `.env` file using the template:

```bash
cp .env.example .env
```

Configure your `.env` file:

```env
PORT=3000
CLIENT_URL=http://localhost:5173

# PostgreSQL connection string
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/braindump

# JWT Secret for cookie sessions
JWT_SECRET=your_super_secret_jwt_key_here

# Google Gemini API key
GENAI_API_KEY=your_gemini_api_key_here

# Pinecone API key
PINECONE_API_KEY=your_pinecone_api_key_here
```

Start the backend server in development mode:

```bash
npm run dev
```

The API will be running at `http://localhost:3000`.

---

### 4. Frontend Setup

Open a new terminal tab, navigate into the frontend directory, and install dependencies:

```bash
cd frontend
npm install
```

Start the Vite development server:

```bash
npm run dev
```

Visit `http://localhost:5173` in your browser.

---

## 📡 API Endpoints

All endpoints are mounted under `/try`:

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/try/auth/register` | Public | Create a new user account |
| `POST` | `/try/auth/login` | Public | Sign in and receive `httpOnly` JWT cookie |
| `GET` | `/try/auth/profile` | JWT | Get authenticated user profile |
| `POST` | `/try/auth/logout` | JWT | Clear auth cookie |
| `POST` | `/try/input` | JWT | Save raw thought, chunk with Gemini, upsert to Pinecone |
| `POST` | `/try/chat` | JWT | Query hybrid memory (PostgreSQL + Pinecone) |
| `GET` | `/try/sessions/:userId` | JWT | Get recent chat sessions for the user |
| `GET` | `/try/messages/:sessionId`| JWT | Get message history for a specific session |
| `DELETE`| `/try/sessions/:sessionId`| JWT | Delete chat session & cascade remove messages |
| `GET` | `/try/journals/:userId` | JWT | Fetch raw journal thoughts for timeline |

---

## 🛡️ Security & Privacy

- **Never Commit Secrets:** Real API keys and connection credentials are kept exclusively in `backend/.env`, which is strictly ignored by `.gitignore`.
- **Cross-User Data Protection:** All database and vector requests verify that the authenticated `req.user.id` matches the session owner or target dataset before querying.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
