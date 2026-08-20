import os
import json
import time
import re
import google.generativeai as genai
from agent.tools import execute_tool, AVAILABLE_TOOLS

# Configure Gemini
api_key = os.getenv("GEMINI_API_KEY", "")
if api_key:
    genai.configure(api_key=api_key)

# Basic model initialization
try:
    model = genai.GenerativeModel('gemini-3.1-flash-lite')
except Exception:
    model = None

# Global session store for pending actions
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

def handle_chat_request(message: str, conversation_id: str = "default"):
    if not model:
        return {
            "response": "Gemini API is not configured or available. Please set GEMINI_API_KEY environment variable.",
            "metadata": {"tools_used": [], "execution_time": 0}
        }

    start_time = time.time()
    
    # Ensure session exists
    if conversation_id not in SESSIONS:
        SESSIONS[conversation_id] = {"pending_action": None}
        
    session = SESSIONS[conversation_id]
    
    # 1. Check for Pending Action
    if session["pending_action"]:
        decision = check_approval(message)
        
        if decision == "approve":
            action = session["pending_action"]
            tool_name = action["tool"]
            args = action["args"]
            
            # Execute tool directly, bypassing prompt/approval
            session["pending_action"] = None # clear state
            
            try:
                func = AVAILABLE_TOOLS[tool_name]
                result = func(**args)
                
                # Simple verification formatting
                response_text = f"Action `{tool_name}` executed successfully.\n\nResult:\n```json\n{json.dumps(result, indent=2)}\n```"
                return {
                    "response": response_text,
                    "metadata": {"tools_used": [tool_name], "execution_time": round(time.time() - start_time, 2)}
                }
            except Exception as e:
                return {
                    "response": f"Failed to execute {tool_name}: {str(e)}",
                    "metadata": {"tools_used": [tool_name], "execution_time": round(time.time() - start_time, 2)}
                }
                
        elif decision == "reject":
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
- "what is my cpu" -> `get_cpu_info`
- "what is my os" -> `get_system_identity`
- "is nginx running" -> `get_service_status`

You have the following tools available:
{list(AVAILABLE_TOOLS.keys())}

If you need to gather information from the system, reply with the tool name on a new line starting with TOOL: followed by its arguments as a JSON object if needed. 
Example:
TOOL: get_service_status {{"service_name": "nginx"}}
TOOL: get_current_user

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
                    tool_results_context += f"\\nTool: {tool_to_run}\\nArgs: {json.dumps(tool_args)}\\nResult: {json.dumps(tool_result.get('result'), default=str)}\\n"
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
