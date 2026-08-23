import React from 'react';
import {
  Terminal, LayoutDashboard, Cpu, Activity,
  Box, HardDrive, Network, Folder
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const TABS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'assistant', label: 'Assistant', icon: Terminal },
  { id: 'system', label: 'System', icon: Cpu },
  { id: 'processes', label: 'Processes', icon: Activity },
  { id: 'services', label: 'Services', icon: Box },
  { id: 'files', label: 'Files', icon: HardDrive },
  { id: 'network', label: 'Network', icon: Network },
  { id: 'activity', label: 'Activity', icon: Activity },
];

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  return (
    <div className="w-64 bg-linux-surface border-r border-linux-border flex flex-col h-full flex-shrink-0">
      <div className="p-4 flex items-center gap-3 border-b border-linux-border">
        <div className="w-8 h-8 flex items-center justify-center bg-linux-card border border-linux-border rounded shadow-sm text-linux-accent">
          <Terminal size={18} />
        </div>
        <div>
          <h1 className="font-semibold text-linux-text-primary text-sm tracking-wide">LINUXAI</h1>
          <p className="text-[10px] text-linux-text-muted uppercase tracking-wider">System Online</p>
        </div>
      </div>
      {/* comt */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors ${isActive
                  ? 'bg-linux-card text-linux-accent border border-linux-border shadow-sm'
                  : 'text-linux-text-secondary hover:text-linux-text-primary hover:bg-linux-card/50 border border-transparent'
                }`}
            >
              <Icon size={16} className={isActive ? 'text-linux-accent' : 'text-linux-text-muted'} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-linux-border bg-linux-surface text-xs space-y-3">
        {/* <div className="flex items-center gap-2 text-linux-text-secondary">
          <User size={14} className="text-linux-text-muted" />
          <span className="mono">● roshan</span>
        </div> */}
        <div className="flex items-center gap-2 text-linux-text-secondary">
          <Folder size={14} className="text-linux-text-muted" />
          <span className="mono truncate">~/Downloads</span>
        </div>
        <div className="flex items-center gap-2 text-linux-text-secondary">
          <div className="w-3 h-3 rounded-full bg-linux-accent/20 flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-linux-accent animate-pulse"></div>
          </div>
          <span>System Online</span>
        </div>
      </div>
    </div>
  );
};
