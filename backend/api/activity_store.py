import datetime
import uuid

# In-memory store
ACTIVITIES = []

def log_activity(event_type: str, action: str, target: str, status: str, details: str):
    activity = {
        "id": str(uuid.uuid4()),
        "timestamp": datetime.datetime.now().isoformat(),
        "type": event_type,
        "action": action,
        "target": target,
        "status": status,
        "details": details
    }
    # Prepend to keep newest first
    ACTIVITIES.insert(0, activity)
    return activity

def get_activities():
    return ACTIVITIES
