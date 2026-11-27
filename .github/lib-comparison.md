There are systems with individual similarities, but I do not know of another library combining your exact set of ideas: light-DOM custom elements, named internal nodes, one-to-one `arpa-node`/`nodesConfig`, zones, live parsing, schema-driven forms/lists, SSR reuse, and CMS-oriented composition.

Closest comparisons:

- **FAST**: The closest custom-element architecture. It has design tokens, dependency injection, component definitions and declarative templates. It is TypeScript/compiler-oriented and does not expose anything equivalent to your runtime `nodesConfig` component graph.
- **Lit**: Strong native custom-element templating and lifecycle tooling. It supports light DOM, but its templates normally compile to update parts. It has no named-node configuration model or zones.
- **Shoelace/Web Awesome**: Mature component libraries with excellent APIs, accessibility and theming. Their components are mostly shadow-DOM widgets rather than configurable application structure.
- **Vaadin and SAP UI5 Web Components**: Broad enterprise coverage, including forms, grids and application concerns. Their customization and data models are much more prescriptive and not based on named runtime component graphs.
- **Builder.io, Plasmic and Qwik Builder-style systems**: These use serializable component trees and CMS schemas. They are conceptually close on schema-to-component rendering, but they have visual editor platforms, framework adapters and usually proprietary/cloud-oriented tooling. They do not expose your node/zone mechanics as the core component contract.
- **Server-driven UI systems such as Hyperview or HTMX-style architectures**: Strongly related to “the server implements the same UI contract.” They normally stream markup or commands rather than maintaining reusable named component graphs.
- **Drupal Layout Builder and other CMS block systems**: Similar at the CMS content-composition level, but operate at page/block granularity rather than inside reusable web components.
- **ERP/domain platforms such as Vaadin Flow and Laravel Livewire**: A server-controlled component model drives frontend UI, but with substantial runtime and framework ownership.

So the differentiator is not any single primitive:

- Lit has templates.
- Web components have custom elements.
- CMS builders have serializable trees.
- Server-driven systems use shared contracts.
- Native slots provide composition.
- Framework libraries provide forms and lists.

Your combination is unusual because **the same named node graph acts as blueprint, runtime structure, configuration schema, SSR description and CMS addressing model**.

I would phrase it as a:

> live, light-DOM custom-element composition runtime with a serializable node graph

rather than “another web-component framework.” That description captures what appears genuinely different.