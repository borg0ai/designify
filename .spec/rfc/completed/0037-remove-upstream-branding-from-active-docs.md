# RFC 0037: Remove upstream branding from active Designify docs

**Status:** Implemented

## Summary

Remove the former upstream project's branding from active Designify documentation and move this checkout from `skills/as-designify` to `skills/designify`. Designify is the product identity; Specify RFCs remain the sole design and implementation source of truth.

## Problem

The repository and installable plugin already identify as Designify, but active contributor and testing documents still describe the upstream project as the source or origin. RFC 0036 is Approved and intentionally retains those provenance notes, so this request needs a separate RFC instead of silently changing RFC 0036's approved scope. The local checkout directory also still carries the `as-` prefix.

## Goals

- Remove former-upstream branding and attribution from active project documents and agent-facing guidance.
- Keep Specify's RFC lifecycle as the only design and implementation plan; do not introduce a parallel plan document.
- Rename the local checkout directory to `/Volumes/ORICO/ws/prj/skills/designify` without changing Git remote or repository contents.
- Keep the existing regression check for forbidden branding without storing the forbidden word literally in its test title or assertion.

## Non-goals

- Do not rewrite archived RFCs, ReasonGraph decision history, generated Birdify artifacts, or legal copyright and license notices.
- Do not change product/package identifiers, Git remote, plugin contents, visual assets, or release configuration.
- Do not alter RFC 0036 or its status/history.

## Design

### Task 1: Remove upstream branding from active docs

Update `AGENTS.md`, `README.md`, `docs/porting-to-a-new-harness.md`, and `docs/testing.md` to describe Designify without upstream identity or attribution. Preserve their useful setup, contribution, and evaluation guidance. Keep Specify as the sole source of truth for persistent work, with code changes gated by an Approved RFC. Update `tests/designify/specify-routing.test.mjs` so it continues rejecting the retired name while assembling its match string from pieces and using a neutral test title.

### Task 2: Rename the local checkout

After Task 1 and validation, move the current checkout directory from `skills/as-designify` to the available sibling path `skills/designify`. Keep the worktree, branch, remote, and file contents intact. No commit, push, or PR is part of this RFC.

## Acceptance

- The active document paths and project test source contain no former-upstream branding; archived records, generated maps, and license notices remain unchanged.
- The routing regression check still rejects that branding; its source contains neither the full spelling in the title nor in the assertion.
- `node <specify-skill>/scripts/specify.mjs validate .spec/rfc/0037-remove-upstream-branding-from-active-docs.md` and `sync-check` pass.
- `pnpm test` and `git diff --check` pass.
- After the move, `git -C /Volumes/ORICO/ws/prj/skills/designify rev-parse --show-toplevel` succeeds and `git -C /Volumes/ORICO/ws/prj/skills/designify remote get-url origin` still returns `git@github.com:borg0ai/designify.git`.
