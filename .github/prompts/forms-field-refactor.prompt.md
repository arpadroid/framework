---
name: forms-field-refactor
description: Refactor an attached Arpadroid forms field and its Storybook story to the current Field blueprint and direct-story conventions.
---

# Forms Field Refactor

Apply this plan to the attached component files when the user says `go`.

## Scope

Treat the attached files as the active scope. Do not reopen broad repository discovery unless a concrete ambiguity blocks the edit. Preserve unrelated user changes and do not modify unrelated components.

## Component implementation

- Preserve the existing base class and public behavior. Do not change inheritance merely for consistency.
- Inspect the component `.types.d.ts` file before editing. Add missing config/property types required by the implementation or story args.
- Prefer the new config shape, especially `inputType` instead of `inputAttributes: { type: ... }`, when supported by the current Field blueprint.
- Preserve custom validation, formatting, min/max, step, output conversion, and other field-specific behavior.
- Replace imperative picker/button creation and `inputMask.addRhs()` calls with `$renderTemplate()` content using `arpa-zone name="inputMaskRhs"` and declarative `on-click` bindings.
- Keep a small action method such as `showPicker()` for declarative event bindings.
- Remove obsolete imports such as `renderNode`, old child components, and obsolete lifecycle/render helper methods.
- For custom multi-input fields, preserve their custom template and synchronization logic.

## Storybook story

- Use typed `Meta<...>` and `StoryObj<...>` metadata.
- Do not use `getArgs`, `getArgTypes`, `renderField`, inherited `FieldDefault`/`FieldTest`, or `argTypes`.
- Hard-code only the relevant component and shared field args directly in the story metadata.
- Render the component directly inside:

  ```js
  <arpa-form id="test-form" debounce="0">
      <component-tag ${$attr(args)}></component-tag>
  </arpa-form>
  ```

- Use `defaultParams` and `testParams` from `@arpadroid/module/storybook/helper`.
- Use `playSetup({ tag, canvas, canvasElement })` from the shared field story setup.
- Use `userEvent` for user interactions instead of direct `.click()` or `fireEvent` where practical.
- Preserve component-specific assertions: initial state, invalid submission/error state, valid payload, success state, picker labels, formatting, min/max, past/future constraints, change signals, and custom input behavior.
- Keep the default export name consistent with the story object name.

## Execution rules

- When the user says `go` with attached files, immediately apply this plan to those files without asking for confirmation.
- Skip diagnostics, type checks, and tests unless the user explicitly requests validation.
- Do not fix unrelated issues discovered while editing.
- Do not undo user edits or formatter changes.
- Keep edits minimal and follow the existing local style.

## Completion

Briefly report the files changed and the main refactor points. State that validation/tests were skipped unless the user requested them.
