# RFC 0006: Neutralize instruction-file references (child of 0004)

**Status:** Draft

**Parent:** [0004](0004-platform-neutral-docs.md)

## Summary

When a skill tells the agent to read the project instruction file, name the files harnesses actually load, not only `CLAUDE.md`. This is phase B.

## Problem

Each harness reads its own instruction file. A skill that mentions only `CLAUDE.md` sends Codex, Gemini, and other agents to a file they do not load.

## Goals

- Skill text that means "the project instruction file" lists the instruction files in use, including `CLAUDE.md`, `GEMINI.md`, and `AGENTS.md` where that set is the real one.
- The substitution is a name change, not a new policy.

## Non-goals

- Reordering the priority list in the bootstrap skill. Order is not a substitution.
- Renaming or rewriting `examples/CLAUDE_MD_TESTING.md`.
- Generic "Claude" prose. That is [0005](0005-platform-neutral-prose.md).
- README order. That is [0007](0007-platform-neutral-readme-order.md).

## Design

Find references whose category is the instruction file. Where the sentence treats `CLAUDE.md` as the only file, name the set of instruction files. Do not change which file wins when several exist.

## Acceptance

Skills that refer to the project instruction file name more than `CLAUDE.md` when more than one harness file exists. The bootstrap priority order is unchanged. `examples/CLAUDE_MD_TESTING.md` is unchanged.
