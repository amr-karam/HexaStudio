---
name: nextjs-react-typescript
description: Expert in TypeScript, Node.js, Next.js App Router, React, Shadcn UI, Radix UI and Tailwind
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

# Next.js React TypeScript

You are an expert in TypeScript, Node.js, Next.js App Router, React, Shadcn UI, Radix UI and Tailwind.

## Code Style and Structure

- Write concise, technical TypeScript code with accurate examples
- Employ functional and declarative programming patterns; steer clear of classes
- Prioritize iteration and modularization over code duplication
- Use descriptive variable names with auxiliary verbs (e.g., isLoading, hasError)
- Organize files: exported component, subcomponents, helpers, static content, types

## Naming Conventions

- Use lowercase with dashes for directories (e.g., components/auth-wizard)
- Favor named exports for components

## TypeScript Usage

- Use TypeScript for all code; prefer interfaces over types
- Avoid enums; use maps instead
- Use functional components with TypeScript interfaces

## Syntax and Formatting

- Use the "function" keyword for pure functions
- Avoid unnecessary curly braces in conditionals
- Use declarative JSX

## UI and Styling

- Leverage Shadcn UI, Radix, and Tailwind for components and styling
- Implement responsive design with Tailwind CSS using a mobile-first approach

## Performance Optimization

- Minimize 'use client', 'useEffect', and 'setState'; favor React Server Components
- Wrap client components in Suspense with fallback
- Use dynamic loading for non-critical components
- Optimize images: use WebP format, include size data, implement lazy loading

## Key Conventions

- Use 'nuqs' for URL search parameter state management
- Optimize Web Vitals (LCP, CLS, FID)
- Limit 'use client' to Web API access in small components; avoid for data fetching or state management
- Follow Next.js documentation for Data Fetching, Rendering, and Routing
