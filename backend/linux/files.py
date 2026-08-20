import os
import glob

def search_files(query: str, path: str = "/"):
    """Search for files matching a pattern."""
    results = []
    try:
        # Simple glob search. In a real system, you'd limit depth and scope for safety.
        # Here we do a fast search in common directories if path is root
        search_paths = [path] if path != "/" else ["/home", "/var/log", "/etc", "/tmp"]
        for sp in search_paths:
            if not os.path.exists(sp): continue
            for root, dirs, files in os.walk(sp):
                # basic safety to avoid scanning everything
                if len(results) > 50:
                    break
                for name in files:
                    if query.lower() in name.lower():
                        results.append(os.path.join(root, name))
                for name in dirs:
                    if query.lower() in name.lower():
                        results.append(os.path.join(root, name))
                        
    except Exception as e:
        return {"error": str(e)}
        
    return {"query": query, "path_searched": path, "results": results[:50]}

def get_file_information(path: str):
    """Retrieve metadata about a specific file."""
    try:
        stat_info = os.stat(path)
        return {
            "path": path,
            "exists": True,
            "size_bytes": stat_info.st_size,
            "permissions": oct(stat_info.st_mode)[-3:],
            "is_dir": os.path.isdir(path),
            "is_file": os.path.isfile(path),
            "uid": stat_info.st_uid,
            "gid": stat_info.st_gid
        }
    except Exception as e:
        return {"path": path, "exists": False, "error": str(e)}
