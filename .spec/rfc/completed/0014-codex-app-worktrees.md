# RFC 0014: Adapt worktree skills to the Codex App sandbox

**Status:** Implemented

## Summary

`using-git-worktrees` and `finishing-a-development-branch` detect a Codex App linked worktree and act on that sandbox instead of creating a second worktree or cleaning one the app owns.

## Problem

The Codex App already runs the session inside a linked worktree. The skills compared paths as if the session were a normal clone, then tried to add or delete worktrees the sandbox does not allow.

## Goals

- Step 0 of using-git-worktrees treats `git-dir` different from `git-common-dir` as an existing linked worktree.
- Finishing does not remove a worktree the Codex App created.
- Claude Code and a normal clone keep their current worktree behavior.

## Non-goals

- Preferring a harness-native worktree tool over `git worktree`. That is [0015](0015-worktree-detect-and-defer.md).
- Changing where Designify stores its own session files.

## Design

Detection is the `git rev-parse` comparison of git-dir and git-common-dir. When they differ, the session is already the worktree. The skill skips creation. Finishing skips cleanup of that linked directory. Tests cover the linked case and the normal-clone case with the same comparison.

## Acceptance

A linked worktree is reported as linked. A normal clone is reported as normal. The finishing skill does not delete the Codex App worktree. Existing non-Codex worktree steps still run in a normal clone.
