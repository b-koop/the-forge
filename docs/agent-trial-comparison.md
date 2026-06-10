# Agent trial comparison

Status: planning research summary, not implementation documentation.
Audience: contributors choosing review/research strategies.

## Explore

Best for fast repo shape and missing-file inventory.

Found the public repo is planning-only and missing implementation basics:

- `package.json`
- source tree
- tests
- CI
- usage/config docs
- contribution/security/changelog docs
- issue templates or roadmap docs

Use later for quick audits and file inventories.

## Plan

Best for sequencing and implementation roadmap.

Recommended:

1. Harden the behavior contract.
2. Define deterministic gate interfaces.
3. Define minimal settings.
4. Build the first `/forge` command.
5. Add safety tests alongside implementation.
6. Document only implemented recovery paths.

Suggested new artifact: `docs/deterministic-gates.md`.

Use later for roadmap and phase planning.

## Adversarial risk review

Best for safety gaps and bypass risks.

Highest risks found:

- deterministic gates are named but not contractually defined
- git ancestry checks may give false confidence
- untrusted ticket/goal text needs operational prompt boundaries
- retry/timeout behavior can create unsafe loops
- red failure verification needs a required evidence shape

Use before locking safety semantics or issue acceptance criteria.

## codebase-pattern-finder

Best for mining implementation examples from the prototype.

Reusable prototype patterns from the private Forge prototype should be migrated into committed examples before public release:

- Pi extension command registration
- queued/follow-up delivery behavior
- trust-gated settings loading
- explicit untrusted ticket text boundary
- `execFile` timeout/retry wrapper
- dash-prefixed selector safety check
- fake CLI tests
- prompt-injection boundary tests
- trusted settings tests

Avoid carrying forward prompt-only orchestration as the final safety model; deterministic gates should become executable code.
