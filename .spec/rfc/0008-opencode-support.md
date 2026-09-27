# RFC 0008: Add native OpenCode plugin support

**Status:** Draft

## Summary

Support OpenCode with a native plugin that shares the Codex plugin's core, instead of copying skill files into the OpenCode config directory at install time.

## Problem

Earlier OpenCode ports copied files into the tool's config tree. That drift from the Codex plugin, and it is not how OpenCode loads plugins.

## Goals

- An OpenCode plugin loads Designify the same way a native OpenCode plugin loads.
- Shared behavior with the Codex integration lives in one place.
- Install docs tell the user to use that plugin, not `git clone` into `~/.config/opencode/superpowers`.

## Non-goals

- A new skill set that exists only for OpenCode.
- File-copy installers kept as a second supported path.

## Design

Add the OpenCode plugin beside the other harness mappings under `designify/skills/designify/workflows/harness-mappings/`. The plugin reads the same skill tree the rest of the package ships. Session start still loads the bootstrap skill. Document the install path in the OpenCode README notes under `docs/`.

## Acceptance

A clean OpenCode session loads the bootstrap without a manual copy of skill files. The Codex and OpenCode plugins share the common loader instead of forking it.
