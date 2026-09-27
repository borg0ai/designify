# RFC 0002: Clarify RFC gate in Designify skill routing

**Status:** Approved

## Summary

Clarify the Designify entrypoint so implementation-oriented TDD guidance cannot be read as a route around Specify RFC planning and approval. The RFC remains the sole implementation plan; TDD starts only after that RFC is approved.

## Problem

The `Choose a workflow` table in `designify/skills/designify/SKILL.md` currently maps “Implement a feature or fix” directly to the TDD reference. The later `Run it` section requires a validated RFC before persistent changes, but the table makes the ordering ambiguous and may lead an agent to begin implementation work before producing or getting approval for the RFC.

## Goals

- Make RFC creation, validation, and approval the explicit gate before implementation workflows for persistent changes.
- Describe TDD as the implementation method used after RFC approval, not as an alternate planning path.
- Preserve one Designify skill entrypoint and existing `.designify/tdd/` and `.designify/sdd/` artifact paths.
- Use the Specify skill as the sole RFC lifecycle tool. Store RFC documents in `.spec/rfc/`; keep TDD, SDD, and evaluation artifacts in `.designify/`.

## Non-goals

- Do not create additional discoverable skills.
- Do not rewrite existing TDD, SDD, Specify, or brainstorming workflows.
- Do not change plugin packaging, host support, RFC lifecycle rules, or product code.
- Do not create alternate RFC locations, parallel plan documents, or duplicate RFC indexes. Specify-managed `.spec/ROADMAP.md` and `.spec/TASK_TRACKING.md` remain the required status/index files.

## Design

Change only `designify/skills/designify/SKILL.md`:

### Task 1: Make RFC approval prerequisite explicit in routing

- Update the TDD routing row so it says TDD applies while implementing a feature or fix governed by an approved RFC.
- Add a short routing note stating that persistent changes must complete the Specify RFC create/validate/approve gate before loading implementation workflows; TDD is not a separate plan.
- Leave workflow reference contents and artifact locations unchanged.
- Keep RFC creation and lifecycle delegated to Specify; do not add another RFC generator or storage convention.
- Before changing the skill, run baseline pressure scenarios for a feature request and a bug fix without the clarification; record whether each route starts TDD before RFC approval and capture the agent's reasoning.
- After the edit, repeat the same scenarios against the updated Designify entrypoint. Confirm each agent creates and validates an RFC, waits for its approval, then chooses TDD for implementation; confirm no parallel plan appears and artifact paths remain under `.designify/`.
- Store scenario prompts, outputs, and comparison notes under `.designify/tdd/0002-designify-rfc-gate/`. Keep repository test files unchanged.
- Run Birdify authoring validation and inspect all links in the edited entrypoint. Report unavailable multi-session evaluation honestly; do not treat static checks as behavioral proof.

## Acceptance

- The router states that persistent changes require an approved Specify RFC before implementation workflows.
- TDD is explicitly described as an implementation method after RFC approval.
- One discoverable Designify skill remains; no workflow file or plugin manifest changes.
- RFC stays at `.spec/rfc/0002-designify-rfc-gate.md`; Specify alone maintains the RFC index and status tracking in `.spec/ROADMAP.md` and `.spec/TASK_TRACKING.md`.
- TDD execution/evaluation artifacts reside under `.designify/tdd/0002-designify-rfc-gate/`; SDD artifacts, when used, reside under `.designify/sdd/0002-designify-rfc-gate/`. Product tests remain in normal test locations.
- Birdify authoring validation passes, entrypoint links resolve, and pressure-evaluation results and limitations are reported.
