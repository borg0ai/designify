/** Vite 把 CLI 打成单个 Node 文件。node: 内置模块保持外部依赖。 */
import { chmodSync } from "node:fs";
import { resolve } from "node:path";
import { defineConfig, type Plugin } from "vite";

const CLI_ENTRY = resolve(import.meta.dirname, "src/brainstorm.ts");
const OUT_DIR = "dist";
const OUT_FILE = "brainstorm.js";
const SHEBANG = "#!/usr/bin/env node\n";
const FILE_MODE = 0o755;

function cliShebang(): Plugin {
  return {
    name: "brainstorm-cli-shebang",
    generateBundle(_options, bundle) {
      for (const item of Object.values(bundle)) {
        if (item.type === "chunk" && item.isEntry) {
          item.code = `${SHEBANG}${item.code}`;
        }
      }
    },
    closeBundle() {
      chmodSync(resolve(import.meta.dirname, OUT_DIR, OUT_FILE), FILE_MODE);
    },
  };
}

export default defineConfig({
  plugins: [cliShebang()],
  build: {
    ssr: CLI_ENTRY,
    outDir: OUT_DIR,
    emptyOutDir: true,
    target: "node22",
    rolldownOptions: {
      output: {
        format: "es",
        entryFileNames: OUT_FILE,
      },
    },
  },
});
