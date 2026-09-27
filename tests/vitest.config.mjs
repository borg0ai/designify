import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

/** 仓库根。用例路径相对仓库，不相对 tests 包。 */
const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const TEST_GLOB = "tests/designify/**/*.test.mjs";

export default defineConfig({
  root: REPO_ROOT,
  test: {
    environment: "node",
    include: [TEST_GLOB],
  },
});
