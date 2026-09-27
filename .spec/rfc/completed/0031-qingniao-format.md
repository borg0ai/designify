# RFC 0031: Make Qingniao post-version formatting runnable

**Status:** Implemented

## Summary

Make Qingniao's post-version `pnpm format` step executable with Prettier while limiting formatting to package and plugin version manifests.

## Problem

Qingniao updated versions to 6.5.0, then failed before publication because it always runs `pnpm format` after a version change when Git integration is enabled. The root format script calls Prettier, which is not installed, and its current glob would reformat source and documentation files across the repository.

## Goals

- Install Prettier as a root development dependency.
- Scope `format` and `format:check` to package manifests and Qingniao-discovered version manifests.
- Let Qingniao complete post-version formatting without rewriting unrelated source or documentation.

## Non-goals

- Do not change any version fields by hand.
- Do not publish, commit, tag, or push as part of this fix.
- Do not introduce repository-wide formatting policy for source or Markdown files.

## Design

### Task 1: Add formatter and scope commands

Add Prettier to root `devDependencies`. Update root `format` and `format:check` scripts to format/check existing version manifests only: root `package.json`, `packages/*/package.json`, `tests/package.json`, and `designify/.plugin/plugin.json`. Keep Qingniao `checks.format` enabled so Doctor validates the configured formatter; keep lint disabled because no lint task exists.

### Task 2: Verify Qingniao formatting path

Run `pnpm format:check`, `pnpm format`, and `pnpm exec qingniao doctor --json`. Do not rerun the version bump: Qingniao already applied version 6.5.0 before failing in its post-version formatting step.

## Acceptance

- Prettier resolves from root scripts.
- Format and format-check touch only the existing package and plugin version manifests.
- Qingniao Doctor returns result status `succeeded` with exit code 0.
- Version remains 6.5.0; no publish command runs.
