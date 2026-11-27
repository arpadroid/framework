Each item lists the evidence, the action, and whether I verified it by reading code (V) or it is a hypothesis to test first (H).

## P0: Correctness and security (core template and props layer)

1. **Escape by default (V)**
   - Evidence: `attrString` in `htmlTool.iso.js` interpolates values into `name="${value}"` unescaped. Template values go into `innerHTML` raw via arpaElementTemplate.helper.js. `escapeHtml` exists in `tools-iso` and no component uses it.
   - Actions:
     - Escape attribute values in `attrString`.
     - Escape interpolated `{var}` text by default, with an explicit raw opt-in (for example `{html:content}` or `{raw:...}`), and mark the places that must stay raw (`content`, node HTML).
     - Audit the 5 `innerHTML =` sites outside stories, plus `ArpaElement.normalizeContentNodes` and `setNodeContent`.
     - Add tests with payloads like `"><img onerror=...>`.

2. **Stop re-evaluating interpolated data (V)**
   - Evidence: `processTemplateVariable` re-runs `processTemplate` on rendered values containing `{`, and `renderTemplate` re-processes string template vars. `{name()}` calls any method on the element.
   - Actions:
     - Process each template once, and never re-scan substituted values.
     - Restrict `name()` and `can-render` method calls to an allow-list, such as methods prefixed `render*`, `has*` or `can*`, or an explicit `templateMethods` set.
     - Add a test that data containing `{remove()}` or `{label}` renders literally.

3. **Make falsy values first-class (V)**
   - Evidence: `getProp` uses `attr || config[name] || payload`. `processTemplateVariable` uses `value || getProp(name) || ''`. `attrString` drops number `0`. `hasProp` and `getProp` treat `false` and the string `'false'` inconsistently.
   - Actions:
     - Use `??`/explicit `undefined` checks in `getProp` and `processTemplateVariable`.
     - Define one boolean-attribute convention: presence means true, and `"false"` means false in every helper.
     - Let `attrString` render `0` and `false` according to that rule.
     - Add table-driven tests across attribute, config and payload precedence.

## P1: Lifecycle and async model

4. **Replace timer retries with one deterministic ready signal (V)**
   - Evidence: `getContentNodeAsync` (`setTimeout` 0 then 10, with a `@todo`), `waitForEventHandlers` (`setTimeout` 10), `handleDefer` (`requestAnimationFrame` then `setTimeout`), and 29 `setTimeout` calls across feature packages.
   - Actions:
     - Introduce `updateComplete` (or reuse `promise`/`onRendered`) that resolves after nodes, zones and event listeners are attached.
     - Have `arpa-node` and `arpa-zone` signal readiness through that promise instead of polling the DOM.
     - Remove the retries one by one, with the story tests as the safety net.

5. **Disconnect/reconnect symmetry (V)**
   - Evidence: `disconnectedCallback` clears `_unsubscribes`, but `$initializeProperties` is guarded by `_hasInitialized` and never re-runs. `ListManagerItem._initializeView` carries a workaround comment.
   - Actions:
     - Add a re-subscribe hook (for example `$onReconnected` or `$subscribe`) called on every connect.
     - Or move subscriptions out of `$initializeProperties` into a method that runs on each `connectedCallback`.
     - Add tests that move a list item and a field between parents and check that signals still fire.

6. **Constructor side effects (H)**
   - Evidence: the constructor reads `innerHTML` and `childNodes` and starts initialization unless `renderOnConnected` is set.
   - Actions:
     - Write a test: `createElement`, then `innerHTML`/`append`, then attach.
     - If content is lost, move content capture and render start to `connectedCallback` by default, and keep the constructor to config only.
     - Document `setContent` as the programmatic path either way.

7. **Batcher edge cases (H)**
   - Evidence: `flushWrites` chains `setTimeout` then `requestAnimationFrame`, which pauses in background tabs. The `writes.size === 1` check decides when to start a flush.
   - Actions:
     - Test rendering in a hidden tab.
     - Add a fallback timer, or use `requestIdleCallback`/`setTimeout` only for chunking.
     - Add unit tests for `DomBatcherTool`, merged writes, and concurrent flushes.
     - Fix the docs: it batches writes only.

## P2: API and architecture clarity

8. **Rationalize the lifecycle hooks (V)**
   - Evidence: about 15 hooks (`$preInitialize`, `$initialize`, `$onInitialized`, `$initializeProperties`, `$initializeNodes`, `$preRender`, `$resolveRender`, `$onComplete`, `$onRendered`, `$onConnected`, and others), with `_preRender` and `$preRender` overlapping.
   - Actions:
     - Document a single lifecycle diagram, with the order and which hooks are async.
     - Deprecate duplicates, and consolidate into roughly 5 documented hooks.

9. **Split `ArpaElement` (V)**
   - Evidence: `arpaElement.js` is a 1,100-line class mixing config, props, templates, nodes, zones, content, i18n, batching and lifecycle.
   - Actions: extract node management, content handling and batching into helpers or mixins with focused tests. The helper pattern already started in `helper/`.

10. **Unify node, zone and content semantics (V)**
    - Evidence: `arpa-node` and `arpa-zone` each duplicate the promise, config and `getArpaElement` plumbing, and there are two content paths (`setContent` vs zones).
    - Actions: introduce a small shared base or mixin for these two.

11. **Define the update model (V)**
    - Evidence: attribute changes reach `update()` only when `observedAttributes` is declared, and `update()` is empty. `reRender()` is used selectively.
    - Actions:
      - Decide and document one policy: which prop changes re-render, which patch.
      - Offer a declarative `observedProps` that maps to `setProp`/`editNode`.
      - Keep full `reRender` for structural changes only.

12. **Typing (V)**
    - Evidence: `getProp` returns `any`, and there are 25 `@ts-ignore`/`@ts-expect-error` in feature packages.
    - Actions:
      - Add per-component prop type maps so `getProp('x')` is typed.
      - Burn down the suppressions, grouped by cause.
      - Make `check:types` a CI gate.

## P3: Quality, accessibility and testing

13. **Engine tests (V)**
    - Evidence: `ui` has 2 test files (helpers only), and `forms`, `lists`, `list-manager`, `application` and others have none.
    - Actions: unit tests for `ArpaElement`, `ArpaNode`, `ArpaZone` (render order, zone placement, `defer`, `can-render`, re-render, reconnect), plus tests for the template helper. Keep the Storybook tests for UI behavior.

14. **Accessibility audit (H)**
    - Evidence: ARIA is sparse (about 20 files, mostly `aria-label` and `aria-current`). The tooltip, combo, select and tag fields are the riskiest.
    - Actions:
      - Run axe in the Storybook tests.
      - Write keyboard and focus tests for dialogs (focus trap, Esc, restore), combos and selects (roles, `aria-expanded`, `aria-activedescendant`), and tooltips (focus and hover).
      - Document the a11y status per component.

15. **Form participation (H)**
    - Evidence: no `ElementInternals`/`formAssociated`.
    - Actions: confirm that native form submission and `FormData` work with your light-DOM inputs. Otherwise add form association for the cases where the inner input is absent or replaced.

16. **Error handling (V)**
    - Evidence: `arpa-node` and `arpa-zone` reject by logging and removing themselves, so failures degrade silently.
    - Actions: add a dev mode with loud, element-scoped diagnostics (name, parent chain, config), and an `error` event on the host.

## P4: Documentation and DX

17. **Document the unique concepts (V)**
    - Zones, nodes, blueprint/template override, `can-render` grammar, `defer`, prop precedence and lifecycle. These are the library's identity and are not obvious from the API.
    - Actions: write a concepts guide and a "build a component" tutorial, and show a zones-vs-slots comparison with a runnable example.

18. **Remove dead and hack code (V)**
    - The `@todo` hack in `getContentNodeAsync`, the `getTemplateAttributeMatch` marked "AI solution, must be reviewed", duplicated JSDoc on `getContentNode`/`getContentNodeAsync`, and commented-out code such as in `listItem` and the `// async $onConnected() {}` leftovers.
    - Action: review and test `getTemplateAttributeMatch` thoroughly, since it parses attributes by hand.

19. **Bundle and perf baselines (V)**
    - Current: `ui` is about 197 KB raw and 38 KB gzipped, and the framework is about 344 KB raw and 85 KB gzipped.
    - Actions: track size in CI, and add a render benchmark (for example 1,000 list items, 100 fields) to measure the batcher and prove or disprove the re-render cost.

## Suggested order

1. P0 items 1–3, with tests first.
2. Item 13 for the engine, and the constructor and batcher tests (6, 7), so later refactors are safe.
3. Items 4–5 (async and lifecycle).
4. Items 8–12 (API and architecture).
5. Items 14–16 and then docs (17–19).

I can start with a failing-test suite for items 1–3 and 6, so the fixes are test-driven.