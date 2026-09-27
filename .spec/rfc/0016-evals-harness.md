# RFC 0016: Move the drill benchmark into evals

**Status:** Draft

## Summary

The skill-compliance benchmark that lived in the separate drill repo becomes `evals/` in this repo. Bash tests under `tests/` are deleted only after a drill scenario covers that test.

## Problem

Drill already runs the superpowers scenarios, but it sits in another repository. Bash tests and drill scenarios duplicate coverage, and contributors do not know which harness is canonical.

## Goals

- `evals/` holds the drill source, scenarios, fixtures, prompts, backend configs, and tests.
- A bash test is removed only when its scenario coverage is verified, not by directory.
- Codex backend config does not require `SUPERPOWERS_ROOT` once that variable is no longer part of the backend contract.

## Non-goals

- CI for the full sweep. Running evals stays manual until a later RFC chooses a budget and a schedule.
- Moving scenarios next to each skill. They stay in `evals/scenarios/`.

## Design

Import the drill tree as `evals/`. Point backend configs at this repo. Delete a `tests/` script only in the same change that names the scenario which replaced it. `.gitignore` may keep a local evals checkout out of the plugin publish set. The README says how to clone or run the harness.

## Acceptance

`evals/` is the documented harness. A deleted bash test has a scenario path cited in the change. Remaining bash tests still run. No workflow requires a GitHub Action for this RFC.
