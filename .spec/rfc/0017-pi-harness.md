# RFC 0017: Add Pi package support and a Pi eval backend

**Status:** Draft

## Summary

Ship Designify as a Pi package and add Pi as a backend in the eval harness from [0016](0016-evals-harness.md).

## Problem

Pi can load extensions, but Designify has no Pi package entry and the eval harness has no Pi backend, so Pi sessions never auto-load the bootstrap and never get graded.

## Goals

- A Pi extension loads the bootstrap at session start.
- The eval harness can drive a Pi session with the same scenario shape as the other backends.
- Tool names in the Pi mapping match what the skills ask the agent to do.

## Non-goals

- Inventing a subagent tool Pi does not ship. The mapping says to use an installed tool or to run the step in the current session.
- The drill import itself. That is [0016](0016-evals-harness.md).

## Design

Add the Pi extension under the repo's Pi package path and document it in `designify/skills/designify/workflows/harness-mappings/references/pi-tools.md`. The eval backend config names the Pi command and the env it needs. The acceptance transcript is a clean session whose first build request triggers brainstorming before code.

## Acceptance

A clean Pi session loads the bootstrap. An eval scenario selects the Pi backend and starts a session. The Pi tool map does not tell the agent to call a tool Pi does not have.
