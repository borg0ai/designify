# RFC 0027: Rewrite composition prohibitions that backfire

**Status:** Draft

## Summary

Some negative sentences in skill prose work and some make the agent do the forbidden thing. Keep the ones that work. Replace composition-time prohibitions with a short positive recipe, and do not add a nuance clause to a recipe that already won.

## Problem

Micro-tests on 2026-06-10 showed a prohibition against restating the brief made controllers retype more spec values than no guidance at all. The same shape of prohibition on "do not ask the reviewer to re-run tests" held. The difference is predictable, so a blanket "make everything positive" pass would throw away working tripwires.

## Goals

- Tripwires, recognition tables, and policy gates stay.
- A discrete prohibition stays when the agent has no incentive to do the forbidden act and a measurement shows it holds.
- A composition prohibition, where the agent wants to produce the forbidden text, becomes a positive recipe that lists what the output contains.
- A winning recipe does not gain a nuance clause.
- When two phrasings tie, keep the shorter one.

## Non-goals

- Rewriting every "do not" in the repo.
- The SDD cost ladder. That is [0028](0028-strict-cost-sdd.md).
- Per-task review scope. That is [0018](completed/0018-sdd-task-scoped-review.md).

## Design

Apply the doctrine to the five composition prohibitions found in the audit.

- Task reviewer "cite, don't narrate": lead with the positive report shape and drop the prohibition half.
- "Do not add open-ended directives": keep. A micro-test could not elicit the failure.
- "Do not ask a reviewer to re-run tests": keep. Measured zero violations, and the line propagates into dispatches.
- "Do not re-review on top of it": replace with a check that the fix report contains the covering tests, the command, and the output before the reviewer is sent again.
- Writing-plans "No Placeholders": this is the uncertain one. The banned tokens are also the review-time scan list, and review-time recognition works. Test a positive composition recipe against the current banned list before deleting the tokens. The self-review scan must still name the tokens it searches for.

The borderline "don't flag pre-existing file sizes" line stays until that writing-plans test, because its positive half already carries the load.

## Acceptance

Each of the five sites matches the disposition above. The writing-plans change ships only after the recipe-versus-banned-list comparison is recorded. A recipe that won is not followed by a nuance sentence in the same skill.
