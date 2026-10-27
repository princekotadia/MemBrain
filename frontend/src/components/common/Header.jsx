import { PenLine, MessageSquare, Clock } from 'lucide-react';
import AnimatedAppName from './AnimatedAppName';

export default function Header({ activeView, onSelectView }) {
  return (
    <>
      {/* 1. App Name "MemBrain" Fixed in Top-Left Corner */}
      <div className="fixed top-4 left-6 z-50 flex items-center select-none pointer-events-auto">
        <AnimatedAppName className="text-[1.35rem] tracking-wider text-[#E3E3E3] major-mono-display-regular" />
      </div>

      {/* 2. Sleek Segmented Toggle Centered at Top */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-40 flex items-center bg-[#1E1F20] border border-[#333538] rounded-full p-1 shadow-lg pointer-events-auto">
        <button
          type="button"
          onClick={() => onSelectView('dump')}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all ${activeView === 'dump' || activeView === 'history'
            ? 'bg-[#333538] text-[#E3E3E3] shadow-sm'
            : 'text-[#C4C7C5] hover:text-[#E3E3E3] hover:bg-[#282A2D]'
            }`}
        >
          <PenLine size={14} />
          <span>Brain Dump</span>
        </button>
        <button
          type="button"
          onClick={() => onSelectView('chat')}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all ${activeView === 'chat'
            ? 'bg-[#333538] text-[#E3E3E3] shadow-sm'
            : 'text-[#C4C7C5] hover:text-[#E3E3E3] hover:bg-[#282A2D]'
            }`}
        >
          <MessageSquare size={14} />
          <span>Memory Chat</span>
        </button>
      </div>

      {/* 3. Top-Right "History" Button (Rendered ONLY on Brain Dump Page) */}
      {activeView === 'dump' && (
        <button
          type="button"
          onClick={() => onSelectView('history')}
          className="fixed top-4 right-6 z-50 flex items-center gap-2 px-4 py-2 rounded-full bg-[#1E1F20] text-[#E3E3E3] border border-[#333538] hover:bg-[#333538] transition-colors text-sm font-medium shadow-sm pointer-events-auto cursor-pointer"
        >
          <Clock size={15} className="text-[#C4C7C5]" />
          <span>History</span>
        </button>
      )}
    </>
  );
}

