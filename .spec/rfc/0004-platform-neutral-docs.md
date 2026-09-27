# RFC 0004: Make skill prose and docs platform-neutral (Umbrella)

**Status:** Draft

**Type:** Umbrella

## Summary

Skill text, instruction-file names, and the README were written for Claude Code first. This umbrella only indexes the three phases that remove that assumption. Each phase is one child.

## Problem

Designify runs on more than one harness. A skill that says "Claude" in a generic sentence, names only `CLAUDE.md`, or lists Claude Code before every other harness teaches the agent the wrong file and the wrong product.

## Goals

- [0005](0005-platform-neutral-prose.md), [0006](0006-platform-neutral-config-refs.md), and [0007](0007-platform-neutral-readme-order.md) are Approved or Implemented.
- Close this umbrella when those three meet their own acceptance. Do not reopen it for a later phase.

## Non-goals

- A new harness integration.
- Behavior changes, new sections, or a fourth wording pass.
- Reordering the skill-priority list inside the bootstrap skill. That belongs only if a child says so, and [0006](0006-platform-neutral-config-refs.md) keeps it out.

## Children

| RFC | Concern |
|-----|---------|
| [0005](0005-platform-neutral-prose.md) | Neutralize generic Claude prose |
| [0006](0006-platform-neutral-config-refs.md) | Neutralize instruction-file references |
| [0007](0007-platform-neutral-readme-order.md) | Order README harness sections neutrally |

## Acceptance

The umbrella is done when every child is Approved or Implemented and `specify` sync-check still links each child to this file. New platform-wording work opens a new RFC.
