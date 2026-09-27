# RFC 0026: Diagnose a failed agent session from the transcript

**Status:** Implemented

## Summary

A workflow the user invokes when a Designify session went wrong. It pins down the failure from the transcript and writes a report. Version one is prose. It does not ship a diagnostic script.

## Problem

When a session mis-follows a skill, the user has a transcript and no procedure. Ad-hoc debugging mixes secrets into notes and does not separate cost, plan drift, and repeated work.

## Goals

- The user can point at a session and get a written diagnosis.
- The workflow uses subagents for the heavy reads and keeps the coordinator on the question the user asked.
- Notes and the report live under `~/.designify/diagnosing/<session-id>/`.
- Secrets are redacted before a note is stored.

## Non-goals

- A shipped script or a database of sessions in version one.
- Automatic filing of an upstream issue.
- Changing the skill that failed. The output is a diagnosis, not the fix.

## Design

The workflow is `designify/skills/designify/workflows/diagnosing-agent-behavior/workflow.md`. Prompts cover cost and time, plan adherence, quality evidence, repeated work, request conflicts, and a scrub pass. References cover where transcripts live, what must be redacted, and how far an issue template may go. Templates are the case file and the report. The model does the reading. A later RFC can add deterministic tools if this prose version is not enough.

## Acceptance

Given a session id, the workflow tells the agent to write the report under `~/.designify/diagnosing/<session-id>/report.md`. The scrub prompt runs before the report is shown. The workflow does not require a new executable.
