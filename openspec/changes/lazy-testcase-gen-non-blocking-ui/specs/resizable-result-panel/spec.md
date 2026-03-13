## ADDED Requirements

### Requirement: TestResultPanel height is user-adjustable via drag

`TestResultPanel` SHALL provide a drag handle at its top edge. Dragging the handle upward SHALL increase the panel height; dragging downward SHALL decrease it. The minimum height SHALL be `80px`. The maximum height SHALL be 50% of the height of its containing element (the right-side panel). The container height SHALL be measured using `ResizeObserver` so that the constraint remains accurate when the left/right split is adjusted.

#### Scenario: User drags handle to increase height

- **WHEN** the user drags the `TestResultPanel`'s top drag handle upward
- **THEN** the panel height increases, stopping at 50% of the right panel height

#### Scenario: User drags handle to decrease height

- **WHEN** the user drags the `TestResultPanel`'s top drag handle downward
- **THEN** the panel height decreases, stopping at a minimum of `80px`

#### Scenario: Container resize adjusts maximum height

- **WHEN** the user resizes the left/right split pane and the right panel height changes
- **THEN** the `TestResultPanel` maximum height constraint is recalculated to 50% of the new right panel height; if the current height exceeds the new maximum, it is clamped

---

### Requirement: TestResultPanel removes fixed max-height

The fixed `max-h-56` Tailwind class SHALL be removed from `TestResultPanel`. Panel height SHALL be controlled entirely by the user-adjustable drag mechanism with min/max constraints defined above.

#### Scenario: Many testcase results are scrollable within adjusted height

- **WHEN** the number of testcase results exceeds the visible area at current height
- **THEN** the panel content is scrollable within the panel without overflowing the right-side layout
