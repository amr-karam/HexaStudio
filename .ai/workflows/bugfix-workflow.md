# 🐛 WORKFLOW: Bugfix Protocol

```text
1. Bug Report & Traceback Reproduction (bug-report.md)
   ↓
2. Identify Root Cause (Inspect full un-truncated error logs)
   ↓
3. Write Failing Unit Test Isolating Bug
   ↓
4. Implement Surgical Fix (No symptom masking or try/except swallows)
   ↓
5. Verify Test Passes & Monorepo Quality Gates Clear
   ↓
6. GitLab Merge Request & CI Execution
```
