/**
 * CLI daemon。默认 start 会脱离父进程；--foreground 让当前进程一直听着。
 * stop 只在 ps 命令行包含本次 --server-id= 时发 SIGTERM。
 */
import { execFileSync, spawn } from "node:child_process";
import { randomBytes } from "node:crypto";
import {
  appendFileSync,
  chmodSync,
  existsSync,
  mkdirSync,
  readFileSync,
  statSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import {
  COMMAND_START,
  EVENTS_FILE,
  EXIT_NOT_RUNNING,
  EXIT_OK,
  EXIT_USAGE,
  FLAG_FOREGROUND,
  FLAG_HOST,
  FLAG_SCREEN,
  FLAG_STATE_DIR,
  INFO_FILE,
  PID_FILE,
  SERVER_ID_PREFIX,
  TYPE_CHOICE,
  TYPE_ERROR,
  TYPE_NOT_RUNNING,
  TYPE_READY,
  TYPE_STOPPED,
  URL_HOST,
  USAGE_MESSAGE,
  type CliOptions,
} from "./cli-args.ts";
import { QUERY_KEY } from "./constants.ts";
import { startServer } from "./server.ts";

const STATE_PARENT = ".designify";
const STATE_NAME = "brainstorm";
const FILE_MODE = 0o600;
const DIR_MODE = 0o700;
const POLL_TIMES = 50;
const STOP_POLLS = 20;
const POLL_MS = 100;
const SERVER_ID_BYTES = 24;
const TOKEN_BYTES = 32;

export type DaemonInfo = {
  type: typeof TYPE_READY;
  pid: number;
  port: number;
  serverId: string;
  url: string;
};

export function defaultStateDir(cwd: string = process.cwd()): string {
  return join(cwd, STATE_PARENT, STATE_NAME);
}

function writeLine(payload: object): void {
  process.stdout.write(`${JSON.stringify(payload)}\n`);
}

function infoPath(stateDir: string): string {
  return join(stateDir, INFO_FILE);
}

export function isAlive(pid: number): boolean {
  if (!Number.isInteger(pid) || pid <= 0) {
    return false;
  }
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

export function commandLine(pid: number): string {
  try {
    return execFileSync("ps", ["-p", String(pid), "-o", "command="], { encoding: "utf8" });
  } catch {
    return "";
  }
}

/** 命令行里必须有本次启动写入的 --server-id=，避免误杀复用了 pid 的别的进程。 */
export function ownsDaemon(pid: number, serverId: string): boolean {
  if (serverId.length === 0) {
    return false;
  }
  return commandLine(pid).includes(`${SERVER_ID_PREFIX}${serverId}`);
}

function readInfo(stateDir: string | null): DaemonInfo | null {
  if (!stateDir) {
    return null;
  }
  const file = infoPath(stateDir);
  if (!existsSync(file)) {
    return null;
  }
  const parsed: unknown = JSON.parse(readFileSync(file, "utf8"));
  if (!parsed || typeof parsed !== "object") {
    return null;
  }
  const info = parsed as Partial<DaemonInfo>;
  if (typeof info.pid !== "number" || typeof info.serverId !== "string" || typeof info.port !== "number" || typeof info.url !== "string") {
    return null;
  }
  return {
    type: TYPE_READY,
    pid: info.pid,
    port: info.port,
    serverId: info.serverId,
    url: info.url,
  };
}

function clearState(stateDir: string): void {
  for (const name of [INFO_FILE, PID_FILE]) {
    const file = join(stateDir, name);
    if (existsSync(file)) {
      unlinkSync(file);
    }
  }
}

function writeInfo(stateDir: string, info: DaemonInfo): void {
  mkdirSync(stateDir, { recursive: true, mode: DIR_MODE });
  const file = infoPath(stateDir);
  writeFileSync(file, `${JSON.stringify(info)}\n`, { mode: FILE_MODE });
  chmodSync(file, FILE_MODE);
  const pidFile = join(stateDir, PID_FILE);
  writeFileSync(pidFile, `${info.pid}\n`, { mode: FILE_MODE });
  chmodSync(pidFile, FILE_MODE);
}

function publicUrl(port: number, token: string): string {
  const url = new URL(`http://${URL_HOST}:${port}/`);
  url.searchParams.set(QUERY_KEY, token);
  return url.toString();
}

function isScreenFile(screen: string | null): screen is string {
  if (!screen) {
    return false;
  }
  return existsSync(screen) && statSync(screen).isFile();
}

export async function runForeground(options: CliOptions): Promise<never> {
  if (!isScreenFile(options.screen)) {
    throw new TypeError("screen must be a file");
  }
  const stateDir = options.stateDir ?? defaultStateDir();
  const html = readFileSync(options.screen, "utf8");
  const token = randomBytes(TOKEN_BYTES).toString("hex");
  const serverId = options.serverId ?? randomBytes(SERVER_ID_BYTES).toString("hex");
  const eventsFile = join(stateDir, EVENTS_FILE);
  mkdirSync(stateDir, { recursive: true, mode: DIR_MODE });
  const session = await startServer({
    html,
    token,
    host: options.host,
    onChoice(event) {
      appendFileSync(eventsFile, `${JSON.stringify({ type: TYPE_CHOICE, ...event })}\n`);
    },
  });
  const info: DaemonInfo = {
    type: TYPE_READY,
    pid: process.pid,
    port: session.port,
    serverId,
    url: publicUrl(session.port, token),
  };
  let closing = false;
  const shutdown = async (): Promise<void> => {
    if (closing) {
      return;
    }
    closing = true;
    await session.close();
    clearState(stateDir);
    process.exit(EXIT_OK);
  };
  process.on("SIGTERM", () => {
    void shutdown();
  });
  process.on("SIGINT", () => {
    void shutdown();
  });
  writeInfo(stateDir, info);
  writeLine(info);
  return new Promise(() => {});
}

export async function startDetached(options: CliOptions, cliPath: string, execPath: string = process.execPath): Promise<DaemonInfo> {
  if (!options.screen) {
    throw new TypeError("screen is required");
  }
  const stateDir = options.stateDir ?? defaultStateDir();
  const serverId = options.serverId ?? randomBytes(SERVER_ID_BYTES).toString("hex");
  mkdirSync(stateDir, { recursive: true, mode: DIR_MODE });
  clearState(stateDir);
  const child = spawn(execPath, [
    cliPath,
    COMMAND_START,
    FLAG_FOREGROUND,
    `${SERVER_ID_PREFIX}${serverId}`,
    FLAG_SCREEN,
    options.screen,
    FLAG_HOST,
    options.host,
    FLAG_STATE_DIR,
    stateDir,
  ], { detached: true, stdio: "ignore" });
  child.unref();
  for (let attempt = 0; attempt < POLL_TIMES; attempt += 1) {
    const info = readInfo(stateDir);
    if (info && isAlive(info.pid) && ownsDaemon(info.pid, info.serverId)) {
      return info;
    }
    await delay(POLL_MS);
  }
  throw new Error("daemon did not become ready");
}

export async function stopDaemon(stateDir: string = defaultStateDir()): Promise<number> {
  const info = readInfo(stateDir);
  if (!info || !isAlive(info.pid) || !ownsDaemon(info.pid, info.serverId)) {
    if (info) {
      clearState(stateDir);
    }
    writeLine({ type: TYPE_NOT_RUNNING });
    return EXIT_NOT_RUNNING;
  }
  process.kill(info.pid, "SIGTERM");
  for (let attempt = 0; attempt < STOP_POLLS; attempt += 1) {
    if (!isAlive(info.pid)) {
      break;
    }
    await delay(POLL_MS);
  }
  if (isAlive(info.pid)) {
    process.kill(info.pid, "SIGKILL");
  }
  clearState(stateDir);
  writeLine({ type: TYPE_STOPPED, pid: info.pid });
  return EXIT_OK;
}

export async function runCli(options: CliOptions, cliPath: string): Promise<number> {
  if (options.command !== COMMAND_START) {
    return stopDaemon(options.stateDir ?? defaultStateDir());
  }
  if (!isScreenFile(options.screen)) {
    writeLine({ type: TYPE_ERROR, message: USAGE_MESSAGE });
    return EXIT_USAGE;
  }
  if (options.foreground) {
    return runForeground(options);
  }
  const info = await startDetached(options, cliPath);
  writeLine(info);
  return EXIT_OK;
}
