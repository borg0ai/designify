# RFC 0013: Serve the visual companion with Node built-ins only

**Status:** Implemented

## Summary

The brainstorm server uses Node's HTTP stack and a hand-rolled WebSocket frame codec. It does not vendor `ws` or any other runtime package.

## Problem

The companion server shipped a vendored `node_modules` tree so it could speak WebSocket. That tree is a dependency inside a plugin that is supposed to stay dependency-free.

## Goals

- One server file uses `node:http` and implements the WebSocket frames the companion needs.
- Client frames are masked. Payload size is bounded.
- The brainstorming workflow still launches that server.

## Non-goals

- The detachable CLI, ready JSON line, and `--server-id` stop rule. Those are [0001](0001-brainstorm-cli.md).
- A new wire protocol.

## Design

Replace the vendored WebSocket library with the built-in server under the brainstorming workflow scripts. Keep the HTTP routes the companion already uses: the screen, static files if the current server has them, and the choice event. Tests in the server package call the built-in server, not the old vendored entry.

## Acceptance

The server starts with no third-party runtime import. A browser with the session key receives the HTML. A missing key is rejected. An oversized frame is rejected.
