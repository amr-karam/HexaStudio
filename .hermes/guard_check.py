#!/usr/bin/env python3
"""Quick guard check - call before any file/folder operation."""
import sys, json
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))
from hermes_cycle_guard import check_and_mark, stats

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"duplicate": False, "info": "no-op", "stats": stats()}, indent=2))
        sys.exit(0)
    
    path = sys.argv[1]
    operation = sys.argv[2] if len(sys.argv) > 2 else "process"
    result = check_and_mark(path, operation)
    result["stats"] = stats()
    print(json.dumps(result, indent=2))
