#!/usr/bin/env python3
"""
Hermes Agent Cycle Guard
Prevents re-processing the same files/folders within a session.
Usage:
    from hermes_cycle_guard import guard
    guard.check_and_mark("path/to/file", "operation_type")
"""
import json, hashlib, sys
from pathlib import Path
from datetime import datetime, timezone

TRACKER_PATH = Path(__file__).parent / "processed-tracker.json"

def _load_tracker():
    if not TRACKER_PATH.exists():
        return {"processed_paths": [], "processed_hashes": [], "session_start": datetime.now(timezone.utc).isoformat(), "max_history": 500}
    with open(TRACKER_PATH, "r", encoding="utf-8") as f:
        return json.load(f)

def _save_tracker(data):
    with open(TRACKER_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)

def _hash_content(path: Path) -> str:
    try:
        return hashlib.sha256(path.read_bytes()).hexdigest()[:16]
    except Exception:
        return ""

def check_and_mark(path_str: str, operation: str = "process") -> dict:
    """
    Check if path+operation was already processed. If not, mark it.
    Returns dict with 'duplicate': bool and 'info': str
    """
    tracker = _load_tracker()
    path = Path(path_str).resolve()
    path_hash = _hash_content(path) if path.is_file() else hashlib.sha256(str(path).encode()).hexdigest()[:16]
    entry = f"{operation}:{path_hash}:{path}"

    if entry in tracker.get("processed_hashes", []):
        return {"duplicate": True, "info": f"Already processed: {path} ({operation})"}

    tracker.setdefault("processed_paths", []).append(str(path))
    tracker.setdefault("processed_hashes", []).append(entry)
    tracker["last_updated"] = datetime.now(timezone.utc).isoformat()

    # Trim history
    max_hist = tracker.get("max_history", 500)
    for key in ["processed_paths", "processed_hashes"]:
        if len(tracker.get(key, [])) > max_hist:
            tracker[key] = tracker[key][-max_hist:]

    _save_tracker(tracker)
    return {"duplicate": False, "info": f"Marked: {path} ({operation})"}

def reset_session():
    """Clear all processed markers for a fresh session."""
    _save_tracker({
        "processed_paths": [],
        "processed_hashes": [],
        "session_start": datetime.now(timezone.utc).isoformat(),
        "max_history": 500
    })
    return {"status": "reset", "info": "Session guard cleared"}

def stats() -> dict:
    tracker = _load_tracker()
    return {
        "session_start": tracker.get("session_start"),
        "total_marked": len(tracker.get("processed_paths", [])),
        "unique_paths": len(set(tracker.get("processed_paths", []))),
        "last_updated": tracker.get("last_updated")
    }

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: hermes_cycle_guard.py <check|reset|stats> [path] [operation]")
        sys.exit(1)
    
    cmd = sys.argv[1]
    if cmd == "stats":
        print(json.dumps(stats(), indent=2))
    elif cmd == "reset":
        print(json.dumps(reset_session(), indent=2))
    elif cmd == "check":
        path = sys.argv[2] if len(sys.argv) > 2 else "."
        operation = sys.argv[3] if len(sys.argv) > 3 else "process"
        result = check_and_mark(path, operation)
        print(json.dumps(result, indent=2))
    else:
        print(f"Unknown command: {cmd}")
        sys.exit(1)
