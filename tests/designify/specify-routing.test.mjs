import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

const SKILL_ROOT = join(import.meta.dirname, "..", "..", "designify", "skills", "designify");
const SKILL_MD = join(SKILL_ROOT, "SKILL.md");
const WORKFLOWS_ROOT = join(SKILL_ROOT, "workflows");

function read(path) {
  return readFileSync(path, "utf8");
}

function workflowMd(name) {
  return join(WORKFLOWS_ROOT, name, "workflow.md");
}

describe("specify 路由与工作流契约", () => {
  test("SKILL.md 将持久变更路由到 Specify", () => {
    const skill = read(SKILL_MD);
    expect(skill).toMatch(/specify/i);
    expect(skill).toMatch(/\.spec\//);
    expect(skill).toMatch(/TASK_TRACKING/);
    expect(skill).toMatch(/approved RFC/);
  });

  test("SKILL.md 路由表引用的工作流文件都存在", () => {
    const skill = read(SKILL_MD);
    const refs = [...skill.matchAll(/`workflows\/([^`]+)`/g)].map((match) => match[1]);
    expect(refs.length).toBeGreaterThan(0);
    for (const ref of refs) {
      expect(existsSync(join(WORKFLOWS_ROOT, ref)), ref).toBe(true);
    }
  });

  test("设计与计划工作流以 Specify RFC 为唯一计划载体", () => {
    for (const name of ["brainstorming", "writing-plans"]) {
      const text = read(workflowMd(name));
      expect(text, name).toMatch(/Specify/);
      expect(text, name).toMatch(/\.spec\//);
      expect(text, name).toMatch(/parallel|second plan/i);
    }
  });

  test("设计工作流要求 RFC 批准后推进状态，提交前 sync-check", () => {
    for (const name of ["brainstorming", "writing-plans"]) {
      const text = read(workflowMd(name));
      expect(text, name).toMatch(/advance <id> Approved/);
      expect(text, name).toMatch(/sync-check/);
    }
  });

  test("执行工作流消费已批准 RFC，不另立计划或状态账本", () => {
    for (const name of ["executing-plans", "test-driven-development", "subagent-driven-development"]) {
      const text = read(workflowMd(name));
      expect(text, name).toMatch(/approved RFC/);
      expect(text, name).toMatch(/Specify/);
      expect(text, name).toMatch(/execution evidence|status authority/);
    }
  });

  test("工作流文件不引用旧品牌", () => {
    const retiredBrand = new RegExp(["super", "power"].join(""), "i");
    const names = readdirSync(WORKFLOWS_ROOT).filter((name) =>
      statSync(join(WORKFLOWS_ROOT, name)).isDirectory(),
    );
    expect(names.length).toBeGreaterThan(0);
    for (const name of names) {
      const file = workflowMd(name);
      if (!existsSync(file)) continue;
      expect(read(file), name).not.toMatch(retiredBrand);
    }
  });
});
