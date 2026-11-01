/**
 * 为一份 RFC 确定 .designify/sdd 工作区，并打印绝对路径。
 * 用法: node sdd-workspace.mjs RFC_FILE
 */
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, realpathSync, writeFileSync } from "node:fs";
import { basename, dirname, extname, isAbsolute, join, relative } from "node:path";
import { pathToFileURL } from "node:url";

export const SDD_RELATIVE_DIR = ".designify/sdd";
const RFC_PATH_FILE = "rfc-path";
const GITIGNORE_NAME = ".gitignore";
const GITIGNORE_BODY = "*\n";

function isDirectRun() {
  const entry = process.argv[1];
  return Boolean(entry) && import.meta.url === pathToFileURL(entry).href;
}

function git(args, cwd) {
  return execFileSync("git", args, { cwd, encoding: "utf8" }).trim();
}

function rfcSlug(rfcFile) {
  const stem = basename(rfcFile, extname(rfcFile));
  if (!stem || stem === "." || stem === "..") {
    throw new Error(`cannot derive a workspace name from: ${rfcFile}`);
  }
  return stem;
}

function rfcIdentity(rfcFile, repoRoot) {
  const absolute = realpathSync(rfcFile);
  const rel = relative(repoRoot, absolute);
  if (rel.startsWith("..") || isAbsolute(rel)) {
    return absolute;
  }
  return rel.split("\\").join("/");
}

function claim(dir, identity) {
  const marker = join(dir, RFC_PATH_FILE);
  if (existsSync(marker)) {
    return readFileSync(marker, "utf8").trim() === identity;
  }
  mkdirSync(dir, { recursive: true });
  writeFileSync(marker, `${identity}\n`);
  return true;
}

/** 返回该 RFC 的工作区绝对路径。同名 RFC 用父目录名区分。 */
export function resolveSddWorkspace(rfcFile) {
  if (!existsSync(rfcFile)) {
    throw new Error(`no such RFC file: ${rfcFile}`);
  }
  const repoRoot = git(["rev-parse", "--show-toplevel"], dirname(rfcFile));
  const identity = rfcIdentity(rfcFile, repoRoot);
  const slug = rfcSlug(rfcFile);
  const base = join(repoRoot, SDD_RELATIVE_DIR);
  mkdirSync(base, { recursive: true });
  writeFileSync(join(base, GITIGNORE_NAME), GITIGNORE_BODY);

  const parent = basename(dirname(realpathSync(rfcFile)));
  const candidates = [slug, `${slug}-${parent}`];
  for (const name of candidates) {
    const dir = join(base, name);
    if (claim(dir, identity)) {
      return realpathSync(dir);
    }
  }
  for (let index = 2; index < 1000; index += 1) {
    const dir = join(base, `${slug}-${parent}-${index}`);
    if (claim(dir, identity)) {
      return realpathSync(dir);
    }
  }
  throw new Error(`could not allocate a workspace for: ${rfcFile}`);
}

if (isDirectRun()) {
  const rfcFile = process.argv[2];
  if (!rfcFile || process.argv.length !== 3) {
    process.stderr.write("usage: node sdd-workspace.mjs RFC_FILE\n");
    process.exit(2);
  }
  try {
    process.stdout.write(`${resolveSddWorkspace(rfcFile)}\n`);
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.exit(2);
  }
}
