# RFC 0018: Scope per-task SDD reviews to the task diff

**Status:** Implemented

## Summary

Subagent-driven development reviews one task against that task's diff. The final branch review stays broad. Per-task reviewers stop re-running tests the implementer already ran and stop grepping the whole repo by default.

## Problem

Per-task quality reviewers did branch-sized work. In two recorded sessions, most quality reviewers ran repo-wide searches. One spent about 200 seconds and 50 shell commands on a single task. That cost did not find task-scoped defects the diff already contained.

## Goals

- The per-task prompt says to read the task diff first and to widen only with a stated reason.
- The reviewer does not re-run a test command the implementer just ran for that task.
- The final whole-branch review keeps full-repo breadth.
- A re-review after a fix still covers the whole task.

## Non-goals

- Merging spec compliance and code quality into one subagent. Later cost notes may change that. This RFC keeps the two stages.
- Dropping the final branch review.

## Design

Rewrite the task reviewer prompt in `designify/skills/designify/workflows/subagent-driven-development/` so the required read is the diff for the task's commits. Broadening is allowed only after the prompt records why the diff is not enough. The workflow's final review section stays whole-branch. Spec compliance remains a separate pass.

## Acceptance

A per-task review prompt forbids a default repo-wide grep and a repeated test run. The final review prompt still asks for the whole branch. A fixture task with a known diff-only defect is caught from the diff without a repo walk.
