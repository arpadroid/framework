---
name: dom-rendering-optimisation-and-storybook-debugging
description: Rules for DOM rendering optimization techniques and the Storybook test runner debugging workflow.
---

# DOM Rendering Optimisation & Storybook Debugging Workflow

Apply these optimization rules when writing or refactoring DOM manipulation logic, and follow the Storybook testing workflow to verify changes without regressions.

---

## Storybook Environment & Debugging Workflow

### Active Environment Reference
- **Storybook Terminal Session:**
  - **Terminal:** `vscode-terminal:/8e05409e72eec732f4c5a100bc974f5a/2`
  - **Directory:** `/var/www/arpadroid/framework`
  - **Command:** `npm run dev` (running Storybook instance)
  - **URL:** `http://localhost:6007`

### Debugging & Verification Process
1. **Trigger Storybook Test Suite in Browser:**
   - Navigate to the active Storybook instance (`http://localhost:6007`).
   - Open the testing panel or test runner sidebar.
   - Click the **`Run tests`** button to run the entire test suite across all stories.
2. **Inspect the Active Terminal:**
   - Switch to the active Storybook terminal running `npm run dev`.
   - Check the output for build/compilation warnings, runtime exceptions, or assertion failures.
   - Verify that all component stories and interaction tests pass before completing changes.

---

## Core DOM Rendering Optimisation Rules

### 1. Separate Reads and Writes (Prevent Layout Thrashing)
- **Problem:** Modifying the DOM (write) and then querying geometry/layout (read) causes Forced Synchronous Layout. Repeating this in loops causes severe Layout Thrashing.
- **Rule:**
  - **Phase 1 (Reads):** Query and measure all dimensions, bounding rects, and scroll positions first (`getBoundingClientRect()`, `offsetWidth`, `offsetHeight`, `scrollTop`, `getComputedStyle()`).
  - **Phase 2 (Writes):** Apply all DOM updates (attributes, class names, styles, structural changes) together afterward.
- **Forbidden Pattern:** Alternating read -> write -> read -> write in the same tick or iteration.

### 2. Batch Mutations & Coordinate with the Frame Budget
- **Frame Scheduling (`requestAnimationFrame`):** Schedule visual DOM mutations inside `requestAnimationFrame` (rAF) callbacks so they execute right before the browser's style, layout, and paint passes.
- **Write Coalescing:** Aggregate multiple property updates targeting the same node in a single event loop turn into a single write operation.
- **Chunking Large Updates:** Split large batch modifications across frames using `requestAnimationFrame`, `requestIdleCallback`, or cooperative scheduling (`scheduler.yield()`) to avoid dropping below 60fps/120fps.

### 3. Mutate Subtrees Off-DOM
- **Document Fragments:** When injecting multiple sibling nodes, assemble them in a `DocumentFragment` first and insert the fragment in a single operation.
- **Cloning Templates:** Use instantiated `<template>` content cloning (`template.content.cloneNode(true)`) rather than repeatedly parsing strings via `innerHTML`.
- **Decoupled Modifications:** For heavy structural modifications on an existing element, detach it from the parent tree or set `display: none` during mutation, then reattach or restore visibility once finished.
- **Atomic Replacements:** Use `element.replaceChildren(...nodes)` rather than sequential child removals and appends.

### 4. Isolate Reflow & Style Recalculation Boundaries
- **CSS Containment (`contain`):** Apply `contain: layout style paint;` (or `contain: strict;`) to component containers to prevent internal mutations from triggering parent/ancestor recalculations.
- **Content Visibility (`content-visibility: auto`):** Use with `contain-intrinsic-size` on large lists or long pages to skip rendering and layout for off-screen items until scrolled into view.
- **Flat Selectors:** Use shallow, class-based CSS rules (BEM, component scoping) to minimize style recalculation match trees.

### 5. Composite-Only Animations & Transitions
- **Hardware-Accelerated Properties:** Only animate `transform` and `opacity`. These skip Layout (reflow) and Paint, executing directly on the GPU compositor thread.
- **Avoid Layout & Paint Properties:** Do not animate geometry (`width`, `height`, `top`, `left`, `margin`, `padding`) or costly paint properties (`box-shadow`, `border-radius`, `background-color`).
- **Targeted `will-change`:** Apply `will-change: transform, opacity;` only immediately before animations begin, and remove it once finished to conserve GPU memory.

### 6. Keep DOM Tree Size Small (Virtualization & Lazy Mounting)
- **Virtualization:** For large datasets, mount only the visible items plus a small buffer, recycling or adding/removing nodes as the user scrolls.
- **Lazy Mounting:** Defer mounting expensive subtrees and resources using `IntersectionObserver`.
- **Cleanup:** Disconnect observers, remove event listeners, and prune detached subtrees to prevent memory leaks and retained detached DOM trees.

### 7. Event & Input Optimization
- **Event Delegation:** Bind a single event listener on an ancestor container and evaluate `event.target` instead of attaching listeners to hundreds of individual elements.
- **Passive Listeners:** Supply `{ passive: true }` to touch and wheel listeners to prevent blocking compositor scrolling.
- **Throttling & Debouncing:** Throttle high-frequency events (`scroll`, `resize`, `pointermove`) and align visual updates with `requestAnimationFrame`.
