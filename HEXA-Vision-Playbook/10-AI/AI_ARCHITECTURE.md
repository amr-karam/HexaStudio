# 🧠 AI ARCHITECTURE: THE INTELLIGENCE ENGINE

**Version:** 1.0 | **Scope:** All Layers | **Standard:** Adaptive / Low-Latency / High-Fidelity

## 1. THE AI PHILOSOPHY
AI at HEXA Studio is not a "feature"; it is an **orchestrator**. It should move from being a "chatbot" to being a "context-aware agent" that anticipates user needs and adapts the experience in real-time.

---

## 2. THE INTELLIGENCE STACK

### I. The Model Layer (The Brain)
We use a multi-model strategy to balance quality and cost:
- **Gemini 1.5 Pro:** Used for complex reasoning, long-context analysis, and architectural decisions.
- **Gemini 1.5 Flash:** Used for real-time interactions, simple transformations, and high-velocity tasks.
- **GPT-4o:** Used as a cross-validation model for critical prompts.

### II. The Orchestration Layer (The Nervous System)
- **Prompt Management:** All prompts are versioned in `05-PROMPTS/` and `10-AI/PROMPT_LIBRARY.md`.
- **RAG Pipeline (Retrieval Augmented Generation):**
    - **Vector DB:** Use a vector store (e.g., Pinecone or pgvector) to store project-specific knowledge.
    - **Context Injection:** The BFF retrieves relevant documentation from the Playbook and injects it into the prompt to ensure accuracy.

### III. The Interaction Layer (The Senses)
- **Multimodal Input:** Support for text, image (for design feedback), and audio (for voice-controlled 3D scenes).
- **Streaming Responses:** All AI output must be streamed to the frontend to eliminate the "waiting" feeling.

---

## 3. AI IMPLEMENTATION PATTERNS

### I. The "Agentic" Workflow
Move from simple prompts to **Agentic Loops**:
`Goal` $\rightarrow$ `Plan` $\rightarrow$ `Execute` $\rightarrow$ `Review` $\rightarrow$ `Refine` $\rightarrow$ `Output`.

### II. Dynamic UX Adaptation
The AI can trigger changes in the frontend based on user intent:
`User Intent` $\rightarrow$ `AI Decision` $\rightarrow$ `BFF Event` $\rightarrow$ `R3F Scene Change` (e.g., shifting the camera to a specific project detail).

---

## 4. ETHICS & SAFETY (The Guardrails)

### I. Hallucination Mitigation
- **Grounding:** Always provide the AI with the source documentation.
- **Self-Correction:** Use a "Critic" agent to review AI outputs before they reach the user.

### II. Data Privacy
- **Anonymization:** All PII (Personally Identifiable Information) is stripped before being sent to LLM providers.
- **Opt-In:** Users must explicitly opt-in to AI-enhanced features.

---

## 5. QUALITY GATE: AI AUDIT
An AI feature is "AI-Done" only when:
- [ ] The TTFT (Time to First Token) is < 500ms.
- [ ] The output is verified against the "Ground Truth" (Playbook).
- [ ] The prompt is versioned and documented.
- [ ] Fallback logic is implemented for API timeouts.

*“The goal is not to replace human creativity, but to give it a superpower.”*
