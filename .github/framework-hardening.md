## One Stable Identity Per Named Node

A name such as `header`, `title` or `actions` should always identify the same conceptual component region.

Needed guarantees:

- Reject or warn on duplicate names within one blueprint.
- Define duplicate behavior explicitly when multiple configurations provide the same name.
- Keep the node’s name stable even if its tag or attributes change.
- Preserve references in `element.nodes` only while the corresponding live node exists.
- Decide whether nested components may reuse names; likely yes, because names are scoped by owner.

For a CMS, `name` effectively becomes the addressing language. It must not be arbitrary metadata.

## Deterministic Blueprint/Config Precedence

The engine currently combines data from several places: defaults, `nodesConfig`, blueprint attributes, element attributes, template values and runtime edits.

Define a strict precedence order, for example:

1. runtime edit;
2. application-provided `nodesConfig`;
3. consumer blueprint/template;
4. component blueprint;
5. component defaults.

Then document merge behavior:

- Does a consumer replace a node config or deep-merge it?
- Can a class list append or only replace?
- Does `false` override a default `true`?
- Can an application remove a default node?
- Is `tag` mutable after construction?

This should be implemented once and tested as a table-driven merge matrix.

## Documented Zone Placement And Reconnect Behavior

A zone placement is an operation on the live component graph. Its behavior should be specified for:

- target not present yet;
- target appearing after deferred initialization;
- duplicate zones with the same name;
- prepend, append and replace;
- missing parent or nested target;
- target being re-rendered;
- moving the host component between DOM locations;
- removing and reconnecting the host;
- removing a zone after placement.

Two aspects are especially important:

- Content ownership: when the host is destroyed, are zone children destroyed or preserved?
- Reconciliation: when a target is replaced, do its original zone children move to the replacement?

It would be useful to model zone placement as an idempotent operation.

## Serializable Versus Runtime-Only Configuration

A server or CMS must know which `nodesConfig` values can safely be stored and transmitted.

Portable values include:

- strings, numbers and booleans;
- arrays and plain objects;
- tag and node names;
- attributes;
- data-source identifiers;
- registered validator/handler names.

Runtime-only values include:

- functions and callbacks;
- class constructors;
- DOM nodes;
- service instances;
- promises;
- live event subscriptions.

Resolve runtime-only references through registries:

```js
{
    tag: 'text-field',
    validator: 'required',
    onChange: 'article:updateSlug'
}
```

The server contract remains JSON-compatible, while the browser resolves those names to functions.

## SSR Reuse Without Subtree Replacement

The server can produce the same named node graph:

```html
<article-form>
  <text-field name="title">...</text-field>
  <text-field name="body">...</text-field>
</article-form>
```

A useful implementation should:

1. detect existing named nodes;
2. register them in `nodes`;
3. compare expected tags and config;
4. attach behavior and listeners;
5. create or replace only mismatched nodes.

The current `reuseExistingNodes` option suggests this direction, but the guarantee should be stronger. A hydration test should verify that:

- original nodes keep identity;
- focus and input state survive upgrade;
- server content is not cleared;
- no duplicate nodes appear;
- mismatched nodes produce diagnostics;
- hydration does not perform unbounded async replacement.

## Authoritative Readiness And Error States

Nested nodes, zones, deferred operations and events currently involve several promises and waiting methods. Components should expose clear states:

```js
element.state // "idle" | "rendering" | "ready" | "failed" | "destroyed"
element.updateComplete
```

One authoritative completion promise should represent:

- blueprint evaluation;
- node creation or reuse;
- zone placement;
- deferred node initialization;
- event binding;
- final lifecycle callbacks.

Failures should reject that promise and surface through:

- an `error` event;
- an inspectable error property;
- useful context: component, node, zone and expected target.

Timer retries should not define readiness. The relevant nodes and zones should notify completion directly.

## Predictable Update Versus Full-Render Behavior

Every configuration change should have a defined update strategy.

For example:

| Change | Strategy |
|---|---|
| Label/content | Update target node |
| Attribute/class | Patch existing DOM |
| Disabled/value | Native property/attribute update |
| Node tag | Replace that named node |
| Node structure | Re-render a named subtree |
| View/layout | Full component subtree render |
| Zone payload | Place/unplace only affected zone |

`setProp` should identify whether it is changing configuration, a node, or layout. Structural changes should not trigger a full host rebuild unless the structure genuinely changed.

That rule preserves focus, native form state and event identity. It also makes performance bounded and predictable without introducing a DOM diffing engine.