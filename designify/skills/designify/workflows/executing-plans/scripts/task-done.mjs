/**
 * 跑测试。成功才把 Task N 记入 .designify/sdd 账本。
 * 用法: node task-done.mjs RFC_FILE TASK_NUMBER BASE -- TEST_COMMAND [ARGS...]
 */
import { execFileSync, spawnSync } from "node:child_process";
import { appendFileSync, existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { resolveSddWorkspace } from "../../subagent-driven-development/scripts/sdd-workspace.mjs";

const SEPARATOR = "--";
const MIN_ARGS = 5;

function isDirectRun() {
  const entry = process.argv[1];
  return Boolean(entry) && import.meta.url === pathToFileURL(entry).href;
}

function git(args) {
  return execFileSync("git", args, { encoding: "utf8" }).trim();
}

export function quoteCommand(args) {
  return args
    .map((arg) => (/[\s";&|]/.test(arg) ? `'${arg}'` : arg))
    .join(" ");
}

export function finishTask({ rfcFile, taskNumber, base, command, cwd }) {
  git(["rev-parse", "--verify", "--quiet", base]);
  const dir = resolveSddWorkspace(rfcFile);
  const logFile = join(dir, `task-${taskNumber}-tests.log`);
  const ledger = join(dir, "progress.md");
  const [bin, ...args] = command;
  const result = spawnSync(bin, args, { cwd, encoding: "utf8" });
  const output = `${result.stdout ?? ""}${result.stderr ?? ""}`;
  writeFileSync(logFile, output);
  const tail = output.split("\n").filter((line) => line !== "").slice(-5);
  const status = result.status ?? 1;
  if (status !== 0) {
    return { status, logFile, tail, ledgerLine: "" };
  }
  const last = tail.at(-1) ?? "";
  if (!existsSync(ledger)) {
    writeFileSync(ledger, `# SDD ledger — RFC: ${rfcFile}\n`);
  }
  const short = (rev) => git(["rev-parse", `--short=7`, rev]);
  const ledgerLine = `Task ${taskNumber}: complete (commits ${short(base)}..${short("HEAD")}, tests: ${quoteCommand(command)} → ${last})`;
  appendFileSync(ledger, `${ledgerLine}\n`);
  return { status: 0, logFile, tail, ledgerLine };
}

if (isDirectRun()) {
  const argv = process.argv.slice(2);
  const separator = argv.indexOf(SEPARATOR);
  if (argv.length < MIN_ARGS || separator !== 3) {
    process.stderr.write("usage: node task-done.mjs RFC_FILE TASK_NUMBER BASE -- TEST_COMMAND [ARGS...]\n");
    process.exit(2);
  }
  const [rfcFile, taskNumber, base] = argv;
  try {
    const finished = finishTask({
      rfcFile,
      taskNumber,
      base,
      command: argv.slice(separator + 1),
      cwd: process.cwd(),
    });
    if (finished.tail.length > 0) {
      process.stdout.write(`${finished.tail.join("\n")}\n`);
    }
    if (finished.status !== 0) {
      process.stderr.write(`task-done: test command exited ${finished.status}; Task ${taskNumber} NOT recorded (full output: ${finished.logFile})\n`);
      process.exit(finished.status);
    }
    process.stdout.write(`ledger: ${finished.ledgerLine}\n`);
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.exit(2);
  }
}
