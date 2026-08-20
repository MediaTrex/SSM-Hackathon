from enum import Enum
from typing import Dict, Any

class RiskLevel(Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"

def get_tool_metadata(tool_name: str) -> Dict[str, Any]:
    """Retrieve metadata and risk level for a given tool."""
    # Read-only tools
    if tool_name in [
        "get_current_user", "get_system_identity", "get_cpu_info", 
        "get_memory_info", "get_disk_info", "get_gpu_info", 
        "get_system_stats", "get_processes", "get_network_info", 
        "get_service_status", "get_service_logs", "search_files", 
        "get_file_information", "get_hostname", "get_os_version", 
        "get_kernel_version", "get_uptime"
    ]:
        return {
            "name": tool_name,
            "read_only": True,
            "risk_level": RiskLevel.LOW,
            "requires_confirmation": False
        }
        
    # Medium risk tools (requires confirmation)
    if tool_name in ["kill_process", "restart_service", "stop_service", "start_service"]:
        return {
            "name": tool_name,
            "read_only": False,
            "risk_level": RiskLevel.MEDIUM,
            "requires_confirmation": True
        }
        
    # Default to HIGH for unknown or potentially destructive actions
    return {
        "name": tool_name,
        "read_only": False,
        "risk_level": RiskLevel.HIGH,
        "requires_confirmation": True
    }

def classify_action(action_type: str, target: str = "") -> RiskLevel:
    """Legacy wrapper for backward compatibility."""
    meta = get_tool_metadata(action_type)
    return meta["risk_level"]

