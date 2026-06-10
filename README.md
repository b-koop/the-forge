# Pi Forge Command

Reusable local Pi package that adds `/forge` ticket-driven TDD orchestration.

## Build, install, or test

Build the npm package output first:

```bash
pnpm build
```

From this directory, test the built Pi package manifest:

```bash
pi -e .
```

Or install it as a local package:

```bash
pi install /Users/benjaminkoop/code/pi/forge
```

For npm distribution, publish the package tarball after `pnpm prepack`; Pi discovers it through the `pi-package` keyword and loads the exact compiled extension entry declared in `package.json` (`./dist/extensions/forge.js`).

## Command

### `/forge [ticket|issue|pr|url]`

Starts a ticket-driven TDD forge run. The extension resolves initial Linear/GitHub context when possible, captures current git state, then dispatches the agent with a strict orchestration prompt.

Forge requires the agent to:

- use the existing `tdd`, `grill-me`, `naming`, `test-name`, and `linear-cli`/GitHub lookup skills as relevant,
- grill ticket requirements and edge cases before implementation,
- split work into one behavior/test slice at a time,
- run git CLI checks before and after every red, green, verify, and cleanup phase,
- use a red agent for test-only changes, a green agent for production-only changes, a verify agent for intended-failure and git-boundary checks, and a cleanup agent for production readability/naming/duplication,
- create a temporary red checkpoint commit for the failing test, then squash red/green/cleanup into one final commit per behavior slice,
- clean up completed agent worktrees, temporary branches, and checkpoint commits.

## Settings

Forge reads an optional `forge` section from Pi settings. Global settings live in `~/.pi/agent/settings.json`; trusted project settings live in `.pi/settings.json` and override global values. The default settings sample is generated from the Zod-validated config model in `src/forge-config.ts` and checked against `docs/data/forge-settings.sample.json`. Regenerate it with `pnpm generate:forge-settings` after changing defaults.

`testCommands` is the ordered list of executable validation commands Forge passes to the agent prompt. Forge does not execute them directly; the agent should run or select from these commands as applicable for the current slice. The legacy `testCommand` string is still accepted and normalized to `testCommands: [testCommand]`, but new settings should use `testCommands`.

Forge loads settings tolerantly. Missing files, missing `forge`, and omitted optional fields are quiet; malformed, skipped, deprecated, unknown, or invalid Forge settings produce one warning notification and a `# Forge settings warnings` prompt section that explains the source, key, outcome, and fix without echoing raw invalid values.

```json
{
  "forge": {
    "retries": 0,
    "timeoutMs": 30000,
    "testCommands": ["pnpm typecheck", "pnpm test"],
    "skills": {
      "intake": ["tdd", "bdd", "grill-me", "linear-cli"],
      "decompose": ["bdd", "tdd", "naming"],
      "red": ["tdd", "bdd", "test-name"],
      "verifyRed": ["tdd", "vette"],
      "green": ["tdd", "naming"],
      "refactor": ["tdd", "naming", "thermo-nuclear-code-quality-review"],
      "finalVerify": ["tdd", "vette", "thermo-nuclear-code-quality-review", "pr-validate"]
    }
  }
}
```

Pi does not currently expose an extension API for declaring custom `/settings` UI fields, so Forge reads this JSON section directly.

## Requirements

- Pi with extension support.
- Git CLI in the target repository.
- Linear CLI (`linear`) when working from Linear issues.
- GitHub CLI (`gh`) when working from GitHub issues or pull requests.

## Safety defaults

- Git CLI checks are mandatory before and after each agent phase.
- Red agents may only change tests or approved fixtures.
- Green agents may only change production code.
- Verify agents must prove failures happen for the intended ticket reason.
- Cleanup focuses on production readability, naming, simpler control flow, and duplication removal.
- Temporary red checkpoint commits must be squashed into one final commit per behavior slice.

## License

MIT
