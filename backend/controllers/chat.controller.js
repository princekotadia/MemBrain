import { GoogleGenAI } from '@google/genai';
import { Pinecone } from '@pinecone-database/pinecone';
import pool from '../db.js';
import { isValidUUID } from '../middleware/auth.middleware.js';
import 'dotenv/config';

const ai = new GoogleGenAI({ apiKey: process.env.GENAI_API_KEY });
const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
const index = pc.index('braindump1');
const modelName = 'gemini-3-flash-preview';

/**
 * Helper: Strictly isolated semantic retrieval of relevant journal chunks from Pinecone.
 * Uses index.namespace(userId) AND filter: { userId: { $eq: userId } }.
 * If 0 records exist for this user, returns [] cleanly (never falls back to global).
 */
async function fetchRelevantChunks(userId, queryText, topK = 4) {
  if (!userId || !isValidUUID(userId)) return [];

  try {
    const userNamespace = index.namespace(String(userId));
    const results = await userNamespace.searchRecords({
      query: {
        topK,
        inputs: { text: queryText },
        filter: {
          userId: { $eq: String(userId) },
        },
      },
      fields: ['chunk_text', 'userId'],
    });

    const hits = results.result?.hits || [];
    return hits
      .map((hit) => hit.fields?.chunk_text)
      .filter(Boolean);
  } catch (err) {
    console.error(`Pinecone search error for user ${userId}:`, err.message);
    return [];
  }
}

/**
 * Express Controller: Handle Chat with PostgreSQL memory & Pinecone user-isolated semantic search
 * Route: POST /try/chat
 */
export async function handleChat(req, res) {
  // 1. Secure User Identity
  const userId = req.user?.id || req.body?.userId;
  if (!userId || !isValidUUID(userId)) {
    return res.status(401).json({
      success: false,
      message: 'Valid user authentication / UUID is required.',
    });
  }

  const { sessionId, text, limit = 10 } = req.body;

  if (!text || typeof text !== 'string' || !text.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Missing or empty "text" in request body.',
    });
  }

  const queryText = text.trim();
  const historyLimit = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 20);

  try {
    let activeSessionId = sessionId;

    // 2. Validate session ownership or auto-create a new session for this user
    if (activeSessionId) {
      if (!isValidUUID(activeSessionId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid "sessionId" format.',
        });
      }

      const sessionCheck = await pool.query(
        `SELECT id, user_id FROM chat_sessions WHERE id = $1`,
        [activeSessionId]
      );

      if (sessionCheck.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Chat session not found.',
        });
      }

      if (sessionCheck.rows[0].user_id !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: this chat session belongs to another user.',
        });
      }
    } else {
      const newSession = await pool.query(
        `INSERT INTO chat_sessions (user_id, title)
         VALUES ($1, $2)
         RETURNING id`,
        [userId, queryText.slice(0, 40) + '...']
      );
      activeSessionId = newSession.rows[0].id;
    }

    // 3. Fetch Conversation History (chronological order of last messages)
    const historyQuery = `
      SELECT role, content, created_at
      FROM (
        SELECT role, content, created_at
        FROM messages
        WHERE session_id = $1
        ORDER BY created_at DESC
        LIMIT $2
      ) AS recent_subquery
      ORDER BY created_at ASC;
    `;
    const historyResult = await pool.query(historyQuery, [activeSessionId, historyLimit]);
    const chatHistory = historyResult.rows;

    // 4. Save User Message to PostgreSQL
    const userInsertQuery = `
      INSERT INTO messages (session_id, role, content)
      VALUES ($1, 'user', $2)
      RETURNING id, created_at;
    `;
    await pool.query(userInsertQuery, [activeSessionId, queryText]);

    // 5. User-Isolated Semantic Retrieval from Pinecone (strictly scoped to user)
    const relevantChunks = await fetchRelevantChunks(userId, queryText, 4);

    // 6. LLM Synthesis with Combined Context
    const formattedHistory = chatHistory.length > 0
      ? chatHistory.map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`).join('\n')
      : 'No prior messages in this conversation.';

    const formattedContext = relevantChunks.length > 0
      ? relevantChunks.map((chunk, i) => `[Note ${i + 1}]: ${chunk}`).join('\n\n')
      : 'No matching past journal entries found.';

    const prompt = `
You are a helpful personal memory aid and journal assistant.
You have access to the user's past journal entries (long-term memory) and recent conversation history (short-term memory).

### RELEVANT PAST JOURNAL ENTRIES:
${formattedContext}

### RECENT CONVERSATION HISTORY:
${formattedHistory}

### USER'S CURRENT QUESTION:
${queryText}

Instructions:
1. Answer the question directly using the past journal entries and conversational context.
2. If the past notes do not contain the answer, politely state that you do not have a record of it.
3. Maintain conversation continuity using the recent conversation history.
`;

    const interaction = await ai.interactions.create({
      model: modelName,
      input: prompt,
    });

    const aiResponseText = interaction.output_text?.trim() || 'I could not generate a response.';

    // 7. Save AI Response to PostgreSQL
    const aiInsertQuery = `
      INSERT INTO messages (session_id, role, content)
      VALUES ($1, 'assistant', $2)
      RETURNING id, created_at;
    `;
    const aiSaveResult = await pool.query(aiInsertQuery, [activeSessionId, aiResponseText]);

    return res.status(200).json({
      success: true,
      sessionId: activeSessionId,
      messageId: aiSaveResult.rows[0].id,
      reply: aiResponseText,
      contextChunksUsed: relevantChunks.length,
      historyCount: chatHistory.length,
    });
  } catch (error) {
    console.error('Error in handleChat controller:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal Server Error',
    });
  }
}

/**
 * GET /try/sessions/:userId
 * Query chat_sessions for the authenticated user, ordered by created_at DESC
 */
export async function getUserSessions(req, res) {
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
      message: 'Access denied: cannot view another user\'s chat sessions.',
    });
  }

  try {
    const result = await pool.query(
      `SELECT id, user_id, title, created_at
       FROM chat_sessions
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId]
    );

    return res.status(200).json({
      success: true,
      sessions: result.rows,
    });
  } catch (error) {
    console.error('Error in getUserSessions controller:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal Server Error',
    });
  }
}

/**
 * GET /try/messages/:sessionId
 * Query messages for the given sessionId, verified against user ownership
 */
export async function getSessionMessages(req, res) {
  const { sessionId } = req.params;
  const userId = req.user?.id;

  if (!sessionId || !isValidUUID(sessionId)) {
    return res.status(400).json({
      success: false,
      message: 'Missing or invalid "sessionId" parameter.',
    });
  }

  try {
    // If user is authenticated, ensure the session belongs to this user
    if (userId) {
      const sessionCheck = await pool.query(
        `SELECT user_id FROM chat_sessions WHERE id = $1`,
        [sessionId]
      );

      if (sessionCheck.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Chat session not found.',
        });
      }

      if (sessionCheck.rows[0].user_id !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: this session belongs to another user.',
        });
      }
    }

    const result = await pool.query(
      `SELECT id, session_id, role, content, created_at
       FROM messages
       WHERE session_id = $1
       ORDER BY created_at ASC`,
      [sessionId]
    );

    return res.status(200).json({
      success: true,
      messages: result.rows,
    });
  } catch (error) {
    console.error('Error in getSessionMessages controller:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal Server Error',
    });
  }
}

/**
 * DELETE /try/sessions/:sessionId
 * Delete a specific chat session and all associated messages from the database
 */
export async function deleteSession(req, res) {
  const { sessionId } = req.params;
  const userId = req.user?.id;

  if (!sessionId || !isValidUUID(sessionId)) {
    return res.status(400).json({
      success: false,
      message: 'Missing or invalid "sessionId" parameter.',
    });
  }

  if (!userId || !isValidUUID(userId)) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required.',
    });
  }

  try {
    // 1. Verify session exists and belongs to the authenticated user
    const sessionCheck = await pool.query(
      `SELECT id, user_id FROM chat_sessions WHERE id = $1`,
      [sessionId]
    );

    if (sessionCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Chat session not found.',
      });
    }

    if (sessionCheck.rows[0].user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: cannot delete another user\'s chat session.',
      });
    }

    // 2. Explicitly delete messages and session from PostgreSQL
    await pool.query(`DELETE FROM messages WHERE session_id = $1`, [sessionId]);
    await pool.query(`DELETE FROM chat_sessions WHERE id = $1`, [sessionId]);

    return res.status(200).json({
      success: true,
      message: 'Chat conversation deleted successfully.',
      sessionId,
    });
  } catch (error) {
    console.error('Error in deleteSession controller:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal Server Error',
    });
  }
}
