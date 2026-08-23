import os
import shutil
import glob
from pathlib import Path
from datetime import datetime

def resolve_user_path(path_str: str, cwd_str: str = None) -> Path:
    """Centralized path resolver.
    1. Expands ~
    2. Resolves relative to cwd_str (if relative)
    3. Returns an absolute, normalized Path
    """
    if not cwd_str:
        cwd_str = str(Path.home())
        
    p = Path(path_str).expanduser()
    if not p.is_absolute():
        p = Path(cwd_str) / p
        
    return p.resolve()

def get_working_directory(cwd: str = None):
    """Returns the current session working directory."""
    p = resolve_user_path(".", cwd)
    return {"path": str(p)}

def change_directory(path: str, cwd: str = None):
    """Changes directory by resolving the new path and ensuring it exists."""
    p = resolve_user_path(path, cwd)
    if not p.exists():
        return {"error": f"Directory does not exist: {p}"}
    if not p.is_dir():
        return {"error": f"Path is not a directory: {p}"}
    return {"success": True, "path": str(p)}

def search_files(query: str, path: str = None, cwd: str = None):
    """Search for files matching a pattern."""
    results = []
    permission_errors = []
    
    if path:
        search_paths = [resolve_user_path(path, cwd)]
    else:
        # If no path specified, use cwd and maybe others if intent implies broader search
        # Defaulting to cwd for basic searches
        if cwd:
            search_paths = [resolve_user_path(".", cwd)]
        else:
            search_paths = [Path.home(), Path("/opt"), Path("/var"), Path("/tmp"), Path("/media"), Path("/mnt")]
        
    searched_paths = []

    try:
        for sp in search_paths:
            if not sp.exists() or not sp.is_dir():
                continue
                
            searched_paths.append(str(sp))
            
            # Avoid traversing /proc, /sys, /dev unless explicitly requested
            if not path and sp.parts and sp.parts[0] == '/' and len(sp.parts) > 1 and sp.parts[1] in ('proc', 'sys', 'dev'):
                continue

            for root, dirs, files in os.walk(str(sp)):
                if len(results) > 100:
                    break
                    
                for name in files:
                    if query.lower() in name.lower():
                        try:
                            full_path = Path(root) / name
                            stat = full_path.stat()
                            results.append({
                                "path": str(full_path),
                                "name": name,
                                "size": stat.st_size,
                                "modified": datetime.fromtimestamp(stat.st_mtime).isoformat()
                            })
                        except PermissionError:
                            permission_errors.append(str(Path(root) / name))
                        except OSError:
                            pass
                
                for name in dirs:
                    if query.lower() in name.lower():
                        try:
                            full_path = Path(root) / name
                            stat = full_path.stat()
                            results.append({
                                "path": str(full_path),
                                "name": name,
                                "size": stat.st_size,
                                "modified": datetime.fromtimestamp(stat.st_mtime).isoformat()
                            })
                        except PermissionError:
                            permission_errors.append(str(Path(root) / name))
                        except OSError:
                            pass
                            
    except PermissionError as e:
        permission_errors.append(str(e.filename))
    except Exception as e:
        return {"error": str(e)}
        
    return {
        "query": query,
        "found": len(results) > 0,
        "matches": results[:100],
        "searched_paths": searched_paths,
        "permission_errors": permission_errors
    }

def get_file_information(path: str, cwd: str = None):
    """Retrieve metadata about a specific file."""
    p = resolve_user_path(path, cwd)
    try:
        stat_info = p.stat()
        return {
            "path": str(p),
            "exists": True,
            "size_bytes": stat_info.st_size,
            "permissions": oct(stat_info.st_mode)[-3:],
            "is_dir": p.is_dir(),
            "is_file": p.is_file(),
            "uid": stat_info.st_uid,
            "gid": stat_info.st_gid,
            "modified": datetime.fromtimestamp(stat_info.st_mtime).isoformat()
        }
    except Exception as e:
        return {"path": str(p), "exists": False, "error": str(e)}

def get_file_permissions(path: str, cwd: str = None):
    return get_file_information(path, cwd)

def list_directory(path: str = ".", cwd: str = None):
    """List directory contents."""
    p = resolve_user_path(path, cwd)
    if not p.exists():
        return {"error": f"Directory not found: {p}"}
    if not p.is_dir():
        return {"error": f"Path is not a directory: {p}"}
        
    items = []
    try:
        for item in p.iterdir():
            try:
                stat_info = item.stat()
                items.append({
                    "name": item.name,
                    "path": str(item),
                    "is_dir": item.is_dir(),
                    "size": stat_info.st_size,
                    "modified": datetime.fromtimestamp(stat_info.st_mtime).isoformat()
                })
            except PermissionError:
                items.append({
                    "name": item.name,
                    "path": str(item),
                    "is_dir": item.is_dir(),
                    "error": "Permission denied"
                })
        return {"path": str(p), "items": items}
    except PermissionError:
        return {"error": f"Permission denied to read directory: {p}"}
    except Exception as e:
        return {"error": str(e)}

def read_file(path: str, max_bytes: int = 50000, cwd: str = None):
    """Read content of a file."""
    p = resolve_user_path(path, cwd)
    if not p.exists() or not p.is_file():
        return {"error": f"File not found: {p}"}
        
    try:
        with open(p, 'rb') as f:
            chunk = f.read(max_bytes)
            try:
                text = chunk.decode('utf-8')
                return {"path": str(p), "content": text, "truncated": len(chunk) == max_bytes}
            except UnicodeDecodeError:
                return {"error": f"File appears to be binary, cannot safely display its contents: {p}"}
    except PermissionError:
        return {"error": f"Permission denied to read file: {p}"}
    except Exception as e:
        return {"error": str(e)}

def create_file(path: str, content: str = "", cwd: str = None):
    """Create a new file, and write content if provided."""
    p = resolve_user_path(path, cwd)
    try:
        p.parent.mkdir(parents=True, exist_ok=True)
        with open(p, 'w', encoding='utf-8') as f:
            f.write(content)
            
        verified = p.exists() and p.is_file()
        return {
            "success": True,
            "verified": verified,
            "path": str(p),
            "size": p.stat().st_size if verified else 0
        }
    except Exception as e:
        return {"error": str(e)}

def write_file(path: str, content: str, cwd: str = None):
    """Overwrite a file with new content."""
    return create_file(path, content, cwd)

def append_file(path: str, content: str, cwd: str = None):
    """Append content to a file."""
    p = resolve_user_path(path, cwd)
    try:
        with open(p, 'a', encoding='utf-8') as f:
            f.write(content)
        return {"success": True, "path": str(p)}
    except Exception as e:
        return {"error": str(e)}

def rename_file(old_path: str, new_path: str, cwd: str = None):
    p_old = resolve_user_path(old_path, cwd)
    p_new = resolve_user_path(new_path, cwd)
    try:
        p_old.rename(p_new)
        return {"success": True, "old_path": str(p_old), "new_path": str(p_new)}
    except Exception as e:
        return {"error": str(e)}

def copy_file(src: str, dst: str, cwd: str = None):
    p_src = resolve_user_path(src, cwd)
    p_dst = resolve_user_path(dst, cwd)
    try:
        shutil.copy2(p_src, p_dst)
        return {"success": True, "src": str(p_src), "dst": str(p_dst)}
    except Exception as e:
        return {"error": str(e)}

def delete_file(path: str, cwd: str = None):
    """Delete a file and verify it was deleted."""
    p = resolve_user_path(path, cwd)
    try:
        p.unlink(missing_ok=True)
        verified = not p.exists()
        return {"success": True, "verified": verified, "path": str(p)}
    except Exception as e:
        return {"error": str(e)}

def delete_directory(path: str, cwd: str = None):
    """Delete a directory and verify it was deleted."""
    p = resolve_user_path(path, cwd)
    try:
        shutil.rmtree(p)
        verified = not p.exists()
        return {"success": True, "verified": verified, "path": str(p)}
    except Exception as e:
        return {"error": str(e)}
