import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";
import {
  collectTestFiles,
  runPolluterSearch,
} from "../../designify/skills/designify/workflows/systematic-debugging/find-polluter.mjs";

const REPO_ROOT = join(import.meta.dirname, "..", "..");
const DESIGNIFY_ROOT = join(REPO_ROOT, "designify");
const CLI_PACKAGE_ROOT = join(REPO_ROOT, "packages/brainstorm-server");
const BRAINSTORMING_ROOT = join(DESIGNIFY_ROOT, "skills/designify/workflows/brainstorming");
const SCRIPTS_ROOT = join(BRAINSTORMING_ROOT, "scripts");
const VISUAL_COMPANION = join(BRAINSTORMING_ROOT, "visual-companion.md");
const BRAINSTORMING_WORKFLOW = join(BRAINSTORMING_ROOT, "workflow.md");

/** 旧启动器的文件名。Task 1 删除后这些断言必须保持成立。 */
const LEGACY_LAUNCHER_NAMES = [
  "start-server.mjs",
  "stop-server.mjs",
  "launch-args.mjs",
  "server.cjs",
  "frame-template.html",
  "helper.js",
];

const CLI_PACKAGE_SPEC = "@borg0ai/brainstorm-server";

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

/** 取出文档里所有 `npx -y @borg0ai/brainstorm-server@<version>` 的版本。 */
function documentedVersions(markdown) {
  const pattern = new RegExp(`npx -y ${CLI_PACKAGE_SPEC}@(\\d+\\.\\d+\\.\\d+)`, "g");
  return [...markdown.matchAll(pattern)].map((match) => match[1]);
}

describe("brainstorm CLI 打包与调用", () => {
  test("插件不再携带旧启动器脚本", () => {
    expect(existsSync(SCRIPTS_ROOT)).toBe(false);
    for (const name of LEGACY_LAUNCHER_NAMES) {
      expect(existsSync(join(BRAINSTORMING_ROOT, name))).toBe(false);
    }
  });

  test("CLI 源码存在且声明了可发布的 bin", () => {
    expect(existsSync(join(CLI_PACKAGE_ROOT, "src/brainstorm.ts"))).toBe(true);
    expect(existsSync(join(CLI_PACKAGE_ROOT, "src/cli-args.ts"))).toBe(true);
    const manifest = readJson(join(CLI_PACKAGE_ROOT, "package.json"));
    expect(manifest.name).toBe(CLI_PACKAGE_SPEC);
    expect(manifest.bin.brainstorm).toBe("./dist/brainstorm.js");
    expect(manifest.files).toEqual(["dist"]);
    expect(manifest.publishConfig.access).toBe("public");
    expect(manifest.dependencies ?? {}).toEqual({});
  });

  test("文档里的 CLI 版本与 CLI 包、插件版本一致", () => {
    const cliVersion = readJson(join(CLI_PACKAGE_ROOT, "package.json")).version;
    const pluginVersion = readJson(join(DESIGNIFY_ROOT, ".plugin/plugin.json")).version;
    expect(pluginVersion).toBe(cliVersion);

    for (const doc of [VISUAL_COMPANION, BRAINSTORMING_WORKFLOW]) {
      const versions = documentedVersions(readFileSync(doc, "utf8"));
      expect(versions.length).toBeGreaterThan(0);
      for (const version of versions) {
        expect(version).toBe(cliVersion);
      }
    }
  });

  test("文档不再让 agent 用 pnpm exec 调用本地 CLI", () => {
    for (const doc of [VISUAL_COMPANION, BRAINSTORMING_WORKFLOW]) {
      expect(readFileSync(doc, "utf8")).not.toMatch(/pnpm exec brainstorm/);
    }
  });

  test("CLI 测试目录不再引用已删除的 shell 启动器", () => {
    const offenders = [];
    for (const name of readdirSync(join(CLI_PACKAGE_ROOT, "tests"))) {
      if (!name.endsWith(".sh") && !name.endsWith(".js")) {
        continue;
      }
      const text = readFileSync(join(CLI_PACKAGE_ROOT, "tests", name), "utf8");
      if (/start-server\.sh|stop-server\.sh|skills\/brainstorming\/scripts/.test(text)) {
        offenders.push(name);
      }
    }
    expect(offenders).toEqual([]);
  });
});

describe("find-polluter", () => {
  test("匹配测试文件并在命中后停止", async () => {
    const { mkdtempSync, mkdirSync, writeFileSync, rmSync } = await import("node:fs");
    const { tmpdir } = await import("node:os");
    const root = mkdtempSync(join(tmpdir(), "designify-polluter-"));
    mkdirSync(join(root, "src", "nested"), { recursive: true });
    mkdirSync(join(root, "node_modules"), { recursive: true });
    writeFileSync(join(root, "src", "top.test.ts"), "top");
    writeFileSync(join(root, "src", "nested", "deep.test.ts"), "deep");
    writeFileSync(join(root, "node_modules", "skip.test.ts"), "skip");
    try {
      expect(collectTestFiles(root, "src/**/*.test.ts")).toEqual([
        "src/nested/deep.test.ts",
        "src/top.test.ts",
      ]);
      const ran = [];
      const code = runPolluterSearch(root, "pollution.txt", "src/**/*.test.ts", (testFile) => {
        ran.push(testFile);
        if (testFile.endsWith("deep.test.ts")) {
          writeFileSync(join(root, "pollution.txt"), "dirty");
        }
      });
      expect(code).toBe(1);
      expect(ran).toEqual(["src/nested/deep.test.ts"]);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});

describe("插件包", () => {
  test("designify 目录不再包含 shell 脚本", () => {
    const shells = [];
    function walk(dir) {
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const full = join(dir, entry.name);
        if (entry.isDirectory()) {
          walk(full);
        } else if (entry.name.endsWith(".sh") || entry.name.endsWith(".cmd")) {
          shells.push(full);
        }
      }
    }
    walk(DESIGNIFY_ROOT);
    expect(shells).toEqual([]);
  });
});
