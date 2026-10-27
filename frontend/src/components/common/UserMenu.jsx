import { X, Clock, MessageSquare, PenLine, LogOut } from 'lucide-react';

export default function UserMenu({
  user,
  activeView,
  isOpen,
  onToggle,
  onClose,
  onSelectView,
  onLogout,
}) {
  if (activeView !== 'dump' && activeView !== 'history') {
    return null;
  }

  return (
    <>
      {/* Borderless bottom-left toggle button */}
      <button
        type="button"
        onClick={onToggle}
        className="fixed bottom-4 left-4 z-50 flex items-center justify-center p-2 text-[#C4C7C5] hover:text-[#E3E3E3] transition-colors cursor-pointer pointer-events-auto"
        title={isOpen ? 'Close menu' : 'Open menu'}
        aria-label="Toggle user menu"
      >
        {isOpen ? (
          <X size={20} />
        ) : (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2 5h16M2 10h16M2 15h16" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
          </svg>
        )}
      </button>

      {/* Backdrop to close popup on outside click */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={onClose}
        />
      )}

      {/* Small Floating Popup Card */}
      {isOpen && (
        <div className="fixed bottom-14 left-4 z-50 w-64 bg-[#1E1F20] border border-[#333538] rounded-2xl p-4 shadow-2xl animate-fade-in pointer-events-auto">
          {/* User Info Header */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#333538] text-[#E3E3E3] flex items-center justify-center font-semibold text-sm shrink-0">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-sm font-medium text-[#E3E3E3] truncate block">
                {user?.name}
              </span>
              <span className="text-xs text-[#8E918F] truncate block">
                {user?.email}
              </span>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-[#333538]/60 my-3" />

          {/* Quick Actions inside Popup */}
          <div className="space-y-1">
            {activeView !== 'history' && (
              <button
                type="button"
                onClick={() => {
                  onSelectView('history');
                  onClose();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium text-[#C4C7C5] hover:text-[#E3E3E3] hover:bg-[#333538]/60 transition-colors cursor-pointer text-left"
              >
                <Clock size={15} />
                <span>Timeline History</span>
              </button>
            )}
            {activeView !== 'chat' && (
              <button
                type="button"
                onClick={() => {
                  onSelectView('chat');
                  onClose();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium text-[#C4C7C5] hover:text-[#E3E3E3] hover:bg-[#333538]/60 transition-colors cursor-pointer text-left"
              >
                <MessageSquare size={15} />
                <span>Memory Chat</span>
              </button>
            )}
            {activeView !== 'dump' && (
              <button
                type="button"
                onClick={() => {
                  onSelectView('dump');
                  onClose();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium text-[#C4C7C5] hover:text-[#E3E3E3] hover:bg-[#333538]/60 transition-colors cursor-pointer text-left"
              >
                <PenLine size={15} />
                <span>Brain Dump</span>
              </button>
            )}
            <button
              type="button"
              onClick={onLogout}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer text-left"
            >
              <LogOut size={15} />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}

