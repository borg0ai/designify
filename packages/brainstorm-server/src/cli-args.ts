/** 解析 brainstorm CLI 参数。不碰进程和文件系统。 */
import { DEFAULT_HOST } from "./constants.ts";

export const COMMAND_START = "start";
export const COMMAND_STOP = "stop";
export const FLAG_SCREEN = "--screen";
export const FLAG_HOST = "--host";
export const FLAG_STATE_DIR = "--state-dir";
export const FLAG_FOREGROUND = "--foreground";
export const FLAG_SERVER_ID = "--server-id";
export const SERVER_ID_PREFIX = "--server-id=";

export const EXIT_OK = 0;
export const EXIT_USAGE = 2;
export const EXIT_NOT_RUNNING = 3;
export const EXIT_START_FAILED = 4;

export const TYPE_READY = "ready";
export const TYPE_STOPPED = "stopped";
export const TYPE_ERROR = "error";
export const TYPE_NOT_RUNNING = "not_running";
export const TYPE_CHOICE = "choice";

export const INFO_FILE = "server.json";
export const PID_FILE = "server.pid";
export const EVENTS_FILE = "events";
export const URL_HOST = "localhost";
export const USAGE_MESSAGE = "usage: brainstorm start --screen <file> [--state-dir <dir>] [--foreground] | brainstorm stop [--state-dir <dir>]";

const LOOPBACK_HOSTS = new Set([DEFAULT_HOST, URL_HOST]);
const VALUE_FLAGS = new Set([FLAG_SCREEN, FLAG_HOST, FLAG_STATE_DIR, FLAG_SERVER_ID]);

export type CliCommand = typeof COMMAND_START | typeof COMMAND_STOP;

export type CliOptions = {
  ok: true;
  command: CliCommand;
  host: string;
  foreground: boolean;
  screen: string | null;
  stateDir: string | null;
  serverId: string | null;
};

export type ParsedArgs = CliOptions | { ok: false; message: string };

function assignFlag(options: CliOptions, flag: string, value: string): void {
  if (flag === FLAG_SCREEN) {
    options.screen = value;
  } else if (flag === FLAG_HOST) {
    options.host = value;
  } else if (flag === FLAG_STATE_DIR) {
    options.stateDir = value;
  } else if (flag === FLAG_SERVER_ID) {
    options.serverId = value;
  }
}

/** argv 是 process.argv.slice(2)。 */
export function parseArgs(argv: string[]): ParsedArgs {
  const command = argv[0];
  if (command !== COMMAND_START && command !== COMMAND_STOP) {
    return { ok: false, message: USAGE_MESSAGE };
  }
  const options: CliOptions = {
    ok: true,
    command,
    host: DEFAULT_HOST,
    foreground: false,
    screen: null,
    stateDir: null,
    serverId: null,
  };
  for (let index = 1; index < argv.length; index += 1) {
    const flag = argv[index];
    if (flag === FLAG_FOREGROUND) {
      options.foreground = true;
      continue;
    }
    if (flag.startsWith(SERVER_ID_PREFIX)) {
      options.serverId = flag.slice(SERVER_ID_PREFIX.length);
      continue;
    }
    if (!VALUE_FLAGS.has(flag)) {
      return { ok: false, message: USAGE_MESSAGE };
    }
    const value = argv[index + 1];
    if (!value || value.startsWith("--")) {
      return { ok: false, message: USAGE_MESSAGE };
    }
    index += 1;
    assignFlag(options, flag, value);
  }
  if (options.command === COMMAND_START && !options.screen) {
    return { ok: false, message: USAGE_MESSAGE };
  }
  if (!LOOPBACK_HOSTS.has(options.host)) {
    return { ok: false, message: USAGE_MESSAGE };
  }
  return options;
}
