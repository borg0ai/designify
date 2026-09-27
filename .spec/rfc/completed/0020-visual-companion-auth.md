# RFC 0020: Harden visual companion session auth

**Status:** Implemented

## Summary

The visual companion requires the per-session key from [0019](0019-visual-companion-issue-catalog.md) on HTTP and WebSocket. Reconnect keeps working for the browser that already has the key. Same-origin screen script stays allowed.

## Problem

Without a key, any client that can reach the port can read the screen and write choice events the agent will treat as the user. A Host allowlist does not stop a remote client that sends the expected Host.

## Goals

- HTTP and WebSocket without the key are rejected.
- The URL the agent gives the user includes the key.
- Reconnect uses the key the browser already stored, without weakening the check.
- Screen JavaScript from the companion origin still runs. No new runtime UI library.

## Non-goals

- Vendoring Alpine.js.
- Permanent opt-out, free-text browser input, and theme helpers.
- The final impostor-pid and test-evidence pass. That is [0021](0021-visual-companion-hardening-fixup.md).

## Design

Generate a secret per server process. Require it on the page, on `/files/*`, and on the upgrade. After the key matches, keep a browser Origin check for the confused-deputy case. The launch script prints the full URL. Document the key in `visual-companion.md` so the agent does not strip the query string.

## Acceptance

A request with the key returns the screen. A request without it is forbidden and does not record a choice. A WebSocket that omits the key is closed. A same-origin screen script can still send a choice.
