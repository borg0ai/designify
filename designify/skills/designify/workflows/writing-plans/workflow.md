# RFC Implementation Plan

## Purpose

Create or refine one implementation plan inside one Specify-managed RFC. The RFC is the plan. Do not create a second plan file under `docs/`, `.designify/`, or another path.

## Required handoff

1. Load the `specify` skill. Do not copy its CLI or duplicate its RFC lifecycle rules here.
2. Inspect the target repository. Run Specify `init` to locate or scaffold `.spec/` and get the next RFC id.
3. Deliver one RFC with `specify deliver <id> <slug> <title>`. Split independent concerns into separate RFCs; use an umbrella plus child RFCs only when they share a larger theme.
4. Fill the RFC's `Summary`, `Problem`, `Goals`, `Non-goals`, `Design`, and `Acceptance` sections. Put the ordered implementation plan under `## Design` → `### Implementation Plan`.
5. Use `### Task 1: ...`, `### Task 2: ...` headings so Designify's task-brief script can extract SDD work. Each task names exact files, interfaces, tests, red/green steps, and verification commands. Avoid `- [ ]` checkboxes in active RFCs; Specify owns task tracking in `.spec/TASK_TRACKING.md`.
6. Run Specify `validate <rfc-file>`. Fix errors and relevant warnings; do not hand-edit ROADMAP or TASK_TRACKING when Specify commands can update them.
7. Present the RFC path and a concise summary of its ordered implementation plan. Wait for an explicit approval before implementation. RFC approval accepts the design and plan; execution method selection determines inline or SDD flow.

If `specify` is unavailable, stop before implementation. Never silently fall back to a standalone design or plan document.

## Plan content inside RFC

The RFC's `Design` section is the single source of implementation decisions:

- system boundaries, data flow, and key interfaces;
- exact files to create or change;
- ordered `### Task N` sections with inputs, outputs, and dependencies;
- a failing test before implementation for behavior changes;
- exact project verification commands and expected outcomes;
- compatibility constraints and failure handling.

The RFC's `Acceptance` section defines observable completion criteria. Keep implementation steps in `Design`; keep RFC status and tracking checkboxes in Specify-managed files.

## Handoff after approval

- Inline execution: pass the approved RFC file path as `RFC_FILE` to `workflows/executing-plans/workflow.md`.
- Subagent-driven development: pass the same `RFC_FILE` to `workflows/subagent-driven-development/workflow.md`.
- Both executors read the RFC as the plan and store execution artifacts under `.designify/sdd/<RFC-filename-without-extension>/`.
- TDD notes and captured RED/GREEN command output go under `.designify/tdd/<RFC-filename-without-extension>/`. Keep actual product tests in normal project test directories.
