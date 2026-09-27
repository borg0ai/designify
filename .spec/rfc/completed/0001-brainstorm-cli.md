# RFC 0001: Brainstorm server CLI daemon

**Status:** Implemented

## Summary

The visual companion is a long-running HTTP and WebSocket process. Replace the old shell launcher with one Node CLI daemon, `brainstorm`. `start` binds a loopback port, prints a ready JSON line, and keeps serving that screen after the parent exits. `stop` signals only the process whose command line contains this run's `--server-id=`. Pid ownership checks against an unrelated live process do not send a signal.

## Problem

Today the companion lives in `designify/skills/designify/workflows/brainstorming/scripts/server.cjs`, launched by `start-server.mjs` and killed by `stop-server.mjs`. A session needs a detached process, `server.pid`, `server-instance-id`, `.last-port`, `.last-token`, an idle timer, and a Windows or Codex foreground special case. The agent IPC is files: `screen_dir` for HTML, `state/events` for clicks, `state/server-info` when stdout was lost. That machinery exists so the server can outlive one tool call.

The repo also has `packages/brainstorm-server/` (`@borg0ai/brainstorm-server`). Its tests live in `tests/` and still call `skills/brainstorming/scripts/start-server.sh` and `stop-server.sh`, which are gone. That package is excluded from `pnpm test` so it does not fail the Vitest run.

The user asked to rethink this server as a CLI daemon. The package and the command are both named brainstorm.

## Goals

- One CLI starts a daemon and another command stops it. The daemon serves one screen until `stop`.
- Agents invoke the built CLI with `node` on `packages/brainstorm-server/dist/brainstorm.js`. Source is TypeScript. Vite builds that file. No runtime dependency.
- The browser still renders the HTML given to `--screen`. Text questions stay in the harness chat.
- Loopback bind and a per-process URL key stay. A request without the key does not count.
- `stop` does not signal a pid whose command line lacks this run's `--server-id=`.
- New tests live in `packages/brainstorm-server/tests/` and run under `pnpm test`. The stale bash suite in that directory is removed.

## Non-goals

- A terminal `ask` subcommand. Non-visual choices already belong in chat.
- A long-lived `serve` mode that watches a directory for later screens. Several screens are several `show` invocations.
- Non-loopback bind, SSH tunnels, and `BRAINSTORM_OPEN_CMD`.
- Renaming the brainstorming workflow, the skill id `designify`, or historical `docs/superpowers/**` paths.
- The skill id stays `designify` in `.plugin/plugin.json`. `@borg0ai/designify` is reserved for future apps and CLIs. This server CLI is the public package `@borg0ai/brainstorm-server`. The plugin directory is not that npm package.
- Rewriting `frame-template.html` or `helper.js` beyond what `show` needs to emit one choice and exit.

## Design

Two shapes were considered.

A directory-watching daemon with a thinner CLI wrapper keeps `start` and `stop`. It preserves multi-screen sessions and the events file. It also preserves the pid, token, idle, and platform-foreground code that this RFC is trying to delete.

A blocking one-shot `show` was considered. The process would exit on the first choice, so there would be no pid file and no stop command. The user asked for a CLI daemon instead, so the process outlives the `start` invocation.

`start` without `--foreground` spawns a detached child and exits after that child writes `server.json`. The child argv contains `--server-id=<id>`. `stop` reads `server.json` and sends SIGTERM only when `ps` shows that same id. State lives in `--state-dir`, or `.designify/brainstorm/` under the current working directory. The URL key stays in that file, mode `0600`. Choices append to `events` in the state directory. The process does not exit on a choice.

### Command

File: `packages/brainstorm-server/dist/brainstorm.js` (Vite build of `src/brainstorm.ts`)

```text
node dist/brainstorm.js start --screen <html-file> [--state-dir <dir>] [--host <bind>] [--foreground]
node dist/brainstorm.js stop [--state-dir <dir>]
```

Constants:

- Commands `start` and `stop`.
- Default bind host `127.0.0.1`. URL host `localhost` when bind is loopback.
- Default is detached. `--foreground` keeps the server in the current process.
- Exit `0` on ready or stopped, `2` on usage errors, `3` when stop finds nothing it is allowed to signal, `4` if the daemon does not become ready.

Stdout is one JSON line:

- start: `{"type":"ready","url":"http://localhost:<port>/?key=<token>","port":<port>,"pid":<pid>,"serverId":"<id>"}`
- stop: `{"type":"stopped","pid":<pid>}` or `{"type":"not_running"}`
- usage: `{"type":"error","message":"..."}`

The token is 32 random bytes, hex, held in memory and in `server.json` for that process. It is not a `.last-token` file. The URL query `key` is required for HTTP and WebSocket. `--host` other than `127.0.0.1` or `localhost` is a usage error. `--screen` must be a regular file and is served as the document body.

No `--project-dir` and no `/tmp/designify-brainstorm-` session. Daemon state is `--state-dir` or `.designify/brainstorm/`.

### Server module

`packages/brainstorm-server/src/server.ts` is the HTTP and WebSocket implementation, still zero runtime dependencies. `startServer` serves one HTML string on a loopback port and resolves `choice` on the first non-empty `choice` event. `onChoice` runs for every such event so the daemon can append `events` without exiting. The old directory watch, idle timer, and `BRAINSTORM_*` env contract are not used.

`start-server.mjs`, `stop-server.mjs`, and `launch-args.mjs` are deleted once `visual-companion.md` and the tests no longer reference them.

`@borg0ai/brainstorm-server` is a public package (`publishConfig.access` is `public`) with a `bin` named `brainstorm` pointing at `dist/brainstorm.js`. Vite SSR-builds that file from TypeScript. No runtime dependency. Published files are `dist/` only. The designify skill in this repo invokes that bin.

### Docs

`workflows/brainstorming/visual-companion.md` replaces the `start-server.mjs` session instructions with the `brainstorm` CLI. The terminal-versus-browser rule stays. `workflows/brainstorming/workflow.md` is updated only where it tells the agent to launch or stop the daemon.

**Correction (RFC 0029).** This section originally specified `node scripts/brainstorm.mjs show --screen <file> --open`. No `show` subcommand and no `--open` flag were ever built. The shipped contract is `brainstorm start --screen <file>` and `brainstorm stop`, invoked as `npx -y @borg0ai/brainstorm-server@<version>` so the command resolves in an installed plugin rather than only in this repository. RFC 0029 owns that invocation choice; this RFC owns the `start`/`stop` daemon contract, the `--server-id` ownership rule, and the deletion of the legacy launcher.

### Implementation Plan

### Task 1: One-screen server API

Files: `packages/brainstorm-server/src/server.ts`, `packages/brainstorm-server/tests/brainstorm-server.test.ts`.

Export a function that serves one HTML string on `127.0.0.1` with a required key and resolves when a WebSocket text frame contains JSON with a non-empty `choice`. Unauthorized HTTP and WebSocket do not resolve that promise.

Test first. Drive it with Node `http` and a raw WebSocket client. Do not add the `ws` package. Expected RED: the export does not exist. GREEN: the test receives the choice and the process can close the server. Run `pnpm test`.

### Task 2: `brainstorm` daemon CLI

Files: `packages/brainstorm-server/src/brainstorm.ts`, `packages/brainstorm-server/src/cli-args.ts`, `packages/brainstorm-server/src/daemon.ts`, `packages/brainstorm-server/vite.config.ts`, `packages/brainstorm-server/tests/brainstorm-cli.test.ts`.

`start` detaches by default, prints the ready line, and leaves the child listening. `stop` signals only a command line that contains `--server-id=`. Missing `--screen` exits `2`.

Test first by spawning the CLI. Assert the parent exits `0`, `GET` of the ready URL returns the screen, and `stop` exits `0` with the child gone. A second test points `server.json` at a live `sleep` pid and asserts `stop` exits `3` without signaling it. Run `pnpm test`.

### Task 3: Point the workflow at the CLI

Files: `designify/skills/designify/workflows/brainstorming/visual-companion.md`, and the daemon launch or stop sentences in `designify/skills/designify/workflows/brainstorming/workflow.md`.

Document `node scripts/brainstorm.mjs show --screen <file> --open`. Remove `start-server.mjs`, `stop-server.mjs`, `screen_dir`, `state_dir`, and the platform foreground notes. Keep the rule that text questions do not use the browser.

Verify by reading those two files and confirming they do not mention `start-server` or `stop-server`.

### Task 4: Delete the daemon scripts and the stale suite

Files to delete from the plugin scripts: `start-server.mjs`, `stop-server.mjs`, `launch-args.mjs`. Delete the stale files under `packages/brainstorm-server/tests/` that still call those scripts (`start-server.test.sh`, `stop-server.test.sh`, `windows-lifecycle.test.sh`, and the node tests that load `skills/brainstorming/scripts`).

Update `tests/designify/shell-to-mjs.test.mjs` so it no longer requires `SESSION_PARENT`, `TMP_PREFIX`, or `launch-args.mjs`. Assert instead that `packages/brainstorm-server/dist/brainstorm.js` exists and that `designify/` contains no `start-server` or `stop-server` script.

`pnpm-workspace.yaml` already includes `packages/*`. Root `package.json` script `test` goes back to `turbo run test` with no `--filter`, so `@borg0ai/brainstorm-server` runs with `@borg0ai/tests`.

Run `pnpm install` and `pnpm test`. Expected: the new brainstorm tests pass, and no script under `designify/` references `start-server` or `stop-server`.

## Acceptance

- `node dist/brainstorm.js start --screen <file>` exits `0`, prints a `ready` line, and leaves a live loopback server. `stop` then exits `0` and the pid is gone.
- `stop` against a pid whose command line lacks `--server-id=` exits `3` and does not signal that pid.
- A request without `key` does not receive the screen.
- `designify/` has no `start-server` or `stop-server` file and no third-party dependency.
- `pnpm test` runs the new tests and passes.
- `visual-companion.md` tells the agent to run `brainstorm.mjs show` and still sends non-visual questions to the terminal.
