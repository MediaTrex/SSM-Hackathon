import React, { useRef, useEffect } from 'react';

interface AiAssistantProps {
  chatHistory: any[];
  chatMessage: string;
  setChatMessage: (msg: string) => void;
  handleChatSubmit: (e: React.FormEvent) => void;
  isProcessing: boolean;
}

export const AiAssistant: React.FC<AiAssistantProps> = ({ 
  chatHistory, 
  chatMessage, 
  setChatMessage, 
  handleChatSubmit, 
  isProcessing 
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory, isProcessing]);

  return (
    <div className="flex flex-col h-full bg-linux-bg">
      
      {/* Chat Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6">
        
        {chatHistory.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-linux-text-muted space-y-4">
            <div className="text-4xl text-linux-border-hover mb-2 font-mono">{">_"}</div>
            <p className="mono text-sm">LinuxAI Terminal initialized.</p>
            <p className="text-xs">Type a command or ask a question to begin.</p>
          </div>
        )}

        {chatHistory.map((msg, i) => {
          if (msg.role === 'user') {
            return (
              <div key={i} className="border border-linux-border rounded-lg bg-linux-surface overflow-hidden">
                <div className="bg-linux-card px-4 py-1.5 border-b border-linux-border text-[10px] font-semibold text-linux-text-muted tracking-widest uppercase">
                  YOU
                </div>
                <div className="p-4 mono text-sm text-linux-text-primary whitespace-pre-wrap">
                  <span className="text-linux-accent mr-2">{">"}</span>{msg.content}
                </div>
              </div>
            );
          } else {
            const hasSource = msg.metadata?.tools_used && msg.metadata.tools_used.length > 0;
            return (
              <div key={i} className="border border-linux-border rounded-lg bg-linux-card overflow-hidden shadow-sm">
                <div className="bg-linux-surface px-4 py-1.5 border-b border-linux-border flex justify-between items-center text-[10px] font-semibold tracking-widest uppercase">
                  <span className="text-linux-text-primary">LINUXAI</span>
                  {hasSource && <span className="text-linux-accent flex items-center gap-1">✓ VERIFIED</span>}
                </div>
                
                <div className="p-4 text-sm text-linux-text-primary whitespace-pre-wrap leading-relaxed">
                  {msg.content}
                </div>

                {hasSource && (
                  <details className="border-t border-linux-border group">
                    <summary className="px-4 py-2 text-[10px] tracking-widest uppercase text-linux-text-muted cursor-pointer hover:bg-linux-surface transition-colors list-none flex items-center gap-2">
                      <span className="group-open:rotate-90 transition-transform">▶</span> TECHNICAL DETAILS
                    </summary>
                    <div className="px-4 pb-4 pt-2 bg-linux-surface mono text-xs text-linux-text-secondary space-y-2">
                      <div><span className="text-linux-text-muted">Tool:</span> {msg.metadata.tools_used.join(', ')}</div>
                      {msg.metadata.execution_time && <div><span className="text-linux-text-muted">Execution:</span> {msg.metadata.execution_time}s</div>}
                    </div>
                  </details>
                )}
              </div>
            );
          }
        })}

        {isProcessing && (
          <div className="border border-linux-border rounded-lg bg-linux-card overflow-hidden">
            <div className="bg-linux-surface px-4 py-1.5 border-b border-linux-border text-[10px] font-semibold text-linux-text-primary tracking-widest uppercase">
              LINUXAI
            </div>
            <div className="p-4 mono text-sm text-linux-text-secondary space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-linux-accent">●</span> Analyzing request...
              </div>
              <div className="flex items-center gap-2 pl-4 text-linux-text-muted">
                └─ Inspecting system...
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Input Area */}
      <div className="p-4 bg-linux-surface border-t border-linux-border flex-shrink-0">
        <form onSubmit={handleChatSubmit} className="max-w-4xl mx-auto relative group">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-linux-accent mono font-bold pointer-events-none">
            $
          </div>
          <input
            type="text"
            value={chatMessage}
            onChange={(e) => setChatMessage(e.target.value)}
            disabled={isProcessing}
            placeholder={isProcessing ? "Executing..." : "Ask LinuxAI about your system..."}
            className="w-full bg-linux-bg border border-linux-border rounded-lg py-3 pl-10 pr-4 text-sm mono text-linux-text-primary focus:outline-none focus:border-linux-accent/50 focus:shadow-[0_0_10px_rgba(0,255,136,0.1)] transition-all placeholder:text-linux-text-muted disabled:opacity-50"
          />
        </form>
      </div>

    </div>
  );
};
