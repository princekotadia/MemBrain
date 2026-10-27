import { useState, useEffect, useRef, useMemo } from 'react';
import { Loader2 } from 'lucide-react';

import { API_BASE_URL } from './constants';
import AmbientBackground from './components/common/AmbientBackground';
import Toast from './components/common/Toast';
import Header from './components/common/Header';
import UserMenu from './components/common/UserMenu';
import AnimatedAppName from './components/common/AnimatedAppName';
import ChatSidebar from './components/chat/ChatSidebar';
import MemoryModal from './components/history/MemoryModal';

import AuthPage from './pages/AuthPage';
import BrainDumpPage from './pages/BrainDumpPage';
import MemoryChatPage from './pages/MemoryChatPage';
import TimelinePage from './pages/TimelinePage';

export default function App() {
  // ── Authentication & User State ──────────────────────────────────────────
  const [user, setUser] = useState(null); // { id, name, email }
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [isAuthSubmitting, setIsAuthSubmitting] = useState(false);

  // Derived userId: automatically uses the logged-in user's UUID
  const userId = user?.id;

  // View state: 'dump' | 'chat' | 'history' (Default to 'dump')
  const [activeView, setActiveView] = useState('dump');

  // Bottom-left popup menu for dump/history views
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // Sidebar toggle state (only used in 'chat' view)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // ── Global App State ──────────────────────────────────────────────────────
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [deletingSessionId, setDeletingSessionId] = useState(null);

  const [journalEntries, setJournalEntries] = useState([]);
  const [isJournalLoading, setIsJournalLoading] = useState(false);
  const [selectedMemory, setSelectedMemory] = useState(null);

  const [dumpText, setDumpText] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [isDumpLoading, setIsDumpLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // Refs for auto-scroll and textareas
  const chatEndRef = useRef(null);
  const textareaRef = useRef(null);
  const dumpTextareaRef = useRef(null);

  // ── Auto-close bottom-left user popup menu when switching views ───────────
  useEffect(() => {
    setIsUserMenuOpen(false);
  }, [activeView]);

  // ── Auto-scroll when messages update in chat view ─────────────────────────
  useEffect(() => {
    if (activeView === 'chat') {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isChatLoading, activeView]);

  // ── Auto-dismiss toast ───────────────────────────────────────────────────
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  // ── Verify session on mount ──────────────────────────────────────────────
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/auth/profile`, {
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.user) {
            setUser(data.user);
          }
        }
      } catch (err) {
        console.error('Failed to verify session profile:', err);
      } finally {
        setIsAuthChecking(false);
      }
    };
    checkAuth();
  }, []);

  // ── Fetch all chat sessions for the user ──────────────────────────────────
  const fetchSessions = async () => {
    if (!user?.id) return;
    try {
      const response = await fetch(`${API_BASE_URL}/sessions/${user.id}`, {
        credentials: 'include',
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setSessions(data.sessions || []);
      }
    } catch (err) {
      console.error('Failed to fetch user sessions:', err);
    }
  };

  // ── Fetch all raw journal entries for the user ────────────────────────────
  const fetchJournalEntries = async () => {
    if (!user?.id) return;
    setIsJournalLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/journals/${user.id}`, {
        credentials: 'include',
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setJournalEntries(data.entries || []);
      }
    } catch (err) {
      console.error('Failed to fetch journal entries:', err);
    } finally {
      setIsJournalLoading(false);
    }
  };

  // Fetch sessions and initial journal entries only when user?.id is truthy
  useEffect(() => {
    if (user?.id) {
      fetchSessions();
      fetchJournalEntries();
    }
  }, [user?.id]);

  // Fetch journal entries whenever activeView switches to 'history'
  useEffect(() => {
    if (activeView === 'history' && user?.id) {
      fetchJournalEntries();
    }
  }, [activeView, user?.id]);

  // ── Authentication Handlers ──────────────────────────────────────────────
  const handleLogin = async ({ email, password }) => {
    const cleanEmail = email.trim();
    if (!cleanEmail || !password) {
      setAuthError('Email and password are required');
      return;
    }
    setIsAuthSubmitting(true);
    setAuthError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: cleanEmail, password }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Invalid email or password');
      }
      setUser(data.user);
      setActiveView('dump');
      setAuthError(null);
      setToast({
        type: 'success',
        text: `Welcome back, ${data.user.name}!`,
      });
    } catch (err) {
      setAuthError(err.message || 'Login failed');
    } finally {
      setIsAuthSubmitting(false);
    }
  };

  const handleSignup = async ({ name, email, password, onSuccess }) => {
    const cleanName = name.trim();
    const cleanEmail = email.trim();
    if (!cleanName || !cleanEmail || !password) {
      setAuthError('Name, email, and password are required');
      return;
    }
    if (password.length < 6) {
      setAuthError('Password must be at least 6 characters long');
      return;
    }
    setIsAuthSubmitting(true);
    setAuthError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name: cleanName, email: cleanEmail, password }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Registration failed');
      }
      setToast({
        type: 'success',
        text: 'Account created! Please sign in with your credentials.',
      });
      if (onSuccess) onSuccess();
      setAuthError(null);
    } catch (err) {
      setAuthError(err.message || 'Registration failed');
    } finally {
      setIsAuthSubmitting(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
      setMessages([]);
      setSessions([]);
      setJournalEntries([]);
      setSessionId(null);
      setIsUserMenuOpen(false);
      setToast({
        type: 'success',
        text: 'Signed out successfully',
      });
    }
  };

  const handleUseDemoAccount = async () => {
    setAuthError(null);
    setIsAuthSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: 'demo@secondbrain.local', password: 'password123' }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Demo login failed');
      }
      setUser(data.user);
      setActiveView('dump');
      setToast({
        type: 'success',
        text: 'Signed in as Demo User!',
      });
    } catch (err) {
      setAuthError(err.message || 'Demo login failed');
    } finally {
      setIsAuthSubmitting(false);
    }
  };

  // ── Session Handlers ─────────────────────────────────────────────────────
  const loadSession = async (selectedSessionId) => {
    setActiveView('chat');
    setSessionId(selectedSessionId);
    setIsHistoryLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/messages/${selectedSessionId}`, {
        credentials: 'include',
      });
      const data = await response.json();

      if (response.ok && data.success) {
        setMessages(data.messages || []);
      } else {
        throw new Error(data.message || 'Failed to load messages');
      }
    } catch (err) {
      console.error('Error loading session messages:', err);
      setToast({
        type: 'error',
        text: err.message || 'Could not load conversation history.',
      });
    } finally {
      setIsHistoryLoading(false);
    }
  };

  const handleNewChat = () => {
    setSessionId(null);
    setMessages([]);
    setActiveView('chat');
  };

  const handleDeleteSession = async (targetSessionId, e) => {
    if (e) e.stopPropagation();
    if (!targetSessionId || deletingSessionId) return;

    setDeletingSessionId(targetSessionId);
    try {
      const response = await fetch(`${API_BASE_URL}/sessions/${targetSessionId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await response.json();

      if (response.ok && data.success) {
        setSessions((prev) => prev.filter((s) => s.id !== targetSessionId));

        if (sessionId === targetSessionId) {
          setSessionId(null);
          setMessages([]);
        }

        setToast({
          type: 'success',
          text: 'Conversation deleted.',
        });
      } else {
        throw new Error(data.message || 'Failed to delete conversation');
      }
    } catch (err) {
      console.error('Error deleting session:', err);
      setToast({
        type: 'error',
        text: err.message || 'Could not delete conversation.',
      });
    } finally {
      setDeletingSessionId(null);
    }
  };

  // ── Memory Chat Handlers ─────────────────────────────────────────────────
  const handleChatInputChange = (e) => {
    setChatInput(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  };

  const handleChatSubmit = async (e) => {
    if (e) e.preventDefault();
    const trimmed = chatInput.trim();
    if (!trimmed || isChatLoading) return;

    const userMessage = { role: 'user', content: trimmed };
    setMessages((prev) => [...prev, userMessage]);
    setChatInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    setIsChatLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          userId: userId,
          sessionId: sessionId,
          text: trimmed,
        }),
      });

      const data = await response.json();

      if (!response.ok || data.success === false) {
        throw new Error(data.message || `Server responded with ${response.status}`);
      }

      if (!sessionId && data.sessionId) {
        setSessionId(data.sessionId);
        fetchSessions();
      }

      const assistantMessage = {
        role: 'assistant',
        content: data.reply || 'No response generated.',
        contextChunksUsed: data.contextChunksUsed,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      const errorMsg = {
        role: 'assistant',
        content: `Error: ${err.message || 'Unable to connect to the memory chat server.'}`,
        isError: true,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleChatKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleChatSubmit();
    }
  };

  const handleSelectPromptChip = (promptText) => {
    setChatInput(promptText);
    textareaRef.current?.focus();
  };

  // ── Brain Dump Handlers ──────────────────────────────────────────────────
  const handleDumpChange = (e) => {
    const val = e.target.value;
    setDumpText(val);
    if (dumpTextareaRef.current) {
      dumpTextareaRef.current.style.height = 'auto';
      if (val.length > 0) {
        dumpTextareaRef.current.style.height = `${Math.max(144, Math.min(dumpTextareaRef.current.scrollHeight, 380))}px`;
      } else {
        dumpTextareaRef.current.style.height = '72px';
      }
    }
  };

  const handleDumpSubmit = async (e) => {
    if (e) e.preventDefault();
    const trimmed = dumpText.trim();
    if (!trimmed || isDumpLoading) return;

    setIsDumpLoading(true);
    setToast(null);

    try {
      const response = await fetch(`${API_BASE_URL}/input`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          userId: userId,
          text: trimmed,
        }),
      });

      const data = await response.json();

      if (!response.ok || data.success === false) {
        throw new Error(data.message || `Server responded with ${response.status}`);
      }

      setDumpText('');
      if (dumpTextareaRef.current) {
        dumpTextareaRef.current.style.height = '72px';
      }
      setToast({
        type: 'success',
        text: 'Thought saved to memory.',
      });
      fetchJournalEntries();
    } catch (err) {
      setToast({
        type: 'error',
        text: err.message || 'Failed to save thought. Please check backend connection.',
      });
    } finally {
      setIsDumpLoading(false);
    }
  };

  const handleDumpKeyDown = (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleDumpSubmit();
    }
  };

  const handleInsertTag = (tagLabel) => {
    const prefix = `[${tagLabel}] — `;
    let nextText = '';
    if (!dumpText.trim()) {
      nextText = prefix;
    } else if (dumpText.endsWith('\n')) {
      nextText = `${dumpText}${prefix}`;
    } else {
      nextText = `${dumpText}\n\n${prefix}`;
    }
    setDumpText(nextText);
    setTimeout(() => {
      if (dumpTextareaRef.current) {
        dumpTextareaRef.current.focus();
        const len = nextText.length;
        dumpTextareaRef.current.setSelectionRange(len, len);
        dumpTextareaRef.current.style.height = 'auto';
        dumpTextareaRef.current.style.height = `${Math.max(144, Math.min(dumpTextareaRef.current.scrollHeight, 380))}px`;
      }
    }, 0);
  };

  // ── Group Journal Entries by Calendar Date for Timeline ──────────────────
  const groupedTimeline = useMemo(() => {
    const groups = {};
    journalEntries.forEach((entry) => {
      const dateObj = new Date(entry.created_at);
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
      const day = String(dateObj.getDate()).padStart(2, '0');
      const dateKey = `${year}-${month}-${day}`;

      if (!groups[dateKey]) {
        groups[dateKey] = {
          dateKey,
          formattedDate: dateObj.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          }),
          dayName: dateObj.toLocaleDateString('en-US', { weekday: 'long' }),
          memories: [],
        };
      }

      const formattedTime = dateObj.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });

      groups[dateKey].memories.push({
        ...entry,
        formattedTime,
      });
    });

    return Object.values(groups).sort((a, b) => b.dateKey.localeCompare(a.dateKey));
  }, [journalEntries]);

  // ── Render: Auth Checking Initial Screen ─────────────────────────────────
  if (isAuthChecking) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-black text-[#E3E3E3] relative overflow-hidden">
        <AmbientBackground />
        <div className="relative z-10 flex flex-col items-center gap-3">
          <Loader2 className="w-7 h-7 animate-spin text-[#C4C7C5]" />
          <AnimatedAppName className="text-xs tracking-widest text-[#8E918F] major-mono-display-regular" />
        </div>
      </div>
    );
  }

  // ── Render: Authentication Screen ────────────────────────────────────────
  if (!user) {
    return (
      <AuthPage
        toast={toast}
        onCloseToast={() => setToast(null)}
        onLogin={handleLogin}
        onSignup={handleSignup}
        onUseDemoAccount={handleUseDemoAccount}
        isSubmitting={isAuthSubmitting}
        authError={authError}
        setAuthError={setAuthError}
      />
    );
  }

  // ── Render: Authenticated MemBrain Application ────────────────────────────
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-black text-[#E3E3E3] font-sans antialiased relative">
      {/* Global Ambient Background Blobs */}
      <AmbientBackground />

      {/* Top Header */}
      <Header
        activeView={activeView}
        onSelectView={(view) => setActiveView(view)}
      />

      {/* Global Toast Notification */}
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Chat Sidebar (Rendered on Chat view) */}
      {activeView === 'chat' && (
        <ChatSidebar
          isOpen={isSidebarOpen}
          onToggle={() => setIsSidebarOpen((prev) => !prev)}
          onClose={() => setIsSidebarOpen(false)}
          sessions={sessions}
          activeSessionId={sessionId}
          deletingSessionId={deletingSessionId}
          onNewChat={handleNewChat}
          onSelectSession={loadSession}
          onDeleteSession={handleDeleteSession}
          user={user}
          onLogout={handleLogout}
        />
      )}

      {/* User Floating Menu (Rendered on Dump and History views) */}
      <UserMenu
        user={user}
        activeView={activeView}
        isOpen={isUserMenuOpen}
        onToggle={() => setIsUserMenuOpen((prev) => !prev)}
        onClose={() => setIsUserMenuOpen(false)}
        onSelectView={(view) => setActiveView(view)}
        onLogout={handleLogout}
      />

      {/* Main View Area */}
      <main className="flex-1 flex flex-col h-screen w-screen overflow-hidden bg-black pt-16">
        {activeView === 'chat' && (
          <MemoryChatPage
            isSidebarOpen={isSidebarOpen}
            isHistoryLoading={isHistoryLoading}
            isChatLoading={isChatLoading}
            messages={messages}
            chatInput={chatInput}
            textareaRef={textareaRef}
            chatEndRef={chatEndRef}
            onChangeChatInput={handleChatInputChange}
            onKeyDownChatInput={handleChatKeyDown}
            onSubmitChat={handleChatSubmit}
            onSelectPromptChip={handleSelectPromptChip}
          />
        )}

        {activeView === 'dump' && (
          <BrainDumpPage
            dumpText={dumpText}
            dumpTextareaRef={dumpTextareaRef}
            onChangeDump={handleDumpChange}
            onKeyDownDump={handleDumpKeyDown}
            onSubmitDump={handleDumpSubmit}
            onInsertTag={handleInsertTag}
            isLoading={isDumpLoading}
          />
        )}

        {activeView === 'history' && (
          <TimelinePage
            groupedTimeline={groupedTimeline}
            journalEntriesCount={journalEntries.length}
            isLoading={isJournalLoading}
            onBackToDump={() => setActiveView('dump')}
            onSelectMemory={(memory) => setSelectedMemory(memory)}
          />
        )}
      </main>

      {/* Modal: Full View of an Expanded Memory Card */}
      <MemoryModal
        memory={selectedMemory}
        onClose={() => setSelectedMemory(null)}
      />
    </div>
  );
}
