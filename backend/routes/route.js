import express from 'express';
import { input, search, getJournalEntries } from '../controllers/input.controller.js';
import { handleChat, getUserSessions, getSessionMessages, deleteSession } from '../controllers/chat.controller.js';
import { register, login, profile, logout } from '../controllers/auth.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const inputRoutes = express.Router();

// ── Authentication Routes ──────────────────────────────────────────────────
inputRoutes.post('/auth/register', register);
inputRoutes.post('/auth/login', login);
inputRoutes.get('/auth/profile', verifyToken, profile);
inputRoutes.post('/auth/logout', logout);

// ── Application Routes (Multi-tenant secured with verifyToken) ─────────────
inputRoutes.post('/input', verifyToken, input);
inputRoutes.post('/search', verifyToken, search);
inputRoutes.post('/chat', verifyToken, handleChat);

inputRoutes.get('/sessions/:userId', verifyToken, getUserSessions);
inputRoutes.delete('/sessions/:sessionId', verifyToken, deleteSession);
inputRoutes.get('/messages/:sessionId', verifyToken, getSessionMessages);
inputRoutes.get('/journals/:userId', verifyToken, getJournalEntries);

export default inputRoutes;
