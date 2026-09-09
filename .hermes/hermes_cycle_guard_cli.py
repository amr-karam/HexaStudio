#!/usr/bin/env python3
"""
Hermes Cycle Guard - Standalone CLI
Usage:
    hermes-cycle-guard.exe check <path> [operation]
    hermes-cycle-guard.exe stats
    hermes-cycle-guard.exe reset
"""
import json
import hashlib
import sys
import os
from pathlib import Path

# Locate tracker next to the executable
APP_DIR = Path(sys.executable).parent if getattr(sys, 'frozen', False) else Path(__file__).parent
TRACKER_PATH = APP_DIR / "processed-tracker.json"


def load_tracker():
    if not TRACKER_PATH.exists():
        return {
            "processed_paths": [],
            "processed_hashes": [],
            "session_start": __import__('datetime').datetime.now(__import__('datetime').timezone.utc).isoformat(),
            "max_history": 500
        }
    with open(TRACKER_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def save_tracker(data):
    with open(TRACKER_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)


def hash_content(path: Path) -> str:
    try:
        return hashlib.sha256(path.read_bytes()).hexdigest()[:16]
    except Exception:
        return ""


def check_and_mark(path_str: str, operation: str = "process") -> dict:
    tracker = load_tracker()
    path = Path(path_str).resolve()
    path_hash = hash_content(path) if path.is_file() else hashlib.sha256(str(path).encode()).hexdigest()[:16]
    entry = f"{operation}:{path_hash}:{path}"

    if entry in tracker.get("processed_hashes", []):
        return {"duplicate": True, "info": f"Already processed: {path} ({operation})"}

    tracker.setdefault("processed_paths", []).append(str(path))
    tracker.setdefault("processed_hashes", []).append(entry)
    tracker["last_updated"] = __import__('datetime').datetime.now(__import__('datetime').timezone.utc).isoformat()

    max_hist = tracker.get("max_history", 500)
    for key in ["processed_paths", "processed_hashes"]:
        if len(tracker.get(key, [])) > max_hist:
            tracker[key] = tracker[key][-max_hist:]

    save_tracker(tracker)
    return {"duplicate": False, "info": f"Marked: {path} ({operation})"}


def reset_session():
    save_tracker({
        "processed_paths": [],
        "processed_hashes": [],
        "session_start": __import__('datetime').datetime.now(__import__('datetime').timezone.utc).isoformat(),
        "max_history": 500
    })
    return {"status": "reset", "info": "Session guard cleared"}


def stats():
    tracker = load_tracker()
    return {
        "session_start": tracker.get("session_start"),
        "total_marked": len(tracker.get("processed_paths", [])),
        "unique_paths": len(set(tracker.get("processed_paths", []))),
        "last_updated": tracker.get("last_updated")
    }


def main():
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Usage: hermes-cycle-guard <check|stats|reset> [path] [operation]"}, indent=2))
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
        print(json.dumps({"error": f"Unknown command: {cmd}"}, indent=2))
        sys.exit(1)


if __name__ == "__main__":
    main()
