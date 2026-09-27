# RFC 0023: Replace the SDD topological fix loop

**Status:** Implemented

## Summary

Subagent-driven development stops looping "repeat until the review is clean" with no breaker. A fix resumes the same task. A structural finding stops the queue. The skill document uses the same red-flag table shape as the other workflows.

## Problem

Four failures showed up in real sessions. The review loop has no stop. The diagram and the fix instructions disagree. The workflow grew thirteen sections for one loop. The red-flag list is prose while sibling skills use a two-column table.

## Goals

- After findings, the controller resumes the same task instead of dispatching a new implementer from zero.
- A reviewer that never returns clean trips a fixed round limit and stops.
- A finding that later tasks depend on stops the queue.
- The workflow's red flags are an excuse/reality table.
- The fix-loop instructions live in one place in the workflow.

## Non-goals

- Ledger session-scoping. That collides with the same sections but is a different RFC.
- Removing per-task review. That stays [0018](0018-sdd-task-scoped-review.md).

## Design

Rewrite the fix section of `designify/skills/designify/workflows/subagent-driven-development/workflow.md`. The controller keeps the task's implementer context for fixes until the round limit. The prompt templates say resume, name the breaker, and name which findings are structural. Collapse duplicate loop sections into that one path. Match the red-flag table used by sibling skills.

## Acceptance

Three evals match the design notes. A task with findings is resumed, not re-dispatched. A reviewer that always finds a nit hits the breaker. A structural finding prevents the next task from starting. The workflow has one fix-loop section and a red-flag table.
