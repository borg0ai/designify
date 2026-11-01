# RFC 0034: Document project-scoped Codex plugin installation

**Status:** Draft

## Summary

Document the repository's nested `designify/` folder as the installable plugin and show the explicit `npx plugins` command for installing it into the current repository's Codex project scope.

## Problem

The README currently shows `npx plugins add ./designify` without target or scope. The CLI defaults to user scope, so readers following the repository's installation instructions can install globally instead of adding the plugin to this repository. It also does not distinguish plugin installation through `npx plugins` from standalone skill installation through `npx skills`.

## Goals

- Make `designify/` unambiguously the plugin root.
- Show Codex project-scope installation with explicit flags.
- Keep discovery documented as non-mutating verification.
- Explain that `npx skills` does not install this plugin bundle.

## Non-goals

- Changing plugin contents, manifest, or supported targets.
- Running installation or discovery commands as part of this documentation-only change.
- Changing user-level or local-scope installation guidance.

## Design

Update root `README.md` only. In “Discover and install,” retain `npx plugins discover ./designify` and replace the ambiguous add command with `npx plugins add ./designify --target codex --scope project --yes`. State that `npx plugins` installs the plugin and its components, while `npx skills` installs skills rather than this plugin package. Preserve the existing plugin layout and Specify guidance.

## Acceptance

- README identifies `designify/` as plugin root and `.plugin/plugin.json` as its manifest.
- Install command explicitly names `codex`, `project`, and `--yes`.
- Discovery command remains available as non-mutating verification.
- No package contents or manifests change.
- `git diff --check` passes.
