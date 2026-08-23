import os
import json
import time
import re
from pathlib import Path
import google.generativeai as genai
from agent.tools import execute_tool, AVAILABLE_TOOLS
import inspect
from agent.formatter import format_tool_result
from api.activity_store import log_activity

# Configure Gemini
api_key = os.getenv("GEMINI_API_KEY", "")
if api_key:
    genai.configure(api_key=api_key)

# Basic model initialization
try:
    model = genai.GenerativeModel('gemini-3.1-flash-lite')
except Exception:
    model = None

# Global session store for pending actions and cwd
SESSIONS = {}

def check_approval(message: str) -> str:
    """Classify response as 'approve', 'reject', or 'unknown'."""
    msg = message.lower().strip()
    approve_words = ["yes", "y", "ok", "okay", "yes please", "go ahead", "do it", "proceed", "execute", "confirm", "allow", "continue"]
    reject_words = ["no", "n", "cancel", "don't", "do not", "stop", "abort", "never mind"]
    
    # Exact match or simple prefix match (e.g. "yes, do it")
    for w in approve_words:
        if msg == w or msg.startswith(w + " ") or msg.startswith(w + ","):
            return "approve"
            
    for w in reject_words:
        if msg == w or msg.startswith(w + " ") or msg.startswith(w + ","):
            return "reject"
            
    return "unknown"

def get_event_type(tool_name: str) -> str:
    if "file" in tool_name or "directory" in tool_name: return "Files"
    if "service" in tool_name: return "Services"
    if "process" in tool_name: return "Processes"
    if "network" in tool_name: return "Network"
    if "system" in tool_name or "cpu" in tool_name or "memory" in tool_name or "gpu" in tool_name or "disk" in tool_name: return "System"
    return "AI"

def handle_chat_request(message: str, conversation_id: str = "default"):
    if not model:
        return {
            "response": "Gemini API is not configured or available. Please set GEMINI_API_KEY environment variable.",
            "metadata": {"tools_used": [], "execution_time": 0}
        }

    start_time = time.time()
    
    # Ensure session exists
    if conversation_id not in SESSIONS:
        SESSIONS[conversation_id] = {
            "pending_action": None,
            "working_directory": str(Path.home())
        }
        
    session = SESSIONS[conversation_id]
    
    # 1. Check for Pending Action
    if session.get("pending_action"):
        decision = check_approval(message)
        
        if decision == "approve":
            action = session["pending_action"]
            tool_name = action["tool"]
            args = action["args"]
            
            # Inject working directory if applicable
            if tool_name in AVAILABLE_TOOLS:
                sig = inspect.signature(AVAILABLE_TOOLS[tool_name])
                if "cwd" in sig.parameters and "cwd" not in args:
                    args["cwd"] = session["working_directory"]
            
            # Execute tool directly, bypassing prompt/approval
            session["pending_action"] = None # clear state
            
            try:
                func = AVAILABLE_TOOLS[tool_name]
                result = func(**args)
                
                # Format result into natural language
                response_text = format_tool_result(tool_name, result, session["working_directory"])
                
                # Special case: update working directory if change_directory succeeded
                if tool_name == "change_directory" and result.get("success"):
                    session["working_directory"] = result.get("path")
                
                target = args.get("path") or args.get("service_name") or args.get("pid") or ""
                log_activity(get_event_type(tool_name), tool_name, str(target), "success" if result.get("success") else "failed", response_text)
                
                return {
                    "response": response_text,
                    "metadata": {"tools_used": [tool_name], "execution_time": round(time.time() - start_time, 2)}
                }
            except Exception as e:
                log_activity(get_event_type(tool_name), tool_name, str(args.get("path") or args.get("service_name") or args.get("pid") or ""), "failed", str(e))
                return {
                    "response": f"Failed to execute {tool_name}: {str(e)}",
                    "metadata": {"tools_used": [tool_name], "execution_time": round(time.time() - start_time, 2)}
                }
                
        elif decision == "reject":
            action = session["pending_action"]
            target = action["args"].get("path") or action["args"].get("service_name") or action["args"].get("pid") or ""
            log_activity(get_event_type(action["tool"]), action["tool"], str(target), "cancelled", "Action was cancelled by user.")
            session["pending_action"] = None
            return {
                "response": "Understood. I have cancelled the pending action.",
                "metadata": {"tools_used": [], "execution_time": round(time.time() - start_time, 2)}
            }
        else:
            return {
                "response": f"I still have a pending action to execute `{session['pending_action']['tool']}`. Do you want me to proceed? (yes/no)",
                "metadata": {"tools_used": [], "execution_time": round(time.time() - start_time, 2)}
            }

    # 2. Normal Agent Loop
    tools_used = []
    actions = []
    tool_results_context = ""
    max_iterations = 5
    iteration = 0
    
    while iteration < max_iterations:
        iteration += 1
        
        tool_prompt = f"""
You are LinuxAI, an AI assistant integrated with the user's actual Linux operating system.
You have access to tools that can inspect and interact with the local Linux machine.

Whenever a user asks about information that is specific to their computer, operating system, hardware, files, processes, services, network, configuration, or current system state, you MUST use the appropriate Linux tool before answering.
Never guess or hallucinate information about the user's machine.
Never use your general model knowledge as a substitute for querying the local operating system.
If the required information is available through a system tool, call the tool first.

IMPORTANT MAPPINGS:
- "whoami", "what user am I", "my username" -> ALWAYS use `get_current_user`
- "pwd", "what is my current directory" -> ALWAYS use `get_working_directory`
- "cd Downloads", "go to Documents" -> ALWAYS use `change_directory`
- "what is my cpu" -> `get_cpu_info`
- "what is my os" -> `get_system_identity`
- "is nginx running" -> `get_service_status`

FILESYSTEM RULES:
- Never say you do not have the capability to create, read, or delete files if a tool exists.
- "Is there a file named roshan.txt" -> use `search_files {{"query": "roshan.txt"}}`
- "Create page.txt" -> use `create_file {{"path": "page.txt"}}`
- "Read page.txt" -> use `read_file {{"path": "page.txt"}}`
- "Delete page.txt" -> use `delete_file {{"path": "page.txt"}}`
- "What's in my Downloads folder?" -> use `list_directory {{"path": "~/Downloads"}}`

Current Session Working Directory: {session['working_directory']}

You have the following tools available:
{list(AVAILABLE_TOOLS.keys())}

If you need to gather information from the system or perform an action, reply with the tool name on a new line starting with TOOL: followed by its arguments as a JSON object if needed. 
Example:
TOOL: get_service_status {{"service_name": "nginx"}}
TOOL: get_current_user
TOOL: create_file {{"path": "notes.txt", "content": "Hello"}}

If you have gathered enough information to answer the user fully, or if no tools are needed, simply output FINAL_ANSWER: followed by your final human-friendly response.

User Query: "{message}"

Here is the system data you have gathered so far:
{tool_results_context}

What is your next step? (Choose one TOOL or FINAL_ANSWER)
"""
        try:
            response = model.generate_content(tool_prompt)
            response_text = response.text.strip()
            
            tool_to_run = None
            tool_args = {}
            final_answer = None
            
            for line in response_text.split('\n'):
                line = line.strip()
                if line.startswith("TOOL:"):
                    parts = line.replace("TOOL:", "").strip().split(" ", 1)
                    tool_to_run = parts[0]
                    if len(parts) > 1:
                        try:
                            tool_args = json.loads(parts[1])
                        except:
                            pass
                    break
                elif line.startswith("FINAL_ANSWER:"):
                    final_answer = line.replace("FINAL_ANSWER:", "").strip()
                    break
            
            if final_answer:
                return {
                    "response": final_answer,
                    "actions": actions,
                    "metadata": {
                        "tools_used": tools_used,
                        "execution_time": round(time.time() - start_time, 2)
                    }
                }
                
            if not tool_to_run and not final_answer:
                final_answer = response_text
                return {
                    "response": final_answer,
                    "actions": actions,
                    "metadata": {
                        "tools_used": tools_used,
                        "execution_time": round(time.time() - start_time, 2)
                    }
                }
                
            if tool_to_run and tool_to_run in AVAILABLE_TOOLS:
                tools_used.append(tool_to_run)
                
                # Inject cwd for tools called by the agent
                if tool_to_run in AVAILABLE_TOOLS:
                    sig = inspect.signature(AVAILABLE_TOOLS[tool_to_run])
                    if "cwd" in sig.parameters and "cwd" not in tool_args:
                        tool_args["cwd"] = session["working_directory"]
                
                tool_result = execute_tool(tool_to_run, **tool_args)
                
                if tool_result.get("status") == "pending_approval":
                    # Store pending action
                    session["pending_action"] = {
                        "tool": tool_result["tool"],
                        "args": tool_result["args"],
                        "risk": tool_result["risk"]
                    }
                    return {
                        "response": tool_result["reason"],
                        "requires_confirmation": True,
                        "pending_action": session["pending_action"],
                        "metadata": {
                            "tools_used": tools_used,
                            "execution_time": round(time.time() - start_time, 2)
                        }
                    }
                else:
                    result_data = tool_result.get('result', {})
                    
                    target = tool_args.get("path") or tool_args.get("service_name") or tool_args.get("pid") or ""
                    log_status = "success" if tool_result.get("status") == "success" else "failed"
                    # If there's an error, log it
                    log_details = format_tool_result(tool_to_run, result_data, session["working_directory"])
                    if tool_result.get("status") == "error":
                        log_details = tool_result.get("error", "Unknown error")
                    
                    log_activity(get_event_type(tool_to_run), tool_to_run, str(target), log_status, log_details)
                    
                    # Intercept safe action formatting and state updates immediately
                    if tool_to_run == "change_directory" and result_data.get("success"):
                        session["working_directory"] = result_data.get("path")
                        formatted_response = format_tool_result(tool_to_run, result_data, session["working_directory"])
                        return {
                            "response": formatted_response,
                            "metadata": {"tools_used": tools_used, "execution_time": round(time.time() - start_time, 2)}
                        }
                    elif tool_to_run == "get_working_directory":
                        formatted_response = format_tool_result(tool_to_run, result_data, session["working_directory"])
                        return {
                            "response": formatted_response,
                            "metadata": {"tools_used": tools_used, "execution_time": round(time.time() - start_time, 2)}
                        }
                        
                    tool_results_context += f"\\nTool: {tool_to_run}\\nArgs: {json.dumps(tool_args)}\\nResult: {json.dumps(result_data, default=str)}\\n"
            else:
                tool_results_context += f"\\nTool: {tool_to_run}\\nResult: Error - Tool not found.\\n"
                
        except Exception as e:
            return {
                "response": f"Error communicating with AI: {str(e)}",
                "metadata": {"tools_used": tools_used, "execution_time": round(time.time() - start_time, 2)}
            }
            
    return {
        "response": "I'm sorry, I was unable to fully diagnose the issue within the execution limit.",
        "metadata": {"tools_used": tools_used, "execution_time": round(time.time() - start_time, 2)}
    }
