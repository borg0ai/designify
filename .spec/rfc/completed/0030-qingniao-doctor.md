# RFC 0030: Make Qingniao Doctor match repository checks

**Status:** Implemented

## Summary

Configure Qingniao Doctor and Qingniao's Turbo build integration to match this repository's actual package scripts. Expose real root `typecheck` and `build` commands and declare the package build task in Turbo, without adding scripts that call tools or tasks the repository does not have.

## Problem

`qingniao doctor --json` fails because the root manifest lacks `lint`, `format`, `format:check`, `typecheck`, and `build`. No lint or formatter is configured in this repository, while the publishable server package already provides `typecheck` and `build` scripts. Qingniao's automatic defaults would point lint at a nonexistent Turbo task and formatting at an uninstalled Prettier command. Qingniao detects Turbo and runs `turbo run build`, but `turbo.json` currently declares only `test`, so that release build fails before package build starts.

## Goals

- Let Doctor check lint and formatting only when this repository configures those tools.
- Expose root typecheck and build commands that delegate to the publishable workspace package.
- Declare the package `build` task in Turbo so Qingniao's detected build command resolves.
- Preserve existing `test` and `release` scripts.

## Non-goals

- Do not add ESLint, Prettier, or other quality-tool dependencies.
- Do not add no-op scripts or change package versions.
- Do not publish or start a server.

## Design

### Task 1: Align Doctor checks with repository tooling

Add `qingniao.config.json` with `checks.lint` and `checks.format` disabled because the repository has no configured lint or formatting tools. Add root `typecheck` and `build` scripts in `package.json` that delegate to `@borg0ai/brainstorm-server` through pnpm's workspace filter. Add `build` to `turbo.json` with `dist/**` outputs so Qingniao's Turbo integration can run the server package build. Keep `test` and `release` unchanged.

### Task 2: Verify release readiness

Run `pnpm exec qingniao doctor --json`, parse JSONL events, and require the final result to report success. Run `pnpm exec turbo run build` and require the server package build task to complete successfully.

## Acceptance

- Qingniao Doctor reports exit code 0 and no missing-script errors.
- Root typecheck/build scripts resolve to the existing server package scripts.
- `turbo run build` resolves and runs the server package build task.
- No versions are changed and no publish command is run as part of this RFC.
