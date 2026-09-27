# RFC 0025: Keep the Hermes plugin version in lockstep

**Status:** Draft

## Summary

The version bump script updates `.hermes-plugin/plugin.yaml` through `yq`, using the same manifest list as the JSON manifests, and checks every declared file before it writes any of them.

## Problem

The Hermes manifest is YAML. The bump script only rewrites JSON, so the Hermes plugin version drifts from the repo version. A hand-rolled YAML parser in Bash is the wrong fix.

## Goals

- `.version-bump.json` lists `.hermes-plugin/plugin.yaml` and the top-level `version` field.
- JSON files go through `jq`. YAML files go through `yq` v4. The key and value are data, not string-interpolated into the expression.
- `--check`, `--audit`, and the write path share one dispatcher.
- A read-only preflight runs before any write. If a later YAML `version` is not a string, every manifest stays byte-for-byte unchanged.

## Non-goals

- A YAML parser written in the shell.
- Nested keys or `.yml` names.
- Hermes runtime behavior.
- A transaction framework or a rewrite of audit status codes.
- The separate JSON-expression validation issue found beside this work.

## Design

Add the Hermes path to `.version-bump.json`. Teach `scripts/bump-version.sh` to dispatch on the suffix. Preflight reads every present manifest with that dispatcher and aborts before the first write when a read fails or a YAML version is not a string. Missing files keep today's behavior. `--help` does not require `jq` or `yq`.

## Acceptance

A temp fixture with aligned JSON and YAML passes `--check` and `--audit`, and a bump updates both. A fixture whose JSON is listed first and whose later YAML version is not a string exits nonzero with no file changed. The repo's `.version-bump.json` contains the Hermes entry. `bump-version.sh --check` passes on the repo.
