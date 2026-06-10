# The Forge

The Forge is a planned Pi extension for verified BDD/TDD orchestration.

It will guide an agent through the smallest useful behavior slice, prove red fails for the intended reason, reach green with the smallest production change, refactor while green, and commit one clean final slice.

## Status

Status: planning proposal, not implemented.

No installable extension exists yet. This repository is currently defining the v1 behavior, safety gates, and public documentation before implementation starts.

## What you can do now

- Read `docs/initial-plan.md` for the current roadmap.
- Read `docs/design-decisions.md` for accepted planning decisions.
- Read `docs/deterministic-gates.md` for intended code-owned safety gates.
- Read `features/verified-tdd-microcycle.feature` for the behavior contract draft.
- Use GitHub issues for implementation planning.

The GitHub wiki contains exploratory research notes. Committed files in `docs/` and `features/` are the authoritative project docs.

## Core loop

```text
record_start_hash()
choose_next_smallest_behavior()
write_red_test_only_change()
verify_red_fails_for_intended_reason()
make_smallest_green_change()
verify_green()
refactor_without_behavior_change()
verify_fully_green()
commit_final_green_slice()
verify_commit_parent_is_start_hash()
```

## Principles

- Code owns deterministic gates: git state, hashes, file boundaries, exit codes, and test output.
- AI owns semantic judgment: behavior selection, intended-failure interpretation, naming, implementation clarity, and refactor quality.
- Deterministic checks block progress; AI judgment cannot override failed code checks.
- Each behavior slice ends as one fully green commit.

## Documentation locations

- `.forge/runs/`: generated local run state; ignored by git; never authoritative public docs.
- `features/`: committed behavior contracts.
- `docs/`: committed user, contributor, and accepted design documentation.
- GitHub wiki: exploratory research notes only.

## License

MIT
