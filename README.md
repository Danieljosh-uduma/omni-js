# OmniJS Framework

An enterprise-ready frontend framework featuring a dual-engine workflow for friction-free development and ultra-fast production builds.

## Project Structure

```
omni-js/
├── packages/
│   ├── runtime/        # Dev Mode Runtime Interpreter (@omni/runtime)
│   └── cli/            # Production AOT Compiler CLI (@omni/cli)
├── example/            # Starter application
├── docs/               # Official documentation site (built with OmniJS)
├── package.json        # Monorepo root
└── README.md
```

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Build the Core Runtime

This compiles the OmniJS Runtime Interpreter into a single file that can be loaded in any browser.

```bash
npm run build:runtime
```

### 3. Run the Documentation Site

```bash
cd docs
npm run dev
```

Open the URL printed in your terminal (e.g. `http://localhost:5500`). Click the sidebar to navigate between pages — routing is fully built into the framework.

### 4. Run the Example App

```bash
cd example
npm run dev
```

Open the URL printed in your terminal.

---

## How to Write OmniJS Code

Create a `.omni` file with three blocks — `<script>`, `<style>`, and your template using the 6 core blocks.

### The 6 Core Blocks

OmniJS maps six core semantic tags to HTML5 elements based on DOM depth, nesting hierarchy, or explicit overrides:

| Block                                                | Compiles To (Default / Variant)               | Purpose                                         |
| ---------------------------------------------------- | --------------------------------------------- | ----------------------------------------------- |
| [`<Stack>`](SEMANTIC_ELEMENTS.md#11-stack)           | `<main>`, `<section>`, `<div>`                | Structural layouts, groups, sections            |
| [`<Text>`](SEMANTIC_ELEMENTS.md#12-text)             | `<h1>`–`<h6>`, `<p>`, `<li>`, `<td>`          | Dynamic headings, copy, list items, table cells |
| [`<Action>`](SEMANTIC_ELEMENTS.md#13-action)         | `<button>`, `<a>`                             | Interactive actions, triggers, and links        |
| [`<Collection>`](SEMANTIC_ELEMENTS.md#14-collection) | `<ul>`, `<ol>`, `<table>`                     | List renders, data grids, repeating components  |
| [`<Media>`](SEMANTIC_ELEMENTS.md#15-media)           | `<img>`, `<video>`, `<audio>`, `<iframe>`     | Embedded media and iframe wrappers              |
| [`<Form>`](SEMANTIC_ELEMENTS.md#16-form)             | `<form>`, `<input>`, `<textarea>`, `<select>` | Interactive form inputs and form containers     |

For detailed behavior and override examples, read the [Semantic Element Specification](SEMANTIC_ELEMENTS.md).

### Example `.omni` File

```html
<script>
  state ?counter = 0;

  function increment() {
    ?counter = ?counter + 1;
  }
</script>

<style>
  .btn {
    background: #007bff;
    color: white;
    padding: 10px;
    border-radius: 4px;
  }
</style>

<Stack>
  <Text>Counter: </Text>
  <Text bind::text="?counter"></Text>
  <Action class="btn" on::click="increment">Add +1</Action>
</Stack>
```

### Declarative Routing

Navigation is a first-class framework feature. No config files, no imports.

```html
<!-- Link to a page -->
<Action navigate::to="/about">About</Action>

<!-- This Stack only shows when the URL matches -->
<Stack route="/about">
  <Text>About Page</Text>
</Stack>
```

### State Management & Global Stores

Every variable created with the `state` keyword is automatically registered in a global state object (`window.globalOmniState`) by name.

For complex state, you can also define declarative stores using `createStore(initialState, name)`:

```javascript
// Define a central store
const store = createStore({ theme: 'dark', user: null }, 'appStore');
```

---

## 🌎 Hydration & SEO Target

OmniJS compiles templates down to an SEO-optimized **Full Hydration** target. During builds, the HTML layout is statically pre-rendered so search crawlers can instantly index your page. On page load, the runtime reactively connects event listeners and signal observers in-place without replacing or shifting DOM elements.

Read the [Hydration Specification](HYDRATION.md) for more details.

---

### Importing Components

Use the `<Use>` tag to import other `.omni` files as reusable components.

```html
<Use component="./Header.omni" name="Header" />

<Stack>
  <header />
  <Text>Page content here</Text>
</Stack>
```

### GSAP Animations

Attach animations declaratively. The framework manages the lifecycle.

```html
<Stack animate::load="from: { opacity: 0, y: -20, duration: 0.6 }">
  <Text>I fade in on load</Text>
</Stack>
```

---

## 🛠️ Production Build

When ready to deploy, compile your app into optimized vanilla JS:

```bash
cd docs   # or cd example
npm run build
```

The CLI outputs a minified, tree-shaken bundle to `dist/`. No CDN dependencies, no runtime parser — just optimized JavaScript.

---

## Dual-Engine Architecture

|                  | Dev Mode                                 | Production Mode                      |
| ---------------- | ---------------------------------------- | ------------------------------------ |
| **Engine**       | Runtime Interpreter                      | AOT Compiler CLI                     |
| **Build Step**   | None (zero-build)                        | `npm run build`                      |
| **How It Works** | Fetches `.omni` files, parses in-browser | esbuild plugin compiles `.omni` → JS |
| **Bundle Size**  | Runtime (~10kb) loaded once              | Only compiled output ships           |
| **Use Case**     | Local development                        | Deployment                           |

---

## 📊 Benchmarks & Performance

To prove its production readiness, here are the real-world benchmarks measured on the OmniJS framework:

| Metric                      | Result                     | Description                                                                                                                                  |
| --------------------------- | -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| **Reactivity Speed**        | **1,225,000+ updates/sec** | Operations/sec executing signal write/read cycles + side-effect runs.                                                                        |
| **AOT Build Speed**         | **~118 ms**                | Total compile and bundle time per component using the esbuild plugin compiler.                                                               |
| **Reactivity Core Size**    | **3.52 KB**                | Minified size of the reactive signals library.                                                                                               |
| **Full Production Runtime** | **16.56 KB**               | Minified size of the entire framework client library (Reactivity, Renderer, History API Router, Forms, Async Resources, and Error overlays). |
