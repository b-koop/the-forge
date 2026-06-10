# Run a verified TDD micro-cycle programmatically

## Task outcome

Drive one behavior slice from the next smallest test through red, green, refactor, and a final green commit, while proving that each validation checkpoint means what it claims.

## Before you begin

- Work from a clean git index unless you intentionally resume an existing slice.
- Know the behavior goal in domain language.
- Know the repository's check commands, such as typecheck, lint, unit tests, or focused test commands.
- Configure Forge in Pi settings when defaults are not enough. The default settings sample is generated from the Zod-validated config model in `src/forge-config.ts` and mirrored in `docs/data/forge-settings.sample.json`. `testCommands` is the ordered list of executable validation commands Forge passes to the agent prompt. Forge does not execute them directly; the agent should run or select from these commands as applicable for the current slice. The legacy `testCommand` string is still accepted and normalized to `testCommands: [testCommand]`, but new settings should use `testCommands`:

```json
{
  "forge": {
    "retries": 0,
    "timeoutMs": 30000,
    "testCommands": ["pnpm typecheck", "pnpm test"],
    "skills": {
      "red": ["tdd", "bdd", "test-name"],
      "verifyRed": ["tdd", "vette"],
      "finalVerify": ["tdd", "vette", "thermo-nuclear-code-quality-review"]
    }
  }
}
```

- Keep test-only, production-only, verification, and cleanup work separated by phase.

## Programmatic loop

Repeat this loop until no unproven behavior remains:

```text
record_start_hash()
select_next_smallest_behavior()
write_one_test_only_change()
verify_red_fails_for_intended_reason()
make_smallest_production_change()
verify_green()
refactor_without_behavior_change()
verify_fully_green()
commit_final_green_slice()
verify_commit_parent_is_start_hash()
```

At the start of each slice, record the current commit so automation can prove no unexpected commit was inserted while the agent worked:

```bash
START_SHA=$(git rev-parse HEAD)
START_BRANCH=$(git branch --show-current || true)
```

After the final slice commit, verify that the new commit's first parent is exactly `START_SHA`:

```bash
FINAL_SHA=$(git rev-parse HEAD)
test "$(git rev-parse HEAD^1)" = "$START_SHA"
```

If this check fails, stop and inspect history before continuing.

## Responsibility split

Prefer deterministic code for anything that can be checked from git, files, test output, or exit codes. Use AI only for judgment calls that require semantic understanding.

| Step | Code owns | AI owns |
| --- | --- | --- |
| Record start state | Capture `START_SHA`, branch, clean index, and changed-file list. | Explain any intentional dirty state before the slice starts. |
| Select next behavior | List uncovered scenarios, changed files, candidate tests, and dependency hints. | Choose the smallest meaningful behavior and state why it is smallest. |
| Write red test | Enforce test-only file changes, diff hygiene, and one focused command. | Draft the behavior-focused test and name it clearly. |
| Verify red | Check non-zero exit, failing test name, changed-file boundary, and captured output. | Decide whether the failure proves the intended missing behavior. |
| Make green change | Enforce production-only changes after red and run the focused test. | Implement the smallest readable production change. |
| Verify green | Check zero exit for focused and required wider commands. | Explain whether the implementation stayed within the behavior slice. |
| Refactor | Run checks after each batch, compare public behavior, and detect file drift. | Improve names, duplication, and structure without changing behavior. |
| Commit | Run `git add`, `git commit`, capture `FINAL_SHA`, and verify `HEAD^1 == START_SHA`. | Write the concise commit message from the behavior outcome. |

Automation should block progress when code-owned checks fail. AI judgment may add context, but it must not override a failed deterministic check.

## 1. Select the next smallest behavior

Choose one observable behavior that can be proven by one focused test.

Programmatic selection checklist:

- Parse the ticket, feature, or `.feature` file into behavior candidates.
- Filter out behavior already covered by passing tests.
- Prefer the candidate with the fewest dependencies and clearest expected outcome.
- Reject candidates that require multiple user actions, unrelated states, or broad infrastructure work.

Validation:

```bash
git status --short
```

Expected result:

- The working tree is clean, or all existing changes are explicitly part of this slice.
- The selected behavior can be named in one sentence: `Prove that <actor/system> <outcome> when <condition>`.

## 2. Write the red test

Add or change only the test, fixture, or behavior spec needed to prove the selected behavior.

Guardrails:

- Do not edit production code.
- Do not batch multiple behavior expectations.
- Name the test after the behavior, not the implementation.

Validation:

```bash
git diff --check
git diff --name-only
```

Expected result:

- Changed files are test/spec/fixture files only.
- The diff contains one behavioral expectation.

## 3. Verify red fails for the intended reason

Run the narrowest command that exercises the new test.

Example:

```bash
pnpm test path/to/focused.test.ts -- --runInBand
```

If the repository uses another runner, replace this with the focused equivalent.

Validation rules:

- The command must fail.
- The failing test must be the newly added or changed test.
- The failure message must point to the missing behavior, not syntax, imports, setup, flakes, or unrelated tests.

Record the intended failure evidence:

```text
RED_OK = failing_test_name + failure_message_excerpt + command
```

If red fails for the wrong reason, fix the test before any production change.

Optional checkpoint:

```bash
git add <test files>
git commit -m "test: checkpoint red for <behavior>"
RED_SHA=$(git rev-parse HEAD)
test "$(git rev-parse HEAD^1)" = "$START_SHA"
```

Use this only as a temporary checkpoint. It must not remain as the final slice commit. If a separate agent creates this commit, require it to report `RED_SHA` and verify the parent hash before allowing green work.

## 4. Make the smallest green change

Edit production code only enough to satisfy the red test.

Guardrails:

- Do not improve unrelated design yet.
- Do not expand scope to additional behaviors.
- Prefer the simplest readable implementation that proves the behavior.

Validation:

```bash
git diff --check
<focused test command from red>
```

Expected result:

- The focused test passes.
- The production diff is limited to the behavior under test.

## 5. Verify the slice is green

Run the relevant wider checks before refactoring.

Typical command set:

```bash
pnpm typecheck
pnpm test
```

Use the commands that exist in the repository.

Expected result:

- All required checks pass.
- No unrelated files changed.
- The red failure evidence still explains why the test was meaningful.

## 6. Refactor without changing behavior

Improve names, duplication, structure, and clarity after the behavior is green.

Guardrails:

- Keep the same externally observable behavior.
- Prefer small mechanical edits.
- Do not add new behavior while refactoring.

Validation after every meaningful refactor batch:

```bash
<focused test command>
<required wider checks>
git diff --check
```

Expected result:

- The focused test remains green.
- The wider check set remains green.
- The diff is easier to read without introducing a new behavior claim.

## 7. Commit the final green state

Before committing, verify the final state is fully green and the history is still anchored to the slice start.

```bash
git status --short
<required wider checks>
git diff --check
test "$(git merge-base HEAD "$START_SHA")" = "$START_SHA"
```

If a temporary red checkpoint commit exists, squash it with the green and refactor work so the final history contains one complete green slice whose parent is `START_SHA`.

Final commit shape:

```bash
git add <slice files>
git commit -m "feat: <behavior outcome>"
FINAL_SHA=$(git rev-parse HEAD)
test "$(git rev-parse HEAD^1)" = "$START_SHA"
```

Use `fix:`, `test:`, or another conventional prefix when it better describes the slice.

Expected result:

- The final commit contains the test, implementation, and refactor for one behavior slice.
- The committed state is green.
- `HEAD^1` equals the recorded `START_SHA`, proving no extra commit was snuck in.
- There are no leftover temporary red commits for the slice.

## Focused troubleshooting

| Symptom | Action |
| --- | --- |
| Red passes immediately | Strengthen the test or confirm the behavior was already implemented. Do not proceed as red. |
| Red fails from syntax/import/setup | Fix the test harness before production edits. |
| Multiple tests fail on red | Narrow the test or investigate whether the selected behavior is too large. |
| Green requires broad production changes | Split the behavior smaller or add an enabling refactor as a separate green commit first. |
| Refactor changes behavior | Revert the refactor batch, restore green, and retry smaller. |
| Final checks fail | Do not commit. Return to green or split the slice. |

## Automation outputs to capture

For each slice, store enough evidence for review:

```json
{
  "behavior": "one-sentence behavior outcome",
  "red": {
    "command": "focused test command",
    "expectedFailure": "failure excerpt proving missing behavior"
  },
  "green": {
    "command": "focused test command",
    "result": "passed"
  },
  "refactor": {
    "commands": ["focused test command", "required wider checks"],
    "result": "passed"
  },
  "history": {
    "startSha": "sha recorded before the slice",
    "finalSha": "final green commit sha",
    "parentCheck": "HEAD^1 equals startSha"
  }
}
```

## Related behavior spec

The companion `.feature` file should stay concise and describe only observable workflow behavior. This document is the technical how-to for implementing and validating that workflow programmatically.
