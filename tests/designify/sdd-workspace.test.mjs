import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, test } from "vitest";
import { extractTask } from "../../designify/skills/designify/workflows/subagent-driven-development/scripts/task-brief.mjs";
import {
  resolveSddWorkspace,
  SDD_RELATIVE_DIR,
} from "../../designify/skills/designify/workflows/subagent-driven-development/scripts/sdd-workspace.mjs";

const SDD_DIR = ".designify/sdd";
const RFC = `---
name: sample
---

### Task 1: First

Do the first thing.

\`\`\`
### Task 9: not a task
\`\`\`

### Task 2: Second

Do the second thing.
`;

function git(cwd, args) {
  execFileSync("git", args, { cwd, stdio: "ignore" });
}

describe("SDD 工作区", () => {
  test("抽出 Task 1，忽略围栏里的标题", () => {
    const body = extractTask(RFC, 1);
    expect(body).toMatch(/Task 1: First/);
    expect(body).toMatch(/Task 9: not a task/);
    expect(body).not.toMatch(/Task 2: Second/);
  });

  test("工作区落在 .designify/sdd，同名 RFC 分开存放", () => {
    const root = mkdtempSync(join(tmpdir(), "designify-sdd-"));
    git(root, ["init"]);
    git(root, ["config", "user.email", "designify@example.com"]);
    git(root, ["config", "user.name", "Designify"]);
    mkdirSync(join(root, "docs", "alpha"), { recursive: true });
    mkdirSync(join(root, "docs", "beta"), { recursive: true });
    const alpha = join(root, "docs", "alpha", "feature.md");
    const beta = join(root, "docs", "beta", "feature.md");
    writeFileSync(alpha, RFC);
    writeFileSync(beta, RFC);
    writeFileSync(join(root, "README.md"), "designify\n");
    git(root, ["add", "."]);
    git(root, ["commit", "-m", "init"]);
    try {
      const first = resolveSddWorkspace(alpha);
      const again = resolveSddWorkspace(alpha);
      const second = resolveSddWorkspace(beta);
      expect(first).toBe(again);
      expect(first).toMatch(/\.designify\/sdd\/feature$/);
      expect(second).toMatch(/\.designify\/sdd\/feature-beta$/);
      expect(SDD_RELATIVE_DIR).toBe(SDD_DIR);
      expect(readFileSync(join(root, ".designify", "sdd", ".gitignore"), "utf8")).toBe("*\n");
      expect(readFileSync(join(first, "rfc-path"), "utf8").trim()).toBe("docs/alpha/feature.md");
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});
