---
name: bigquery-graph
description: Provides guidelines and best practices for querying and defining property
  graphs and semantic graphs in BigQuery using GQL (Graph Query Language). Use when
  creating property graphs or querying graph topologies in BigQuery.
license: Apache-2.0
metadata:
  version: v1
  publisher: google
---

<supermemory-recall>
Before responding, silently decide whether recalling saved memory (past sessions, decisions, conventions, the user's preferences) would materially improve your answer to THIS message. Reason first — don't search reflexively, and don't narrate the decision.

Recall — by calling the `supermemory` tool with `mode: "search"` — when the message:
- refers to earlier work or decisions ("the auth flow", "like we did", "continue", "the bug from before")
- touches an area where saved conventions, patterns, or preferences likely exist
- is ambiguous in a way past context would resolve

Skip recall when the message is self-contained, trivial, a greeting/meta, fully answerable from the current conversation, or you already recalled the relevant context this session and the topic hasn't shifted.

Cadence is per-message: it's fine to recall on several turns in a row, and fine to never recall in a session. When you do recall, run it before answering and fold the results into your response.
</supermemory-recall>

# BigQuery Graph Analytics

BigQuery supports Graph Analytics through property graph queries (using GQL) and semantic graphs. Property graphs allow you to query topology, node/edge connections, and graph relationships directly in BigQuery SQL.

## Reference Directory

- **GQL Querying**: [graph_queries.md](references/graph_queries.md) - Standard GQL syntax and pattern matching.
- **Semantic Queries**: [semantic_queries.md](references/semantic_queries.md) - Semantic graph operations and expand functions.
- **Schema Best Practices**: [best_practices.md](references/graph-schema/best_practices.md) - Performance and indexing best practices for graph schemas.
- **DDL Reference**: [ddl_reference.md](references/graph-schema/ddl_reference.md) - `CREATE PROPERTY GRAPH` DDL syntax.
- **Feature Parity & Limitations**: [feature_parity.md](references/graph-schema/feature_parity.md) - GQL limitations and feature parity.
- **Graph Schema Advisor**: [graph_schema_ddl_advisor.md](references/graph-schema/graph_schema_ddl_advisor.md) - Assistant guidelines for designing graph schemas.

