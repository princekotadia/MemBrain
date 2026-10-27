import { Plus, MessageSquare, Trash2, Loader2, LogOut, X } from 'lucide-react';

export default function ChatSidebar({
  isOpen,
  onToggle,
  onClose,
  sessions,
  activeSessionId,
  deletingSessionId,
  onNewChat,
  onSelectSession,
  onDeleteSession,
  user,
  onLogout,
}) {
  return (
    <>
      {/* Borderless icon-only toggle button — hamburger ↔ X */}
      <button
        type="button"
        onClick={onToggle}
        className="fixed bottom-4 left-4 z-50 flex items-center justify-center p-2 text-[#C4C7C5] hover:text-[#E3E3E3] transition-colors cursor-pointer pointer-events-auto"
        title={isOpen ? 'Collapse sidebar' : 'Open sidebar'}
        aria-label="Toggle chat history"
      >
        {isOpen ? (
          <X size={20} />
        ) : (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2 5h16M2 10h16M2 15h16" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
          </svg>
        )}
      </button>

      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Collapsible Left Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex flex-col w-[280px] bg-[#1E1F20] border-r border-[#333538]/60 transition-transform duration-300 ease-in-out pointer-events-auto ${isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
          }`}
      >
        {/* Top: Pill "New Chat" Button */}
        <div className="p-4 pt-18 pb-2">
          <button
            type="button"
            onClick={onNewChat}
            className="flex items-center gap-3 w-full bg-[#1A1A1C] hover:bg-[#333538] text-[#E3E3E3] px-4 py-3 rounded-full text-sm font-medium transition-colors border border-[#333538]/60 shadow-sm cursor-pointer"
          >
            <Plus size={18} className="text-[#C4C7C5]" />
            <span>New Chat</span>
          </button>
        </div>

        {/* Content: Scrollable list of past chat sessions */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
          <div className="px-3 pb-2 text-xs font-medium text-[#C4C7C5]/70">
            Recent
          </div>

          {sessions.length === 0 ? (
            <div className="px-3 py-4 text-xs text-[#C4C7C5]/50 italic text-center">
              No previous conversations
            </div>
          ) : (
            sessions.map((session) => {
              const isActive = session.id === activeSessionId;
              const isDeleting = deletingSessionId === session.id;
              return (
                <div
                  key={session.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => onSelectSession(session.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onSelectSession(session.id);
                    }
                  }}
                  className={`group flex items-center justify-between w-full px-3.5 py-2 rounded-full text-sm text-left transition-colors cursor-pointer select-none ${isActive
                      ? 'bg-[#333538] text-[#E3E3E3] font-medium'
                      : 'text-[#C4C7C5] hover:bg-[#333538]/70 hover:text-[#E3E3E3]'
                    }`}
                  title={session.title || 'Untitled Session'}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1 mr-2">
                    <MessageSquare size={16} className="flex-shrink-0 opacity-70" />
                    <span className="truncate">{session.title || 'Untitled Session'}</span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => onDeleteSession(session.id, e)}
                    disabled={isDeleting}
                    className="opacity-0 group-hover:opacity-100 hover:text-rose-400 p-1.5 rounded-full hover:bg-black/30 transition-all text-[#8E918F] shrink-0"
                    title="Delete conversation"
                    aria-label="Delete conversation"
                  >
                    {isDeleting ? (
                      <Loader2 size={13} className="animate-spin text-rose-400" />
                    ) : (
                      <Trash2 size={13} />
                    )}
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Sidebar Footer: sits side-by-side with bottom-left hamburger icon */}
        <div className="h-18 pl-14 pr-4 border-t border-[#333538]/40 flex items-center justify-between text-xs text-[#C4C7C5] shrink-0">
          <div className="flex flex-col min-w-0 pr-2">
            <span className="text-sm font-medium text-[#E3E3E3] truncate">
              {user?.name}
            </span>
            <span className="text-[11px] text-[#8E918F] truncate">
              {user?.email}
            </span>
          </div>
          <button
            type="button"
            onClick={onLogout}
            className="text-[#C4C7C5] hover:text-rose-400 hover:bg-[#333538]/60 p-2 rounded-full transition-colors cursor-pointer shrink-0"
            title="Log out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>
    </>
  );
}

