import { ArrowUp, Loader2 } from 'lucide-react';

export default function ChatInput({
  textareaRef,
  value,
  onChange,
  onKeyDown,
  onSubmit,
  isLoading,
  isDisabled,
  showFooterHint = false,
}) {
  return (
    <div className="w-full">
      <form onSubmit={onSubmit} className="relative">
        <div className="flex items-center gap-3 bg-[#1E1F20] border border-[#333538] rounded-[32px] px-5 py-3.5 focus-within:border-[#4E95FF]/60 shadow-lg transition-all">
          <textarea
            ref={textareaRef}
            rows={1}
            value={value}
            onChange={onChange}
            onKeyDown={onKeyDown}
            placeholder="Ask MemBrain about your memories..."
            disabled={isDisabled || isLoading}
            className="flex-1 bg-transparent border-none outline-none text-[#E3E3E3] placeholder-[#6b7280] placeholder:text-white/35 text-[15px] sm:text-base leading-relaxed resize-none max-h-36 overflow-y-auto"
          />

          <button
            type="submit"
            disabled={isDisabled || isLoading || !value.trim()}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all flex-shrink-0 ${value.trim() && !isLoading && !isDisabled
                ? 'bg-[#E3E3E3] text-black hover:bg-white cursor-pointer shadow-sm'
                : 'text-[#71767B] bg-transparent cursor-not-allowed opacity-40'
              }`}
            aria-label="Send prompt"
          >
            {isLoading ? (
              <Loader2 size={16} className="animate-spin text-[#C4C7C5]" />
            ) : (
              <ArrowUp className="w-5 h-5" />
            )}
          </button>
        </div>
      </form>
      {showFooterHint && (
        <p className="text-xs text-[#8E918F] text-center mt-2">
          MemBrain remembers your past journal entries and short-term conversation.
        </p>
      )}
    </div>
  );
}

