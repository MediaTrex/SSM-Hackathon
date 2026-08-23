import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { Dashboard } from './components/Dashboard';
import { AiAssistant } from './components/AiAssistant';
import { SystemMonitor } from './components/SystemMonitor';
import { ProcessViewer } from './components/ProcessViewer';
import { ServiceManager } from './components/ServiceManager';
import { FileManager } from './components/FileManager';
import { NetworkManager } from './components/NetworkManager';
import { ActivityLog } from './components/Placeholders';

const API_BASE_URL = 'http://localhost:8000/api';

function App() {
  const [activeTab, setActiveTab] = useState('overview');
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
    
    // Switch to assistant tab if we aren't already there
    if (activeTab !== 'assistant') {
      setActiveTab('assistant');
    }

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

  // Keyboard shortcut to focus assistant
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.code === 'Space') {
        e.preventDefault();
        setActiveTab('assistant');
        // A short timeout to ensure the tab renders before focusing
        setTimeout(() => {
          const input = document.querySelector('input[type="text"]') as HTMLInputElement;
          if (input) input.focus();
        }, 50);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <Dashboard metrics={metrics} setActiveTab={setActiveTab} />;
      case 'assistant':
        return (
          <AiAssistant 
            chatHistory={chatHistory}
            chatMessage={chatMessage}
            setChatMessage={setChatMessage}
            handleChatSubmit={handleChatSubmit}
            isProcessing={isProcessing}
          />
        );
      case 'system': return <SystemMonitor />;
      case 'processes': return <ProcessViewer />;
      case 'services': return <ServiceManager />;
      case 'files': return <FileManager />;
      case 'network': return <NetworkManager />;
      case 'activity': return <ActivityLog />;
      default: return <Dashboard metrics={metrics} setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="h-screen w-full flex overflow-hidden bg-linux-bg font-sans text-linux-text-primary selection:bg-linux-accent/20">
      
      {/* Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar metrics={metrics} />
        
        <main className="flex-1 overflow-y-auto overflow-x-hidden relative">
          {renderContent()}
        </main>
      </div>

    </div>
  );
}

export default App;
