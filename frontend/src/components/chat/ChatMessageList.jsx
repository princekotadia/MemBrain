import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Brain } from 'lucide-react';

export default function ChatMessageList({ messages, isChatLoading, chatEndRef }) {
  return (
    <div className="flex-1 overflow-y-auto px-4 py-8 relative z-10">
      <div className="max-w-3xl mx-auto w-full flex flex-col">
        {messages.map((msg, index) => {
          const isUser = msg.role === 'user';
          const prevMsg = messages[index - 1];
          // Larger gap before a new user turn (after an AI reply)
          // Smaller gap between user bubble and the AI reply below it
          const marginTop =
            index === 0
              ? '0px'
              : prevMsg?.role === 'assistant'
                ? '50px' // AI → next User: increased gap
                : '30px'; // User → AI reply: base gap

          return (
            <div key={index} className="w-full" style={{ marginTop }}>
              {isUser ? (
                <div className="flex justify-end">
                  <div className="max-w-[85%] sm:max-w-[75%] bg-[#333538] text-[#E3E3E3] px-5 py-3 rounded-2xl sm:rounded-3xl text-[15px] sm:text-base leading-relaxed shadow-sm">
                    {msg.content}
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <Brain className="w-5 h-5 text-[#E3E3E3] shrink-0" />
                  </div>
                  <div className="flex-1 text-[#E3E3E3] text-[15px] sm:text-base leading-relaxed overflow-hidden">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        p: ({ children }) => (
                          <p className="mb-4 last:mb-0 leading-relaxed text-[#E3E3E3]">{children}</p>
                        ),
                        strong: ({ children }) => (
                          <strong className="font-semibold text-white">{children}</strong>
                        ),
                        ul: ({ children }) => (
                          <ul className="list-disc pl-5 my-3 space-y-2.5 text-[#E3E3E3]">{children}</ul>
                        ),
                        ol: ({ children }) => (
                          <ol className="list-decimal pl-5 my-3 space-y-2.5 text-[#E3E3E3]">{children}</ol>
                        ),
                        li: ({ children }) => (
                          <li className="leading-relaxed">{children}</li>
                        ),
                        code: ({ node, inline, className, children, ...props }) =>
                          inline ? (
                            <code className="bg-[#2A2B2D] text-[#E3E3E3] px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
                              {children}
                            </code>
                          ) : (
                            <pre className="bg-[#1E1F20] border border-[#333538] rounded-xl p-3 my-3 overflow-x-auto text-sm font-mono text-[#E3E3E3]">
                              <code {...props}>{children}</code>
                            </pre>
                          ),
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>

                    {/* Memory badge on its own row using Brain icon */}
                    {msg.contextChunksUsed > 0 && (
                      <div className="mt-3 flex">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1E1F20] border border-[#333538] text-xs text-[#C4C7C5]">
                          <Brain size={12} className="text-[#E3E3E3]" />
                          <span>{msg.contextChunksUsed} memory chunks recalled from journal</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {isChatLoading && (
          <div className="flex items-start gap-4 mt-6">
            <div className="flex-shrink-0 mt-1">
              <Brain className="w-5 h-5 text-[#E3E3E3] shrink-0" />
            </div>
            <div className="flex items-center gap-1.5 py-2">
              <div className="w-2 h-2 rounded-full bg-[#C4C7C5] animate-bounce [animation-delay:-0.3s]" />
              <div className="w-2 h-2 rounded-full bg-[#C4C7C5] animate-bounce [animation-delay:-0.15s]" />
              <div className="w-2 h-2 rounded-full bg-[#C4C7C5] animate-bounce" />
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>
    </div>
  );
}

