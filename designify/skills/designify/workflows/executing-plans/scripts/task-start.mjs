/**
 * 抽出任务 brief，并记录当前 HEAD 作为该任务的 BASE。
 * 用法: node task-start.mjs RFC_FILE TASK_NUMBER
 */
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { resolveSddWorkspace } from "../../subagent-driven-development/scripts/sdd-workspace.mjs";
import { writeTaskBrief } from "../../subagent-driven-development/scripts/task-brief.mjs";

function isDirectRun() {
  const entry = process.argv[1];
  return Boolean(entry) && import.meta.url === pathToFileURL(entry).href;
}

export function startTask(rfcFile, taskNumber) {
  const outFile = join(resolveSddWorkspace(rfcFile), `task-${taskNumber}-brief.md`);
  const brief = writeTaskBrief(readFileSync(rfcFile, "utf8"), taskNumber, outFile);
  const base = execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim();
  return { brief: brief.outFile, base };
}

if (isDirectRun()) {
  const [rfcFile, taskNumber] = process.argv.slice(2);
  if (!rfcFile || !taskNumber || process.argv.length !== 4) {
    process.stderr.write("usage: node task-start.mjs RFC_FILE TASK_NUMBER\n");
    process.exit(2);
  }
  try {
    const started = startTask(rfcFile, taskNumber);
    process.stdout.write(`brief: ${started.brief}\nbase: ${started.base}\n`);
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.exit(2);
  }
}
