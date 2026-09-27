# RFC 0007: Order README harness sections neutrally (child of 0004)

**Status:** Draft

**Parent:** [0004](0004-platform-neutral-docs.md)

## Summary

After phases A and B, put README harness sections in an order that does not present Claude Code as the default product. No prose rewrite in this phase.

## Problem

[0005](0005-platform-neutral-prose.md) and [0006](0006-platform-neutral-config-refs.md) fix wording and filenames. The README can still list Claude Code first in a way that reads as the only supported harness.

## Goals

- README harness sections follow a neutral order.
- Prose from phases A and B stays put.

## Non-goals

- Wording changes.
- New harness install docs.
- Skill body edits.

## Design

Reorder existing README harness sections only. Do not edit sentences while moving blocks.

## Acceptance

The README harness order no longer leads with Claude Code as the implied default. A diff of this phase is a move of sections, not a prose edit.
