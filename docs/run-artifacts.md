# Forge run artifacts

Status: planning proposal, not implemented.
Audience: contributors and future Forge users.

Forge stores generated, per-run working files under `.forge/runs/<slug>/`.

## Purpose

`.forge/` is local run state, not public project documentation. It is gitignored by default.

Use committed `docs/` and `features/` for authoritative design, user, and contributor documentation. Use the GitHub wiki for exploratory research notes only.

## Standard run directory

```text
.forge/runs/<slug>/
  state.json
  notes.md
  behavior.feature
  logs/
```

## Artifact roles

- `state.json`: machine-readable run state, slice list, phases, retries, commands, hashes, and checkpoint commits.
- `notes.md`: human-readable planning notes, questions, decisions, and investigation summaries.
- `behavior.feature`: generated behavior expectations for the run.
- `logs/`: command output, red/green attempts, verifier notes, and failure summaries.

## Repository rule

- `.forge/` remains ignored.
- Promote durable decisions from `.forge/` into committed `docs/` or `features/` files.
- Do not rely on `.forge/` for public documentation or release notes.
