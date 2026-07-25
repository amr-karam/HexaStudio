# 🤖 AI AUTOMATION RULES & EVENT-DRIVEN TRIGGER SPECIFICATIONS

**Version:** 1.0.0 | **Scope:** AI System Automations | **Standard:** Event-Driven Agent Orchestration

---

## 1. OVERVIEW & AUTOMATION PIPELINE

AI Automations run as asynchronous event handlers listening to the NestJS `EventBus` (`apps/backend/src/modules/realtime/event-bus.service.ts`). When business events occur (e.g. lead submitted, project uploaded, render phase reviewed), automated AI routines process embeddings, generate tags, and post webhooks.

---

## 2. CORE AI AUTOMATION ROUTINES

1. **Auto-Tagging Pipeline**: When a project is created or updated in Strapi $\rightarrow$ `AutoTagService` generates GPT-4o tags $\rightarrow$ updates Qdrant collection vectors.
2. **Lead Routing & Qualification**: Contact form submit $\rightarrow$ `SalesAssistant` evaluates ICP score $\rightarrow$ dispatches Slack notification & creates Odoo lead.
3. **Smart Project Recommendations**: Client views project detail $\rightarrow$ `RecommendationService` queries Qdrant cosine similarity $\rightarrow$ returns top 3 similar 3D portfolio projects.

---

## 3. RELATED DOCUMENTATION

- [VECTOR_SEARCH.md](file:///c:/Users/amrmo/OneDrive/Desktop/hexastudio.net/HEXA-Vision-Playbook/10-AI/VECTOR_SEARCH.md) — Vector search.
- [AI_ARCHITECTURE.md](file:///c:/Users/amrmo/OneDrive/Desktop/hexastudio.net/HEXA-Vision-Playbook/10-AI/AI_ARCHITECTURE.md) — AI framework architecture.
