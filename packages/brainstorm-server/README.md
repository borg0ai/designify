# @borg0ai/brainstorm-server

A zero-dependency CLI daemon that serves one HTML screen to a browser and records the user's clicks. It backs the visual companion in the Designify agent skill.

The daemon binds a loopback port, prints one JSON line when it is ready, and keeps serving after the process that started it exits. Every request must carry the per-process URL key.

## Install

```bash
npx -y @borg0ai/brainstorm-server@6.5.0 start --screen path/to/screen.html
```

The first run resolves the package through the npm registry and caches it. Later runs start from cache.

## Usage

```text
brainstorm start --screen <html-file> [--state-dir <dir>] [--host <bind>] [--foreground]
brainstorm stop [--state-dir <dir>]
```

| Flag | Meaning |
| --- | --- |
| `--screen <file>` | HTML document to serve. Required for `start`, and must be a regular file. |
| `--state-dir <dir>` | Where `server.json`, `server.pid` and `events` live. Defaults to `.designify/brainstorm/` under the current working directory. |
| `--host <bind>` | Loopback only. `127.0.0.1` (default) or `localhost`. Anything else is a usage error. |
| `--foreground` | Serve in the current process instead of detaching. Use it when the environment reaps detached processes. |

`start` detaches by default. The child is spawned with `--server-id=<id>` in its argv.

### stdout

One JSON line per invocation.

```json
{"type":"ready","url":"http://localhost:53187/?key=6f1c…","port":53187,"pid":51234,"serverId":"9a3f…"}
{"type":"stopped","pid":51234}
{"type":"not_running"}
{"type":"error","message":"usage: brainstorm start --screen <file> …"}
```

### exit codes

| Code | Meaning |
| --- | --- |
| `0` | Ready, or stopped. |
| `2` | Usage error. |
| `3` | `stop` found nothing it was allowed to signal. |
| `4` | The daemon did not become ready. |

## The key

The URL query parameter `key` is required for both HTTP and the WebSocket upgrade. It is 32 random bytes in hex, generated per process, and compared with a constant-time comparison. A request without it gets `403`, and an unauthorized WebSocket upgrade is destroyed without resolving the choice.

Hand the user the complete `url` from the `ready` line, including `?key=`.

## Events

Each click with a non-empty `choice` appends one line to `events` in the state directory. The file is not cleared between starts.

```jsonl
{"type":"choice","choice":"single"}
{"type":"choice","choice":"split"}
```

The daemon does not exit on a choice; it serves until `stop`. The page sends the choice itself, over a WebSocket text frame containing JSON with a non-empty `choice` string. The server returns the HTML file unchanged — no CSS, no click script, no frame wrapper.

## Stop safety

`stop` reads `server.json` and sends `SIGTERM` only when `ps` shows that the recorded pid's command line still contains this run's `--server-id=`. A stale file pointing at a pid that was recycled by an unrelated process exits `3` and sends no signal.

## License

MIT
