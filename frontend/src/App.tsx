import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Terminal, Activity, Cpu, HardDrive } from 'lucide-react';

const API_BASE_URL = 'http://localhost:8000/api';

function App() {
  const [metrics, setMetrics] = useState<any>(null);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const conversationId = useRef(Math.random().toString(36).substring(7));

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/metrics/system`);
        setMetrics(res.data);
      } catch (e) {
        console.error("Error fetching metrics", e);
      }
    };
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;
    
    const newHistory = [...chatHistory, { role: 'user', content: chatMessage }];
    setChatHistory(newHistory);
    setChatMessage('');
    setIsProcessing(true);

    try {
      const res = await axios.post(`${API_BASE_URL}/chat`, { 
        message: chatMessage,
        conversation_id: conversationId.current
      });
      setChatHistory([...newHistory, { role: 'ai', content: res.data.response, metadata: res.data.metadata }]);
    } catch (e) {
      setChatHistory([...newHistory, { role: 'ai', content: "Error communicating with the agent." }]);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-8 flex flex-col gap-8">
      <header className="flex items-center gap-4 border-b border-slate-700 pb-4">
        <Terminal className="text-teal-400 w-8 h-8" />
        <h1 className="text-3xl font-bold tracking-tight">LinuxAI Operations Assistant</h1>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1">
        
        {/* Left Column: Metrics */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Activity className="text-blue-400" /> System Metrics
            </h2>
            {metrics ? (
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1 text-sm text-slate-400">
                    <span className="flex items-center gap-2"><Cpu className="w-4 h-4"/> CPU Usage</span>
                    <span>{metrics.cpu_percent}%</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${metrics.cpu_percent}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1 text-sm text-slate-400">
                    <span className="flex items-center gap-2"><Activity className="w-4 h-4"/> RAM Usage</span>
                    <span>{metrics.memory.percent}%</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${metrics.memory.percent}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1 text-sm text-slate-400">
                    <span className="flex items-center gap-2"><HardDrive className="w-4 h-4"/> Disk Usage</span>
                    <span>{metrics.disk.percent}%</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div className="bg-teal-500 h-2 rounded-full" style={{ width: `${metrics.disk.percent}%` }}></div>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-slate-500 text-sm animate-pulse">Loading metrics...</p>
            )}
          </div>
        </div>

        {/* Right Column: Chat */}
        <div className="lg:col-span-2 bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg flex flex-col h-[70vh]">
          <h2 className="text-xl font-semibold mb-4 border-b border-slate-700 pb-2">AI Terminal</h2>
          
          <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
            {chatHistory.length === 0 && (
              <p className="text-slate-500 text-center mt-10">Ask me anything about your Linux system...</p>
            )}
            {chatHistory.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-lg ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-200'}`}>
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  {msg.metadata && msg.metadata.tools_used && msg.metadata.tools_used.length > 0 && (
                    <details className="mt-2 text-xs border-t border-slate-600 pt-2 text-slate-400">
                      <summary className="cursor-pointer hover:text-slate-300 transition-colors">Technical Details ▼</summary>
                      <div className="mt-2 bg-slate-800 p-2 rounded">
                        <p><strong>Tools used:</strong> {msg.metadata.tools_used.join(', ')}</p>
                        {msg.metadata.execution_time && <p><strong>Execution time:</strong> {msg.metadata.execution_time}s</p>}
                      </div>
                    </details>
                  )}
                </div>
              </div>
            ))}
            {isProcessing && (
              <div className="flex justify-start">
                <div className="max-w-[80%] p-3 rounded-lg bg-slate-700 text-slate-200">
                  <p className="flex items-center gap-2 animate-pulse">
                    <span className="text-teal-400">🔍</span> Inspecting your system...
                  </p>
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleChatSubmit} className="flex gap-2 relative">
            <input 
              type="text" 
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              placeholder="e.g. Why is my system slow?"
              className="flex-1 bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 focus:outline-none focus:border-teal-400 transition-colors"
            />
            <button type="submit" disabled={isProcessing} className={`font-semibold px-6 rounded-lg transition-colors ${isProcessing ? 'bg-slate-600 text-slate-400 cursor-not-allowed' : 'bg-teal-500 hover:bg-teal-400 text-slate-900'}`}>
              Execute
            </button>
          </form>
        </div>
        
      </div>
    </div>
  );
}

export default App;
