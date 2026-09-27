# RFC 0009: Close skill gaps found in real sessions

**Status:** Draft

## Summary

Two real development sessions reported eight gaps that let bugs ship. This RFC records those problems and the skill changes that close them. The reports are evidence. Each fix still has to be checked against the skill it edits.

## Problem

Sessions showed the same classes of miss: a configuration change was declared done without a check, background processes piled up, subagent prompts carried too much context, work was handed off without a self-check, mocks drifted from the interface, reviewers could not see the files they needed, fix loops were slow, and skills were not read before the action they govern.

## Goals

- Configuration changes are verified by reading the resulting config or running the check the skill names.
- End-to-end tests clean up background processes they start.
- Subagent prompts carry the task, not the parent transcript.
- A handoff includes a short self-check of what was claimed.
- Tests mock the interface, not a copy of the implementation.
- Reviewers receive the file paths they are asked to judge.
- A fix loop does not restart the whole task when one finding remains.
- The skill that governs a step is read before that step runs.

## Non-goals

- Adopting every remedy the session notes proposed. The problems are the requirement. A remedy that fights an existing skill stays out.
- A new skill per problem.

## Design

Put the verification step in the skill that already owns that action: test-driven development and verification for config checks, subagent-driven development for prompt size and review file access, and the debugging workflow for process cleanup. Do not add a parallel checklist skill.

## Acceptance

Each of the eight problems has a sentence in the owning workflow that an agent can follow, and a pressure note or test that fails if that sentence is ignored. Open questions in the source notes are either decided in this RFC's design or left listed under Non-goals.
