# RFC 0005: Neutralize generic Claude prose (child of 0004)

**Status:** Draft

**Parent:** [0004](0004-platform-neutral-docs.md)

## Summary

Replace generic third-person "Claude" in skill prose with wording that does not name one harness. This is phase A only.

## Problem

Skill bodies were drafted for Claude Code. Sentences that say "Claude" where any agent is meant make other harnesses look unsupported.

## Goals

- Generic prose no longer uses "Claude" as the name of the agent.
- Headings that say CSO become SDO where that label is the only change required.
- Behavior, document structure, examples, code blocks, and YAML frontmatter stay as they are.

## Non-goals

- Instruction-file names. That is [0006](0006-platform-neutral-config-refs.md).
- README section order. That is [0007](0007-platform-neutral-readme-order.md).
- New callouts or compatibility notes.

## Design

Search skill and doc prose for "Claude" used as the agent, not as a product the user asked about. Rewrite those sentences in the third person without a harness name. Leave code samples, frontmatter, and platform-specific tool references for later phases.

## Acceptance

A search of skill prose for generic "Claude" returns no hits outside named-product and historical contexts. Diffs for this phase do not change code blocks, frontmatter, or config filenames.
