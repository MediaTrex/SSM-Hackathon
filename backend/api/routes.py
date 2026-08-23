from fastapi import APIRouter, Query
from pydantic import BaseModel
from linux import system, processes, services, files, system_info
from agent.reasoning import handle_chat_request
from api.activity_store import get_activities
from typing import Optional

router = APIRouter()

class ChatRequest(BaseModel):
    message: str
    conversation_id: Optional[str] = "default"

@router.get("/system/identity")
def get_system_identity():
    return {
        **system_info.get_system_identity(),
        "cpu": system_info.get_cpu_info(),
        "uptime": system_info.get_uptime()
    }

@router.get("/metrics/system")
def get_system_metrics():
    stats = system.get_system_stats()
    stats["load"] = system_info.get_load_average()
    stats["uptime"] = system_info.get_uptime()
    return stats

@router.get("/metrics/processes")
def get_running_processes(search: Optional[str] = None):
    return processes.get_top_processes(limit=50, search=search)

@router.get("/services")
def get_system_services():
    return services.list_services()

@router.get("/files")
def get_files(path: str = ".", cwd: Optional[str] = None):
    return files.list_directory(path=path, cwd=cwd)

@router.get("/network")
def get_network():
    return system_info.get_network_info()

@router.get("/activity")
def get_activity():
    return {"activities": get_activities()}

@router.post("/chat")
def chat(request: ChatRequest):
    response = handle_chat_request(request.message, request.conversation_id)
    return response
