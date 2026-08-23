import { useState, useEffect } from 'react';
import axios from 'axios';
import { Folder, FileText, CornerLeftUp, RefreshCw } from 'lucide-react';

const API_BASE_URL = 'http://localhost:8000/api';

export const FileManager = () => {
  const [items, setItems] = useState<any[]>([]);
  const [currentPath, setCurrentPath] = useState<string>('~');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFiles = async (path: string) => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/files?path=${encodeURIComponent(path)}`);
      if (res.data.error) {
        setError(res.data.error);
      } else {
        setItems(res.data.items);
        setCurrentPath(res.data.path);
        setError(null);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles(currentPath);
  }, []);

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const navigateUp = () => {
    if (currentPath === '/') return;
    const parts = currentPath.split('/');
    parts.pop();
    const newPath = parts.join('/') || '/';
    fetchFiles(newPath);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto w-full flex flex-col h-full space-y-4">
      
      <div className="flex justify-between items-end border-b border-linux-border pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-linux-text-primary">FILES</h1>
          <div className="flex items-center gap-2 mt-1">
            <button onClick={navigateUp} className="text-linux-text-muted hover:text-linux-text-primary"><CornerLeftUp size={14}/></button>
            <p className="text-sm text-linux-text-secondary mono">{currentPath}</p>
          </div>
        </div>
        <button 
          onClick={() => fetchFiles(currentPath)}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-1.5 bg-linux-surface border border-linux-border rounded text-xs mono hover:bg-linux-card transition-colors disabled:opacity-50"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          REFRESH
        </button>
      </div>

      {error ? (
        <div className="border border-linux-warning rounded bg-linux-card p-6">
          <h2 className="text-linux-warning font-semibold mb-2">⚠ FILESYSTEM ERROR</h2>
          <p className="text-linux-text-secondary mono text-sm">{error}</p>
        </div>
      ) : (
        <div className="flex-1 bg-linux-card border border-linux-border rounded overflow-hidden flex flex-col">
          <div className="grid grid-cols-12 p-3 bg-linux-surface border-b border-linux-border text-[10px] font-semibold tracking-widest uppercase text-linux-text-muted">
            <div className="col-span-6">NAME</div>
            <div className="col-span-2">TYPE</div>
            <div className="col-span-2 text-right">SIZE</div>
            <div className="col-span-2 text-right">MODIFIED</div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {loading && items.length === 0 ? (
              <div className="flex items-center justify-center h-full mono text-linux-text-muted text-sm">Reading directory...</div>
            ) : (
              <div className="divide-y divide-linux-border/50">
                {items.sort((a, b) => {
                  if (a.is_dir && !b.is_dir) return -1;
                  if (!a.is_dir && b.is_dir) return 1;
                  return a.name.localeCompare(b.name);
                }).map((item, i) => (
                  <div 
                    key={i} 
                    className="grid grid-cols-12 p-3 text-sm hover:bg-linux-surface/50 transition-colors group cursor-pointer"
                    onClick={() => {
                      if (item.is_dir) fetchFiles(item.path);
                    }}
                  >
                    <div className="col-span-6 flex items-center gap-3 truncate pr-4">
                      {item.is_dir ? <Folder size={16} className="text-linux-info" /> : <FileText size={16} className="text-linux-text-muted" />}
                      <span className={`${item.is_dir ? 'font-semibold text-linux-text-primary' : 'text-linux-text-secondary'} ${item.error ? 'text-linux-warning' : ''}`}>{item.name}</span>
                    </div>
                    <div className="col-span-2 text-xs text-linux-text-muted">{item.is_dir ? 'Directory' : 'File'}</div>
                    <div className="col-span-2 text-right mono text-linux-text-muted text-xs">{item.is_dir ? '--' : formatSize(item.size)}</div>
                    <div className="col-span-2 text-right text-xs text-linux-text-muted truncate pl-4">
                      {item.error ? <span className="text-linux-warning text-[10px]">Permission Denied</span> : new Date(item.modified).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
