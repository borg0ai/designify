/**
 * 把 BASE..HEAD 的提交、统计和 diff 写成审阅包。
 * 用法: node review-package.mjs RFC_FILE BASE HEAD [OUTFILE]
 */
import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { resolveSddWorkspace } from "./sdd-workspace.mjs";

function isDirectRun() {
  const entry = process.argv[1];
  return Boolean(entry) && import.meta.url === pathToFileURL(entry).href;
}

function git(args, cwd) {
  return execFileSync("git", args, { cwd, encoding: "utf8" }).trim();
}

function verifyRevision(cwd, revision, label) {
  try {
    git(["rev-parse", "--verify", "--quiet", revision], cwd);
  } catch {
    throw new Error(`bad ${label}: ${revision}`);
  }
}

export function buildReviewPackage(cwd, base, head) {
  verifyRevision(cwd, base, "BASE");
  verifyRevision(cwd, head, "HEAD");
  try {
    execFileSync("git", ["merge-base", "--is-ancestor", base, head], { cwd, stdio: "ignore" });
  } catch {
    throw new Error(`HEAD is not a descendant of BASE: ${base}..${head}`);
  }
  const count = Number(git(["rev-list", "--count", `${base}..${head}`], cwd));
  if (count < 1) {
    throw new Error(`empty commit range: ${base}..${head}`);
  }
  const commits = git(["log", "--oneline", `${base}..${head}`], cwd);
  const stat = git(["diff", "--stat", `${base}..${head}`], cwd);
  const diff = execFileSync("git", ["diff", "-U10", `${base}..${head}`], { cwd, encoding: "utf8" });
  const body = `# Review package: ${base}..${head}\n\n## Commits\n${commits}\n\n## Files changed\n${stat}\n\n## Diff\n${diff}`;
  return { body, commits: count };
}

if (isDirectRun()) {
  const [rfcFile, base, head, explicitOut] = process.argv.slice(2);
  if (!rfcFile || !base || !head || process.argv.length > 6) {
    process.stderr.write("usage: node review-package.mjs RFC_FILE BASE HEAD [OUTFILE]\n");
    process.exit(2);
  }
  try {
    const cwd = process.cwd();
    const short = (rev) => git(["rev-parse", "--short", rev], cwd);
    const outFile = explicitOut
      ?? join(resolveSddWorkspace(rfcFile), `review-${short(base)}..${short(head)}.diff`);
    const review = buildReviewPackage(cwd, base, head);
    writeFileSync(outFile, review.body);
    process.stdout.write(`wrote ${outFile}: ${review.commits} commit(s), ${Buffer.byteLength(review.body)} bytes\n`);
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    const missingRange = error.message.startsWith("HEAD is not") || error.message.startsWith("empty commit");
    process.exit(missingRange ? 3 : 2);
  }
}
