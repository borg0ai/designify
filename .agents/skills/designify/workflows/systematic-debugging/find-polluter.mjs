/**
 * 逐个跑测试，找出第一个制造指定文件或目录的用例。
 * 用法: node find-polluter.mjs <file_or_dir_to_check> <test_pattern>
 */
import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { pathToFileURL } from "node:url";

const USAGE = "Usage: node find-polluter.mjs <file_to_check> <test_pattern>";
const EXAMPLE = "Example: node find-polluter.mjs '.git' 'src/**/*.test.ts'";
const SKIP_DIRS = new Set(["node_modules"]);
const EXPECTED_ARG_COUNT = 2;

function isDirectRun() {
  const entry = process.argv[1];
  return Boolean(entry) && import.meta.url === pathToFileURL(entry).href;
}

function globToRegExp(pattern) {
  let source = "";
  for (let index = 0; index < pattern.length; index += 1) {
    if (pattern.slice(index, index + 3) === "**/") {
      source += "(?:.*/)?";
      index += 2;
      continue;
    }
    const char = pattern[index];
    if (char === "*") {
      source += "[^/]*";
    } else if ("\\.+^${}()|[]".includes(char)) {
      source += `\\${char}`;
    } else {
      source += char;
    }
  }
  return new RegExp(`^${source}$`);
}

function patternList(rawPattern) {
  const stripped = rawPattern.replace(/^\.\//, "");
  const collapsed = stripped.replace(/\*\*\//g, "");
  return [...new Set([stripped, collapsed])].map(globToRegExp);
}

export function collectTestFiles(rootDir, rawPattern) {
  const matchers = patternList(rawPattern);
  const found = [];

  function walk(dir) {
    for (const name of readdirSync(dir)) {
      if (SKIP_DIRS.has(name)) {
        continue;
      }
      const fullPath = join(dir, name);
      const info = statSync(fullPath);
      if (info.isDirectory()) {
        walk(fullPath);
        continue;
      }
      const rel = relative(rootDir, fullPath).split("\\").join("/");
      if (matchers.some((matcher) => matcher.test(rel))) {
        found.push(rel);
      }
    }
  }

  walk(rootDir);
  found.sort();
  return found;
}

function printUsage() {
  process.stdout.write(`${USAGE}\n${EXAMPLE}\n`);
}

export function runPolluterSearch(rootDir, pollutionCheck, testPattern, runTest) {
  if (!pollutionCheck || !testPattern) {
    printUsage();
    return 1;
  }

  const testFiles = collectTestFiles(rootDir, testPattern);
  process.stdout.write(`Searching for test that creates: ${pollutionCheck}\n`);
  process.stdout.write(`Test pattern: ${testPattern}\n\n`);
  process.stdout.write(`Found ${testFiles.length} test files\n\n`);

  for (let index = 0; index < testFiles.length; index += 1) {
    const testFile = testFiles[index];
    const label = `[${index + 1}/${testFiles.length}]`;
    if (existsSync(join(rootDir, pollutionCheck))) {
      process.stdout.write(`Pollution already exists before test ${index + 1}/${testFiles.length}\n`);
      process.stdout.write(`   Skipping: ${testFile}\n`);
      continue;
    }
    process.stdout.write(`${label} Testing: ${testFile}\n`);
    runTest(testFile);
    if (existsSync(join(rootDir, pollutionCheck))) {
      const stat = statSync(join(rootDir, pollutionCheck));
      process.stdout.write(`\nFOUND POLLUTER!\n   Test: ${testFile}\n   Created: ${pollutionCheck}\n\n`);
      process.stdout.write(`Pollution details:\n${stat.mode.toString(8)} ${stat.size} ${pollutionCheck}\n\n`);
      process.stdout.write(`To investigate:\n  npm test ${testFile}\n  cat ${testFile}\n`);
      return 1;
    }
  }

  process.stdout.write("\nNo polluter found - all tests clean!\n");
  return 0;
}

function npmTest(testFile) {
  spawnSync("npm", ["test", testFile], {
    stdio: "ignore",
    shell: process.platform === "win32",
  });
}

if (isDirectRun()) {
  if (process.argv.length !== EXPECTED_ARG_COUNT + 2) {
    printUsage();
    process.exit(1);
  }
  const code = runPolluterSearch(process.cwd(), process.argv[2], process.argv[3], npmTest);
  process.exit(code);
}
