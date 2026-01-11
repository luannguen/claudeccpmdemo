# CCPM Process & Philosophy

This document defines the 4 core pillars of the Claude Code Project Management (CCPM) system. All agents must adhere to these principles.

## 1. Spec-Driven Development
- **Traceability**: Every line of code must be traceable back to a Task, which belongs to an Epic, which satisfies a Requirement in a PRD.
- **Workflow**:
  1.  **PRD**: `P-{year}-{id}-{name}.md` - Define *What* and *Why*.
  2.  **Epic**: `E-{year}-{id}-{name}.md` - Define *How*.
  3.  **Task**: Checklist in `task.md` or GitHub Issue.
  4.  **Code**: Implementation.
- **Rule**: Never start coding without an approved Epic/Plan.

## 2. GitHub Issues as Single Source of Truth
- **Centralization**: GitHub Issues are the primary source of truth for work items.
- **Visibility**: Status updates, blockers, and decisions must be recorded in Issues (or their proxy artifacts like `task.md` synced to issues).
- **Handoff**: Use Issues to pass context between Human and AI.
- **No Hidden Context**: Avoid relying solely on chat history; vital info must be persisted in artifacts or issues.

## 3. Parallel Agents
- **Decomposition**: Epics must be broken down into non-overlapping "Work Streams" (e.g., Frontend vs Backend, Database vs API).
- **Independence**: Agents working on different streams should ideally touch different files to prevent merge conflicts.
- **Coordination**: Use `agent-coordination.md` protocols when touching shared files.
- **Speed**: The goal is to run multiple agents concurrently to speed up delivery (3-5x).

## 4. Context Preservation
- **Persistence**: Context is king. It must never be lost between sessions.
- **Artifacts**:
  - `brain/task.md`: Current state of progress.
  - `brain/implementation_plan.md`: Technical design.
  - `.claude/epics/*`: Long-term technical documentation.
  - `.claude/prds/*`: Long-term product documentation.
- **Resumption**: Any agent picking up the project must be able to resume work instantly by reading these artifacts, without needing to re-read the entire chat history.
