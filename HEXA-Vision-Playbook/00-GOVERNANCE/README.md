# HEXA Vision Playbook

**Version:** 1.0.0  
**Status:** Foundation  
**Last Updated:** 2026-07-08  
**Owner:** Chief Enterprise Architect  

---

## Purpose

This Playbook is the **single source of truth** and **operating manual** for the entire HEXA Vision platform. It governs every AI Agent, developer, and contributor working on the project. No development begins without consulting this Playbook.

## Scope

The Playbook covers all aspects of the HEXA Studio ecosystem:

| Domain | Coverage |
|--------|----------|
| **Vision** | Product direction, mission, values, long-term strategy |
| **Architecture** | System design, component relationships, data flow |
| **Standards** | Code, design, security, performance, accessibility |
| **Workflow** | Development lifecycle, Git strategy, CI/CD |
| **AI Agents** | Responsibilities, guidelines, prompt templates |
| **Quality** | Gates, checklists, review criteria, Definition of Done |
| **Operations** | Deployment, monitoring, incident response, maintenance |

## How to Use This Playbook

### For New Developers / AI Agents

1. Read `PROJECT_OVERVIEW.md` — understand the platform
2. Read `PRODUCT_VISION.md` — understand the mission
3. Read `SYSTEM_ARCHITECTURE.md` — understand the structure
4. Read `AI_AGENT_GUIDE.md` — understand your role
5. Read `CODING_STANDARDS.md` — understand the rules
6. Read `QUALITY_GATES.md` — understand the bar

### For Sprint Planning

1. Review `PROJECT_ROADMAP.md` for current phase
2. Check `sprints/` for active sprint backlog
3. Review `adr/` for recent architectural decisions
4. Use `templates/` for story creation

### For Feature Development

1. Read relevant architecture docs in `architecture/`
2. Check `api/` for endpoint specifications
3. Review `standards/` for relevant standards
4. Follow `DEVELOPMENT_WORKFLOW.md`
5. Pass all items in `checklists/`

## Playbook Structure

```
HEXA-Vision-Playbook/
├── README.md                      # This file
├── PROJECT_OVERVIEW.md            # Platform overview
├── PRODUCT_VISION.md              # Mission, vision, values
├── PROJECT_ROADMAP.md             # Phase breakdown
├── TECH_STACK.md                  # Technology decisions
├── SYSTEM_ARCHITECTURE.md         # System design
├── REPOSITORY_STRATEGY.md         # Monorepo structure
├── DEVELOPMENT_WORKFLOW.md        # Development lifecycle
├── CODING_STANDARDS.md            # Code quality rules
├── GIT_WORKFLOW.md                # Git conventions
├── DOCUMENTATION_STANDARDS.md     # Documentation rules
├── SECURITY_STANDARDS.md          # Security requirements
├── PERFORMANCE_STANDARDS.md       # Performance budgets
├── ACCESSIBILITY_GUIDE.md         # A11y requirements
├── SEO_GUIDE.md                   # SEO requirements
├── DEPLOYMENT_STRATEGY.md         # Deployment pipeline
├── RELEASE_PROCESS.md             # Release management
├── QUALITY_GATES.md               # Quality control
├── AI_AGENT_GUIDE.md              # Agent responsibilities
├── BUSINESS_WORKFLOWS.md          # Business processes
├── PRODUCT_VISION_2030.md         # Long-term vision
│
├── architecture/                  # Detailed architecture docs
├── agents/                        # Agent-specific guides
├── prompts/                       # Prompt templates
├── templates/                     # Document templates
├── standards/                     # Detailed standards
├── checklists/                    # Verification checklists
├── sprints/                       # Sprint plans
├── adr/                           # Architecture Decision Records
├── api/                           # API specifications
├── odoo/                          # Odoo integration docs
├── devops/                        # DevOps runbooks
└── meeting-notes/                 # Meeting records
```

## Versioning

This Playbook follows [Semantic Versioning 2.0.0](https://semver.org/):

- **MAJOR**: Incompatible architectural or workflow changes
- **MINOR**: New standards, roles, or processes added
- **PATCH**: Clarifications, corrections, minor updates

The version is maintained in the `CHANGELOG.md` within this directory.

## Maintenance

- Review quarterly for relevance
- Update immediately when architectural decisions change
- Every ADR must reference the Playbook version at time of decision
- The Chief Architect is the owner and final authority on Playbook content

## License

This Playbook is proprietary to HEXA Studio. It governs internal development and is not for public distribution.
