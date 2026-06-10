Feature: TDD micro-cycle workflow is observable and verifiable

  This companion spec describes the externally observable workflow for running
  one programmatic TDD slice from start hash through a final green commit.

  Scenario: Select the next smallest behavior slice
    Given a behavior backlog for the current ticket
    When the operator starts a new micro-cycle slice
    Then exactly one smallest behavior is selected for the slice

  Scenario: Red is verified as an intended failure
    Given a newly added behavior test for the selected slice
    When the focused test command is executed
    Then the run fails for the intended missing behavior reason

  Scenario: Green change is the smallest passing implementation
    Given a verified red failure for the selected behavior
    When the smallest production change is applied
    Then the focused test for that behavior passes

  Scenario: Refactor keeps observable behavior unchanged
    Given the slice is green for the selected behavior
    When cleanup refactors are applied
    Then focused and required wider checks remain green

  Scenario: The final commit is anchored to the recorded start hash
    Given START_SHA is recorded before the slice begins
    When the final green slice commit is created
    Then the final commit's first parent equals START_SHA
