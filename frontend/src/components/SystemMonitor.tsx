import { useState, useEffect } from 'react';
import axios from 'axios';
import { Cpu, Server, Hash, Layers } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

export const SystemMonitor = () => {
  const [identity, setIdentity] = useState<any>(null);
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchIdentity = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/system/identity`);
        setIdentity(res.data);
      } catch (err: any) {
        setError(err.message);
      }
    };
    fetchIdentity();
  }, []);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/metrics/system`);
        setMetrics(res.data);
        setLoading(false);
      } catch (err: any) {
        setError(err.message);
      }
    };
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 2000);
    return () => clearInterval(interval);
  }, []);

  if (error) {
    return (
      <div className="p-8 max-w-6xl mx-auto w-full">
        <div className="border border-linux-warning rounded bg-linux-card p-6">
          <h2 className="text-linux-warning font-semibold mb-2">⚠ SYSTEM INFORMATION UNAVAILABLE</h2>
          <p className="text-linux-text-secondary mono text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (loading || !identity) {
    return (
      <div className="p-8 max-w-6xl mx-auto w-full flex items-center justify-center h-full">
        <span className="mono text-linux-text-muted">Detecting Linux system...</span>
      </div>
    );
  }

  const formatUptime = (seconds: number) => {
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${d}d ${h}h ${m}m`;
  };

  return (
    <div className="p-8 max-w-6xl mx-auto w-full space-y-8">

      <div className="flex justify-between items-end border-b border-linux-border pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-linux-text-primary">SYSTEM INFORMATION</h1>
          <p className="text-sm text-linux-text-muted mono mt-1">{identity.hostname}</p>
        </div>
        <div className="flex items-center gap-2 text-xs mono">
          <div className="w-2 h-2 rounded-full bg-linux-accent animate-pulse"></div>
          <span className="text-linux-accent">LIVE</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-linux-card border border-linux-border rounded p-4">
          <div className="flex items-center gap-2 text-linux-text-muted mb-2">
            <Server size={14} />
            <span className="text-[10px] font-semibold tracking-widest uppercase">OS</span>
          </div>
          <div className="text-sm font-semibold">{identity.distribution || identity.os}</div>
          <div className="text-xs text-linux-text-muted">{identity.distribution_version || identity.release}</div>
        </div>

        <div className="bg-linux-card border border-linux-border rounded p-4">
          <div className="flex items-center gap-2 text-linux-text-muted mb-2">
            <Layers size={14} />
            <span className="text-[10px] font-semibold tracking-widest uppercase">Kernel</span>
          </div>
          <div className="text-sm font-semibold">{identity.release}</div>
          <div className="text-xs text-linux-text-muted">{identity.architecture}</div>
        </div>

        <div className="bg-linux-card border border-linux-border rounded p-4">
          <div className="flex items-center gap-2 text-linux-text-muted mb-2">
            <Cpu size={14} />
            <span className="text-[10px] font-semibold tracking-widest uppercase">Hardware</span>
          </div>
          <div className="text-sm font-semibold truncate" title={identity.cpu?.model_name || 'Generic CPU'}>
            {identity.cpu?.model_name || 'Generic CPU'}
          </div>
          <div className="text-xs text-linux-text-muted">
            {identity.cpu?.cores_physical} Cores / {identity.cpu?.cores_logical} Threads
          </div>
        </div>

        <div className="bg-linux-card border border-linux-border rounded p-4">
          <div className="flex items-center gap-2 text-linux-text-muted mb-2">
            <Hash size={14} />
            <span className="text-[10px] font-semibold tracking-widest uppercase">Uptime</span>
          </div>
          <div className="text-sm font-semibold mono">
            {metrics?.uptime?.uptime_seconds ? formatUptime(metrics.uptime.uptime_seconds) : identity.uptime?.uptime_seconds ? formatUptime(identity.uptime.uptime_seconds) : '--'}
          </div>
          <div className="text-xs text-linux-text-muted mono mt-1">
            Load: {metrics?.load?.load_average?.map((l: number) => l.toFixed(2)).join(', ') || '0.00, 0.00, 0.00'}
          </div>
        </div>
      </div>

    </div>
  );
};
