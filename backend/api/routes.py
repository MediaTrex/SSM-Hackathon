from fastapi import APIRouter
from pydantic import BaseModel
from linux import system, processes
from agent.reasoning import handle_chat_request

router = APIRouter()

from typing import Optional

class ChatRequest(BaseModel):
    message: str
    conversation_id: Optional[str] = "default"

@router.get("/metrics/system")
def get_system_metrics():
    return system.get_system_stats()

@router.get("/metrics/processes")
def get_running_processes():
    return processes.get_top_processes(limit=10)

@router.post("/chat")
def chat(request: ChatRequest):
    response = handle_chat_request(request.message, request.conversation_id)
    return response
