import psutil

def get_top_processes(limit=10):
    """Get the top running processes sorted by memory usage."""
    procs = []
    for p in psutil.process_iter(['pid', 'name', 'username', 'memory_percent', 'cpu_percent']):
        try:
            procs.append(p.info)
        except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess):
            pass
            
    # Sort by memory percent descending
    procs = sorted(procs, key=lambda p: p['memory_percent'] if p['memory_percent'] else 0, reverse=True)
    return procs[:limit]

def kill_process(pid: int):
    """Kill a process by PID."""
    try:
        p = psutil.Process(pid)
        p.terminate()
        return {"success": True, "message": f"Process {pid} terminated."}
    except Exception as e:
        return {"success": False, "message": str(e)}
