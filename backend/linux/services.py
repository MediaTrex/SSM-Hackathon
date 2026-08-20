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
