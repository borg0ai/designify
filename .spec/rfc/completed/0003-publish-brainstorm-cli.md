# RFC 0003: Prepare @borg0ai/brainstorm-server for npm publication

**Status:** Implemented

## Summary

Add Qingniao and Changesets as root development dependencies and expose Qingniao through a root `release` script. Initialize Changesets once only when `.changeset` is absent. This task prepares release tooling only; it does not publish.

## Problem

The repository has no root `release` command. Qingniao's documented release workflow uses Changesets when configured. The user requested installation of both tools and conditional initialization, while explicitly excluding publication and dev server startup.

## Goals

- Add `@systembug/qingniao` and `@changesets/cli` to the root `devDependencies` using pnpm.
- Add root script `"release": "qingniao"`.
- If `.changeset/` does not exist, run `npx qingniao changeset-init` exactly once.
- Stop after release-tool setup; do not publish or start a dev server.

## Non-goals

- Do not publish any npm package.
- Do not start a dev server.
- Do not change CLI behavior or add scripts beyond the requested `release` command.
- Do not commit, tag, push, or alter unrelated staged/unstaged changes.

## Design

Use Specify for this RFC. Keep any additional Designify planning or execution notes under `.designify/`. Existing user changes are present across the repository; preserve them.

### Task 1: Install release tooling and expose the release command

- Use pnpm to add `@systembug/qingniao` and `@changesets/cli` to root `devDependencies`.
- Add `"release": "qingniao"` to root `package.json` scripts.
- Preserve existing scripts and dependencies; do not modify package-level release metadata.

### Task 2: Initialize Changesets only when absent

- Check whether `.changeset/` exists.
- If absent, run `npx qingniao changeset-init` once. If present, do not run initialization.
- Do not publish, bump versions, commit, tag, push, or start a dev server.

## Acceptance

- Root `devDependencies` include `@systembug/qingniao` and `@changesets/cli`.
- Root `package.json` contains `"release": "qingniao"` and retains its existing scripts.
- `.changeset/` is initialized once via `npx qingniao changeset-init` only when it was absent.
- No npm publication or dev server startup occurs.
- RFC remains under `.spec/rfc/`; other Designify work notes, if any, remain under `.designify/`.
