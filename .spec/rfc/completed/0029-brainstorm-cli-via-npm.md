# RFC 0029: Invoke the published brainstorm CLI from the skill

**Status:** Implemented

## Summary

The brainstorming workflow already documents the `brainstorm` CLI, but the command it tells the agent to run — `pnpm exec brainstorm` — only resolves inside this monorepo, through the root `workspace:*` devDependency link. A designify plugin installed into any other project has no `brainstorm` on PATH, so the visual companion silently does not work. Publish `@borg0ai/brainstorm-server` to npm and have the skill invoke it with `npx -y @borg0ai/brainstorm-server@<version>`. Delete the legacy launcher scripts and the stale test suite that reference shell scripts this repository no longer has.

## Problem

`packages/brainstorm-server/dist/` is gitignored, so the built CLI is not in the repository. The plugin directory `designify/` contains no CLI. `@borg0ai/brainstorm-server` returns 404 on the npm registry. Three facts follow:

- An installed designify plugin cannot start the visual companion, because nothing in the plugin or the user's project provides the `brainstorm` command.
- The only working invocation is `pnpm exec brainstorm` from this repository root, which depends on a `workspace:*` devDependency that does not exist downstream.
- Nothing asserts that the version named in the skill documentation matches the published package, so the reference can drift silently.

Alongside that, the pre-CLI launcher is still present and unreferenced: `start-server.mjs`, `stop-server.mjs`, `launch-args.mjs`, `server.cjs` (717 lines), `frame-template.html` and `helper.js` under `designify/skills/designify/workflows/brainstorming/scripts/`. The only thing still exercising them is `tests/designify/shell-to-mjs.test.mjs`.

Worse, every legacy file under `packages/brainstorm-server/tests/` loads `skills/brainstorming/scripts/*`. That top-level `skills/` directory no longer exists in this repository — the skills live under `designify/skills/` — so all ten of those files point at a path that cannot resolve. They are not run by `pnpm test`, which invokes only the two TypeScript suites, so they have been rotting silently.

## Goals

- The skill invokes the CLI by its published npm name, so an installed plugin works in any project.
- The version in the skill documentation is pinned and provably equal to `packages/brainstorm-server/package.json`.
- A test fails when the documented version, the package version, and the plugin version disagree.
- The unreferenced launcher scripts and the stale shell-era tests are gone.
- `pnpm test` passes.

## Non-goals

- Publishing the package. This RFC prepares and verifies the invocation; the `npm publish` run is the human partner's, because it writes to a public registry under their scope.
- Bundling a built CLI copy inside `designify/` as an offline fallback.
- Adding `ask`, `serve`, directory watching, an idle timer, or the `BRAINSTORM_*` environment contract back.
- Changing CLI behavior, the `start`/`stop` contract, the `--server-id` ownership rule, or `frame-template.html` semantics.
- Repairing `scripts/bump-version.sh`, which is already broken because `.version-bump.json` is missing.

## Design

The skill calls `npx -y @borg0ai/brainstorm-server@<version>`. The version is pinned rather than floating so a released plugin always drives a matching CLI, and so a future behavior change cannot reach an already-released plugin through a registry lookup. The pin is checked by a test, not by a build step.

`@borg0ai/brainstorm-server` already declares `publishConfig.access: "public"`, `bin.brainstorm` pointing at `dist/brainstorm.js`, and `files: ["dist"]`. The package ships no runtime dependency. `npx` runs the bin, so the invocation needs no extra flags. The npm page gets a README describing `start`, `stop`, the `ready` JSON line, and the `key` requirement.

`npx` needs a registry on first run and caches afterwards. A user without network gets a clear failure from `npx` rather than a silently missing companion. That tradeoff is accepted: the alternative, a bundled build artifact, puts a generated file in git and needs a sync step to prevent drift.

Version sources that must agree: `packages/brainstorm-server/package.json`, `designify/.plugin/plugin.json`, and the version literal in `visual-companion.md` and `workflow.md`. A single vitest case reads all four and fails on mismatch.

### Task 1: Delete the legacy launcher

Files to delete: `designify/skills/designify/workflows/brainstorming/scripts/start-server.mjs`, `stop-server.mjs`, `launch-args.mjs`, `server.cjs`, `frame-template.html`, `helper.js`.

The whole `scripts/` directory under `brainstorming/` goes. `find-polluter.mjs` lives under `systematic-debugging/`, not here, so it is untouched.

Verify by grepping `designify/` for `start-server`, `stop-server`, `launch-args`, `server.cjs`, `frame-template` and `helper.js`; expect no hits.

### Task 2: Delete the stale test suite

Delete ten files from `packages/brainstorm-server/tests/`: `start-server.test.sh`, `stop-server.test.sh`, `windows-lifecycle.test.sh`, `lifecycle.test.js`, `server.test.js`, `auth.test.js`, `ws-protocol.test.js`, `branding.test.js`, `helper.test.js`, `browser-launcher.test.js`.

Every one of them loads `skills/brainstorming/scripts/*`, a path that cannot resolve in this repository. The two survivors, `brainstorm-server.test.ts` and `brainstorm-cli.test.ts`, are the suites that `package.json` actually runs and that cover the current CLI.

`packages/brainstorm-server/package.json` already runs only those two files, so no script change is needed for the deletions to take effect. After deleting, the directory holds exactly those two files.

### Task 3: Rewrite the plugin vitest around the published CLI

`tests/designify/shell-to-mjs.test.mjs` currently imports `launch-args.mjs`, `start-server.mjs` and `stop-server.mjs`. Those imports die with Task 1. Keep the `find-polluter` and "no shell scripts in the plugin" cases; they test live code.

Replace the brainstorm cases with:

- `packages/brainstorm-server/src/brainstorm.ts` and `src/cli-args.ts` exist and the launcher scripts do not.
- The version documented in `visual-companion.md` and `workflow.md` equals the version in `packages/brainstorm-server/package.json` and `designify/.plugin/plugin.json`.
- `package.json` of the CLI declares `bin.brainstorm`, `files: ["dist"]`, and no `dependencies`.

Test first. Expected RED: the documented version does not yet match the npx invocation, and the launcher files still exist. Run `pnpm test`.

### Task 4: Point the workflow at npx

Files: `designify/skills/designify/workflows/brainstorming/visual-companion.md`, and the daemon launch sentence in `designify/skills/designify/workflows/brainstorming/workflow.md`.

Replace `pnpm exec brainstorm` with `npx -y @borg0ai/brainstorm-server@<version>` everywhere, including the `stop` examples and the "How It Works" paragraph that says the repository dogfoods the package. Note in `visual-companion.md` that the first run resolves through the npm registry.

Keep unchanged: the terminal-versus-browser rule, the `events` file contract, the `ready` JSON line shape, the loop, and the screen-writing guidance.

### Task 5: Prepare the package for the registry

Files: `packages/brainstorm-server/README.md`.

Describe `start`, `stop`, the flags, the exit codes, the `ready`/`stopped`/`not_running`/`error` stdout lines, the `key` query parameter, the `events` file, and the loopback-only bind. npm includes `README.md` and `LICENSE` automatically even though `files` lists only `dist`.

Confirm `pnpm --filter @borg0ai/brainstorm-server pack --dry-run` contains `dist/brainstorm.js`, `package.json` and `README.md`, and no `src/`.

## Acceptance

- `grep -rn "start-server\|stop-server\|launch-args\|server\.cjs" designify/` returns nothing.
- `designify/skills/designify/workflows/brainstorming/scripts/` no longer exists.
- `packages/brainstorm-server/tests/` contains exactly `brainstorm-server.test.ts` and `brainstorm-cli.test.ts`.
- No file under `packages/brainstorm-server/tests/` references `skills/brainstorming/scripts`.
- `visual-companion.md` and `workflow.md` invoke `npx -y @borg0ai/brainstorm-server@<version>`, with `<version>` equal to the CLI package version and the plugin version.
- `pnpm test` passes, including the new version-agreement case.
- `pnpm --filter @borg0ai/brainstorm-server pack --dry-run` ships `dist/brainstorm.js` and no `src/`.
- The registry still has no published `@borg0ai/brainstorm-server` until the human partner runs `npm publish`. This RFC does not publish.
