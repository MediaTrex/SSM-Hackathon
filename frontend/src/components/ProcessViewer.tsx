import { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Pause, Play, XCircle } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

export const ProcessViewer = () => {
  const [processes, setProcesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [isPaused, setIsPaused] = useState(false);

  const fetchProcesses = async () => {
    if (isPaused) return;
    try {
      const res = await axios.get(`${API_BASE_URL}/metrics/processes${search ? `?search=${search}` : ''}`);
      setProcesses(res.data);
      setLoading(false);
    } catch (err: any) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchProcesses();
    const interval = setInterval(fetchProcesses, 2000);
    return () => clearInterval(interval);
  }, [search, isPaused]);

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

  const terminateProcess = async (pid: number) => {
    // In a real app, this should trigger a confirmation modal
    if (!window.confirm(`Terminate process ${pid}?`)) return;
    try {
      await axios.post(`${API_BASE_URL}/chat`, {
        message: `terminate process ${pid}`,
      });
      fetchProcesses();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto w-full flex flex-col h-full space-y-4">

      <div className="flex justify-between items-end border-b border-linux-border pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-linux-text-primary">PROCESSES</h1>
          <p className="text-sm text-linux-text-muted mono mt-1">top / htop</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-linux-text-muted" />
            <input
              type="text"
              placeholder="Search processes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-1.5 bg-linux-surface border border-linux-border rounded text-sm mono focus:outline-none focus:border-linux-accent/50 text-linux-text-primary"
            />
          </div>
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="flex items-center gap-2 px-3 py-1.5 bg-linux-surface border border-linux-border rounded text-xs mono hover:bg-linux-card transition-colors"
          >
            {isPaused ? <Play size={14} /> : <Pause size={14} />}
            {isPaused ? 'RESUME' : 'PAUSE'}
          </button>
        </div>
      </div>

      <div className="flex-1 bg-linux-card border border-linux-border rounded overflow-hidden flex flex-col">
        <div className="grid grid-cols-6 p-3 bg-linux-surface border-b border-linux-border text-[10px] font-semibold tracking-widest uppercase text-linux-text-muted">
          <div className="col-span-1">PID</div>
          <div className="col-span-2">PROCESS</div>
          <div className="col-span-1">USER</div>
          <div className="col-span-1 text-right">CPU %</div>
          <div className="col-span-1 text-right">MEM %</div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-full mono text-linux-text-muted text-sm">Loading running processes...</div>
          ) : processes.length === 0 ? (
            <div className="flex items-center justify-center h-full mono text-linux-text-muted text-sm">No processes found.</div>
          ) : (
            <div className="divide-y divide-linux-border/50">
              {processes.map((proc) => (
                <div key={proc.pid} className="grid grid-cols-6 p-3 text-sm mono hover:bg-linux-surface/50 transition-colors group">
                  <div className="col-span-1 text-linux-text-secondary">{proc.pid}</div>
                  <div className="col-span-2 text-linux-text-primary truncate pr-4">{proc.name}</div>
                  <div className="col-span-1 text-linux-text-secondary">{proc.username}</div>
                  <div className="col-span-1 text-right text-linux-accent">
                    {proc.cpu_percent ? proc.cpu_percent.toFixed(1) : '0.0'}%
                  </div>
                  <div className="col-span-1 flex items-center justify-end gap-4">
                    <span className="text-linux-info">{proc.memory_percent ? proc.memory_percent.toFixed(1) : '0.0'}%</span>
                    <button
                      onClick={() => terminateProcess(proc.pid)}
                      className="opacity-0 group-hover:opacity-100 text-linux-warning hover:text-red-400 transition-opacity"
                      title="Terminate Process"
                    >
                      <XCircle size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  );
};
