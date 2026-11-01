#!/usr/bin/env bash
# Regression check: Designify should not route new worktrees through the old
# global worktree directory.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

USING_SKILL="$REPO_ROOT/designify/skills/designify/workflows/using-git-worktrees/workflow.md"
FINISHING_SKILL="$REPO_ROOT/designify/skills/designify/workflows/finishing-a-development-branch/workflow.md"
ROTOTILL_SPEC="$REPO_ROOT/.spec/rfc/completed/0015-worktree-detect-and-defer.md"
# shellcheck disable=SC2088
OLD_GLOBAL_PATH='~/.config/designify/worktrees'

failures=0

assert_contains() {
    local file="$1"
    local pattern="$2"
    local label="$3"

    if grep -Fq "$pattern" "$file"; then
        echo "  [PASS] $label"
    else
        echo "  [FAIL] $label"
        echo "    Expected to find: $pattern"
        echo "    In file: $file"
        failures=$((failures + 1))
    fi
}

assert_not_contains() {
    local file="$1"
    local pattern="$2"
    local label="$3"

    if grep -Fq "$pattern" "$file"; then
        echo "  [FAIL] $label"
        echo "    Did not expect to find: $pattern"
        echo "    In file: $file"
        failures=$((failures + 1))
    else
        echo "  [PASS] $label"
    fi
}

echo "=== Worktree Path Policy Test ==="
echo ""

if [[ ! -f "$USING_SKILL" || ! -f "$FINISHING_SKILL" || ! -f "$ROTOTILL_SPEC" ]]; then
    echo "[FAIL] expected workflow or RFC file is missing"
    exit 1
fi

assert_not_contains "$USING_SKILL" "$OLD_GLOBAL_PATH" "using-git-worktrees does not mention old global path"
assert_not_contains "$USING_SKILL" "global legacy" "using-git-worktrees does not use unclear global legacy shorthand"
assert_not_contains "$USING_SKILL" "Global path" "using-git-worktrees has no global path quick-reference row"
assert_contains "$USING_SKILL" 'default to `.worktrees/` at the project root' "using-git-worktrees defaults new manual worktrees to .worktrees/"

assert_not_contains "$FINISHING_SKILL" "$OLD_GLOBAL_PATH" "finishing-a-development-branch does not treat old global path as owned"
assert_contains "$FINISHING_SKILL" '`.worktrees/` or `worktrees/`' "finishing-a-development-branch keeps project-local cleanup ownership"

assert_not_contains "$ROTOTILL_SPEC" "$OLD_GLOBAL_PATH" "rototill spec does not preserve old global path policy"
assert_not_contains "$ROTOTILL_SPEC" "legacy path compat" "worktree RFC does not advertise legacy path compatibility"

echo ""

if [ "$failures" -gt 0 ]; then
    echo "STATUS: FAILED ($failures failures)"
    exit 1
fi

echo "STATUS: PASSED"
