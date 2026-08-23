import psutil

def get_top_processes(limit=50, search: str = None):
    """Get the top running processes sorted by memory usage, with optional search."""
    procs = []
    for p in psutil.process_iter(['pid', 'name', 'username', 'memory_percent', 'cpu_percent', 'status']):
        try:
            info = p.info
            if search and search.lower() not in (info.get('name') or '').lower():
                continue
            procs.append(info)
        except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess):
            pass
            
    # Sort by CPU percent descending
    procs = sorted(procs, key=lambda p: p['cpu_percent'] if p['cpu_percent'] else 0, reverse=True)
    return procs[:limit]

def kill_process(pid: int):
    """Kill a process by PID."""
    try:
        p = psutil.Process(pid)
        p.terminate()
        return {"success": True, "message": f"Process {pid} terminated."}
    except Exception as e:
        return {"success": False, "message": str(e)}
