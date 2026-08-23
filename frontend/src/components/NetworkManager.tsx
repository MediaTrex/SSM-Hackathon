import { useState, useEffect } from 'react';
import axios from 'axios';
import { Network, Activity } from 'lucide-react';

const API_BASE_URL = 'http://localhost:8000/api';

export const NetworkManager = () => {
  const [networkInfo, setNetworkInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNetwork = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/network`);
      setNetworkInfo(res.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNetwork();
    const interval = setInterval(fetchNetwork, 5000); // 5 seconds
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

  if (loading || !networkInfo) {
    return (
      <div className="p-8 max-w-6xl mx-auto w-full flex items-center justify-center h-full">
        <span className="mono text-linux-text-muted">Detecting network interfaces...</span>
      </div>
    );
  }

  const interfaces = networkInfo.interfaces || {};

  return (
    <div className="p-8 max-w-6xl mx-auto w-full space-y-8">
      
      <div className="flex justify-between items-end border-b border-linux-border pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-linux-text-primary">NETWORK</h1>
          <p className="text-sm text-linux-text-muted mono mt-1">ifconfig / ip addr</p>
        </div>
        <div className="flex items-center gap-2 text-xs mono">
          <div className="w-2 h-2 rounded-full bg-linux-accent animate-pulse"></div>
          <span className="text-linux-accent">LIVE</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {Object.keys(interfaces).map((iface) => (
          <div key={iface} className="bg-linux-card border border-linux-border rounded-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <Network size={20} className="text-linux-accent" />
              <h2 className="text-lg font-bold mono tracking-wider">{iface}</h2>
              <div className="ml-auto flex items-center gap-1.5 text-[10px] tracking-widest text-linux-accent border border-linux-accent/30 bg-linux-accent/10 px-2 py-0.5 rounded">
                <div className="w-1.5 h-1.5 rounded-full bg-linux-accent"></div>
                UP
              </div>
            </div>
            
            <div className="space-y-4 text-sm mono">
              <div>
                <div className="text-[10px] text-linux-text-muted uppercase tracking-widest mb-1 font-sans">IPv4 Address</div>
                <div className="text-linux-text-primary">{interfaces[iface].ip || 'N/A'}</div>
              </div>
              <div>
                <div className="text-[10px] text-linux-text-muted uppercase tracking-widest mb-1 font-sans">Netmask</div>
                <div className="text-linux-text-secondary">{interfaces[iface].netmask || 'N/A'}</div>
              </div>
              <div className="pt-4 border-t border-linux-border/50 flex gap-6">
                <div className="flex items-center gap-2 text-linux-info">
                  <Activity size={14} />
                  <span>RX Active</span>
                </div>
                <div className="flex items-center gap-2 text-linux-warning">
                  <Activity size={14} />
                  <span>TX Active</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
