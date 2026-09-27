# RFC 0028: Cheapen SDD mechanics without moving judgment

**Status:** Draft

## Summary

Cut the dollar cost of subagent-driven development by cheapening mechanical work. Judgment stays on the expensive model or with the user. A rung ships only when its quality gates pass. Rungs that already died at those gates stay dead.

## Problem

A measured SDD run spent about $13. Most of that is the controller's resident context and the implementer dispatches. Review loops vary the bill and usually start from an ambiguous plan. Moving the controller or the reviewer to a cheaper model looks like the largest saving and is also the easiest way to drop a judgment the pass/fail gate will not see.

## Goals

- Quality stays: planted-defect review passes over five runs, extra-feature rejection passes, end-to-end scenarios pass, and a blind comparison matches the current deliverable.
- A rung names which decisions it moves and shows each one is mechanical.
- One fresh subagent per task remains. Several plan tasks are not batched into one implementer dispatch.
- Failed rungs are not retried under a softer gate.

## Non-goals

- Wall-clock as a target. Token count matters only as a cost driver.
- Dispatch-time task batching.
- Scoped re-reviews that only check the fix. That was vetoed. Full re-review stays.
- Treating "the cheap model usually gets it right" as evidence.

## Design

Judgment that stays expensive: blocked or needs-context handling, a review note that cannot be verified from the diff, dispatch curation, review severity, false-positive adjudication, and knowing the plan itself is wrong. A rung that would move one of these must decide it once at plan time, escalate it back, or stop.

Ladder, in leverage order:

- L1. Plan crispness in writing-plans: constraints header, exact interfaces, and fewer tiny tasks. Measured outcome is fidelity and variance, not a dollar claim. Opus-written plans with complete code were the cost change. Hand-written fixture plans were the expensive baseline.
- L2. Cheaper controller. Died at the pre-registered gates, including the broken-plan escalation scenario. Do not ship.
- L3. Cheaper task reviewer. Died. Haiku reviewers missed planted defects or downgraded them. Do not ship.
- L4. Resident-context diet: the controller reads task headings and global constraints, not the whole plan body, because the brief already carries the task. Trim reports.
- L5. Vetoed ideas, including scoped re-review. No experiment without an explicit reversal.

## Acceptance

L2 and L3 are not in the workflow. L1 changes to writing-plans cite fidelity, not a dollar delta. L4, if taken, still leaves judgment points on the expensive controller. A quality miss on five planted-defect runs kills that rung. Task batching is absent.
