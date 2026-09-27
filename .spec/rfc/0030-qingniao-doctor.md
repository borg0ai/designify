# RFC 0030: Make Qingniao Doctor match repository checks

**Status:** Approved

## Summary

Configure Qingniao Doctor to match this repository's actual quality tooling and expose real root `typecheck` and `build` commands. This removes doctor failures without adding scripts that call tools or tasks the repository does not have.

## Problem

`qingniao doctor --json` fails because the root manifest lacks `lint`, `format`, `format:check`, `typecheck`, and `build`. No lint or formatter is configured in this repository, while the publishable server package already provides `typecheck` and `build` scripts. Qingniao's automatic defaults would point lint at a nonexistent Turbo task and formatting at an uninstalled Prettier command.

## Goals

- Let Doctor check lint and formatting only when this repository configures those tools.
- Expose root typecheck and build commands that delegate to the publishable workspace package.
- Preserve existing `test` and `release` scripts.

## Non-goals

- Do not add ESLint, Prettier, or other quality-tool dependencies.
- Do not add no-op scripts or change package versions.
- Do not publish or start a server.

## Design

### Task 1: Align Doctor checks with repository tooling

Add `qingniao.config.json` with `checks.lint` and `checks.format` disabled because the repository has no configured lint or formatting tools. Add root `typecheck` and `build` scripts in `package.json` that delegate to `@borg0ai/brainstorm-server` through pnpm's workspace filter. Keep `test` and `release` unchanged.

### Task 2: Verify release readiness

Run `pnpm exec qingniao doctor --json`, parse JSONL events, and require the final result to report success. Continue with the user's prescribed Qingniao plan and authorized non-publishing bump only after Doctor succeeds.

## Acceptance

- Qingniao Doctor reports exit code 0 and no missing-script errors.
- Root typecheck/build scripts resolve to the existing server package scripts.
- No versions are changed by hand and no publish command is run.
