## ADDED Requirements

### Requirement: Prod runner stop cancels in-flight submission and settles Promise

When the production runner's `stop()` is called while `runStudentCode` is in-flight, the runner SHALL cancel the pending `killTimer`, terminate the worker, and cause the `runStudentCode` Promise to settle (resolve with `null`). After `stop()` returns, `isRunning` SHALL be `false` and the `submit()` Promise SHALL NOT remain pending indefinitely.

#### Scenario: Stop during prod submission settles Promise

- **WHEN** `submit()` is in progress in the production runner and `stop()` is called
- **THEN** the `killTimer` SHALL be cleared
- **AND** the worker SHALL be terminated
- **AND** the `runStudentCode` Promise SHALL resolve with `null`
- **AND** `isRunning` SHALL be `false`

#### Scenario: Stop when no submission is in-flight is a no-op

- **WHEN** `stop()` is called on the production runner while no submission is running
- **THEN** the call SHALL have no effect and SHALL NOT throw

#### Scenario: KillTimer does not fire after stop

- **WHEN** `stop()` is called during an in-flight prod submission
- **THEN** the `killTimer` callback SHALL NOT execute after `stop()` completes

---

### Requirement: Dev runner stop cancels in-flight submission and settles Promise

When the dev runner's `stop()` is called while the submission worker is in-flight, the runner SHALL cancel the pending `killTimer` for the submission worker, terminate the submission worker, and cause the `submit()` Promise to settle. `stop()` SHALL also continue to terminate the generator-phase `activeWorker` if it is active. After `stop()` returns, `isRunning` SHALL be `false`.

#### Scenario: Stop during dev submission settles Promise

- **WHEN** `submit()` is in progress in the dev runner and `stop()` is called
- **THEN** the submission worker's `killTimer` SHALL be cleared
- **AND** the submission worker SHALL be terminated
- **AND** `isRunning` SHALL be `false`
- **AND** the `submit()` Promise SHALL NOT remain pending indefinitely

#### Scenario: Stop during dev generator phase terminates activeWorker

- **WHEN** the dev runner is in the generator phase (`loadTestcases` in progress) and `stop()` is called
- **THEN** `activeWorker` SHALL be terminated
- **AND** `isRunning` SHALL be `false`

#### Scenario: Dev killTimer does not fire after stop

- **WHEN** `stop()` is called during an in-flight dev submission
- **THEN** the submission `killTimer` callback SHALL NOT execute after `stop()` completes

---

### Requirement: Cleanup cancels all pending timers and workers

The `cleanup()` function for both prod and dev runners SHALL cancel all pending `killTimer` timers, terminate all active workers, and settle any in-flight Promises. After `cleanup()` returns, no stale timer callbacks SHALL fire. This prevents side effects after component unmount.

#### Scenario: Cleanup during prod submission cancels timer

- **WHEN** `cleanup()` is called on the prod runner while a submission is in-flight
- **THEN** the `killTimer` SHALL be cleared
- **AND** the worker SHALL be terminated
- **AND** the in-flight Promise SHALL settle

#### Scenario: Cleanup during dev submission cancels timer

- **WHEN** `cleanup()` is called on the dev runner while a submission is in-flight
- **THEN** the submission `killTimer` SHALL be cleared
- **AND** both the submission worker and any active generator worker SHALL be terminated
- **AND** in-flight Promises SHALL settle

#### Scenario: No stale timer fires after cleanup

- **WHEN** `cleanup()` is called and then sufficient wall-clock time passes for any previously scheduled `killTimer` to fire
- **THEN** no callback SHALL execute from the cleared timers
