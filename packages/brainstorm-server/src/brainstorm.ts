/** brainstorm CLI。直接执行时解析参数并启动或停止 daemon。Vite 把这个文件打成 dist/brainstorm.js。 */
import { realpathSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { EXIT_START_FAILED, EXIT_USAGE, TYPE_ERROR, parseArgs } from "./cli-args.ts";
import { runCli } from "./daemon.ts";

export { startServer } from "./server.ts";

function writeError(message: string): void {
  process.stdout.write(`${JSON.stringify({ type: TYPE_ERROR, message })}\n`);
}

export async function main(argv: string[], cliPath: string): Promise<number> {
  const parsed = parseArgs(argv);
  if (!parsed.ok) {
    writeError(parsed.message);
    return EXIT_USAGE;
  }
  return runCli(parsed, cliPath);
}

/** pnpm 的 bin 是符号链接。比较真实路径，避免 argv 与 import.meta.url 不一致时静默退出。 */
function isDirectRun(): boolean {
  const entry = process.argv[1];
  if (!entry) {
    return false;
  }
  try {
    return realpathSync(fileURLToPath(import.meta.url)) === realpathSync(entry);
  } catch {
    return import.meta.url === pathToFileURL(entry).href;
  }
}

if (isDirectRun()) {
  const entry = process.argv[1] ?? "";
  main(process.argv.slice(2), entry).then(
    (code) => {
      process.exit(code);
    },
    (error: unknown) => {
      writeError(error instanceof Error ? error.message : String(error));
      process.exit(EXIT_START_FAILED);
    },
  );
}
