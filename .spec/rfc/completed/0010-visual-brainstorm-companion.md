# RFC 0010: Add a browser visual companion for brainstorming

**Status:** Implemented

## Summary

Brainstorming can show mockups and choices in a browser while the conversation stays in the terminal. The agent writes HTML. The server shows the newest screen and records clicks.

## Problem

Layout and visual choices are hard to judge from prose alone. The brainstorming workflow had no way to put a screen in front of the user.

## Goals

- A local server serves one HTML screen and records click events for the agent to read on the next turn.
- The brainstorming workflow offers the companion, then tells the agent how to write a screen and how to stop.
- Text questions stay in the terminal.

## Non-goals

- The later terminal-commands refactor. That is [0012](0012-visual-brainstorm-terminal-commands.md).
- Removing third-party server dependencies. That is [0013](0013-zero-dep-brainstorm-server.md).
- The current CLI daemon in [0001](0001-brainstorm-cli.md). This RFC is the companion's first shape.

## Design

The server lives with the brainstorming workflow and watches a content directory. The agent writes a new HTML file per screen. Events append to a state file. The workflow document is the operator guide the agent reads after the user accepts the companion.

## Acceptance

Starting the server returns a URL. A click on a choice shows up in the events file. Stopping the server ends that process. The brainstorming workflow points at this server rather than telling the agent to paste mockups only in chat.
