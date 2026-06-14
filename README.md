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

Create a `.omni` file with three blocks — `<script>`, `<style>`, and your template using the 4 core blocks.

### The 4 Core Blocks

| Block | Compiles To |
|---|---|
| `<Stack>` | `<main>`, `<section>`, `<div>` (based on depth) |
| `<Text>` | `<h1>`–`<h6>`, `<p>` (based on hierarchy) |
| `<Action>` | `<button>`, `<a>`, `<input>` (based on attributes) |
| `<Collection>` | `<ul>`, `<ol>`, `<table>` (based on data) |

### Example `.omni` File

```html
<script>
  let ?counter = 0;

  function increment() {
    ?counter = ?counter + 1;
  }
</script>

<style>
  .btn { background: #007bff; color: white; padding: 10px; border-radius: 4px; }
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

### Importing Components

Use the `<Use>` tag to import other `.omni` files as reusable components.

```html
<Use component="./Header.omni" name="Header" />

<Stack>
  <Header />
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

| | Dev Mode | Production Mode |
|---|---|---|
| **Engine** | Runtime Interpreter | AOT Compiler CLI |
| **Build Step** | None (zero-build) | `npm run build` |
| **How It Works** | Fetches `.omni` files, parses in-browser | esbuild plugin compiles `.omni` → JS |
| **Bundle Size** | Runtime (~10kb) loaded once | Only compiled output ships |
| **Use Case** | Local development | Deployment |
