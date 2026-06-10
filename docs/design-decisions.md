# Forge design decisions

Status: accepted planning decisions, not implemented.
Audience: contributors and design reviewers.
Applies to: intended v1 behavior unless a section says otherwise.

## V1 scope

In:

- direct current worktree
- clean-start gate before any AI call
- `.forge/runs/<slug>/` generated run artifacts
- JSON state plus Markdown notes plus generated behavior feature
- ordered behavior slices with dependencies
- red/verify/green loop
- verified-red checkpoint commit amended into one final slice commit
- two-tier checks
- minimal read-only cleanup notes

Out:

- isolated worktrees
- cleanup agents that edit code or tests
- automatic handling for every recovery path
- docs/wiki publishing automation
- npm publishing

## Start gate

- If the repo is dirty at start, Forge lists the files and stops.
- No AI is called before the clean-start gate passes.
- After Forge setup, only ignored `.forge/runs/<slug>/` artifacts are allowed outside git.

## Planning phase

- `/forge <details>` starts read-only research and planning.
- AI may research ideas/functionality but may not edit code.
- AI may propose planning content, but only Forge writes artifacts after validating paths, schema, and allowed file locations.
- Each run lives under `.forge/runs/<slug>/`.
- The run uses:
  - `state.json` for machine-readable state
  - Markdown notes for human-readable planning
  - a Gherkin feature/spec for expected behavior
- Planning produces an ordered slice list with explicit dependencies.
- Questions are asked and resolved until the plan is clear.

## Slice dependency behavior

- Failed slices can be skipped only if later slices do not depend on them.
- A failed slice can be retried when it becomes the only blocker dependency or the only remaining work.
- AI may investigate a blocker to improve retry instructions.

## Red phase

- Before red, Forge runs the focused command and records it passing.
- Red receives the prompt, notes, relevant files, expected test area, and expected failure.
- Red may change test files only.
- Red may not commit.
- If red changes non-test files or commits, Forge reverts/undoes and returns feedback.
- Red should produce exactly one failing test case.
- If the focused command passes, Forge reviews whether the test is valid, high quality, and adds useful behavior coverage for behavior that already exists.
- A passing red test that adds useful coverage can skip green implementation, commit the test-only coverage slice, update the slice start SHA, and continue with the next slice.
- If red produces neither one intended failing test case nor useful already-green coverage, Forge returns output to the same red agent.
- Same red agent gets 5 attempts.
- If still failing, mark the slice failed and continue independent slices.
- After all possible slices, retry failed slices with new agents for 5 more attempts.
- If still failing, stop and report to the user.

## Verify red

- Verify agent receives test results, basic prompt, and surrounding files.
- Verify decides whether the single failure matches the intended missing behavior.
- If the test passes, verify decides whether it is valid, high quality, and useful coverage for existing behavior.
- If not, feedback returns to red.
- If the single failure is verified, Forge continues to green.
- If useful already-green coverage is verified, Forge skips green implementation, commits the test-only coverage slice, and starts again with the next slice.

## Red checkpoint commit

- After verified red, Forge creates an internal checkpoint commit.
- The checkpoint commit contains only the verified red test change.
- Green amends this commit with implementation changes.
- The temporary checkpoint is not left as an extra public history entry.
- Final slice history must contain exactly one conventional commit whose diff includes both the verified test and implementation.
- Parent/hash checks prove no unexpected commits appeared.

## Green phase

- Green receives the verified failure and expected behavior.
- Green may modify code only.
- Green may not modify test files.
- If green changes test files, Forge reverts those test changes and returns feedback.
- Green continues until focused and planned related checks pass.

## Check policy

Planning defines command tiers for each slice:

- Focused command: the narrowest command expected to exercise the current slice.
- Related checks: additional commands covering nearby behavior or integration points.
- Milestone/full checks: expensive project-wide validation run at configured milestones and final completion.

Forge uses two tiers:

- targeted related checks on every slice
- expensive/full milestone checks at milestones and final completion

## Cleanup/review phase

- V1 includes minimal read-only cleanup notes.
- Cleanup notes block only if they identify a correctness or test-coverage issue that invalidates the slice.
- Editing cleanup/refactor agents are deferred to later design.

## Commit model

- One conventional commit per behavior slice.
- After each completed slice, Forge updates the start SHA for the next slice.

## Worktree model

- V1 uses the direct current worktree.
- Isolated worktrees are a later enhancement.
