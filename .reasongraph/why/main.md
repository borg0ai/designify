# Why: main

<!-- reasongraph:v1 generated 2026-09-27 — review before sharing; edit freely, edits are preserved -->

## Intent
Make the designify plugin discoverable by the plugins CLI from one manifest, with Node ESM hooks and workflow scripts, a pnpm/Turbo workspace, and a public loopback brainstorm server CLI that the brainstorming skill invokes.

## Decisions

### Keep a single Agent Plugins manifest and delete per-host copies
Status: directed
Touches: `designify/.plugin/plugin.json`, `designify/skills/designify/SKILL.md`, `designify/skills/designify/workflows/**`, `.agents/plugins/marketplace.json`

plugins@1.3.4 discover treats a directory that contains .plugin/plugin.json plus skills/ as one plugin, and it found one plugin named designify with one skill and hooks by scanning designify/ rather than a marketplace file. Per-host plugin.json files that set skills to ./ were dropped because the real skill lives at skills/designify/SKILL.md and a non-empty skills field is not rewritten to ./skills/. Install-time host manifests are left to the Plugins CLI. workflows/ is not an extra skill. The root marketplace that still named superpowers was outside the CLI search paths and was removed with the other duplicated host config.

Considered/rejected: Leaving separate Claude, Cursor, Codex, Kimi, Devin, Muse, and Hermes manifests, plus .plugin/skill-release.json and two hook sets under legacy-host-config.
Reviewer attention: Confirm discover still reports one plugin, one skill, and hooks, and that no vendor manifest with skills set to ./ remains.

### Rewrite the SessionStart hook as Node ESM
Status: directed
Touches: `designify/hooks/hooks.json`, `designify/hooks/session-start.mjs`, `designify/hooks/session-output.mjs`, `designify/skills/designify/SKILL.md`, `tests/designify/session-start.test.mjs`

hooks.json runs node on ${CLAUDE_PLUGIN_ROOT}/hooks/session-start.mjs. The module reads skills/designify/SKILL.md instead of a missing ${PLUGIN_ROOT}/SKILL.md. session-output.mjs picks the JSON shape from the host environment: Cursor uses additional_context, Claude Code and Muse use nested additionalContext, and other hosts use a top-level additionalContext. The body is escaped with JSON.stringify. The bash session-start script and run-hook.cmd were removed. The Node test file reported 7 passing tests.

Considered/rejected: Keeping a bash hook plus run-hook.cmd. Discover only checks that hooks/hooks.json exists and does not check that the script can read the skill.

### Convert remaining plugin shell scripts to ESM
Status: directed
Touches: `designify/skills/designify/workflows/brainstorming/scripts/start-server.mjs`, `designify/skills/designify/workflows/brainstorming/scripts/launch-args.mjs`, `designify/skills/designify/workflows/brainstorming/scripts/stop-server.mjs`, `designify/skills/designify/workflows/systematic-debugging/find-polluter.mjs`, `designify/skills/designify/workflows/brainstorming/visual-companion.md`, `designify/skills/designify/workflows/systematic-debugging/root-cause-tracing.md`, `designify/skills/designify/workflows/writing-skills/workflow.md`, `designify/skills/designify/workflows/brainstorming/scripts/server.cjs`, `tests/designify/shell-to-mjs.test.mjs`

The three remaining shell entrypoints in the plugin became start-server.mjs, stop-server.mjs, and find-polluter.mjs, with launch argument parsing in launch-args.mjs. Skill docs call them via node. stop-server.mjs only stops processes whose command line contains that invocation's --brainstorm-server-id. find-polluter.mjs runs tests one by one and reports the first case that creates a polluting file. server.cjs, helper.js, and render-graphs.js stayed JavaScript. Combined with the session-start tests, 15 tests passed.

Considered/rejected: Leaving start-server.sh, stop-server.sh, and find-polluter.sh in the plugin.

### Leave repository-root legacy shell tests outside the plugin conversion
Status: discussed
Touches: `tests/**`, `scripts/**`

Shell under tests/ and scripts/ at the repository root was left in place because it is outside the designify plugin package. No explicit rationale was recorded for converting those scripts later.

### Rename Superpowers workspace paths to designify
Status: directed
Touches: `designify/skills/designify/SKILL.md`, `designify/skills/designify/workflows/executing-plans/workflow.md`, `designify/skills/designify/workflows/subagent-driven-development/workflow.md`, `designify/skills/designify/workflows/subagent-driven-development/task-reviewer-prompt.md`, `designify/skills/designify/workflows/subagent-driven-development/re-review-prompt.md`, `designify/skills/designify/workflows/diagnosing-agent-behavior/workflow.md`, `designify/skills/designify/workflows/diagnosing-agent-behavior/templates/report.md`, `designify/skills/designify/workflows/diagnosing-agent-behavior/templates/case.md`, `designify/skills/designify/workflows/diagnosing-agent-behavior/references/github-issues.md`, `designify/skills/designify/workflows/brainstorming/workflow.md`, `designify/skills/designify/workflows/brainstorming/visual-companion.md`, `designify/skills/designify/workflows/brainstorming/scripts/start-server.mjs`

Workspace paths inside the plugin were changed off .superpowers. Brainstorm sessions use .designify/brainstorm/ and temp directories under /tmp/designify-brainstorm-. SDD records for an RFC use .designify/sdd/<RFC filename>/, with the parent directory distinguishing same-named RFCs. Diagnosis records use ~/.designify/diagnosing/<session-id>/. After the rewrite, node --test tests/designify/*.test.mjs reported 18 passing tests.

Considered/rejected: Keeping .superpowers/sdd as the on-disk workspace.

### Convert SDD and executing-plans helpers to ESM
Status: directed
Touches: `designify/skills/designify/workflows/subagent-driven-development/scripts/sdd-workspace.mjs`, `designify/skills/designify/workflows/subagent-driven-development/scripts/task-brief.mjs`, `designify/skills/designify/workflows/subagent-driven-development/scripts/review-package.mjs`, `designify/skills/designify/workflows/executing-plans/scripts/task-start.mjs`, `designify/skills/designify/workflows/executing-plans/scripts/task-done.mjs`, `designify/skills/designify/workflows/subagent-driven-development/workflow.md`, `designify/skills/designify/workflows/executing-plans/workflow.md`, `tests/designify/sdd-workspace.test.mjs`

sdd-workspace, task-brief, review-package, task-start, and task-done were rewritten as .mjs and the workflows call them with node scripts/...mjs. They write the .designify/sdd workspace rather than .superpowers/sdd.

### Run plugin package tests with Vitest
Status: directed
Touches: `tests/vitest.config.mjs`, `tests/designify/session-start.test.mjs`, `tests/designify/shell-to-mjs.test.mjs`, `tests/designify/sdd-workspace.test.mjs`, `package.json`

The three plugin tests moved from node:test and node:assert to Vitest describe, test, and expect. npm test was vitest run. Vitest 5.0.2 collected only tests/designify/**/*.test.mjs. That run reported 3 files and 18 passing tests. Vitest stays out of the designify plugin payload.

Considered/rejected: Keeping the Node built-in test runner.

### Drive the repo with a pnpm workspace and Turbo
Status: directed
Touches: `pnpm-workspace.yaml`, `turbo.json`, `package.json`, `pnpm-lock.yaml`, `.gitignore`

The root is a private workspace with packageManager pnpm@10.27.0. pnpm test runs turbo run test. package-lock.json was removed and pnpm-lock.yaml is the lockfile. A second test run was a cache hit and took 9ms. The test task treats designify/ sources as cache inputs so plugin edits rerun tests.

Considered/rejected: Staying on npm with a root package-lock.json.

### Install Vitest only on the tests workspace package
Status: discussed
Touches: `tests/package.json`, `tests/vitest.config.mjs`, `vitest.config.mjs`

A root vitest.config.mjs could not resolve Vitest once it lived only in the tests package, so the config moved to tests/vitest.config.mjs and the root file was deleted. The plugin directory does not depend on Vitest.

### Name the root package designify-monorepo
Status: directed
Touches: `package.json`

The root package name is designify-monorepo so it does not collide with the plugin or later CLI package names. After the rename the workspace listing included designify-monorepo.

### Name the test workspace package @borg0ai/tests
Status: directed
Touches: `tests/package.json`

The tests package name is @borg0ai/tests. The @designify scope was removed from workspace package names. It depends on the brainstorm server package with workspace:* once that package exists.

Considered/rejected: Keeping the name @designify/tests.

### Mark workspace packages private except the brainstorm server
Status: directed
Touches: `package.json`, `tests/package.json`, `packages/brainstorm-server/package.json`

designify-monorepo and @borg0ai/tests are private: true so they are not published. The nested brainstorm-server-tests manifest was also set private before that suite was moved. The brainstorm server package later dropped private so it can be published.

### Do not run the stale brainstorm bash suite from the default test task
Status: discussed
Touches: `packages/brainstorm-server/package.json`, `packages/brainstorm-server/tests/start-server.test.sh`, `packages/brainstorm-server/tests/stop-server.test.sh`, `turbo.json`, `docs/testing.md`

The old suite still invokes bash start-server.sh and stop-server.sh and still points at skills/brainstorming/scripts/, which is not where server.cjs, start-server.mjs, and stop-server.mjs live. Wiring it into turbo run test would fail pnpm test. Default pnpm test stays on the Vitest suite. The stale suite is only the package filter test, and those bash files were later left on disk but taken out of the package test script.

Risk: The checked-in bash tests do not exercise the current server and will fail if someone runs them.
Reviewer attention: Confirm the package test script does not call the old .sh files or the removed skills/brainstorming/scripts/ paths.

### Place brainstorm server code and tests in a workspace package
Status: directed
Touches: `packages/brainstorm-server/package.json`, `packages/brainstorm-server/tests/**`, `pnpm-workspace.yaml`, `docs/testing.md`, `.spec/rfc/0001-brainstorm-cli.md`

The repo-root brainstorm-server directory moved under packages/ and its package-lock.json was deleted so the root pnpm-lock.yaml owns dependencies. pnpm-workspace.yaml includes packages/*. Tests sit in packages/brainstorm-server/tests/, and repo-root relative paths go up three levels. An intermediate layout under src/tests was corrected to tests/. Implementation is under packages/brainstorm-server/src/. Plugin install copies designify/ only, not packages/.

Considered/rejected: Leaving the suite at tests/brainstorm-server, where pnpm-workspace.yaml only includes the tests/ package and ignores the nested folder, or keeping tests in src/tests.

### Record the brainstorm CLI contract in RFC 0001
Status: discussed
Touches: `.spec/rfc/0001-brainstorm-cli.md`, `.spec/rfc/completed/0001-brainstorm-cli.md`

The RFC design text still documented `node scripts/brainstorm.mjs show --screen <file> --open`. The CLI that exists has only start and stop, with no show subcommand and no --open flag. The RFC text was corrected to that contract, then advanced to Implemented and archived once the skill docs, the CLI, and the launcher removal were in the tree.

### Implement a loopback single-screen server before the CLI
Status: directed
Touches: `packages/brainstorm-server/src/server.ts`, `packages/brainstorm-server/src/constants.ts`, `packages/brainstorm-server/src/frames.ts`, `packages/brainstorm-server/src/authorize.ts`, `packages/brainstorm-server/tests/brainstorm-server.test.ts`, `designify/skills/designify/workflows/brainstorming/scripts/server.cjs`

startServer({ html, token, host }) listens on 127.0.0.1 on a random port and returns port, choice, and close. GET / returns the HTML only when ?key= matches; other HTTP requests are 403. A WebSocket without the key is closed and does not settle choice. The first text frame with a non-empty choice settles choice once. There is no runtime dependency. Tests were written to fail first; brainstorm-server.test reported 3 passing tests, and pnpm test also ran the existing 18 Vitest tests. The plugin server.cjs was left in place until the CLI was wired. The sources were later renamed from .mjs to .ts.

Considered/rejected: Building the CLI in the same step as the server.

### Expose the server as a detached start/stop CLI
Status: directed
Touches: `packages/brainstorm-server/src/brainstorm.ts`, `packages/brainstorm-server/src/daemon.ts`, `packages/brainstorm-server/src/cli-args.ts`, `packages/brainstorm-server/tests/brainstorm-cli.test.ts`, `packages/brainstorm-server/package.json`, `.spec/rfc/0001-brainstorm-cli.md`

brainstorm start backgrounds the server and the parent exits. stdout is one ready JSON line with the ?key= URL, pid, and serverId. start requires an existing HTML file and serves that file only, returned as-is, with no frame template and no helper.js injection. Choices append to the state directory events file. Default state directory is .designify/brainstorm/. stop signals only processes whose command line contains this --server-id=. The listener is 127.0.0.1. There is no --open, no directory watch, and no port reuse across screens. With no arguments the CLI exits 2 and prints usage for start and stop. The CLI tests plus the server tests were 6 passing before the symlink case was added.

Considered/rejected: The RFC's blocking show command that writes ready and choice to stdout and then exits.
Risk: A session cannot push a new screen into an already open tab; each visual question needs another start, and the URL changes.
Reviewer attention: Confirm stop cannot signal a process that lacks this server id, and that missing --open is acceptable for the skill flow.

### Name the package and command brainstorm, not brainstore
Status: directed
Touches: `packages/brainstorm-server/package.json`, `packages/brainstorm-server/src/brainstorm.ts`, `packages/brainstorm-server/tests/windows-lifecycle.test.sh`, `.spec/rfc/0001-brainstorm-cli.md`, `.spec/ROADMAP.md`, `.spec/TASK_TRACKING.md`

The package directory, npm name @borg0ai/brainstorm-server, bin command brainstorm, and RFC id were renamed off brainstore. Default state remains .designify/brainstorm/. pnpm test then reported 6 tests in the new package and 18 existing Vitest tests.

### Publish @borg0ai/brainstorm-server as a public package with no runtime dependencies
Status: directed
Touches: `packages/brainstorm-server/package.json`

private was removed and publishConfig.access is public so the scoped package can be published to the public registry. The published name is @borg0ai/brainstorm-server at version 6.4.2, license MIT, bin brainstorm, with no runtime dependencies. A dry-run pack was checked and the produced tarball was deleted. npm publish was not run. Tests are not part of the published file set.

Risk: The package is configured as public but has not been published, so installs outside this workspace cannot resolve it yet.

### Build the CLI with TypeScript and Vite into one Node file
Status: directed
Touches: `packages/brainstorm-server/src/brainstorm.ts`, `packages/brainstorm-server/src/server.ts`, `packages/brainstorm-server/src/daemon.ts`, `packages/brainstorm-server/src/cli-args.ts`, `packages/brainstorm-server/src/frames.ts`, `packages/brainstorm-server/src/authorize.ts`, `packages/brainstorm-server/src/constants.ts`, `packages/brainstorm-server/vite.config.ts`, `packages/brainstorm-server/tsconfig.json`, `packages/brainstorm-server/package.json`, `.gitignore`, `.spec/rfc/0001-brainstorm-cli.md`

Sources are TypeScript. The package build is a Vite 8 SSR bundle of src/brainstorm.ts to dist/brainstorm.js, about 16 KB, with a shebang. node: builtins stay external. typescript ^7.0.2 and vite ^8.3.1 are devDependencies. bin and exports point at dist/brainstorm.js. files is only dist/. prepack builds first. The test script typechecks with tsc --noEmit, builds, then runs the tests. dist/ is gitignored. The RFC was updated to this layout.

Considered/rejected: Publishing the TypeScript sources or the earlier .mjs files as the public entry.
Reviewer attention: Confirm the published tarball contains dist/brainstorm.js and does not contain src/ or tests/.

### Reserve the @borg0ai/designify name and keep it out of this repo
Status: directed
Touches: `package.json`, `packages/brainstorm-server/package.json`, `designify/.plugin/plugin.json`

@borg0ai/designify is reserved for a future apps CLI and is not a package in this workspace. The brainstorm server package stays @borg0ai/brainstorm-server with bin brainstorm. The plugin directory has no package.json. Skill identity stays name designify in designify/.plugin/plugin.json, separate from the npm package name. A short-lived rename of the brainstorm package and its bin to @borg0ai/designify and designify was reverted.

Considered/rejected: Using @borg0ai/designify as the npm name and bin of the brainstorm server, or shipping that name from designify/package.json.

### Point the brainstorming skill at the brainstorm CLI
Status: directed
Touches: `designify/skills/designify/workflows/brainstorming/visual-companion.md`, `designify/skills/designify/workflows/brainstorming/workflow.md`

The brainstorming docs were calling `pnpm exec brainstorm` from the repo root. That resolves only through the workspace devDependency, `packages/brainstorm-server/dist` is gitignored, and `designify/` contained no CLI, so an installed plugin could not start the companion. The docs now invoke `npx -y @borg0ai/brainstorm-server@6.4.2` for `start` and `stop`, pinned to the shared plugin and package version 6.4.2, and the checkout-only wording was removed.

Considered/rejected: Bundling `dist/brainstorm.js` into `designify/bin` was set aside because it would commit a generated file and need a release sync. Keeping the workspace-only `pnpm exec` invocation was set aside because it does not resolve outside this monorepo. An unpinned `npx` invocation was set aside because the published CLI could move ahead of the plugin version the docs were written against.
Risk: The docs pin 6.4.2, which was not on the registry at the time (lookup returned not found), and this change does not publish the package. The first start also needs a network fetch.
Reviewer attention: Confirm both workflow docs use the pinned npx start/stop form, and that 6.4.2 is actually published before those docs are relied on.

### Treat a symlinked bin as a direct CLI run
Status: discussed — found while checking the documented pnpm exec invocation
Touches: `packages/brainstorm-server/src/brainstorm.ts`, `packages/brainstorm-server/tests/brainstorm-cli.test.ts`, `node_modules/.bin/brainstorm`

pnpm's bin is a symlink, so comparing argv to import.meta.url did not match and pnpm exec brainstorm exited 0 without printing usage. isDirectRun now compares real paths. A symlink entry test was added. The package tests then reported 7 passing, and ./node_modules/.bin/brainstorm with no arguments exits 2 and prints usage: brainstorm start ... | brainstorm stop ...

### Move tracked design docs from docs/superpowers to .designify
Status: directed
Touches: `.designify/specs/**`, `.designify/plans/**`, `docs/superpowers/**`, `.gitignore`, `tests/claude-code/test-worktree-path-policy.sh`, `README.md`

docs/superpowers/specs and docs/superpowers/plans were git-moved to .designify/specs and .designify/plans, and the old directory was removed. That is 20 specs and 16 plans. In-repo references and tests that pointed at docs/superpowers/ were updated to .designify/. evals/docs/superpowers/ was left unchanged because that path belongs to the evals tree. docs/plans/ was left where it was. Snapshots under .birdify/ still mention docs/superpowers/.

Considered/rejected: Keeping the design history under docs/superpowers/.
Reviewer attention: Confirm .birdify snapshots and evals/docs/superpowers/ were intentionally not rewritten.

### Gitignore .designify session output but track specs and plans
Status: discussed
Touches: `.gitignore`, `.designify/specs/**`, `.designify/plans/**`, `.designify/brainstorm/**`, `.designify/tdd/**`, `.designify/sdd/**`

.gitignore still ignores session artifacts under .designify (brainstorm, tdd, and sdd). specs/ and plans/ stay trackable after the move. git check-ignore was used to confirm the session paths stay ignored.

### Merge each design and its plan into a single Draft RFC
Status: discussed
Touches: `.spec/rfc/0004-platform-neutral-docs.md`, `.spec/rfc/0005-platform-neutral-prose.md`, `.spec/rfc/0006-platform-neutral-config-refs.md`, `.spec/rfc/0007-platform-neutral-readme-order.md`, `.spec/rfc/0008-opencode-support.md`, `.spec/rfc/0009-skill-feedback-gaps.md`, `.spec/rfc/0010-visual-brainstorm-companion.md`, `.spec/rfc/0011-document-review-system.md`, `.spec/rfc/0012-visual-brainstorm-terminal-commands.md`, `.spec/rfc/0013-zero-dep-brainstorm-server.md`, `.spec/rfc/0014-codex-app-worktrees.md`, `.spec/rfc/0015-worktree-detect-and-defer.md`, `.spec/rfc/0016-evals-harness.md`, `.spec/rfc/0017-pi-harness.md`, `.spec/rfc/0018-sdd-task-scoped-review.md`, `.spec/rfc/0019-visual-companion-issue-catalog.md`, `.spec/rfc/0020-visual-companion-auth.md`, `.spec/rfc/0021-visual-companion-hardening-fixup.md`, `.spec/rfc/0022-sdd-plan-scoped-workspace.md`, `.spec/rfc/0023-sdd-fix-loop.md`, `.spec/rfc/0024-codex-efficiency-fixes.md`, `.spec/rfc/0025-hermes-version-bump.md`, `.spec/rfc/0026-diagnose-agent-session.md`, `.spec/rfc/0027-positive-instruction-prose.md`, `.spec/rfc/0028-strict-cost-sdd.md`

Each prior design and its matching implementation plan become one RFC body so the spec set has a single record per change. Twenty-five new records, .spec/rfc/0004 through .spec/rfc/0028, are written as Draft. Specify sync-check is treated as the consistency gate after the writes.

Considered/rejected: Keeping a separate design file and a separate plan file was dropped so one RFC holds both.

### Keep task checkboxes on the tracking board
Status: discussed
Touches: `.spec/TASK_TRACKING.md`, `.spec/rfc/0004-platform-neutral-docs.md`, `.spec/rfc/0028-strict-cost-sdd.md`

Checkbox state stays in .spec/TASK_TRACKING.md and is not copied into RFC bodies. Later, board items that correspond to archived RFCs are checked off there rather than inside the RFC text.

### Split platform-neutral work into an umbrella RFC and three phase RFCs
Status: discussed
Touches: `.spec/rfc/0004-platform-neutral-docs.md`, `.spec/rfc/0005-platform-neutral-prose.md`, `.spec/rfc/0006-platform-neutral-config-refs.md`, `.spec/rfc/0007-platform-neutral-readme-order.md`

Platform-neutral documentation is an umbrella record at 0004. Phase A, generic Claude wording, is 0005. Phase B, instruction file names, is 0006. Phase C, README order, is 0007. The umbrella stays open until those phase records are actually done.

### Record positive-instruction prose as RFC 0027
Status: discussed
Touches: `.spec/rfc/0027-positive-instruction-prose.md`, `docs/superpowers/specs/2026-06-10-positive-instruction-redesign-design.md`

The historical positive-instruction redesign spec is delivered as RFC 0027. Composition prohibitions that backfire are specified as positive wording instead. The new file is validated with Specify before it is left as Draft.

### Limit strict-cost SDD to mechanical-cost reduction in RFC 0028
Status: discussed
Touches: `.spec/rfc/0028-strict-cost-sdd.md`, `docs/superpowers/specs/2026-06-10-strict-cost-sdd-design.md`

RFC 0028 records a strict-cost spec-driven-development change whose scope is only lowering mechanical cost. Levels L2 and L3 are not implemented because they already failed the acceptance gate. No numeric threshold for that failure is recorded in this pass.

Considered/rejected: Implementing L2 and L3 was rejected because those levels had already failed the gate.

### Fold eval results into RFC 0022 acceptance instead of a new RFC
Status: discussed
Touches: `.spec/rfc/0022-sdd-plan-scoped-workspace.md`

RFC 0022 specifies plan-scoped progress directories, one directory per RFC. Eval results are written into that RFC's acceptance criteria. A separate RFC is not opened for those results.

Considered/rejected: Opening another RFC just for eval output was rejected in favor of acceptance text on 0022.

### Point worktree policy tests at RFC 0015
Status: discussed
Touches: `tests/claude-code/test-worktree-path-policy.sh`, `.spec/rfc/0015-worktree-detect-and-defer.md`

Fixtures that previously pointed at .designify/plans are retargeted to .spec/rfc. The worktree regression reads RFC 0015, whose rule is to prefer a native worktree and otherwise use the project's .worktrees/ directory. The same test file is edited again in the archive pass. No explicit rationale for that second edit is recorded.

Reviewer attention: Confirm the test still resolves RFC 0015 after that file moves under .spec/rfc/completed/.

### Ignore the whole .designify directory
Status: discussed
Touches: `.gitignore`, `.designify/`

.gitignore is changed to ignore the entire .designify/ directory so session artifacts are not stored beside specifications. Spec content lives under .spec/rfc instead.

### Remove the legacy spec and plan directories from the worktree and index
Status: directed
Touches: `.designify/specs`, `.designify/plans`, `docs/superpowers`, `docs/plans`, `.spec/rfc/0004-platform-neutral-docs.md`, `.spec/rfc/0028-strict-cost-sdd.md`

.designify/plans, .designify/specs, docs/superpowers, and docs/plans are removed from both the worktree and the git index. After removal, the index lists zero files under those four paths. Surviving spec text is only .spec/rfc/0004 through .spec/rfc/0028. Two historical specs are read from HEAD via git show before the docs/superpowers tree is gone, and that content is what lands in RFC 0027 and RFC 0028.

Risk: Deleting the old trees drops the previous paths; anything not copied into an RFC is gone from the worktree.
Reviewer attention: Confirm no remaining tracked file still references .designify/plans, .designify/specs, docs/superpowers, or docs/plans.

### Archive only RFCs whose behavior is already in the tree
Status: directed
Touches: `.spec/rfc/completed/`, `.spec/rfc/0010-visual-brainstorm-companion.md`, `.spec/rfc/0012-visual-brainstorm-terminal-commands.md`, `.spec/rfc/0013-zero-dep-brainstorm-server.md`, `.spec/rfc/0014-codex-app-worktrees.md`, `.spec/rfc/0015-worktree-detect-and-defer.md`, `.spec/rfc/0018-sdd-task-scoped-review.md`, `.spec/rfc/0019-visual-companion-issue-catalog.md`, `.spec/rfc/0020-visual-companion-auth.md`, `.spec/rfc/0021-visual-companion-hardening-fixup.md`, `.spec/rfc/0022-sdd-plan-scoped-workspace.md`, `.spec/rfc/0023-sdd-fix-loop.md`, `.spec/rfc/0026-diagnose-agent-session.md`, `.spec/TASK_TRACKING.md`

Closure is an advance to Implemented followed by archive into .spec/rfc/completed/, and only after the skill, workflow, and package tree is checked. Twelve RFCs are closed: 0010 visual companion, 0012 browser display with terminal commands, 0013 zero-dependency brainstorm server, 0014 do not create a worktree when the Codex app already has one, 0015 prefer a native worktree otherwise .worktrees/, 0018 task-diff review then a final whole-branch review, 0019 visual-companion issue catalog, 0020 session key, 0021 stop only the process whose server id matches, 0022 SDD progress split by RFC directory, 0023 fix loop capped at 5 rounds then a circuit break, and 0026 failed-session diagnosis. RFC 0003 was already archived and is not closed again. Specify sync-check passes after the archive, and the matching task-board items are checked.

Considered/rejected: Advancing every Draft RFC was rejected. Records with no landed behavior stay Draft.
Reviewer attention: Confirm .spec/rfc/completed/ contains exactly these twelve and that the 5-round cap, matching server-id stop, and .worktrees/ fallback match the workflows.

### Leave the brainstorm CLI RFC open
Status: directed
Touches: `.spec/rfc/0001-brainstorm-cli.md`, `designify/skills/designify/SKILL.md`, `packages/brainstorm-server/package.json`

RFC 0001 stays open. The plugin still ships start-server.mjs, and the skill is not yet switched to the RFC's brainstorm.mjs show entry.

Reviewer attention: Confirm start-server.mjs is still the live entry and brainstorm.mjs show is not.

### Leave the RFC gate routing RFC open
Status: directed
Touches: `.spec/rfc/0002-designify-rfc-gate.md`, `designify/skills/designify/workflows/`

RFC 0002 stays open. The route table still sends implement-feature work straight to TDD, and the stress-test records the RFC requires are absent.

### Leave the platform-neutral RFC family open
Status: directed
Touches: `.spec/rfc/0004-platform-neutral-docs.md`, `.spec/rfc/0005-platform-neutral-prose.md`, `.spec/rfc/0006-platform-neutral-config-refs.md`, `.spec/rfc/0007-platform-neutral-readme-order.md`, `README.md`

RFCs 0004 through 0007 stay open. Platform-neutral wording and the README order are not finished, so the umbrella RFC cannot be closed with its phases.

### Leave OpenCode and Pi harness RFCs open
Status: directed
Touches: `.spec/rfc/0008-opencode-support.md`, `.spec/rfc/0017-pi-harness.md`

RFCs 0008 and 0017 stay open. OpenCode and Pi integration were removed from the tree, which is not the same as finishing them, so they are not marked Implemented.

Considered/rejected: Treating removal from the tree as completion was rejected.
Risk: The RFC text can describe harness support that is no longer in the repository.

### Leave RFCs whose acceptance still does not match the tree open
Status: directed
Touches: `.spec/rfc/0009-skill-feedback-gaps.md`, `.spec/rfc/0011-document-review-system.md`, `.spec/rfc/0016-evals-harness.md`, `.spec/rfc/0024-codex-efficiency-fixes.md`, `.spec/rfc/0025-hermes-version-bump.md`, `.spec/rfc/0027-positive-instruction-prose.md`, `.spec/rfc/0028-strict-cost-sdd.md`, `designify/skills/designify/workflows/`

RFCs 0009, 0011, 0016, 0024, 0025, 0027, and 0028 stay open. Their acceptance conditions do not match the skills or scripts currently in the tree, including the eight skill gaps, spec and plan review, moving drills into evals/, Codex efficiency items T1 through T5, Hermes version alignment with the repo version, positive-instruction prose, and the mechanical-cost-only SDD scope.

Reviewer attention: Confirm none of these seven were archived and that each acceptance check still fails against the current skills or scripts.

### Remove the unused in-plugin brainstorm launchers
Status: directed
Touches: `designify/skills/designify/workflows/brainstorming/scripts/*`

After the skill called the CLI, nothing in the docs still referenced start-server.mjs, stop-server.mjs, launch-args.mjs, server.cjs (717 lines), frame-template.html, or helper.js. The whole brainstorming scripts directory was removed. The files were already staged, so the index delete was forced; the blobs remain in git history.

Reviewer attention: Confirm no workflow, hook, or test still imports those six files.

### Delete brainstorm-server tests aimed at the old skill scripts
Status: directed
Touches: `packages/brainstorm-server/tests/*`

Every non-TypeScript file under packages/brainstorm-server/tests referenced skills/brainstorming/scripts, a tree this repo no longer has. The package test script runs only brainstorm-server.test.ts and brainstorm-cli.test.ts, so the other ten files never ran and had gone stale. Those ten were deleted: start-server.test.sh, stop-server.test.sh, windows-lifecycle.test.sh, lifecycle.test.js, server.test.js, auth.test.js, branding.test.js, browser-launcher.test.js, helper.test.js, and ws-protocol.test.js. An earlier list of four files was wrong and was corrected before the delete.

Reviewer attention: Confirm the two TypeScript CLI tests remain and that no CI job still invokes the deleted shell tests.

### Lock the published CLI version to the plugin in vitest
Status: discussed
Touches: `tests/designify/shell-to-mjs.test.mjs`, `packages/brainstorm-server/package.json`, `designify/.plugin/plugin.json`, `designify/skills/designify/workflows/brainstorming/visual-companion.md`, `designify/skills/designify/workflows/brainstorming/workflow.md`

tests/designify/shell-to-mjs.test.mjs was rewritten in place, keeping that filename, to assert that designify/ no longer mentions the old launchers, that packages/brainstorm-server/tests does not reference skills/brainstorming/scripts, and that every @borg0ai/brainstorm-server version in the two workflow docs equals both the CLI package version and designify/.plugin/plugin.json. The matcher accepts only a numeric semver so a closing markdown backtick is not captured as part of the version. The full pnpm test run was green at 16 vitest tests and 7 brainstorm tests; an earlier run in the same tree was 18 and 7.

Considered/rejected: A separate JSON file to hold the pinned version was not added. The docs plus the two manifests are the sources, and the test compares them.
Reviewer attention: The filename still says shell-to-mjs; the assertions are about the published CLI and leftover launchers.

### Specify published-CLI invocation in RFC 0029
Status: discussed
Touches: `.spec/rfc/0029-brainstorm-cli-via-npm.md`, `.spec/rfc/completed/0029-brainstorm-cli-via-npm.md`

The npm invocation, launcher deletion, stale-test deletion, version-lock test, and package README were specified in RFC 0029, validated, implemented, and archived. The RFC's test-deletion task was widened from four files to all ten non-TypeScript files under packages/brainstorm-server/tests before those deletes ran.

### Put a README and LICENSE in the brainstorm-server npm package
Status: discussed
Touches: `packages/brainstorm-server/README.md`, `packages/brainstorm-server/LICENSE`, `packages/brainstorm-server/package.json`

A package README was added for the registry page. A MIT LICENSE was copied from the repository root because the package declared MIT but had no LICENSE file, and the registry only packs a license file that is present. A dry-run pack contained dist/brainstorm.js, package.json, README.md, and LICENSE, and did not contain src.

Reviewer attention: Confirm the packed tarball still has no runtime dependencies and no src.

### Stop the porting guide from invoking the deleted brainstorm launcher
Status: agent-initiated — not requested in plan or prompts
Touches: `docs/porting-to-a-new-harness.md`

The porting guide's example of spelling a command through an interpreter still named bash scripts/start-server.sh, and a matching stop script, after those files were removed. The example was edited so it no longer points at the deleted launcher. No further rationale was recorded beyond keeping the guide consistent with that deletion.

### Leave the version-bump script and RFC 0003 release wiring unchanged
Status: agent-initiated — not requested in plan or prompts
Touches: `scripts/bump-version.sh`, `.version-bump.json`, `package.json`, `.spec/rfc/completed/0003-publish-brainstorm-cli.md`, `.changeset/*`

scripts/bump-version.sh cannot run because .version-bump.json is absent. RFC 0003 is marked Implemented, but the release script and the qingniao and changesets dependencies it describes are not in package.json; only .changeset/ is present. Neither was changed. No fix was chosen; both were left outside this change.

### Add the Turbo build task Qingniao auto-runs
Status: discussed
Touches: `turbo.json`, `.spec/rfc/completed/0030-qingniao-doctor.md`

Qingniao detects turbo.json and runs turbo run build. The pipeline defined only test, so the build phase failed because no build task existed. The missing task was added to turbo.json and written into approved RFC 0030. pnpm exec turbo run build then built @borg0ai/brainstorm-server, and Qingniao Doctor and Plan both passed.

Considered/rejected: Leaving the Turbo pipeline as test-only, which cannot satisfy the detected turbo run build command.
Risk: A required build task can fail the same build phase for any workspace package that has no build script.
Reviewer attention: Confirm turbo.json defines build, that it is the task Qingniao invokes, and that the successful run still includes @borg0ai/brainstorm-server.

### Archive RFC 0030 without applying the version bump
Status: directed — close after the working fix, not as a document-only ending
Touches: `.spec/rfc/completed/0030-qingniao-doctor.md`

RFC 0030 was marked Implemented and archived at .spec/rfc/completed/0030-qingniao-doctor.md only after the Turbo build task existed and Qingniao Doctor and Plan had passed. An unpublished bump, intended with --yes --skip-publish --skip-build, had already stopped with exit code 1 because the worktree had uncommitted changes, and it was not retried. Plan had named @borg0ai/brainstorm-server@6.4.2 as the only publishable package and a minor changeset was prepared for that new CLI; no version field was hand-edited and nothing was published. The bump stays a separate clean-tree release.

Considered/rejected: Archiving before the Turbo build task existed, retrying the bump on a dirty worktree, or hand-editing the version to force the bump through.
Risk: The archived RFC can be read as finished while the package version is still the pre-bump value and the minor changeset is unapplied.
Reviewer attention: Confirm the completed RFC is Implemented, that @borg0ai/brainstorm-server was not published, and that version fields were not hand-edited past 6.4.2.

### Install Prettier so the root format script resolves
Status: directed
Touches: `package.json`

The release format step runs the root format script, which invokes Prettier. Prettier was not installed, so the script could not be resolved. checks.format set to false only skips the format check; formatting that follows a version update still runs, so Prettier was installed and the root script remains a real Prettier invocation.

Considered/rejected: Relying on checks.format false to skip the release format step was rejected because that flag does not skip formatting after a version update.

### Limit the root format script to Qingniao version manifests
Status: discussed
Touches: `package.json`

The root format script was limited to the version manifests a Qingniao version update rewrites, so a format run does not walk the rest of the repository.

Considered/rejected: Formatting the whole repository was rejected so the release format step stays limited to those manifests.
Risk: Paths outside those manifests are not formatted by the root format script.
Reviewer attention: Confirm the format targets are the manifests Qingniao rewrites and that leaving the rest of the tree unformatted is intended.

### Point the format glob at the four manifests that exist
Status: discussed
Touches: `package.json`

Prettier exits with status 2 when a glob matches no files. skill-release.json is not in the repository, so the format script was narrowed to the four version manifests that do exist. pnpm format and pnpm format:check then both succeeded, and Qingniao Doctor returned exit code 0.

Risk: A later manifest omitted from the glob will be skipped, and removing a listed file will make Prettier fail the format step again.
Reviewer attention: Confirm each of the four targets exists on disk and that skill-release.json stays out of the glob.

### Leave the version at 6.5.0 and skip bump and publish
Status: discussed
Touches: `package.json`

The format-script fix was applied with the version left at 6.5.0. Qingniao stops a version bump while the worktree has uncommitted changes, so the bump was not run again and the package was not published.

### Archive RFC 0031 once the format script passes
Status: discussed
Touches: `.spec/rfc/completed/0031-qingniao-format.md`

RFC 0031 records the Qingniao format-script fix. It was archived at .spec/rfc/completed/0031-qingniao-format.md after pnpm format and pnpm format:check passed, with the version still at 6.5.0.
