# RFC 0015: Defer to native worktrees and fall back to git

**Status:** Implemented

## Summary

Worktree skills use the harness worktree tool when it exists, and `git worktree` under the project when it does not. New manual worktrees go in `.worktrees/` at the project root. Finishing cleans `.worktrees/` and `worktrees/` only.

## Problem

The skills always ran `git worktree add`, including on harnesses that already have a worktree tool. They also treated a home-directory worktree path as something this repo owns.

## Goals

- On a harness with a native worktree tool, the skill uses that tool first.
- Without one, the skill creates a worktree at `.worktrees/` in the project.
- Finishing removes project-local `.worktrees/` or `worktrees/` directories it created.
- Three known finishing bugs from the rototill notes are fixed in the same skill pass.

## Non-goals

- Keeping or reading the old home-directory worktree store.
- A compatibility mode that still creates worktrees on that home path.
- Codex App sandbox detection. That is [0014](0014-codex-app-worktrees.md).

## Design

`designify/skills/designify/workflows/using-git-worktrees/workflow.md` gains a step that prefers the native tool, then falls back to `git worktree add` under `.worktrees/`. `finishing-a-development-branch` owns cleanup only for `.worktrees/` or `worktrees/` inside the project. The old global directory is not named as a path the skill manages.

## Acceptance

The using-git-worktrees workflow says new manual worktrees default to `.worktrees/` at the project root. The finishing workflow says cleanup ownership is `.worktrees/` or `worktrees/`. Neither workflow names a home-directory worktree path. A Claude Code session with the native tool uses that tool instead of `git worktree add`.
