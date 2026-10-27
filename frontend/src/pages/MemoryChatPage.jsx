import { Loader2, Compass } from 'lucide-react';
import ChatMessageList from '../components/chat/ChatMessageList';
import ChatInput from '../components/chat/ChatInput';
import { SUGGESTED_PROMPTS } from '../constants';

export default function MemoryChatPage({
  isSidebarOpen,
  isHistoryLoading,
  isChatLoading,
  messages,
  chatInput,
  textareaRef,
  chatEndRef,
  onChangeChatInput,
  onKeyDownChatInput,
  onSubmitChat,
  onSelectPromptChip,
}) {
  return (
    <div
      className={`flex-1 flex flex-col h-[calc(100vh-64px)] overflow-hidden transition-all duration-300 relative ${isSidebarOpen ? 'md:pl-[280px]' : 'pl-0'
        }`}
    >
      {/* Ambient Gemini Deep-Blue Glow in Center */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden">
        <div className="w-[700px] h-[500px] rounded-full bg-blue-700/15 blur-[140px] opacity-80" />
      </div>

      {isHistoryLoading ? (
        <div className="flex-1 flex flex-col items-center justify-center text-[#C4C7C5] gap-3 relative z-10">
          <Loader2 size={24} className="animate-spin text-[#4E95FF]" />
          <span className="text-sm">Loading conversation history...</span>
        </div>
      ) : messages.length === 0 ? (
        /* EMPTY STATE: Vertically & Horizontally Centered Greeting, Input Pill, and Suggestion Chips */
        <div className="flex-1 flex flex-col justify-center items-center px-4 py-8 max-w-3xl w-full mx-auto relative z-10 overflow-y-auto">
          {/* Centered Heading */}
          <div className="flex flex-col items-center text-center mb-7">
            <div className="flex items-center gap-3 mb-3">
              <h1 className="text-4xl sm:text-5xl font-normal tracking-wide bg-gradient-to-b from-white via-[#E3E3E3] to-[#8E918F] bg-clip-text text-transparent major-mono-display-regular">
                Recall & Reflect
              </h1>
            </div>
            <p className="text-[#9AA0A6] text-sm sm:text-base leading-relaxed max-w-lg">
              Ask questions about your thoughts, past habits, projects, or feelings.
            </p>
          </div>

          {/* Centered Chat Input Pill */}
          <div className="w-full mt-8 mb-8">
            <ChatInput
              textareaRef={textareaRef}
              value={chatInput}
              onChange={onChangeChatInput}
              onKeyDown={onKeyDownChatInput}
              onSubmit={onSubmitChat}
              isLoading={isChatLoading}
              isDisabled={isHistoryLoading}
            />
          </div>

          {/* Suggested Chips Below Input */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
            {SUGGESTED_PROMPTS.map((promptText, i) => (
              <button
                key={i}
                type="button"
                onClick={() => onSelectPromptChip(promptText)}
                className="flex items-center justify-between p-4 rounded-2xl bg-[#1E1F20]/90 hover:bg-[#333538] border border-[#333538]/60 text-left text-sm text-[#C4C7C5] hover:text-[#E3E3E3] transition-all group shadow-sm cursor-pointer"
              >
                <span className="line-clamp-2">{promptText}</span>
                <Compass
                  size={16}
                  className="flex-shrink-0 text-[#C4C7C5] opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all ml-2"
                />
              </button>
            ))}
          </div>
        </div>
      ) : (
        /* ACTIVE CONVERSATION STATE: Scrollable Messages + Bottom Pinned Input */
        <>
          <ChatMessageList
            messages={messages}
            isChatLoading={isChatLoading}
            chatEndRef={chatEndRef}
          />

          {/* Input Area (Fixed Bottom) */}
          <div className="w-full max-w-3xl mx-auto px-4 pb-6 pt-2 relative z-10">
            <ChatInput
              textareaRef={textareaRef}
              value={chatInput}
              onChange={onChangeChatInput}
              onKeyDown={onKeyDownChatInput}
              onSubmit={onSubmitChat}
              isLoading={isChatLoading}
              isDisabled={isHistoryLoading}
              showFooterHint={true}
            />
          </div>
        </>
      )}
    </div>
  );
}

