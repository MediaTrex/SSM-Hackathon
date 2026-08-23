import React from 'react';
import { Settings, Cpu, Activity, HardDrive } from 'lucide-react';

interface TopbarProps {
  metrics: any;
}

export const Topbar: React.FC<TopbarProps> = ({ metrics }) => {
  return (
    <header className="h-12 bg-linux-surface border-b border-linux-border flex items-center justify-between px-4 text-sm flex-shrink-0">
      
      {/* Left: Window Title area */}
      <div className="flex items-center gap-4 text-linux-text-secondary">
        <span className="font-semibold text-linux-text-primary">LinuxAI</span>
        <div className="flex items-center gap-1.5 text-xs bg-linux-card px-2 py-0.5 rounded border border-linux-border">
          <span className="w-1.5 h-1.5 rounded-full bg-linux-accent"></span>
          <span className="text-linux-text-muted">SYSTEM ONLINE</span>
        </div>
      </div>

      {/* Center: Quick Metrics (if available) */}
      <div className="hidden md:flex items-center gap-6 text-xs mono text-linux-text-secondary">
        <div className="flex items-center gap-2">
          <Cpu size={14} className="text-linux-text-muted" />
          <span>CPU {metrics?.cpu_percent ?? '--'}%</span>
        </div>
        <div className="flex items-center gap-2">
          <Activity size={14} className="text-linux-text-muted" />
          <span>RAM {metrics?.memory?.percent ?? '--'}%</span>
        </div>
        <div className="flex items-center gap-2">
          <HardDrive size={14} className="text-linux-text-muted" />
          <span>DISK {metrics?.disk?.percent ?? '--'}%</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-linux-accent"></div>
          <span>NETWORK</span>
        </div>
      </div>

      {/* Right: Tools / Settings */}
      <div className="flex items-center gap-3">
        <button className="text-linux-text-muted hover:text-linux-text-primary transition-colors">
          <Settings size={16} />
        </button>
      </div>

    </header>
  );
};
