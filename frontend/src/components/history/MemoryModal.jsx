import { X } from 'lucide-react';

export default function MemoryModal({ memory, onClose }) {
  if (!memory) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-[#1E1F20] border border-[#333538] rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-[#333538]/60 mb-4">
          <div className="text-xs font-medium text-[#C4C7C5]">
            {new Date(memory.created_at).toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}{' '}
            •{' '}
            {new Date(memory.created_at).toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
              hour12: true,
            })}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[#C4C7C5] hover:text-white p-1.5 rounded-full hover:bg-[#333538] transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        <div className="text-[15px] text-[#E3E3E3] leading-relaxed whitespace-pre-wrap max-h-[60vh] overflow-y-auto pr-2">
          {memory.raw_content}
        </div>
      </div>
    </div>
  );
}

