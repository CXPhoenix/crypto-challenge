## ADDED Requirements

### Requirement: ProblemPanel code blocks render with VitePress styles

The `ProblemPanel` wrapper element SHALL include the `vp-doc` CSS class alongside the existing `prose` classes. This SHALL ensure VitePress's built-in code block CSS (including the copy button positioning and appearance) applies correctly within the panel.

The copy button injected by VitePress's markdown transformer SHALL be `position: absolute` inside the code block container, NOT rendered in normal document flow. No visible gap SHALL appear between a paragraph and the code block that follows it due to an unstyled copy button.

#### Scenario: Copy button is visible and correctly positioned

- **WHEN** the challenge problem description contains a fenced code block
- **THEN** a copy button is visible at the top-right corner of the code block (on hover or always-visible, per VitePress defaults)

#### Scenario: No layout gap above code block content

- **WHEN** a code block follows a paragraph (e.g., "**輸入：**") in the problem description
- **THEN** no abnormal vertical gap appears between the paragraph and the code block content
