# RFC 0011: Review specs and plans before implementation

**Status:** Draft

## Summary

After a design or a plan is written, a fresh reviewer checks it before implementation starts. Spec review looks for completeness and contradictions. Plan review looks for task size and a match to the spec.

## Problem

The author of a spec is a poor checker of that spec. Placeholder text, contradictions, and plans that skip the spec were reaching implementation.

## Goals

- Brainstorming dispatches a spec reviewer after the design is written and before the user review gate.
- Writing plans dispatches a plan reviewer on the plan chunk before execution.
- Reviewer prompts are files in the workflow, not improvised instructions.

## Non-goals

- Replacing the user's approval.
- Reviewing code. That stays in requesting-code-review and subagent-driven development.

## Design

Add a spec reviewer prompt under `designify/skills/designify/workflows/brainstorming/` and a plan reviewer prompt under the writing-plans workflow. The brainstorming workflow calls the spec reviewer after the self-review and before asking the user to approve. The writing-plans workflow calls the plan reviewer after the plan exists and before the execution handoff. Findings are fixed in the document. The reviewer does not implement.

## Acceptance

A spec with a placeholder or two contradicting sections is sent back by the spec reviewer prompt's checklist categories. A plan task that does not name a file from the spec is sent back by the plan reviewer. Both prompts exist as files the workflow links to.
