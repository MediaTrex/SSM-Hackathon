import { useState, useEffect } from 'react';
import axios from 'axios';
import { Activity, Clock, CheckCircle2, XCircle, AlertTriangle, X } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

export const ActivityLog = () => {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  const fetchActivities = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/activity`);
      setActivities(res.data.activities || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
    const interval = setInterval(fetchActivities, 3000); // Efficient polling
    return () => clearInterval(interval);
  }, []);

  const filters = ['All', 'System', 'Files', 'Processes', 'Services', 'Network', 'AI'];

  const filteredActivities = filter === 'All'
    ? activities
    : activities.filter(a => a.type === filter);

  return (
    <div className="p-8 max-w-6xl mx-auto w-full flex flex-col h-full space-y-6">

      <div className="flex justify-between items-end border-b border-linux-border pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-linux-text-primary">ACTIVITY LOG</h1>
          <p className="text-sm text-linux-text-muted mono mt-1">tail -f /var/log/syslog</p>
        </div>
      </div>

      <div className="flex space-x-2">
        {filters.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 text-xs mono rounded border transition-colors ${filter === f
              ? 'bg-linux-card text-linux-accent border-linux-border shadow-sm'
              : 'text-linux-text-secondary hover:text-linux-text-primary hover:bg-linux-surface border-transparent'
              }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto pr-2 pb-8">
        {!loading && activities.length === 0 ? (
          <div className="border border-linux-border rounded bg-linux-card p-10 flex flex-col items-center justify-center text-center space-y-4">
            <Activity size={32} className="text-linux-text-muted opacity-50" />
            <div>
              <p className="text-linux-text-primary font-medium">No activity yet</p>
              <p className="text-linux-text-muted text-sm mt-1">LinuxAI actions will appear here as you interact with your system.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-linux-border before:to-transparent">
            {filteredActivities.map((act) => {
              const date = new Date(act.timestamp);
              const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

              let Icon = CheckCircle2;
              let iconColor = 'text-linux-accent';
              if (act.status === 'failed') { Icon = XCircle; iconColor = 'text-linux-warning'; }
              if (act.status === 'cancelled') { Icon = X; iconColor = 'text-linux-text-muted'; }
              if (act.status === 'warning') { Icon = AlertTriangle; iconColor = 'text-yellow-500'; }

              return (
                <div key={act.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">

                  {/* Icon */}
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border border-linux-border bg-linux-bg shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm ${iconColor} z-10`}>
                    <Icon size={16} />
                  </div>

                  {/* Card */}
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded bg-linux-card border border-linux-border shadow-sm">
                    <div className="flex items-center justify-between mb-1">
                      <div className="font-semibold text-sm text-linux-text-primary">{act.type} Action</div>
                      <time className="text-xs text-linux-text-muted flex items-center gap-1 mono"><Clock size={12} />{timeStr}</time>
                    </div>
                    <div className="text-sm text-linux-text-secondary mt-2">
                      <p>{act.details}</p>
                      {act.target && <p className="mono text-xs mt-1 text-linux-text-muted">Target: {act.target}</p>}
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};
