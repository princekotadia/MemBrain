import { THOUGHT_STARTERS } from '../constants';

export default function BrainDumpPage({
  dumpText,
  dumpTextareaRef,
  onChangeDump,
  onKeyDownDump,
  onSubmitDump,
  onInsertTag,
  isLoading,
}) {
  const dumpWordCount = dumpText.trim() ? dumpText.trim().split(/\s+/).length : 0;
  const dumpCharCount = dumpText.length;

  return (
    <div className="flex-1 overflow-y-auto px-4 py-8 relative scrollbar-none">
      {/* 1. Ambient Background Depth: Radial Spotlight */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_35%,rgba(56,189,248,0.06),rgba(139,92,246,0.04),transparent)]" />
      </div>

      <div className="w-[90%] md:w-[62%] max-w-4xl mx-auto flex flex-col items-center min-h-[calc(100vh-120px)] justify-center pb-12 relative z-10">
        {/* 2. Editorial Header */}
        <div className="w-full text-center mb-8 flex flex-col items-center">
          <h1 className="text-4xl sm:text-5xl font-normal tracking-wide bg-gradient-to-b from-white via-[#E3E3E3] to-[#8E918F] bg-clip-text text-transparent major-mono-display-regular">
            brain dump
          </h1>
          <p className="text-base text-[#9AA0A6] mt-2 max-w-lg leading-relaxed">
            Drop your raw, unstructured thoughts. Everything is saved and indexed.
          </p>
        </div>

        {/* 3. Composer Box — Collapsed to half height without action bar when empty; expands upon typing */}
        <form
          onSubmit={onSubmitDump}
          style={{
            marginTop: '48px',
            boxShadow:
              '0 8px 85px 25px rgba(79, 112, 229, 0.10), 0 12px 140px 45px rgba(56, 102, 214, 0.07), 0 16px 50px 10px rgba(0, 0, 0, 0.75)',
            transition: 'box-shadow 0.4s ease, padding 0.25s ease',
          }}
          onFocus={(e) => {
            e.currentTarget.style.boxShadow =
              '0 8px 85px 28px rgba(79, 112, 229, 0.14), 0 12px 140px 50px rgba(56, 102, 214, 0.10), 0 16px 50px 10px rgba(0, 0, 0, 0.75)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.boxShadow =
              '0 8px 85px 25px rgba(79, 112, 229, 0.10), 0 12px 140px 45px rgba(56, 102, 214, 0.07), 0 16px 50px 10px rgba(0, 0, 0, 0.75)';
          }}
          className={`w-full flex flex-col bg-[#111214] border border-[#333538] rounded-3xl transition-all duration-300 ease-out ${dumpText.length > 0 ? 'p-6' : 'p-4 sm:p-5'
            }`}
        >
          <textarea
            ref={dumpTextareaRef}
            value={dumpText}
            onChange={onChangeDump}
            onKeyDown={onKeyDownDump}
            disabled={isLoading}
            placeholder="Write freely... What happened today? What are you learning, reading, feeling, or planning? Press ⌘+Enter to save..."
            className={`w-full bg-transparent border-none outline-none resize-none text-sm sm:text-[15px] placeholder:text-sm sm:placeholder:text-[15px] text-[#E3E3E3] placeholder-[#5F6368] leading-relaxed overflow-y-auto transition-[min-height] duration-200 ${dumpText.length > 0 ? 'min-h-[144px] max-h-[380px]' : 'min-h-[72px] max-h-[72px]'
              }`}
            autoFocus
          />

          {/* Bottom Action Row - Rendered only when user types something */}
          {dumpText.length > 0 && (
            <div className="flex items-center justify-between pt-4 mt-2 border-t border-white/[0.04]">
              <div className="flex items-center gap-2 font-mono text-xs text-[#6E7278]">
                <span>
                  {dumpWordCount} {dumpWordCount === 1 ? 'word' : 'words'}
                </span>
                <span className="text-white/15">•</span>
                <span>{dumpCharCount} chars</span>
              </div>

              <button
                type="submit"
                disabled={isLoading || !dumpText.trim()}
                className={`px-5 py-2.5 rounded-full font-medium text-xs sm:text-sm transition-all ${dumpText.trim() && !isLoading
                    ? 'bg-[#E3E3E3] text-black hover:bg-white shadow-[0_0_20px_rgba(255,255,255,0.15)] cursor-pointer'
                    : 'bg-white/[0.05] text-[#5F6368] border border-white/[0.06] cursor-not-allowed opacity-50'
                  }`}
              >
                {isLoading ? 'Saving...' : 'Save Thought'}
              </button>
            </div>
          )}
        </form>

        {/* 4. Thought-Starter / Tag Pills */}
        <div className="w-full flex items-center justify-center flex-wrap gap-2" style={{ marginTop: '32px' }}>
          {THOUGHT_STARTERS.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onInsertTag(item.label)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-[#141517] text-[#C4C7C5] border border-white/[0.07] hover:border-white/20 hover:bg-[#1E1F20] hover:text-white transition-all cursor-pointer shadow-sm active:scale-95"
            >
              <span>{item.emoji}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

