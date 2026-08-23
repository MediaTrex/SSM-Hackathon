import json

def format_tool_result(tool_name: str, result: dict, working_directory: str = None) -> str:
    """Format tool execution results into natural language."""
    if result.get("error"):
        return f"I couldn't execute `{tool_name}`: {result['error']}"

    if tool_name == "create_file":
        if result.get("success"):
            return f"Done. I created `{result.get('path')}`."
            
    if tool_name == "write_file" or tool_name == "append_file":
        if result.get("success"):
            return f"Done. I updated `{result.get('path')}`."
            
    if tool_name == "copy_file":
        if result.get("success"):
            return f"Done. I copied `{result.get('source')}` to `{result.get('destination')}`."
            
    if tool_name == "rename_file":
        if result.get("success"):
            return f"Done. I renamed `{result.get('source')}` to `{result.get('destination')}`."
            
    if tool_name == "delete_file":
        if result.get("success"):
            return f"Done. I deleted `{result.get('path')}` and verified that it no longer exists."

    if tool_name == "delete_directory":
        if result.get("success"):
            return f"Done. I deleted the directory `{result.get('path')}`."

    if tool_name == "move_file":
        if result.get("success"):
            return f"Done. I moved `{result.get('source')}` to `{result.get('destination')}`."
            
    if tool_name == "change_directory":
        if result.get("success"):
            return f"Changed directory to `{result.get('path')}`."
            
    if tool_name == "get_working_directory":
        return f"You are currently in `{result.get('path')}`."
        
    if tool_name == "get_current_user":
        if result.get("username"):
            return f"You are currently logged in as `{result['username']}`."
            
    if tool_name == "search_files":
        if result.get("success") and result.get("matches"):
            files_str = "\n".join([f"`{m}`" for m in result.get("matches")[:5]])
            return f"I found the following matches:\n{files_str}"
        return f"I couldn't find any matches."
            
    if tool_name == "read_file":
        if result.get("success"):
            content = result.get('content', '')
            if len(content) > 500:
                content = content[:500] + "\n..."
            return f"Here is the content of `{result.get('path')}`:\n\n{content}"

    # For unsupported tools or generic fallback
    return f"Action `{tool_name}` executed successfully."
