#!/usr/bin/env python3
"""
Hermes Honcho Learner
Reads user memory from self-hosted Honcho (19.16.1.100:8000) and writes
structured learnings to a local markdown file that the Hermes agent can consume.
"""
from __future__ import annotations

import json
import os
import sys
from pathlib import Path
from typing import Any

try:
    import requests
except ImportError:
    print("Missing dependency: requests")
    print("Install: pip install requests")
    sys.exit(1)

APP_DIR = Path(sys.executable).parent if getattr(sys, "frozen", False) else Path(__file__).parent
DEFAULT_OUTPUT = APP_DIR / "honcho-learnings.md"


def load_env() -> dict[str, str]:
    candidates = [
        Path.home() / ".hermes" / ".env",
        Path.home() / "AppData" / "Local" / "hermes" / "profiles" / "hermes-engineering-council-profile-router" / ".env",
    ]
    values: dict[str, str] = {}
    for env_path in candidates:
        if env_path.exists():
            for line in env_path.read_text(encoding="utf-8").splitlines():
                if "=" in line and not line.strip().startswith("#"):
                    k, v = line.split("=", 1)
                    values[k.strip()] = v.strip().strip('"').strip("'")
    return values


def honcho_request(base_url: str, api_key: str, method: str, path: str, **kwargs: Any) -> Any:
    headers = kwargs.pop("headers", {})
    headers.setdefault("Authorization", f"Bearer {api_key}")
    headers.setdefault("Content-Type", "application/json")
    url = f"{base_url}{path}"
    resp = requests.request(method, url, headers=headers, timeout=15, **kwargs)
    resp.raise_for_status()
    if resp.status_code == 204:
        return None
    return resp.json()


def fetch_workspace(base_url: str, api_key: str, workspace_id: str) -> dict[str, Any]:
    return honcho_request(base_url, api_key, "POST", "/v3/workspaces", json={"id": workspace_id})


def fetch_peer(workspace_id: str, base_url: str, api_key: str) -> dict[str, Any]:
    return honcho_request(base_url, api_key, "POST", f"/v3/workspaces/{workspace_id}/peers", json={"id": "user"})


def search_user_knowledge(workspace_id: str, peer_id: str, base_url: str, api_key: str, query: str, limit: int = 20) -> dict[str, Any] | list[Any]:
    payload = {
        "query": query,
        "limit": limit,
    }
    return honcho_request(base_url, api_key, "POST", f"/v3/workspaces/{workspace_id}/search", json=payload)


def fetch_peer_representation(workspace_id: str, peer_id: str, base_url: str, api_key: str) -> str:
    data = honcho_request(base_url, api_key, "POST", f"/v3/workspaces/{workspace_id}/peers/{peer_id}/representation", json={})
    if isinstance(data, dict):
        return data.get("representation") or json.dumps(data, ensure_ascii=False, indent=2)
    return json.dumps(data, ensure_ascii=False, indent=2)


def fetch_peer_card(workspace_id: str, peer_id: str, base_url: str, api_key: str) -> list[str] | None:
    data = honcho_request(base_url, api_key, "GET", f"/v3/workspaces/{workspace_id}/peers/{peer_id}/card")
    if isinstance(data, dict):
        card = data.get("peer_card")
        if isinstance(card, list):
            return card
    return None


def render_markdown(workspace_id: str, peer_id: str, representation: str, card: list[str] | None, findings: dict[str, Any]) -> str:
    # Deduplicate all findings - flatten, dedupe, strip prior_memory_file wrappers
    all_items: list[str] = []
    seen: set[str] = set()

    for topic, items in findings.items():
        if isinstance(items, list):
            for entry in items:
                if isinstance(entry, dict):
                    content = entry.get("content") or entry.get("text") or json.dumps(entry, ensure_ascii=False)
                else:
                    content = str(entry)
                content = content.strip()
                if "<prior_memory_file>" in content or "</prior_memory_file>" in content:
                    continue
                if content not in seen:
                    seen.add(content)
                    all_items.append(content)

    lines = [
        "# Honcho Learnings",
        "",
        f"- Workspace: `{workspace_id}`",
        f"- Peer: `{peer_id}`",
        "",
        "## Peer Representation",
        "",
        representation.strip() or "_No representation yet._",
        "",
    ]
    if card:
        lines.append("## Peer Card")
        lines.append("")
        for item in card:
            lines.append(f"- {item}")
        lines.append("")

    lines.append("## Consolidated Memory Findings")
    lines.append("")
    if all_items:
        for item in all_items[:100]:
            lines.append(f"- {item}")
        lines.append("")
    else:
        lines.append("- No indexed memory findings available yet.")
        lines.append("")

    return "\n".join(lines)


def learn(output_path: Path | None = None) -> int:
    env = load_env()
    base_url = env.get("HONCHO_BASE_URL", "http://19.16.1.100:8000").rstrip("/")
    api_key = env.get("HONCHO_API_KEY", "")
    if not api_key:
        print("Missing HONCHO_API_KEY in Hermes .env")
        return 1

    output = output_path or DEFAULT_OUTPUT
    queries = [
        "user preferences and workflows",
        "project priorities and decisions",
        "recurring constraints and policies",
        "known issues and fixes",
        "infrastructure and credentials",
    ]

    print(f"Honcho base URL: {base_url}")
    print(f"Output: {output}")
    print("Fetching workspace...")
    workspace = fetch_workspace(base_url, api_key, "hermes_hermes-engineering-council-profile-router")
    workspace_id = workspace.get("id") or "unknown"

    print(f"Workspace: {workspace_id}")
    print("Fetching peer...")
    peer = fetch_peer(workspace_id, base_url, api_key)
    peer_id = peer.get("id") or "user"

    print(f"Peer: {peer_id}")
    print("Fetching representation...")
    representation = fetch_peer_representation(workspace_id, peer_id, base_url, api_key)

    card = fetch_peer_card(workspace_id, peer_id, base_url, api_key)

    findings: dict[str, Any] = {}
    for query in queries:
        print(f"Searching: {query}")
        try:
            data = search_user_knowledge(workspace_id, peer_id, base_url, api_key, query)
            items = data if isinstance(data, list) else data.get("items") or data.get("messages") or data.get("results") or []
            findings[query] = items
        except Exception as exc:
            findings[query] = f"ERROR: {exc}"

    markdown = render_markdown(workspace_id, peer_id, representation, card, findings)
    output.write_text(markdown, encoding="utf-8")
    print(f"Wrote {output} ({len(markdown)} chars)")
    return 0


if __name__ == "__main__":
    target = Path(sys.argv[1]) if len(sys.argv) > 1 else None
    sys.exit(learn(target))
