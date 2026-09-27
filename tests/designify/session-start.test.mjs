import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, test } from "vitest";
import { createSessionPayload } from "../../designify/hooks/session-start.mjs";
import { buildHookPayload, selectOutputShape } from "../../designify/hooks/session-output.mjs";

const PLUGIN_ROOT = join(import.meta.dirname, "..", "..", "designify");
const HOOKS_JSON = join(PLUGIN_ROOT, "hooks", "hooks.json");
const SESSION_START_MJS = "session-start.mjs";
const SHAPE_SDK = "sdk";
const EVENT_SESSION_START = "SessionStart";

describe("SessionStart hook", () => {
  test("hooks.json 只调用 session-start.mjs", () => {
    const hooks = JSON.parse(readFileSync(HOOKS_JSON, "utf8"));
    const entry = hooks.hooks.SessionStart[0].hooks[0];
    expect(entry.type).toBe("command");
    expect(entry.shell).toBeUndefined();
    expect(entry.command).toMatch(new RegExp(`hooks/${SESSION_START_MJS}"$`));
    expect(entry.command).not.toMatch(/run-hook\.cmd|session-start"/);
  });

  test("Cursor 只输出 additional_context", () => {
    const payload = buildHookPayload(
      { CURSOR_PLUGIN_ROOT: "/plugin", CLAUDE_PLUGIN_ROOT: "/plugin" },
      "body",
    );
    expect(Object.keys(payload)).toEqual(["additional_context"]);
    expect(payload.additional_context).toBe("body");
  });

  test("Claude Code 输出嵌套 additionalContext", () => {
    const payload = buildHookPayload({ CLAUDE_PLUGIN_ROOT: "/plugin" }, "body");
    expect(payload.hookSpecificOutput.hookEventName).toBe(EVENT_SESSION_START);
    expect(payload.hookSpecificOutput.additionalContext).toBe("body");
    expect(payload.additionalContext).toBeUndefined();
    expect(payload.additional_context).toBeUndefined();
  });

  test("Copilot CLI 输出顶层 additionalContext", () => {
    expect(selectOutputShape({ COPILOT_CLI: "1", CLAUDE_PLUGIN_ROOT: "/plugin" })).toBe(SHAPE_SDK);
    expect(buildHookPayload({ COPILOT_CLI: "1", CLAUDE_PLUGIN_ROOT: "/plugin" }, "body")).toEqual({
      additionalContext: "body",
    });
  });

  test("读取唯一 skill", () => {
    const payload = createSessionPayload(PLUGIN_ROOT, { CLAUDE_PLUGIN_ROOT: PLUGIN_ROOT });
    const context = payload.hookSpecificOutput.additionalContext;
    expect(context).toMatch(/name: designify/);
    expect(context).toMatch(/workflows\/brainstorming\/workflow\.md/);
  });

  test("skill 缺失时仍输出错误文本", () => {
    const emptyRoot = mkdtempSync(join(tmpdir(), "designify-hook-"));
    try {
      const payload = createSessionPayload(emptyRoot, {});
      expect(payload.additionalContext).toMatch(/Error reading Designify skill/);
    } finally {
      rmSync(emptyRoot, { recursive: true, force: true });
    }
  });

  test("node 入口可执行", () => {
    const script = join(PLUGIN_ROOT, "hooks", SESSION_START_MJS);
    const result = spawnSync(process.execPath, [script], {
      env: { ...process.env, CLAUDE_PLUGIN_ROOT: PLUGIN_ROOT },
      encoding: "utf8",
    });
    expect(result.status, result.stderr).toBe(0);
    expect(JSON.parse(result.stdout).hookSpecificOutput.hookEventName).toBe(EVENT_SESSION_START);
  });
});
