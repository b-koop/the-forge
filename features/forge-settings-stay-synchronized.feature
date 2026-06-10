Feature: Forge settings documentation stays synchronized with defaults

  The Forge settings defaults live in the Zod-validated config model. Every
  documented settings example must stay identical to those defaults so readers
  never copy stale configuration.

  Scenario: forge settings sample is generated from the Zod-validated defaults
    Given the Zod-validated Forge config model defines the default settings
    When the settings sample file is generated
    Then docs/data/forge-settings.sample.json equals the generated defaults

  Scenario: readers see the current forge settings defaults in the TDD guide
    Given the TDD guide embeds a Forge settings JSON example
    When a reader follows the Before you begin section
    Then the embedded example equals the generated Forge settings defaults
