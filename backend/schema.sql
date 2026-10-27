-- Enable pgcrypto extension for gen_random_uuid() if on older Postgres
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    password VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Ensure password column exists if table was previously created without it
ALTER TABLE users ADD COLUMN IF NOT EXISTS password VARCHAR(255);

-- 2. Chat Sessions Table
CREATE TABLE IF NOT EXISTS chat_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) DEFAULT 'New Conversation',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3. Messages Table (Chronological Chat Log)
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 4. Journal Entries Table (Raw Un-chunked Thoughts)
CREATE TABLE IF NOT EXISTS journal_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    raw_content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id 
    ON chat_sessions(user_id);

CREATE INDEX IF NOT EXISTS idx_messages_session_created 
    ON messages(session_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_journal_entries_user_created 
    ON journal_entries(user_id, created_at DESC);

-- 5. Pinecone Vector DB Specification (Reference)
-- Index Name: braindump1
-- Cloud: aws
-- Region: us-east-1
-- Embedding Model: multilingual-e5-large
-- Field Map: { text: 'chunk_text' }

-- Seed mock user used by the frontend
INSERT INTO users (id, email, name, password)
VALUES ('123e4567-e89b-12d3-a456-426614174000', 'demo@secondbrain.local', 'Demo User', '$2b$10$G2RuqSG7ZHnmkDUpBcRtseDTo5bM2Pkz/oa4o.S1AHwsoOqhVqB8S')
ON CONFLICT (id) DO UPDATE SET password = EXCLUDED.password;
