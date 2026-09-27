# RFC 0019: Record visual companion issue dispositions

**Status:** Implemented

## Summary

Open visual-companion issues and PRs are triaged here so later hardening RFCs implement decisions instead of merging those PRs. The catalog is the disposition record.

## Problem

Companion bugs arrived as many PRs against `skills/brainstorming/scripts/`. Several proposed fixes that do not match the threat model, including a Host allowlist and a vendored Alpine build.

## Goals

- Each open item has one disposition: do, already fixed, deferred, dropped, or workshop.
- The chosen auth approach is a per-session secret on the page, file routes, and the WebSocket.
- Alpine.js is not vendored.
- Terminal-versus-HTML gating and moving session state out of the working tree stay undecided here.

## Non-goals

- Implementing the "do" items. Auth work is [0020](0020-visual-companion-auth.md) and [0021](0021-visual-companion-hardening-fixup.md).
- Merging the source PRs.

## Design

Dispositions:

- Per-session key on `/`, `/files/*`, and the WebSocket. Host allowlist is dropped. A browser Origin check can stay after the key, as a confused-deputy control.
- Reject non-object WebSocket payloads. Keep the frame-length bound.
- Ignore dotfile screens such as `._*.html`.
- `stop` must not kill a reused or unrelated pid.
- WebSocket clients reconnect with backoff. Idle timeout is configurable. Shutdown closes sockets. A dead server is visible to the user and the agent.
- Permanent opt-out, free-text browser feedback, and light/dark frame helpers are deferred.
- Auto-open of the URL is a separate launch flag, not part of the key design.
- Shell-lint cleanups are opportunistic only.

## Acceptance

A later companion change can point at this RFC for why the key exists and why Alpine and the Host allowlist do not. Deferred items are absent from [0020](0020-visual-companion-auth.md) and [0021](0021-visual-companion-hardening-fixup.md).
