#!/usr/bin/env python3
"""Generate unified skill registry from both hexastudio.net and hermes-agent skill directories."""

import json
import os
import re
import yaml
from pathlib import Path
from typing import Any
from dataclasses import dataclass, asdict
from datetime import datetime

@dataclass
class SkillMetadata:
    id: str
    name: str
    display_name: str
    short_description: str
    description: str
    category: str
    tags: list[str]
    related_skills: list[str]
    system: str
    schema_version: str = "1.0"
    author: str | None = None
    version: str | None = None
    license: str | None = None
    platforms: list[str] | None = None

def slugify(name: str) -> str:
    """Convert skill name to snake_case ID."""
    return name.lower().replace("-", "_").replace(" ", "_")

def extract_yaml_frontmatter(content: str) -> tuple[dict, str]:
    """Extract YAML frontmatter from content."""
    match = re.match(r'^---\s*\n(.*?)\n---\s*\n(.*)$', content, re.DOTALL)
    if match:
        try:
            return yaml.safe_load(match.group(1)) or {}, match.group(2)
        except yaml.YAMLError:
            return {}, content
    return {}, content

def get_hexastudio_net_skills(skills_dir: Path) -> list[SkillMetadata]:
    """Extract skills from hexastudio.net skills directory."""
    skills = []
    
    if not skills_dir.exists():
        return skills
        
    for skill_path in sorted(skills_dir.iterdir()):
        if not skill_path.is_dir():
            continue
            
        skill_id = skill_path.name
        skill_md = skill_path / "SKILL.md"
        
        if not skill_md.exists():
            continue
            
        content = skill_md.read_text(encoding='utf-8')
        frontmatter, _ = extract_yaml_frontmatter(content)
        
        # Extract description from frontmatter or content
        description = frontmatter.get('description', '')
        if not description and content.strip():
            # Try to get first meaningful line
            lines = [l.strip() for l in content.split('\n') if l.strip()]
            for line in lines:
                if not line.startswith('#') and line:
                    description = line
                    break
            if not description:
                description = "Skill in hexastudio.net"
                
        # Try to get display_name and short_description from openai.yaml
        openai_yaml = skill_path / "agents" / "openai.yaml"
        display_name = frontmatter.get('name', skill_id.replace('_', '-')).title()
        short_description = description[:80] + "..." if len(description) > 80 else description
        
        # Check for agent config in openai.yaml
        if openai_yaml.exists():
            try:
                agent_content = openai_yaml.read_text(encoding='utf-8')
                agent_data = yaml.safe_load(agent_content)
                if agent_data and 'interface' in agent_data:
                    interface = agent_data['interface']
                    display_name = interface.get('display_name', display_name)
                    short_description = interface.get('short_description', short_description)
            except yaml.YAMLError:
                pass
        
        # Extract tags from content
        tags = []
        
        # Look for related skills in content
        related_skills = []
        
        skills.append(SkillMetadata(
            id=skill_id,
            name=skill_id,
            display_name=display_name,
            short_description=short_description,
            description=description,
            category=skill_id,
            tags=tags,
            related_skills=related_skills,
            system="hexastudio.net"
        ))
    
    return skills

def get_hermes_agent_skills(skills_dir: Path) -> list[SkillMetadata]:
    """Extract skills from hermes-agent skills directory."""
    skills = []
    
    if not skills_dir.exists():
        return skills
    
    # Category directories
    categories = [
        "software-development", "creative", "research", "productivity", 
        "devops", "email", "media", "note-taking", "social-media", 
        "web", "autonomous-ai-agents", "communication", "mcp", "mlops",
        "health", "blockchain", "migration", "security", "web-development"
    ]
    
    for category in categories:
        cat_path = skills_dir / category
        if not cat_path.exists():
            continue
            
        for skill_path in sorted(cat_path.iterdir()):
            if not skill_path.is_dir():
                continue
                
            skill_md = skill_path / "SKILL.md"
            
            if not skill_md.exists():
                continue
                
            content = skill_md.read_text(encoding='utf-8')
            frontmatter, _ = extract_yaml_frontmatter(content)
            
            if not frontmatter:
                continue
            
            skill_id = slugify(frontmatter.get('name', skill_path.name))
            name = frontmatter.get('name', skill_path.name.title())
            description = frontmatter.get('description', '')
            
            # Extract tags
            metadata = frontmatter.get('metadata', {})
            hermes_meta = metadata.get('hermes', {}) if isinstance(metadata, dict) else {}
            tags = hermes_meta.get('tags', []) if isinstance(hermes_meta.get('tags'), list) else []
            related_skills = hermes_meta.get('related_skills', []) if isinstance(hermes_meta.get('related_skills'), list) else []
            
            # Get required fields
            platforms = frontmatter.get('platforms', [])
            
            skills.append(SkillMetadata(
                id=skill_id,
                name=name,
                display_name=name.title(),
                short_description=description[:80] + "..." if len(description) > 80 else description,
                description=description,
                category=category,
                tags=tags if isinstance(tags, list) else [],
                related_skills=related_skills if isinstance(related_skills, list) else [],
                system="hermes-agent",
                author=frontmatter.get('author', 'Hermes Agent'),
                version=frontmatter.get('version', '1.0.0'),
                license=frontmatter.get('license', 'MIT'),
                platforms=platforms if isinstance(platforms, list) else []
            ))
    
    return skills

def generate_registry(
    hexastudio_dir: Path, 
    hermes_dir: Path,
    output_path: Path
) -> dict:
    """Generate unified skill registry."""
    
    hexastudio_skills = get_hexastudio_net_skills(hexastudio_dir)
    hermes_skills = get_hermes_agent_skills(hermes_dir)
    
    all_skills = hexastudio_skills + hermes_skills
    
    registry = {
        "system": "Hermes",
        "version": "1.0",
        "description": "Central unified skill registry for both hexastudio.net and hermes-agent systems",
        "generated_at": datetime.utcnow().isoformat() + "Z",
        "total_skills": len(all_skills),
        "by_system": {
            "hexastudio.net": len(hexastudio_skills),
            "hermes-agent": len(hermes_skills)
        },
        "global_rules": {
            "critical_rules": [
                {
                    "id": "never-manual",
                    "name": "NEVER Tell User to Do Anything Manually",
                    "description": "AGENTS MUST NEVER tell the user to do anything manually. The agent MUST handle everything automatically using available tools. If a task requires user action (credentials, approvals), the agent must use available tools (wizard, question tool, etc.) to guide through it - never say 'you need to...' or 'please run...'. The agent IS the automation.",
                    "severity": "CRITICAL",
                    "applies_to": ["hexastudio.net", "hermes-agent", "all-agents"],
                    "enforcement": "IMMEDIATE - Any violation is a critical protocol breach"
                },
                {
                    "id": "plan-before-code",
                    "name": "Make a Concise Implementation Plan Before Changing Code",
                    "description": "AGENTS MUST make a concise implementation plan BEFORE making any code changes. Never jump directly into editing - first lay out the plan, then execute. This ensures clarity, catches issues early, and aligns with the user on approach.",
                    "severity": "CRITICAL",
                    "applies_to": ["hexastudio.net", "hermes-agent", "all-agents"],
                    "enforcement": "IMMEDIATE - Any violation is a critical protocol breach"
                }
            ],
            "enforcement_note": "This rule is binding on ALL agents in ALL systems. No exceptions."
        },
        "skills": [asdict(s) for s in all_skills]
    }
    
    output_path.write_text(json.dumps(registry, indent=2, ensure_ascii=False), encoding='utf-8')
    return registry

if __name__ == "__main__":
    import sys
    
    hexastudio_dir = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("C:/Users/amrmo/OneDrive/Desktop/hexastudio.net/skills")
    hermes_dir = Path(sys.argv[2]) if len(sys.argv) > 2 else Path("C:/Users/amrmo/workspace/hermes-agent/skills")
    output_path = Path(sys.argv[3]) if len(sys.argv) > 3 else Path("C:/Users/amrmo/OneDrive/Desktop/hexastudio.net/skills/central-skills-registry.json")
    
    registry = generate_registry(hexastudio_dir, hermes_dir, output_path)
    print(f"Generated registry with {registry['total_skills']} skills")
    print(f"  hexastudio.net: {registry['by_system']['hexastudio.net']}")
    print(f"  hermes-agent: {registry['by_system']['hermes-agent']}")