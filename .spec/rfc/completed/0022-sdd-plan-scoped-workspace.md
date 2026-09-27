# RFC 0022: Key SDD progress to the plan file

**Status:** Implemented

## Summary

Subagent-driven development stores its ledger, briefs, and reports under a directory named for the plan, not in one flat progress file shared by every plan.

## Problem

A single `.superpowers/sdd/progress.md` has no plan identity. A later plan can resume a finished plan's ledger because task numbers match and the file never expires.

## Goals

- The workspace path includes the plan file's identity.
- Starting SDD on a different plan does not read the previous plan's ledger.
- Resuming the same plan does read that plan's ledger.
- In this repo the directory is `.designify/sdd/<plan-id>/`.

## Non-goals

- The fix-loop rewrite. That is [0023](0023-sdd-fix-loop.md).
- Session-scoped ledgers that ignore the plan file.

## Design

`sdd-workspace` takes the plan path and creates `<repo>/.designify/sdd/<plan-basename>/`. The workflow's start check looks only in that directory. A leftover flat `progress.md` is not the ledger. The positive instruction is the path recipe, not a list of forbidden files.

The 2026-07-06 pressure notes are the acceptance evidence shape: one fixture where plan B must ignore plan A's ledger, and one where the same plan resumes. Cited commits in that fixture have to be real commits whose diffs match the task they claim. A counter that only increments inside a subshell is not acceptable fixture state.

## Acceptance

Two plans in one repo get two ledger directories. Resuming plan A loads A's ledger. Starting plan B does not mark A's tasks done. The workflow text names `.designify/sdd/<plan-id>/` and does not tell the agent to read a flat `.designify/sdd/progress.md` as the current ledger.
