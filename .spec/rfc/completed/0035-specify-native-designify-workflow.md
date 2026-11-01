# RFC 0035: Make Specify the Native Designify Workflow

**Status:** Implemented

## Summary

Rebuild Designify's primary workflow around Specify's RFC lifecycle. Superpowers is the source material for reusable techniques, not the workflow model or authority. For persistent work, one Specify RFC carries the approved design and implementation plan; Specify owns status and tracking; focused Designify workflows provide execution methods after approval.

## Problem

Designify currently presents inherited stages and path-specific gates such as brainstorming, writing plans, TDD, and SDD as a general end-to-end process. A Specify gate exists, but the overall experience still follows Superpowers' process vocabulary and sequencing. This leaves two competing workflow models and can make Designify appear to require stages or artifacts that Specify does not own.

## Goals

- Make Specify's RFC lifecycle the single source of truth for persistent changes: Draft, review, approval, implementation, and completion tracking.
- Make the Designify entrypoint explain how requests map to Specify, including when read-only investigation or a disposable spike does not need an implementation RFC.
- Keep TDD, SDD, debugging, and review as optional focused techniques selected to execute or verify approved work, not as a parallel lifecycle or planning authority.
- Remove redundant inherited process stages, status tracking, and approval gates where they duplicate or conflict with Specify.
- Keep the one-plugin, one-public-skill layout and preserve useful technical guidance and existing user-facing capabilities.

## Non-goals

- Rewriting Specify's CLI, RFC schema, status model, or managed index files.
- Replacing Specify with another specification or planning system.
- Removing useful Superpowers-derived techniques solely because of their origin.
- Changing plugin packaging, supported harnesses, or product implementation behavior.
- Bulk rewriting all workflow references without tying each change to the Specify-native lifecycle.

## Design

Update the public router and the workflow references that define request intake, design approval, planning, and implementation handoff. Keep `.spec/ROADMAP.md`, `.spec/TASK_TRACKING.md`, and `.spec/rfc/` under Specify CLI ownership. The RFC remains the only durable design and implementation plan; `.designify/` contains execution evidence only. Preserve specialized workflow references where they solve a distinct execution or verification problem, and route to them only when relevant to an approved RFC or explicit diagnostic/review request.

### Implementation Plan

### Task 1: Define Specify-native entry and lifecycle

Update `designify/skills/designify/SKILL.md` to route persistent work through Specify lifecycle and describe direct handling of read-only questions, diagnostics, and disposable feasibility probes. Remove any implication that Designify's inherited stages are mandatory or that separate plans/checklists own implementation scope. Keep workflow selection focused on execution methods and requested specialist tasks.

### Task 2: Align design intake and RFC handoff

Update `designify/skills/designify/workflows/brainstorming/workflow.md` and `designify/skills/designify/workflows/writing-plans/workflow.md`. Make the RFC the point where durable design and implementation tasks are recorded; use Specify commands for lifecycle operations; ensure feature-scope approval does not substitute for RFC approval. Remove duplicated process stages and gates that do not serve this handoff.

### Task 3: Align implementation and verification handoffs

Review `designify/skills/designify/workflows/executing-plans/workflow.md`, `designify/skills/designify/workflows/test-driven-development/workflow.md`, and `designify/skills/designify/workflows/subagent-driven-development/workflow.md`. Ensure each consumes the approved RFC without generating another plan or competing status record. Keep their execution evidence under `.designify/` and report completion through Specify-managed status only when the relevant lifecycle action is authorized.

### Task 4: Update workflow contract checks

Update focused tests under `tests/designify/` and any directly affected harness tests to assert Specify ownership, RFC approval gating, and absence of parallel planning/status authority. Adjust migration-era tests only where they encode the superseded process, retaining tests for compatibility behavior still supported.

## Acceptance

- Designify's public entrypoint identifies Specify as the lifecycle authority for persistent changes.
- One approved RFC contains the durable design and ordered implementation plan; no competing plan or status ledger is required.
- Execution references consume the approved RFC and preserve optional TDD/SDD, debugging, and review techniques without introducing another approval lifecycle.
- Read-only investigation and disposable feasibility work have clear boundaries and do not silently become persistent implementation.
- Focused workflow tests pass, including harness tests changed by this RFC.
- Specify `validate` and `sync-check` pass for the active RFC set.
