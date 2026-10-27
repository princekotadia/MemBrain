import { GoogleGenAI } from "@google/genai";
import { Pinecone } from '@pinecone-database/pinecone';
import pool from '../db.js';
import { isValidUUID } from '../middleware/auth.middleware.js';
import "dotenv/config";

const ai = new GoogleGenAI({ apiKey: process.env.GENAI_API_KEY });
const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
const index = pc.index('braindump1');
const modelName = 'gemini-3-flash-preview';

/**
 * POST /try/input
 * Save a raw thought into Postgres and upsert semantic chunks into Pinecone
 * strictly partitioned to index.namespace(userId) with userId metadata
 */
async function input(req, res) {
    try {
        // 1. Secure User Identity
        const userId = req.user?.id || req.body?.userId;
        if (!userId || !isValidUUID(userId)) {
            return res.status(401).json({
                success: false,
                message: 'Valid user authentication / UUID is required to save thoughts.',
            });
        }

        const rawText = req.body?.text || (typeof req.body === 'string' ? req.body : '');
        if (!rawText || !rawText.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Missing or empty "text" in request body.',
            });
        }

        const text = rawText.trim();

        // 2. Save raw un-chunked thought into PostgreSQL
        let journalId = null;
        let createdAt = new Date().toISOString();
        try {
            const journalResult = await pool.query(
                `INSERT INTO journal_entries (user_id, raw_content)
                 VALUES ($1, $2)
                 RETURNING id, created_at;`,
                [userId, text]
            );
            if (journalResult.rows.length > 0) {
                journalId = journalResult.rows[0].id;
                createdAt = journalResult.rows[0].created_at
                    ? new Date(journalResult.rows[0].created_at).toISOString()
                    : createdAt;
            }
        } catch (dbErr) {
            console.warn("Could not save to journal_entries in postgres:", dbErr.message);
        }

        // 3. Deconstruct raw thought into standalone chunk ideas via Gemini
        const interaction = await ai.interactions.create({
            model: modelName,
            input: text,
            system_instruction: "You are an assistant that extracts distinct, standalone ideas from raw text. Deconstruct the following text into clear, independent statements. Each statement must contain all context needed to understand it. Output them as a list of objects where each object contains {_id(random hexadecimal string unique for each record), chunk_text (where each statement lives)}. The output should strictly be in JSON.",
        });

        let op_text = interaction.output_text || "";
        op_text = op_text
            .replace(/^```(?:json)?\s*/i, "")
            .replace(/```\s*$/, "")
            .trim();

        let parsedChunks = [];
        try {
            const parsed = JSON.parse(op_text);
            parsedChunks = Array.isArray(parsed) ? parsed : [parsed];
        } catch (parseErr) {
            console.warn("Could not parse JSON chunks from LLM, using fallback chunk:", parseErr.message);
            parsedChunks = [{ _id: 'chunk_' + Date.now(), chunk_text: text }];
        }

        if (parsedChunks.length === 0) {
            parsedChunks = [{ _id: 'chunk_' + Date.now(), chunk_text: text }];
        }

        // 4. Enrich every vector chunk with userId, journalId, createdAt, and text metadata
        const enrichedRecords = parsedChunks.map((chunk, idx) => {
            const chunkContent = String(chunk.chunk_text || chunk.text || text).trim();
            const chunkId = chunk._id || `chunk_${journalId || Date.now()}_${idx}`;
            return {
                _id: String(chunkId),
                chunk_text: chunkContent,
                userId: String(userId),
                journalId: journalId ? String(journalId) : '',
                createdAt: createdAt,
                text: chunkContent,
            };
        });

        // 5. Partitioned Upsert: Scope to user's dedicated namespace in Pinecone
        const userNamespace = index.namespace(String(userId));
        await userNamespace.upsertRecords({
            records: enrichedRecords,
        });

        return res.status(200).json({
            success: true,
            message: 'Thought saved and indexed in your private memory.',
            journalId: journalId,
            recordsCount: enrichedRecords.length,
        });

    } catch (error) {
        console.error("Error in input controller:", error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Internal Server Error',
        });
    }
}

/**
 * POST /try/search
 * User-isolated semantic search across personal memories
 */
async function search(req, res) {
    try {
        const userId = req.user?.id || req.body?.userId;
        if (!userId || !isValidUUID(userId)) {
            return res.status(401).json({
                success: false,
                message: 'Valid user authentication / UUID is required.',
            });
        }

        const rawText = req.body?.text || req.body?.query || (typeof req.body === 'string' ? req.body : '');
        if (!rawText || !rawText.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Missing "text" or "query" in request body.',
            });
        }

        const queryText = rawText.trim();

        // Scope search strictly to user's namespace with strict metadata filter
        const userNamespace = index.namespace(String(userId));
        const results = await userNamespace.searchRecords({
            query: {
                topK: 4,
                inputs: { text: queryText },
                filter: {
                    userId: { $eq: String(userId) },
                },
            },
            fields: ['chunk_text', 'userId'],
        });

        const relevantChunks = (results.result?.hits || [])
            .map((hit) => hit.fields?.chunk_text)
            .filter(Boolean);

        const contextString = relevantChunks.length > 0
            ? relevantChunks.join("\n- ")
            : "No previous notes found.";

        const prompt = `
You are a helpful AI assistant acting as a personal journal and memory aid.
Answer the user's question using ONLY the provided context from their past journal entries/notes.
If the context doesn't contain the answer, say you don't have a record of it.

User's Question: ${queryText}

Context (Past Notes):
- ${contextString}`;

        const response = await ai.interactions.create({
            model: modelName,
            input: prompt,
        });

        return res.status(200).json({
            success: true,
            message: response.output_text,
            contextChunksUsed: relevantChunks.length,
        });
    } catch (error) {
        console.error("Error in search controller:", error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Internal Server Error',
        });
    }
}

/**
 * GET /try/journals/:userId
 * Fetch personal journal entries for the authenticated user
 */
async function getJournalEntries(req, res) {
    const userId = req.user?.id || req.params?.userId;
    if (!userId || !isValidUUID(userId)) {
        return res.status(401).json({
            success: false,
            message: 'Valid user authentication / UUID is required.',
        });
    }

    // Prevent cross-user data leakage
    if (req.user?.id && req.params?.userId && req.user.id !== req.params.userId) {
        return res.status(403).json({
            success: false,
            message: 'Access denied to other user journal entries.',
        });
    }

    try {
        const result = await pool.query(
            `SELECT id, raw_content, created_at FROM journal_entries WHERE user_id = $1 ORDER BY created_at DESC;`,
            [userId]
        );

        return res.status(200).json({
            success: true,
            entries: result.rows,
        });
    } catch (error) {
        console.error("Error in getJournalEntries controller:", error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Internal Server Error',
        });
    }
}

export { input, search, getJournalEntries };
