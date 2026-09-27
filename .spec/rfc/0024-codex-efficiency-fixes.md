# RFC 0024: Apply the five evidence-strong Codex efficiency treatments

**Status:** Draft

## Summary

Ship five skill changes that already have a failing baseline in the Codex efficiency campaign. Anything without that baseline waits.

## Problem

Codex sessions spend turns on work the skills provoke: nested review inside a worker, polling sleeps, wrong tool notes, a brainstorming path that skips approval, and child agents spawned without a named model.

## Goals

- T1. A subagent-driven worker does not launch its own review subagent.
- T2. Waits are event-driven. The skill does not tell the agent to poll on a timer as the primary wait.
- T3. The Codex tool map matches the tools Codex actually exposes.
- T4. Brainstorming keeps three paths, and every path waits for approval before implementation.
- T5. A child agent spawn names the model and effort explicitly.

## Non-goals

- Phase 2 items from the campaign. Those need their own failing baseline first.
- Changing harnesses other than the ones each treatment names. T4's regression battery includes Claude Code because the router is shared. The other treatments stay on the Codex map unless the battery says otherwise.

## Design

Edit the subagent-driven workflow for T1, the waiting guidance for T2, `harness-mappings/references/codex-tools.md` for T3, the brainstorming router for T4, and the spawn instructions for T5. Grade each treatment against the criteria already measured: T1 has zero worker-issued depth-2 review spawns and still covers review; T2 lowers the timeout rate without losing completion; T3's corrections cite the tool source; T4 keeps the approval gate on all three paths; T5 shows model and effort on every child spawn.

## Acceptance

Each treatment has a before and after note against its criterion. A treatment that misses its criterion is reverted in that change. Phase 2 items are not in the diff.
