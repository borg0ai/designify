/**
 * brainstorm CLI daemon：start 拉起常驻进程并打印 ready，stop 只结束带匹配 server id 的进程。
 */
import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import { mkdir, mkdtemp, readFile, rm, symlink, writeFile } from "node:fs/promises";
import http from "node:http";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const CLI = fileURLToPath(new URL("../dist/brainstorm.js", import.meta.url));
const HTML = "<p>daemon</p>";
const INFO_FILE = "server.json";
const EXIT_OK = 0;
const EXIT_USAGE = 2;
const EXIT_NOT_RUNNING = 3;
const TYPE_READY = "ready";
const TYPE_STOPPED = "stopped";
const TYPE_ERROR = "error";
const TYPE_NOT_RUNNING = "not_running";

function run(args: string[]) {
  return spawnSync(process.execPath, [CLI, ...args], { encoding: "utf8" });
}

function get(url: string): Promise<{ status: number | undefined; text: string }> {
  return new Promise((resolve, reject) => {
    const request = http.get(url, (response) => {
      const chunks: Buffer[] = [];
      response.on("data", (chunk: Buffer) => chunks.push(chunk));
      response.on("end", () => {
        resolve({ status: response.statusCode, text: Buffer.concat(chunks).toString("utf8") });
      });
    });
    request.on("error", reject);
  });
}

async function makeHome() {
  const dir = await mkdtemp(join(tmpdir(), "brainstorm-cli-"));
  const screen = join(dir, "screen.html");
  await writeFile(screen, HTML);
  return { dir, screen, stateDir: join(dir, "state") };
}

async function killRecorded(stateDir: string): Promise<void> {
  try {
    const info = JSON.parse(await readFile(join(stateDir, INFO_FILE), "utf8"));
    process.kill(info.pid, "SIGKILL");
  } catch {
    /* 已经退出，或还没写 server.json */
  }
}

test("符号链接入口仍解析参数", async () => {
  const home = await makeHome();
  const link = join(home.dir, "brainstorm.js");
  await symlink(CLI, link);
  try {
    const result = spawnSync(process.execPath, [link], { encoding: "utf8" });
    assert.equal(result.status, EXIT_USAGE);
    assert.equal(JSON.parse(result.stdout).type, TYPE_ERROR);
  } finally {
    await rm(home.dir, { recursive: true, force: true });
  }
});

test("start 缺少 screen 时退出 2", async () => {
  const home = await makeHome();
  try {
    const result = run(["start", "--state-dir", home.stateDir]);
    assert.equal(result.status, EXIT_USAGE);
    assert.equal(JSON.parse(result.stdout).type, TYPE_ERROR);
  } finally {
    await rm(home.dir, { recursive: true, force: true });
  }
});

test("start 默认脱离父进程，stop 结束该 daemon", async () => {
  const home = await makeHome();
  try {
    const started = run(["start", "--screen", home.screen, "--state-dir", home.stateDir]);
    assert.equal(started.status, EXIT_OK, started.stderr);
    const ready = JSON.parse(started.stdout);
    assert.equal(ready.type, TYPE_READY);
    assert.equal(typeof ready.pid, "number");
    const response = await get(ready.url);
    assert.equal(response.status, 200);
    assert.equal(response.text, HTML);

    const stopped = run(["stop", "--state-dir", home.stateDir]);
    assert.equal(stopped.status, EXIT_OK, stopped.stderr);
    assert.equal(JSON.parse(stopped.stdout).type, TYPE_STOPPED);
    await new Promise((resolve) => {
      setTimeout(resolve, 50);
    });
    assert.throws(() => process.kill(ready.pid, 0));
  } finally {
    await killRecorded(home.stateDir);
    await rm(home.dir, { recursive: true, force: true });
  }
});

test("stop 不向命令行里没有 server id 的进程发信号", async () => {
  const home = await makeHome();
  const impostor = spawn("sleep", ["30"], { stdio: "ignore" });
  try {
    const pid = impostor.pid;
    if (pid === undefined) {
      throw new Error("impostor pid missing");
    }
    await mkdir(home.stateDir, { recursive: true });
    await writeFile(join(home.stateDir, INFO_FILE), JSON.stringify({
      pid,
      serverId: "not-this-process-000000000000000000000000",
      port: 9,
      url: "http://127.0.0.1:9/?key=nope",
    }));
    const stopped = run(["stop", "--state-dir", home.stateDir]);
    assert.equal(stopped.status, EXIT_NOT_RUNNING);
    assert.equal(JSON.parse(stopped.stdout).type, TYPE_NOT_RUNNING);
    process.kill(pid, 0);
  } finally {
    impostor.kill("SIGKILL");
    await rm(home.dir, { recursive: true, force: true });
  }
});
