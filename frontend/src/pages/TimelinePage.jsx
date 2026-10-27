import { ArrowLeft, Clock, Loader2 } from 'lucide-react';

export default function TimelinePage({
  groupedTimeline,
  journalEntriesCount,
  isLoading,
  onBackToDump,
  onSelectMemory,
}) {
  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-64px)] overflow-hidden">
      {/* Top Navigation for Timeline View */}
      <div className="max-w-4xl w-full mx-auto px-6 pt-4 pb-2 flex items-center justify-between flex-shrink-0">
        <button
          type="button"
          onClick={onBackToDump}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1E1F20] hover:bg-[#333538] border border-[#333538] text-xs font-medium text-[#C4C7C5] hover:text-[#E3E3E3] transition-colors shadow-sm cursor-pointer"
        >
          <ArrowLeft size={14} />
          <span>Back to Brain Dump</span>
        </button>

        <div className="text-xs text-[#C4C7C5]/60">
          {journalEntriesCount} total {journalEntriesCount === 1 ? 'thought' : 'thoughts'} recorded
        </div>
      </div>

      {/* Scrollable Timeline Area */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="max-w-4xl mx-auto w-full">
          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-semibold text-[#E3E3E3] tracking-tight">
              Timeline History
            </h2>
            <p className="text-[#C4C7C5] text-sm mt-1">
              Your un-chunked memories, reflections, and thoughts grouped chronologically by day.
            </p>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center min-h-[40vh] text-[#C4C7C5] gap-3">
              <Loader2 size={24} className="animate-spin text-[#4E95FF]" />
              <span className="text-sm">Loading journal timeline...</span>
            </div>
          ) : groupedTimeline.length === 0 ? (
            <div className="min-h-[40vh] flex flex-col items-center justify-center text-center p-8 bg-[#1E1F20] border border-[#333538] rounded-3xl">
              <Clock size={36} className="text-[#C4C7C5]/40 mb-3" />
              <h3 className="text-lg font-medium text-[#E3E3E3]">No journal thoughts recorded yet</h3>
              <p className="text-sm text-[#C4C7C5] mt-1 max-w-sm">
                When you save thoughts in the Brain Dump workspace, they will appear here along this timeline.
              </p>
              <button
                type="button"
                onClick={onBackToDump}
                className="mt-5 px-5 py-2 rounded-full bg-[#E3E3E3] text-black text-xs font-medium hover:bg-white transition-colors cursor-pointer"
              >
                Write First Thought
              </button>
            </div>
          ) : (
            <div className="space-y-0">
              {groupedTimeline.map((group) => (
                <div key={group.dateKey} className="flex items-start gap-6 relative">
                  {/* 1. Left of the Bar (Date Column) */}
                  <div className="w-28 text-right pt-1 shrink-0">
                    <span className="text-sm font-medium text-[#C4C7C5]">
                      {group.formattedDate}
                    </span>
                  </div>

                  {/* 2. The Vertical Timeline Bar & Node Dot */}
                  <div className="w-[2px] bg-[#333538] self-stretch relative shrink-0">
                    {/* Circular node dot */}
                    <div className="w-3.5 h-3.5 rounded-full bg-[#E3E3E3] ring-4 ring-black absolute -left-[6px] top-2" />
                  </div>

                  {/* 3. Right of the Bar (Day Title + Horizontally Scrollable Memory Tiles) */}
                  <div className="flex-1 min-w-0 pb-12">
                    {/* Day Name */}
                    <h3 className="text-xl font-semibold text-[#E3E3E3] mb-4">
                      {group.dayName}
                    </h3>

                    {/* Horizontal Scrollable Tiles */}
                    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin">
                      {group.memories.map((entry) => (
                        <div
                          key={entry.id}
                          onClick={() => onSelectMemory(entry)}
                          className="w-72 h-44 shrink-0 flex flex-col justify-between p-4 rounded-2xl bg-[#1E1F20] border border-[#333538] hover:border-[#555] transition-all cursor-pointer group shadow-sm hover:shadow-md"
                        >
                          <div className="text-sm text-[#E3E3E3] leading-relaxed line-clamp-4 overflow-hidden">
                            {entry.raw_content}
                          </div>
                          <div className="text-xs text-[#C4C7C5] mt-3 pt-2 border-t border-[#333538]/60 flex items-center justify-between">
                            <span>{entry.formattedTime}</span>
                            <span className="text-[10px] text-[#C4C7C5]/50 opacity-0 group-hover:opacity-100 transition-opacity">
                              Click to expand
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

