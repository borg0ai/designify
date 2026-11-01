/**
 * 从 RFC 抽出一个 Task 的全文，写到该 RFC 的 .designify/sdd 工作区。
 * 用法: node task-brief.mjs RFC_FILE TASK_NUMBER [OUTFILE]
 */
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { resolveSddWorkspace } from "./sdd-workspace.mjs";

const TASK_HEADING = /^(#+[ \t]+Task[ \t]+)(\d+)([^0-9]|$)/;
const FENCE = /^```/;

function isDirectRun() {
  const entry = process.argv[1];
  return Boolean(entry) && import.meta.url === pathToFileURL(entry).href;
}

/** 抽出 Task N 的正文，含标题。代码围栏里的伪标题不算任务边界。 */
export function extractTask(markdown, taskNumber) {
  const target = String(taskNumber);
  let inFence = false;
  let inTask = false;
  const lines = [];
  for (const line of markdown.split(/\r?\n/)) {
    if (FENCE.test(line)) {
      inFence = !inFence;
    } else if (!inFence && TASK_HEADING.test(line)) {
      inTask = TASK_HEADING.exec(line)[2] === target;
    }
    if (inTask) {
      lines.push(line);
    }
  }
  return lines.length === 0 ? "" : `${lines.join("\n")}\n`;
}

export function writeTaskBrief(rfcText, taskNumber, outFile) {
  const body = extractTask(rfcText, taskNumber);
  if (!body.trim()) {
    throw new Error(`task ${taskNumber} not found (no heading matching 'Task ${taskNumber}')`);
  }
  writeFileSync(outFile, body);
  const lineCount = body.split("\n").filter((line, index, all) => index < all.length - 1 || line !== "").length;
  return { outFile, lineCount };
}

if (isDirectRun()) {
  const [rfcFile, taskNumber, explicitOut] = process.argv.slice(2);
  if (!rfcFile || !taskNumber || process.argv.length > 5) {
    process.stderr.write("usage: node task-brief.mjs RFC_FILE TASK_NUMBER [OUTFILE]\n");
    process.exit(2);
  }
  try {
    const { readFileSync } = await import("node:fs");
    const outFile = explicitOut ?? join(resolveSddWorkspace(rfcFile), `task-${taskNumber}-brief.md`);
    const result = writeTaskBrief(readFileSync(rfcFile, "utf8"), taskNumber, outFile);
    process.stdout.write(`wrote ${result.outFile}: ${result.lineCount} lines\n`);
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.exit(error.message.startsWith("task ") ? 3 : 2);
  }
}
