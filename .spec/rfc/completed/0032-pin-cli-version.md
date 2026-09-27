# RFC 0032: Align pinned CLI documentation version

**Status:** Implemented

## Summary

Update active brainstorm CLI documentation to pin the Qingniao-bumped CLI version, keeping published install examples aligned with package and plugin manifests.

## Problem

Qingniao bumped `@borg0ai/brainstorm-server` and the Designify plugin to `6.5.0`. Active docs still pin CLI invocations to `6.4.2`, causing the repository test that checks CLI/package/plugin version consistency to fail.

## Goals

- Align current CLI invocation examples with package and plugin version `6.5.0`.
- Keep historical release/version records unchanged.

## Non-goals

- Do not edit package or plugin version fields.
- Do not run another version bump or publish.

## Design

### Task 1: Update active CLI examples

Replace stale `@borg0ai/brainstorm-server@6.4.2` pins with `@borg0ai/brainstorm-server@6.5.0` in the active visual companion workflow and CLI package README.

### Task 2: Verify consistency

Run the root `pnpm test` command and confirm the documentation/package/plugin version assertion passes.

## Acceptance

- Active install/start/stop examples pin `6.5.0`.
- Root tests pass.
- No package version field changes or npm publication occur.
