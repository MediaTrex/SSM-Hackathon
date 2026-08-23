from linux import system, processes, system_info, services, files
from security.risk_classifier import classify_action, RiskLevel, get_tool_metadata

# These are the tools that the AI can use. We map function names to their implementations.
AVAILABLE_TOOLS = {
    "get_system_stats": system.get_system_stats,
    "get_processes": processes.get_top_processes,
    "kill_process": processes.kill_process,
    "get_current_user": system_info.get_current_user,
    "get_system_identity": system_info.get_system_identity,
    "get_cpu_info": system_info.get_cpu_info,
    "get_memory_info": system_info.get_memory_info,
    "get_disk_info": system_info.get_disk_info,
    "get_gpu_info": system_info.get_gpu_info,
    "get_network_info": system_info.get_network_info,
    "get_service_status": services.get_service_status,
    "get_service_logs": services.get_service_logs,
    "search_files": files.search_files,
    "get_file_information": files.get_file_information,
    "read_file": files.read_file,
    "list_directory": files.list_directory,
    "get_file_permissions": files.get_file_permissions,
    "create_file": files.create_file,
    "write_file": files.write_file,
    "append_file": files.append_file,
    "rename_file": files.rename_file,
    "copy_file": files.copy_file,
    "delete_file": files.delete_file,
    "delete_directory": files.delete_directory,
    "get_working_directory": files.get_working_directory,
    "change_directory": files.change_directory,
    "get_uptime": system_info.get_uptime,
    "get_load_average": system_info.get_load_average,
    "list_services": services.list_services
}

def execute_tool(tool_name: str, **kwargs):
    """Executes a tool if it's safe, otherwise flags for approval."""
    if tool_name not in AVAILABLE_TOOLS:
        return {"error": "Tool not found", "status": "failed"}
        
    meta = get_tool_metadata(tool_name)
    
    if meta["requires_confirmation"]:
        return {
            "status": "pending_approval",
            "tool": tool_name,
            "args": kwargs,
            "risk": meta["risk_level"].value,
            "reason": f"Execution of {tool_name} requires your approval."
        }
        
    # Execute immediately for read_only/no_confirmation tools
    try:
        func = AVAILABLE_TOOLS[tool_name]
        result = func(**kwargs)
        return {"status": "success", "result": result}
    except Exception as e:
        return {"status": "error", "error": str(e)}
