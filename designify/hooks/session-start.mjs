/**
 * SessionStart hook。读取唯一 skill，按宿主打印 JSON。
 * 由 hooks.json 通过 node 调用。
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { buildHookPayload, buildSessionContext } from "./session-output.mjs";

const SKILL_RELATIVE_PATH = "skills/designify/SKILL.md";
const SKILL_READ_ERROR = "Error reading Designify skill";

function readSkill(pluginRoot) {
  try {
    return readFileSync(join(pluginRoot, SKILL_RELATIVE_PATH), "utf8");
  } catch {
    return SKILL_READ_ERROR;
  }
}

export function createSessionPayload(pluginRoot, env) {
  return buildHookPayload(env, buildSessionContext(readSkill(pluginRoot)));
}

function isDirectRun() {
  const entry = process.argv[1];
  if (!entry) {
    return false;
  }
  return import.meta.url === pathToFileURL(entry).href;
}

if (isDirectRun()) {
  const pluginRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
  const payload = createSessionPayload(pluginRoot, process.env);
  process.stdout.write(`${JSON.stringify(payload, null, 2)}\n`);
}
