from enum import Enum
import os

class RiskLevel(Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"

PROTECTED_PATHS = [
    '/etc', '/boot', '/root', '/usr', '/bin', '/sbin', '/var', '/sys', '/proc'
]

CRITICAL_SERVICES = [
    'systemd', 'sshd', 'network', 'dbus', 'cron', 'docker', 'ufw'
]

def assess_risk(operation: str, **kwargs):
    """
    Evaluates the risk of an operation.
    Returns a tuple of (RiskLevel, confirmation_message).
    If no confirmation is required, confirmation_message is None.
    """
    target = kwargs.get("path") or kwargs.get("service_name") or kwargs.get("pid") or ""

    # Check if target path is in protected paths
    if target and isinstance(target, str) and (operation.endswith("_file") or operation.endswith("_directory")):
        # Normalizing to unix style since this is a linux AI
        target_norm = target.replace('\\', '/')
        if not target_norm.startswith("~"):
            for p in PROTECTED_PATHS:
                if target_norm == p or target_norm.startswith(p + "/"):
                    msg = f"This action affects a protected system path (`{target}`). Would you like me to continue?"
                    return RiskLevel.HIGH, msg
                    
    # Read-only operations and info gathering
    low_risk_ops = [
        "get_current_user", "get_system_identity", "get_cpu_info", 
        "get_memory_info", "get_disk_info", "get_gpu_info", 
        "get_system_stats", "get_processes", "get_network_info", 
        "get_service_status", "get_service_logs", "search_files", 
        "get_file_information", "get_hostname", "get_os_version", 
        "get_kernel_version", "get_uptime", "get_load_average",
        "read_file", "list_directory", "get_file_permissions",
        "get_working_directory", "change_directory", "list_services"
    ]
    
    if operation in low_risk_ops:
        return RiskLevel.LOW, None
                
    # Highly destructive actions
    high_risk_ops = ["delete_file", "delete_directory", "kill_process"]
    if operation in high_risk_ops:
        if operation == "kill_process":
            return RiskLevel.HIGH, f"Terminating process {target} might cause system instability or data loss. Would you like me to continue?"
        else:
            return RiskLevel.HIGH, f"Deleting `{target}` will permanently remove it. This action cannot be undone. Would you like me to continue?"

    # Normal file modifications (executed directly unless in protected path)
    normal_write_ops = [
        "create_file", "write_file", "append_file", "rename_file", "copy_file"
    ]
    if operation in normal_write_ops:
        return RiskLevel.LOW, None
        
    # Service modifications
    service_ops = ["restart_service", "stop_service", "start_service"]
    if operation in service_ops:
        if target in CRITICAL_SERVICES:
            return RiskLevel.HIGH, f"Modifying a critical service (`{target}`) can disrupt the system. Would you like me to continue?"
        return RiskLevel.LOW, None # Executed directly if explicitly requested

    # Default to HIGH for unknown ops
    return RiskLevel.HIGH, f"The operation `{operation}` is potentially dangerous. Would you like me to continue?"
