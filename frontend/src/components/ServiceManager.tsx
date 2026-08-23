import { useState, useEffect } from 'react';
import axios from 'axios';
import { RefreshCw, Play, Square, RotateCw } from 'lucide-react';

const API_BASE_URL = 'http://localhost:8000/api';

export const ServiceManager = () => {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/services`);
      if (res.data.error) {
        setError(res.data.error);
      } else {
        setServices(res.data.services);
        setError(null);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const executeServiceAction = async (action: string, serviceName: string) => {
    if (!window.confirm(`${action} service ${serviceName}?`)) return;
    try {
      await axios.post(`${API_BASE_URL}/chat`, {
        message: `${action} service ${serviceName}`,
      });
      fetchServices();
    } catch (e) {
      console.error(e);
    }
  };

  if (error) {
    return (
      <div className="p-8 max-w-6xl mx-auto w-full">
        <div className="border border-linux-warning rounded bg-linux-card p-6">
          <h2 className="text-linux-warning font-semibold mb-2">⚠ SYSTEM INFORMATION UNAVAILABLE</h2>
          <p className="text-linux-text-secondary mono text-sm">{error}</p>
          <button onClick={fetchServices} className="mt-4 px-4 py-2 border border-linux-border rounded text-sm hover:bg-linux-surface">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto w-full flex flex-col h-full space-y-4">
      
      <div className="flex justify-between items-end border-b border-linux-border pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-linux-text-primary">SERVICES</h1>
          <p className="text-sm text-linux-text-muted mono mt-1">systemctl list-units</p>
        </div>
        <button 
          onClick={fetchServices}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-1.5 bg-linux-surface border border-linux-border rounded text-xs mono hover:bg-linux-card transition-colors disabled:opacity-50"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          REFRESH
        </button>
      </div>

      <div className="flex-1 bg-linux-card border border-linux-border rounded overflow-hidden flex flex-col">
        <div className="grid grid-cols-12 p-3 bg-linux-surface border-b border-linux-border text-[10px] font-semibold tracking-widest uppercase text-linux-text-muted">
          <div className="col-span-3">SERVICE</div>
          <div className="col-span-2">STATUS</div>
          <div className="col-span-2">LOADED</div>
          <div className="col-span-5">DESCRIPTION</div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {loading && services.length === 0 ? (
            <div className="flex items-center justify-center h-full mono text-linux-text-muted text-sm">Discovering system services...</div>
          ) : (
            <div className="divide-y divide-linux-border/50">
              {services.map((srv, i) => (
                <div key={i} className="grid grid-cols-12 p-3 text-sm hover:bg-linux-surface/50 transition-colors group items-center">
                  <div className="col-span-3 font-semibold text-linux-text-primary truncate pr-2">{srv.name}</div>
                  <div className="col-span-2 mono flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${srv.active === 'active' ? 'bg-linux-accent' : srv.active === 'failed' ? 'bg-linux-warning' : 'bg-linux-text-muted'}`}></div>
                    <span className={srv.active === 'active' ? 'text-linux-accent' : srv.active === 'failed' ? 'text-linux-warning' : 'text-linux-text-muted'}>
                      {srv.active.toUpperCase()}
                    </span>
                  </div>
                  <div className="col-span-2 mono text-linux-text-secondary text-xs">{srv.load}</div>
                  <div className="col-span-5 text-linux-text-muted text-xs truncate pr-4 flex justify-between items-center">
                    <span className="truncate">{srv.description}</span>
                    <div className="hidden group-hover:flex items-center gap-2">
                      <button onClick={() => executeServiceAction('start', srv.name)} className="p-1 hover:text-linux-accent transition-colors" title="Start"><Play size={14} /></button>
                      <button onClick={() => executeServiceAction('stop', srv.name)} className="p-1 hover:text-linux-warning transition-colors" title="Stop"><Square size={14} /></button>
                      <button onClick={() => executeServiceAction('restart', srv.name)} className="p-1 hover:text-linux-info transition-colors" title="Restart"><RotateCw size={14} /></button>
                    </div>
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
