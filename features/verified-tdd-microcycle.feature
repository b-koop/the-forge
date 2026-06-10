Feature: Verified TDD micro-cycle

  # Actor glossary:
  # - Forge is the orchestrator that enforces gates.
  # - An agent is the AI worker assigned to a phase.
  # - The developer is the human who starts or resolves the run.

  Rule: Forge starts only from a clean project state

    Scenario: Stop before AI when the project is dirty
      Given non-Forge files have uncommitted changes
      When the developer starts Forge
      Then Forge lists the changed files
      And no agent is called

  Rule: Work is always reduced to the next smallest test

    Scenario: Choose the next test
      Given unfinished work remains
      When Forge reviews the planned slices
      Then Forge selects the smallest behavior not yet proven

    Scenario: Stop when no unproven behavior remains
      Given all requested behavior has been proven by passing tests
      When Forge reviews the planned slices
      Then no new test is selected
      And the micro-cycle is complete

  Rule: Red must fail for the expected reason

    Scenario: Verify red
      Given the focused command passed before red
      And the next test is written
      When Forge runs the focused command
      Then exactly one test case fails
      And the failure describes the intended missing behavior

    Scenario: Commit useful coverage when the behavior already exists
      Given the focused command passed before red
      And the next test is written
      When Forge runs the focused command
      Then the command passes
      And Forge reviews whether the test is valid and useful
      And Forge commits the useful test coverage
      And Forge starts again with the next slice

    Scenario: Reject a passing test that adds no useful coverage
      Given the focused command passed before red
      And the next test is written
      When Forge runs the focused command
      Then the command passes
      And the test does not improve behavior coverage
      And implementation does not begin

    Scenario: Reject the wrong red
      Given the focused command passed before red
      And the next test is written
      When Forge runs the focused command
      Then the test fails for another reason
      And implementation does not begin

  Rule: Green uses the smallest working change

    Scenario: Reach green
      Given red failed for the intended reason
      When the green agent makes a code-only change
      Then the focused command passes
      And the planned related checks pass

    Scenario: Reject green that changes tests
      Given red failed for the intended reason
      When the green agent changes a test file
      Then Forge reverts the test change
      And the green agent receives the reason

    Scenario: Reject green that breaks existing behavior
      Given red failed for the intended reason
      When the green agent makes a code-only change
      Then the focused command passes
      But a planned related check fails
      And the slice is not committed

  Rule: Each slice ends as one green conventional commit

    Scenario: Commit the green slice
      Given the focused command and planned related checks pass
      When Forge finalizes the slice
      Then the final commit includes the verified test and implementation
      And the final commit parent is the recorded slice start

    Scenario: Reject unexpected commit history
      Given the focused command and planned related checks pass
      When Forge finalizes the slice
      Then the final commit parent differs from the recorded slice start
      And the slice is not marked complete

  Rule: Cleanup review is read-only in v1

    Scenario: Record non-blocking cleanup notes
      Given the slice is green
      When the cleanup review finds maintainability suggestions
      Then Forge records the suggestions
      And the slice can still be committed

    Scenario: Block cleanup findings that invalidate the slice
      Given the slice is green
      When the cleanup review finds a correctness or test-coverage issue
      Then the slice is not committed
