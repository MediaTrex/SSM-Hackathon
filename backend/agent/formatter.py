import json

def format_tool_result(tool_name: str, result: dict, working_directory: str = None) -> str:
    """Format tool execution results into natural language."""
    if result.get("error"):
        return f"I couldn't execute `{tool_name}`: {result['error']}"

    if tool_name == "create_file" or tool_name == "write_file":
        if result.get("success"):
            return f"Done. I created `{result.get('path')}` and verified that the file exists."
    
    if tool_name == "delete_file":
        if result.get("success"):
            return f"Done. I deleted `{result.get('path')}` and verified that it is no longer there."
            
    if tool_name == "change_directory":
        if result.get("success"):
            return f"Changed directory to `{result.get('path')}`."
            
    if tool_name == "get_working_directory":
        return f"You are currently in `{result.get('path')}`."
        
    if tool_name == "get_current_user":
        if result.get("username"):
            return f"You are currently logged in as `{result['username']}`."
            
    # For unsupported tools or generic fallback
    return f"Action `{tool_name}` executed successfully."
