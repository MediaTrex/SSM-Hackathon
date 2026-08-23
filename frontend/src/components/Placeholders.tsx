import { HardDrive, Activity, Box, Network, Cpu } from 'lucide-react';

export const SystemMonitor = () => (
  <div className="p-8 max-w-6xl mx-auto w-full text-linux-text-muted mono flex flex-col items-center justify-center h-full space-y-4">
    <Cpu size={48} className="text-linux-border" />
    <div>System Monitor — Under Construction</div>
  </div>
);

export const ProcessViewer = () => (
  <div className="p-8 max-w-6xl mx-auto w-full text-linux-text-muted mono flex flex-col items-center justify-center h-full space-y-4">
    <Activity size={48} className="text-linux-border" />
    <div>Process Viewer — Under Construction</div>
  </div>
);

export const ServiceManager = () => (
  <div className="p-8 max-w-6xl mx-auto w-full text-linux-text-muted mono flex flex-col items-center justify-center h-full space-y-4">
    <Box size={48} className="text-linux-border" />
    <div>Service Manager — Under Construction</div>
  </div>
);

export const FileManager = () => (
  <div className="p-8 max-w-6xl mx-auto w-full text-linux-text-muted mono flex flex-col items-center justify-center h-full space-y-4">
    <HardDrive size={48} className="text-linux-border" />
    <div>File Manager — Under Construction</div>
  </div>
);

export const NetworkManager = () => (
  <div className="p-8 max-w-6xl mx-auto w-full text-linux-text-muted mono flex flex-col items-center justify-center h-full space-y-4">
    <Network size={48} className="text-linux-border" />
    <div>Network Manager — Under Construction</div>
  </div>
);

export const ActivityLog = () => (
  <div className="p-8 max-w-6xl mx-auto w-full text-linux-text-muted mono flex flex-col items-center justify-center h-full space-y-4">
    <Activity size={48} className="text-linux-border" />
    <div>Activity Log — Under Construction</div>
  </div>
);
