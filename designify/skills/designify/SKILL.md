---
name: designify
description: Use when an agent must design, implement, debug, review, or deliver software changes through a disciplined end-to-end workflow.
---

# Designify

Designify is one skill with focused workflow references. Start here, identify the user's current stage, then load only the relevant reference from `workflows/`. These files are guidance sections, not separately discoverable skills.

## Choose a workflow

| Request or stage | Read |
| --- | --- |
| New feature, unclear request, or design change | `workflows/brainstorming/workflow.md` |
| Create or refine RFC implementation plan | `workflows/writing-plans/workflow.md` |
| Implement approved RFC in this session | `workflows/executing-plans/workflow.md` |
| Implement approved RFC with task-level reviews | `workflows/subagent-driven-development/workflow.md` |
| Implement a feature or fix | `workflows/test-driven-development/workflow.md` |
| Diagnose unexpected behavior | `workflows/systematic-debugging/workflow.md` |
| Review incoming code feedback | `workflows/receiving-code-review/workflow.md` |
| Request a review | `workflows/requesting-code-review/workflow.md` |
| Confirm completion claims | `workflows/verification-before-completion/workflow.md` |
| Finish, merge, or discard a branch | `workflows/finishing-a-development-branch/workflow.md` |
| Create an isolated worktree | `workflows/using-git-worktrees/workflow.md` |
| Parallel independent tasks | `workflows/dispatching-parallel-agents/workflow.md` |
| Create or change agent guidance | `workflows/writing-skills/workflow.md` |
| Investigate a misfiring agent workflow | `workflows/diagnosing-agent-behavior/workflow.md` |

## Run it

1. Inspect the repository and current state before choosing actions. Separate known facts from assumptions.
2. For every persistent engineering change, use the `specify` skill to create and validate an RFC under `.spec/` before editing implementation files. If Specify is unavailable, stop before implementation and report that dependency.
3. Treat the RFC as the only design and implementation plan. Put ordered `### Task N` implementation details in its `Design` section; use Specify-managed `.spec/TASK_TRACKING.md` for status. Never create a parallel plan document or checklist in the RFC body.
4. Load the matching workflow reference. Follow its prerequisites, approval gates, and handoffs in order; references do not grant approval to skip another workflow's gate.
5. Save TDD execution notes under `.designify/tdd/<RFC-filename-without-extension>/` and SDD ledgers, briefs, reports, and review packages under `.designify/sdd/<RFC-filename-without-extension>/`. Keep product test files in the project's normal test locations.
6. Preserve existing user-facing behavior and project conventions. Prefer the smallest complete change that solves the stated problem.
7. Verify claims with the repository's real commands and observed output. Report failures and unavailable checks plainly.
8. Keep the user informed at meaningful milestones. Never claim completion from an unverified assumption.

If a request crosses stages, follow the handoffs in the references. If a capability required by a workflow is absent in the current harness, use a documented fallback or report the limitation; never invent a tool call.
