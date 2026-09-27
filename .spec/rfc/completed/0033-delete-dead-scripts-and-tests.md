# RFC 0033: Delete scripts and tests targeting removed implementations

**Status:** Implemented

## Summary

The superpowers-to-designify migration deleted the per-harness plugin trees (`.codex-plugin/`, `.devin-plugin/`, `.hermes-plugin/`, `.kimi-plugin/`, `.pi/extensions/`), the top-level `skills/` tree, and `.version-bump.json`. Thirteen test files and three shell scripts still target those removed paths. None of them run — the only runner is vitest over `tests/designify/**`, and the repository has no CI workflow — so they have been rotting silently. Delete them.

## Problem

`scripts/bump-version.sh` reads `.version-bump.json` as its first action and exits `1` when the file is absent. The file was deleted in the migration, so the script cannot run at all. It is a trap for anyone who tries to cut a release.

`scripts/sync-to-codex-plugin.sh` hard-requires `$UPSTREAM/.codex-plugin/plugin.json` and exits non-zero when it is missing. `scripts/package-codex-plugin.sh` builds a rootless archive containing `.codex-plugin/`, `assets/`, and `skills/`. Both target a layout this repository no longer has.

On the test side, thirteen files reference deleted paths:

| Path | Targets | Status |
| --- | --- | --- |
| `tests/version-bump/test-bump-version.sh` | `scripts/bump-version.sh` | dead |
| `tests/codex/test-marketplace-manifest.sh` | `.codex-plugin/plugin.json` | dead |
| `tests/codex/test-package-codex-plugin.sh` | `scripts/package-codex-plugin.sh` | dead |
| `tests/codex-plugin-sync/test-sync-to-codex-plugin.sh` | `scripts/sync-to-codex-plugin.sh` | dead |
| `tests/devin/test-devin-plugin.sh` | `.devin-plugin/plugin.json` | dead |
| `tests/pi/test-pi-extension.mjs` | `.pi/extensions/superpowers.ts` | dead |
| `tests/kimi/test-plugin-manifest.sh` | `.kimi-plugin/plugin.json` | dead |
| `tests/kimi/run-tests.sh` | only calls `test-plugin-manifest.sh` | dead |
| `tests/hermes/test_bootstrap.py` | inserts `.hermes-plugin/` on `sys.path`, imports `__init__` | dead |
| `tests/hermes/test_plugin.py` | `.hermes-plugin/../skills` sibling layout | dead |
| `tests/hermes/conftest.py` | fixtures for the two tests above | dead |
| `tests/hermes/__init__.py` | empty helper for the two tests above | dead |
| `tests/systematic-debugging/test-find-polluter.sh` | `skills/systematic-debugging/find-polluter.sh` | dead |

`tests/systematic-debugging/` is the one deletion with live coverage behind it: `find-polluter` still exists as `find-polluter.mjs` and is already covered by `tests/designify/shell-to-mjs.test.mjs`.

## Goals

- No script or test in the repository targets a path that the migration removed.
- `scripts/` and `tests/` describe the repository as it is now.
- `pnpm test` still passes.

## Non-goals

- Do not delete or repoint `tests/claude-code/`, `tests/opencode/`, `tests/hooks/`, `tests/writing-skills/`, `tests/diagnosing-superpowers/`, or `tests/antigravity/`. Their subjects still exist under `designify/`; they need their paths updated, which is separate work with a real decision about whether to keep them.
- Do not delete `tests/explicit-skill-requests/`. Those are LLM-driven eval material, not unit tests.
- Do not restore `.version-bump.json` or revive the Codex, Devin, Kimi, Pi, or Hermes plugin trees. `npx plugins` translates one vendor-neutral manifest; per-host trees are not how this repository ships.
- Do not add a generic "every test target resolves" guard. The heuristic produces false positives on fixture paths such as `skills/example/SKILL.md` and `docs/alpha/plan.md`, which tests create themselves.

## Design

Six directories and three scripts go. `tests/kimi/` goes entirely rather than leaving `run-tests.sh` as a wrapper whose only callee is deleted. `tests/hermes/` goes entirely for the same reason: its two test modules and both of its support files exist only to serve each other.

What remains under `tests/`: `designify/` (the only suite a runner executes), `claude-code/`, `opencode/`, `hooks/`, `writing-skills/`, `diagnosing-superpowers/`, `antigravity/`, `explicit-skill-requests/`, and `shell-lint/`. `scripts/` keeps `lint-shell.sh`, whose subject is live and whose test is `tests/shell-lint/test-lint-shell.sh`.

### Task 1: Delete the three scripts

`scripts/bump-version.sh`, `scripts/package-codex-plugin.sh`, `scripts/sync-to-codex-plugin.sh`.

### Task 2: Delete the dead tests

Delete `tests/version-bump/`, `tests/codex/`, `tests/codex-plugin-sync/`, `tests/devin/`, `tests/pi/`, `tests/kimi/`, `tests/hermes/`, `tests/systematic-debugging/` — thirteen files in eight directories.

### Task 3: Verify

`pnpm test` passes. `grep -rn` for `.codex-plugin`, `.devin-plugin`, `.hermes-plugin`, `.kimi-plugin`, `.pi/extensions`, `.version-bump.json`, and `skills/find-polluter.sh` across `scripts/` and `tests/` returns nothing outside this RFC.

## Acceptance

- `scripts/` contains only `lint-shell.sh`.
- None of `tests/version-bump`, `tests/codex`, `tests/codex-plugin-sync`, `tests/devin`, `tests/pi`, `tests/kimi`, `tests/hermes`, `tests/systematic-debugging` exists.
- `pnpm test` passes.
- `tests/designify/shell-to-mjs.test.mjs` still covers `find-polluter`, so the deleted shell test loses no coverage.
