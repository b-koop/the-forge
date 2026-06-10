# Documentation backlog

Status: planning backlog, not implemented.
Audience: contributors maintaining project documentation.

Public durable docs belong in committed `docs/` and `features/` files. `.forge/` is reserved for generated per-run files. The GitHub wiki is exploratory and non-normative.

## Recommended committed docs

1. `docs/run-artifacts.md`
   - `.forge/runs/<slug>/state.json`
   - notes Markdown
   - generated feature/spec file
   - logs and retry history

2. Update `features/verified-tdd-microcycle.feature`
   - add clean-start block
   - add no-work-complete case
   - add red-passes-unexpectedly case
   - add wrong-red case
   - add green-breaks-existing-behavior case
   - add failed-refactor/review block case

3. Update `docs/initial-plan.md`
   - define gate-assisted v1
   - include ordered slices and dependencies
   - move cleanup editing to later
