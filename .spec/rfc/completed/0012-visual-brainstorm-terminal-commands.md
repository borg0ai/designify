# RFC 0012: Show brainstorm screens in the browser and take commands in the terminal

**Status:** Implemented

## Summary

The visual companion stops blocking the terminal for feedback. The browser shows the screen. The user answers in the terminal. The agent reads click events as a supplement, not as the only channel.

## Problem

The first companion treated the browser as a blocking UI. The session stalled until a click arrived, and the terminal was no longer the command channel.

## Goals

- The agent writes a screen, tells the user the URL, and ends the turn.
- The user's terminal message is the primary feedback. Browser events are merged with it.
- A waiting screen is pushed when the next step does not need the browser.

## Non-goals

- Auth and reconnect hardening. That is [0020](0020-visual-companion-auth.md) and [0021](0021-visual-companion-hardening-fixup.md).
- Replacing the server with the CLI daemon. That is [0001](0001-brainstorm-cli.md).

## Design

Update `designify/skills/designify/workflows/brainstorming/visual-companion.md` so the loop is write, show, stop talking, then read events on the next turn. The server keeps serving the newest file. It does not exit when the first choice arrives.

## Acceptance

A session can show a screen and continue after a terminal reply with no click. A click still lands in the events file. The workflow no longer tells the agent to wait on the browser before the next terminal turn.
