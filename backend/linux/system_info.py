import platform
import psutil
import subprocess
import os
import getpass

def get_current_user():
    """Retrieve the currently logged-in Linux user."""
    try:
        # getpass.getuser() checks environment variables (LOGNAME, USER, LNAME, USERNAME)
        # and falls back to pwd.getpwuid(os.getuid())[0] on Unix.
        return {"username": getpass.getuser()}
    except Exception as e:
        return {"error": str(e)}

def get_system_identity():
    """Retrieve OS, kernel, hostname, architecture, and hardware model."""
    info = {
        "os": platform.system(),
        "release": platform.release(),
        "version": platform.version(),
        "architecture": platform.machine(),
        "hostname": platform.node(),
    }
    
    # Try to get distribution information if on Linux
    if platform.system() == "Linux":
        try:
            with open("/etc/os-release") as f:
                for line in f:
                    if line.startswith("PRETTY_NAME="):
                        info["distribution"] = line.split("=")[1].strip().strip('"')
                    elif line.startswith("VERSION_ID="):
                        info["distribution_version"] = line.split("=")[1].strip().strip('"')
        except Exception:
            pass
            
        # Try to get hardware vendor and model from sysfs
        try:
            with open("/sys/class/dmi/id/sys_vendor") as f:
                info["vendor"] = f.read().strip()
            with open("/sys/class/dmi/id/product_name") as f:
                info["hardware_model"] = f.read().strip()
        except Exception:
            pass
            
    return info

def get_cpu_info():
    """Retrieve detailed CPU information."""
    info = {
        "cores_physical": psutil.cpu_count(logical=False),
        "cores_logical": psutil.cpu_count(logical=True),
        "utilization_percent": psutil.cpu_percent(interval=0.5),
    }
    
    try:
        freq = psutil.cpu_freq()
        if freq:
            info["frequency_current_mhz"] = freq.current
            info["frequency_max_mhz"] = freq.max
    except Exception:
        pass
        
    if platform.system() == "Linux":
        try:
            with open("/proc/cpuinfo") as f:
                for line in f:
                    if "model name" in line:
                        info["model_name"] = line.split(":")[1].strip()
                        break
        except Exception:
            pass
            
    return info

def get_memory_info():
    """Retrieve RAM and Swap information."""
    mem = psutil.virtual_memory()
    swap = psutil.swap_memory()
    
    return {
        "ram": {
            "total_bytes": mem.total,
            "available_bytes": mem.available,
            "used_bytes": mem.used,
            "percent": mem.percent
        },
        "swap": {
            "total_bytes": swap.total,
            "used_bytes": swap.used,
            "percent": swap.percent
        }
    }

def get_disk_info():
    """Retrieve filesystem and usage information."""
    partitions = psutil.disk_partitions()
    disks = []
    
    for p in partitions:
        try:
            usage = psutil.disk_usage(p.mountpoint)
            disks.append({
                "device": p.device,
                "mountpoint": p.mountpoint,
                "fstype": p.fstype,
                "total_bytes": usage.total,
                "used_bytes": usage.used,
                "free_bytes": usage.free,
                "percent": usage.percent
            })
        except Exception:
            continue
            
    return {"partitions": disks}

def get_gpu_info():
    """Retrieve GPU information using lspci or nvidia-smi if available."""
    gpus = []
    if platform.system() == "Linux":
        try:
            result = subprocess.run(["lspci"], stdout=subprocess.PIPE, text=True, check=False)
            for line in result.stdout.split('\n'):
                if "VGA compatible controller" in line or "3D controller" in line:
                    parts = line.split(":")
                    if len(parts) > 2:
                        gpus.append(parts[2].strip())
        except Exception:
            pass
    return {"gpus": gpus if gpus else ["GPU information unavailable or not running on Linux"]}

def get_network_info():
    """Retrieve network interfaces and IP addresses."""
    interfaces = {}
    try:
        addrs = psutil.net_if_addrs()
        for interface_name, interface_addresses in addrs.items():
            for addr in interface_addresses:
                if str(addr.family) == 'AddressFamily.AF_INET':
                    interfaces[interface_name] = {"ip": addr.address, "netmask": addr.netmask}
    except Exception:
        pass
    return {"interfaces": interfaces}

def get_uptime():
    """Retrieve system uptime."""
    try:
        with open('/proc/uptime', 'r') as f:
            uptime_seconds = float(f.readline().split()[0])
            return {"uptime_seconds": uptime_seconds}
    except Exception:
        return {"uptime_seconds": 0}

def get_load_average():
    """Retrieve system load average."""
    try:
        return {"load_average": os.getloadavg()}
    except Exception:
        return {"load_average": [0, 0, 0]}

