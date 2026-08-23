import subprocess

def get_service_status(service_name: str):
    """Retrieve the status of a systemd service."""
    try:
        result = subprocess.run(
            ["systemctl", "status", service_name, "--no-pager"],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            check=False
        )
        return {
            "service": service_name,
            "status_output": result.stdout if result.stdout else result.stderr,
            "is_active": result.returncode == 0
        }
    except Exception as e:
        return {"error": str(e), "service": service_name}

def get_service_logs(service_name: str, lines: int = 50):
    """Retrieve recent logs for a systemd service."""
    try:
        result = subprocess.run(
            ["journalctl", "-u", service_name, "-n", str(lines), "--no-pager"],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            check=False
        )
        return {
            "service": service_name,
            "logs": result.stdout if result.stdout else result.stderr
        }
    except Exception as e:
        return {"error": str(e), "service": service_name}

def list_services():
    """Retrieve a list of all systemd services."""
    try:
        result = subprocess.run(
            ["systemctl", "list-units", "--type=service", "--all", "--no-pager", "--no-legend"],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            check=False
        )
        if result.returncode != 0 and "systemd" not in result.stderr:
            return {"error": "systemctl failed or systemd is not available."}
            
        services = []
        for line in result.stdout.splitlines():
            parts = line.split()
            if len(parts) >= 4:
                name = parts[0]
                if name.endswith('.service'):
                    name = name[:-8]
                load = parts[1]
                active = parts[2]
                sub = parts[3]
                description = " ".join(parts[4:])
                
                services.append({
                    "name": name,
                    "load": load,
                    "active": active,
                    "sub": sub,
                    "description": description
                })
        return {"services": services}
    except Exception as e:
        return {"error": str(e)}

