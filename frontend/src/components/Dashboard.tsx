import React from 'react';
import { Cpu, Activity, HardDrive, Network } from 'lucide-react';

interface DashboardProps {
  metrics: any;
  setActiveTab: (tab: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ metrics, setActiveTab }) => {
  return (
    <div className="p-8 max-w-6xl mx-auto w-full space-y-8">
      
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-linux-text-primary">LINUXAI</h1>
        <p className="text-sm text-linux-text-muted uppercase tracking-widest">AI-Powered Linux Operations Assistant</p>
      </div>

      <div className="space-y-4">
        <h2 className="text-sm font-semibold text-linux-text-secondary border-b border-linux-border pb-2">SYSTEM STATUS</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          
          <div className="bg-linux-card border border-linux-border rounded-lg p-4 flex flex-col justify-between">
            <div className="flex justify-between items-start text-linux-text-secondary mb-4">
              <span className="font-semibold text-xs tracking-wider">CPU</span>
              <Cpu size={16} className="text-linux-text-muted" />
            </div>
            <div>
              <div className="text-2xl font-semibold mono text-linux-text-primary mb-2">{metrics?.cpu_percent ?? '--'}%</div>
              <div className="w-full bg-linux-surface rounded-full h-1.5 mb-2">
                <div className="bg-linux-accent h-1.5 rounded-full" style={{ width: `${metrics?.cpu_percent || 0}%` }}></div>
              </div>
              <div className="text-[10px] text-linux-text-muted mono">{metrics?.cpu_count || '--'} cores</div>
            </div>
          </div>

          <div className="bg-linux-card border border-linux-border rounded-lg p-4 flex flex-col justify-between">
            <div className="flex justify-between items-start text-linux-text-secondary mb-4">
              <span className="font-semibold text-xs tracking-wider">RAM</span>
              <Activity size={16} className="text-linux-text-muted" />
            </div>
            <div>
              <div className="text-2xl font-semibold mono text-linux-text-primary mb-2">{metrics?.memory?.percent ?? '--'}%</div>
              <div className="w-full bg-linux-surface rounded-full h-1.5 mb-2">
                <div className="bg-linux-info h-1.5 rounded-full" style={{ width: `${metrics?.memory?.percent || 0}%` }}></div>
              </div>
              <div className="text-[10px] text-linux-text-muted mono">
                {metrics?.memory ? `${(metrics.memory.used / (1024**3)).toFixed(1)} GB / ${(metrics.memory.total / (1024**3)).toFixed(1)} GB` : '--'}
              </div>
            </div>
          </div>

          <div className="bg-linux-card border border-linux-border rounded-lg p-4 flex flex-col justify-between">
            <div className="flex justify-between items-start text-linux-text-secondary mb-4">
              <span className="font-semibold text-xs tracking-wider">DISK</span>
              <HardDrive size={16} className="text-linux-text-muted" />
            </div>
            <div>
              <div className="text-2xl font-semibold mono text-linux-text-primary mb-2">{metrics?.disk?.percent ?? '--'}%</div>
              <div className="w-full bg-linux-surface rounded-full h-1.5 mb-2">
                <div className="bg-linux-warning h-1.5 rounded-full" style={{ width: `${metrics?.disk?.percent || 0}%` }}></div>
              </div>
              <div className="text-[10px] text-linux-text-muted mono">
                {metrics?.disk ? `${(metrics.disk.used / (1024**3)).toFixed(1)} GB / ${(metrics.disk.total / (1024**3)).toFixed(1)} GB` : '--'}
              </div>
            </div>
          </div>

          <div className="bg-linux-card border border-linux-border rounded-lg p-4 flex flex-col justify-between">
            <div className="flex justify-between items-start text-linux-text-secondary mb-4">
              <span className="font-semibold text-xs tracking-wider">NETWORK</span>
              <Network size={16} className="text-linux-text-muted" />
            </div>
            <div>
              <div className="text-lg font-semibold mono text-linux-accent mb-2 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-linux-accent"></div>
                ONLINE
              </div>
              <div className="w-full bg-linux-surface rounded-full h-1.5 mb-2">
                <div className="bg-linux-surface h-1.5 rounded-full w-full"></div>
              </div>
              <div className="text-[10px] text-linux-text-muted mono">Connected</div>
            </div>
          </div>

        </div>
      </div>

      <div className="space-y-4 pt-4">
        <h2 className="text-sm font-semibold text-linux-text-secondary border-b border-linux-border pb-2">QUICK ACTIONS</h2>
        <div className="flex flex-wrap gap-3">
          {['Diagnose System', 'Check System Health', 'Find Files', 'Inspect Processes', 'Check Services'].map((action) => (
            <button 
              key={action}
              onClick={() => setActiveTab('assistant')}
              className="px-4 py-2 bg-linux-surface border border-linux-border rounded text-sm text-linux-text-secondary hover:text-linux-text-primary hover:border-linux-border-hover transition-colors shadow-sm"
            >
              [ {action} ]
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4 pt-4">
        <h2 className="text-sm font-semibold text-linux-text-secondary border-b border-linux-border pb-2">ASK LINUXAI</h2>
        <div 
          onClick={() => setActiveTab('assistant')}
          className="bg-linux-card border border-linux-border rounded-lg p-4 flex items-center gap-3 cursor-text group hover:border-linux-accent/50 transition-colors"
        >
          <span className="text-linux-accent mono font-bold">$</span>
          <span className="text-linux-text-muted mono text-sm group-hover:text-linux-text-secondary">What would you like to do?</span>
          <span className="w-2 h-4 bg-linux-accent animate-pulse"></span>
        </div>
        <div className="flex gap-4 text-xs mono text-linux-text-muted">
          <span className="hover:text-linux-text-secondary cursor-pointer" onClick={() => setActiveTab('assistant')}>{">"} Why is my system slow?</span>
          <span className="hover:text-linux-text-secondary cursor-pointer" onClick={() => setActiveTab('assistant')}>{">"} What CPU do I have?</span>
          <span className="hover:text-linux-text-secondary cursor-pointer" onClick={() => setActiveTab('assistant')}>{">"} Check nginx</span>
        </div>
      </div>

    </div>
  );
};
