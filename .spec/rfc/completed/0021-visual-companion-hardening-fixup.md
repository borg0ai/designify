# RFC 0021: Finish visual companion hardening fixups

**Status:** Implemented

## Summary

Close the remaining hardening gaps after [0020](0020-visual-companion-auth.md): stop must kill only the server whose instance id matches, tests must be deterministic, and the branch diff must match the security behavior.

## Problem

The auth pass left stop behavior that can signal a reused pid, tests that depend on host state, and a few security edges (null payloads, idle shutdown, visible server death) without a single reviewable result.

## Goals

- `stop` signals a process only when its command line carries this server's instance id.
- An unrelated process whose command line lacks that id is left alone.
- Idle timeout is configurable. Shutdown closes sockets.
- Tests start from a temp session directory and do not depend on a developer's home directory.

## Non-goals

- New companion features from the deferred rows in [0019](0019-visual-companion-issue-catalog.md).
- Replacing the server with the CLI in [0001](0001-brainstorm-cli.md). Where [0001] already specifies `--server-id` ownership, this RFC is the same rule for the workflow server until that CLI is the only launcher.

## Design

Write the instance id into the server command line and the state file. `stop` reads it and checks the live command line before signaling. Tests cover a matching server and an impostor `sleep` or `node` whose command line has no id. Fix frame bounds and null payload handling in the same pass if [0020](0020-visual-companion-auth.md) has not already landed them.

## Acceptance

The impostor test exits without a signal. The matching server test ends that pid. A review of the diff finds no route that serves HTML or accepts a choice without the key.
