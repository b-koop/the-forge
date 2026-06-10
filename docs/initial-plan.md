# Plan the Forge from scratch

Status: planning roadmap, not implemented.
Audience: contributors and design reviewers.

## Outcome

Build a public Pi extension that makes agent-led BDD/TDD safer by separating deterministic code gates from AI judgment.

## Gate-assisted v1

The first implementation should prove the safety model before building a full autonomous orchestrator.

V1 should:

1. refuse to start on a dirty repo and list files without calling AI
2. create ignored `.forge/runs/<slug>/` planning artifacts
3. produce an ordered slice plan with dependencies
4. run a focused baseline command before red
5. enforce red test-only changes and exactly one failing test case
6. use a verifier for intended red failure evidence
7. create a verified-red checkpoint commit
8. enforce green code-only changes
9. run focused and related checks every slice
10. amend into one conventional commit per slice
11. verify final commit parent equals the recorded slice start SHA

## Work plan

1. Define the behavior contract in Gherkin.
2. Design deterministic gates for git state, file scope, command exit codes, and commit ancestry.
3. Design the `.forge/runs/<slug>/` state schema and planning artifacts.
4. Design AI responsibilities for behavior selection, red failure interpretation, green implementation, and refactor quality.
5. Implement the smallest `/forge` command around gate-assisted v1.
6. Add settings for retries, timeout, test command, and per-step skill choices.
7. Add tests proving command safety, prompt construction, settings loading, and git boundary checks.
8. Document usage, configuration, and recovery paths.

## Research tracked in the wiki

The GitHub wiki is exploratory and non-normative. Accepted decisions should be promoted into committed `docs/` or `features/` files.

- Verified red/green/refactor loop
- Code-owned vs AI-owned responsibilities
- Pi extension settings options
- Git commit ancestry safety
- Public package shape
