# Deterministic gates

Status: Planning proposal, not implemented.
Audience: contributors and design reviewers.
Applies to: intended v1 behavior.

## Purpose

Forge uses deterministic gates for facts that code can prove. AI may explain or propose next steps, but AI cannot override a failed gate.

Each gate should produce a machine-readable result with:

- `gate`: stable gate name
- `status`: `pass` or `fail`
- `evidence`: command output, changed files, hashes, or failure summary
- `blocks`: whether Forge must stop before calling the next agent
- `recovery`: the next safe action

## Gate list

### Clean-start gate

Purpose: prevent Forge from starting on top of unrelated work.

Passes when:

- tracked files are clean
- staged files are empty
- untracked non-Forge files are absent

Fails when:

- any non-Forge file is modified, staged, or untracked

Recovery:

- list the files
- stop before calling AI
- ask the user to start from a clean repo

### Run-artifact exception gate

Purpose: allow Forge to create local state without polluting git.

Passes when:

- generated artifacts are under `.forge/runs/<slug>/`
- `.forge/` is ignored by git

Fails when:

- generated run state appears outside `.forge/runs/<slug>/`

Recovery:

- move or delete misplaced generated files before continuing

### Planning-output gate

Purpose: ensure the read-only planning phase produces executable slice state.

Passes when `state.json` includes:

- ordered slices
- dependency ids
- allowed test areas
- allowed code areas
- focused command
- required related checks
- expected red failure

Fails when:

- required fields are missing
- slice dependencies reference unknown ids
- file areas or commands are ambiguous

Recovery:

- ask follow-up questions or rerun planning before coding

### Pre-red baseline gate

Purpose: prove the focused command is green before red changes.

Passes when:

- the focused command exits successfully before red edits

Fails when:

- the focused command fails before red edits

Recovery:

- stop the slice and report the baseline failure

### Red file-scope gate

Purpose: enforce test-only red changes.

Passes when:

- red changes only allowed test/spec/fixture files
- red creates no commits

Fails when:

- production files change
- unexpected files change
- any commit appears during red

Recovery:

- revert disallowed changes or undo unexpected commits
- return the reason to the same red agent attempt

### Single-red-failure gate

Purpose: keep each red phase focused on one behavior while recognizing behavior that is already implemented.

Passes when:

- the post-red focused command has exactly one failing test case

Alternate pass path:

- the post-red focused command passes
- the coverage review says the test is valid, high quality, and adds useful behavior coverage
- Forge commits the test-only coverage slice
- Forge updates the slice start SHA and starts again with the next slice

Fails when:

- no failing test case can be identified and the test adds no useful coverage
- more than one test case fails
- the failure is infrastructure, syntax, import, or setup related

Recovery:

- return command output and failure count to the red agent
- for already-green tests, record the coverage-review decision before committing the test-only coverage slice

### Verified-red gate

Purpose: confirm the single failure matches the intended missing behavior.

Passes when:

- the verify agent cites the command, failing test case, error excerpt, expected behavior, and why alternate causes were rejected

Fails when:

- the verifier says the failure is not the intended missing behavior
- evidence is incomplete

Recovery:

- return verifier feedback to red

### Red checkpoint gate

Purpose: create a fallback point without leaving extra public history.

Passes when:

- Forge creates a temporary checkpoint commit after verified red
- that commit contains only the verified test change
- no other commit appears between `START_SHA` and the checkpoint

Fails when:

- the checkpoint includes non-test changes
- commit ancestry is unexpected

Recovery:

- reset to `START_SHA` and retry the slice or stop for user review

### Green file-scope gate

Purpose: prevent green from weakening or rewriting tests.

Passes when:

- green changes only allowed production/code files
- verified red test files remain unchanged

Fails when:

- green changes test/spec/fixture files

Recovery:

- revert green-owned test changes
- return feedback to the same green agent

### Green checks gate

Purpose: prove the slice is green without over-running expensive checks each time.

Passes when:

- the focused command passes
- all per-slice related checks pass

Fails when:

- any focused or related check fails

Recovery:

- return command output to green

### Milestone checks gate

Purpose: catch integration regressions without running expensive checks after every edit.

Passes when:

- configured milestone/full commands pass at planned milestones and final completion

Fails when:

- any milestone/full command fails

Recovery:

- stop the milestone and route the failure to the appropriate slice or user review

### Final ancestry gate

Purpose: prove no extra commit was snuck into the slice.

Passes when:

- final `HEAD^1` equals the recorded `START_SHA`
- the final commit is conventional
- the final commit diff includes the verified test and green implementation

Fails when:

- parent hash differs
- extra commits remain
- temporary checkpoint commit remains as a separate public history entry

Recovery:

- stop completion and report the commit graph for user review

## Retry policy

- Red gets 5 attempts with the same red agent.
- Failed independent slices may be skipped while non-dependent slices continue.
- Failed blocker slices can be retried when they are the only blocker or only remaining work.
- Retry wave uses new agents for 5 more attempts.
- After retry exhaustion, Forge stops and reports the failure to the user.
