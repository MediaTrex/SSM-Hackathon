import psutil

def get_system_stats():
    """Get CPU, Memory, and Disk metrics."""
    cpu_percent = psutil.cpu_percent(interval=0.5)
    
    mem = psutil.virtual_memory()
    memory_stats = {
        "total": mem.total,
        "available": mem.available,
        "percent": mem.percent,
        "used": mem.used,
    }
    
    disk = psutil.disk_usage('/')
    disk_stats = {
        "total": disk.total,
        "used": disk.used,
        "free": disk.free,
        "percent": disk.percent,
    }
    
    return {
        "cpu_percent": cpu_percent,
        "memory": memory_stats,
        "disk": disk_stats
    }
