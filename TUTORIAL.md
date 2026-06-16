# OmniJS — The Complete Developer Tutorial

> From zero to production in one guide. This tutorial covers every feature, syntax rule, and architectural concept in the OmniJS framework.

---

## Table of Contents

1. [What is OmniJS?](#1-what-is-omnijs)
2. [Installation & Project Setup](#2-installation--project-setup)
3. [Your First `.omni` File](#3-your-first-omni-file)
4. [The `.omni` File Anatomy](#4-the-omni-file-anatomy)
5. [The 4 Core Blocks — Deep Dive](#5-the-4-core-blocks--deep-dive)
6. [Styling](#6-styling)
7. [Reactivity — State & Signals](#7-reactivity--state--signals)
8. [Declarative Bindings](#8-declarative-bindings)
9. [Event Handling](#9-event-handling)
10. [Routing](#10-routing)
11. [Component Imports & Composition](#11-component-imports--composition)
12. [Animations (GSAP Integration)](#12-animations-gsap-integration)
13. [Single-File vs Multi-File Components](#13-single-file-vs-multi-file-components)
14. [Dev Mode — Zero-Build Runtime](#14-dev-mode--zero-build-runtime)
15. [Production Mode — AOT Compiler CLI](#15-production-mode--aot-compiler-cli)
16. [Project Structure Best Practices](#16-project-structure-best-practices)
17. [Accessibility](#17-accessibility)
18. [Complete Reference Cheatsheet](#18-complete-reference-cheatsheet)

---

## 1. What is OmniJS?

OmniJS is an enterprise-ready frontend framework that replaces traditional HTML with exactly **4 universal building blocks**. It features a dual-engine architecture:

- **Dev Mode**: A lightweight runtime interpreter fetches and compiles `.omni` files directly in the browser — zero build step, zero config.
- **Production Mode**: An AOT (Ahead-of-Time) compiler CLI powered by esbuild transforms your `.omni` source into optimized, minified vanilla JavaScript bundles.

### Why OmniJS?

| Traditional HTML               | OmniJS                                            |
| ------------------------------ | ------------------------------------------------- |
| 100+ HTML elements to memorize | 4 blocks: `Stack`, `Text`, `Action`, `Collection` |
| Manual `<div>` soup            | Automatic semantic HTML output                    |
| Separate router library needed | Routing is a native attribute                     |
| GSAP lifecycle management      | Declarative `animate::` attributes                |
| Manual ARIA roles              | Automatic accessibility injection                 |

---

## 2. Installation & Project Setup

### Prerequisites

- Node.js 18+ and npm 9+

### Create a New Project

```bash
mkdir my-omni-app
cd my-omni-app
npm init -y
```

### Install the Framework

```bash
npm install @omni/runtime @omni/cli
```

If you want animations:

```bash
npm install gsap
```

### Build the Runtime

Before you can use Dev Mode, compile the runtime interpreter once:

```bash
npx omni build-runtime
```

This generates `omni-runtime.js` — a single ~10kb file that powers your entire development workflow.

### Create Your Entry Point

Create an `index.html`:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>My OmniJS App</title>
    <script src="./omni-runtime.js" type="module"></script>
  </head>
  <body>
    <script type="text/omni" src="./src/App.omni"></script>
  </body>
</html>
```

That's it. No webpack. No vite config. No `next.config.js`. Just an HTML file and a script tag.

---

## 3. Your First `.omni` File

Create `src/App.omni`:

```html
<style>
  .greeting {
    font-family: sans-serif;
    padding: 2rem;
    text-align: center;
  }
</style>

<Stack class="greeting">
  <Text>Hello, OmniJS!</Text>
  <Text>Welcome to the future of frontend.</Text>
</Stack>
```

Start a local server (e.g., `npx serve .`) and open your browser. You'll see your app rendered with proper semantic HTML — no build step needed.

**What happened under the hood:**

1. The runtime intercepted `<script type="text/omni" src="./src/App.omni">`.
2. It fetched `App.omni` via HTTP.
3. It parsed the `<style>` block and injected it into the document `<head>`.
4. It parsed the template blocks and translated them into real DOM elements.
5. `<Stack>` at depth 1 became `<main>`. `<Text>` at depth 1 became `<h1>`, and the second `<Text>` became `<h2>`.

---

## 4. The `.omni` File Anatomy

Every `.omni` file is a **Single-File Component (SFC)** containing up to three sections:

```html
<script>
  <!-- JavaScript logic, reactive state, functions -->
</script>

<style>
  /* CSS styling for this component */
</style>

<!-- Template: your 4 core blocks go here -->
<Stack>
  <Text>Content</Text>
</Stack>
```

### Section Rules

| Section    | Required? | Purpose                                           |
| ---------- | --------- | ------------------------------------------------- |
| `<script>` | No        | Component logic, state declarations, functions    |
| `<style>`  | No        | CSS styles (injected into `<head>` at mount time) |
| Template   | Yes       | The structural blocks that define your UI         |

### Section Order

Sections can appear in **any order**. The parser extracts `<script>` and `<style>` first, then treats everything remaining as the template.

---

## 5. The 4 Core Blocks — Deep Dive

### 5.1 `<Stack>` — Layout & Structure

The `Stack` is the universal container element. It replaces `<div>`, `<section>`, `<main>`, `<nav>`, `<header>`, and `<footer>`.

**How it compiles:**
The compiler uses **tree depth** to determine the semantic HTML tag:

| Stack Depth | Output Element | Typical Use       |
| ----------- | -------------- | ----------------- |
| 1 (root)    | `<main>`       | Page wrapper      |
| 2           | `<section>`    | Content section   |
| 3+          | `<div>`        | Generic container |

**Example:**

```html
<!-- Depth 1 → <main> -->
<Stack>
  <!-- Depth 2 → <section> -->
  <Stack>
    <!-- Depth 3 → <div> -->
    <Stack>
      <Text>Nested content</Text>
    </Stack>
  </Stack>
</Stack>
```

**Output HTML:**

```html
<main>
  <section>
    <div>
      <h1>Nested content</h1>
    </div>
  </section>
</main>
```

**Attributes:**

```html
<Stack class="my-class" style="padding: 2rem;" id="hero">
  <!-- Standard HTML attributes pass through directly -->
</Stack>
```

---

### 5.2 `<Text>` — Typography & Content

The `Text` block handles all text rendering. It replaces `<h1>`–`<h6>`, `<p>`, and `<span>`.

**How it compiles:**
The compiler uses **heading hierarchy depth** to determine the tag:

| Text Depth | Output Element | Typical Use            |
| ---------- | -------------- | ---------------------- |
| 1          | `<h1>`         | Page title             |
| 2          | `<h2>`         | Section heading        |
| 3          | `<h3>`         | Subsection heading     |
| 4          | `<h4>`         | Sub-subsection heading |
| 5          | `<h5>`         | Minor heading          |
| 6          | `<h6>`         | Smallest heading       |
| 7+         | `<p>`          | Body paragraph         |

**Important:** The heading depth counter increments as the renderer walks your template from top to bottom. Each `<Text>` at the same nesting level gets the next heading level.

**Example:**

```html
<Stack>
  <Text>Page Title</Text>
  <!-- h1 -->
  <Text>Section Heading</Text>
  <!-- h2 -->
  <Text>Subsection</Text>
  <!-- h3 -->
  <Text>Paragraph text here</Text
  ><!-- h4 -->
</Stack>
```

**Styling text:**

```html
<Text class="hero-title" style="font-size: 4rem; color: #ff007f;"> Big Bold Title </Text>
```

---

### 5.3 `<Action>` — Interactive Elements

The `Action` block handles all interactive elements. It replaces `<button>`, `<a>`, `<input>`, and `<textarea>`.

**How it compiles — determined by attributes:**

| Attribute Present      | Output Element         | Use Case               |
| ---------------------- | ---------------------- | ---------------------- |
| `navigate::to="/path"` | `<button role="link">` | Client-side navigation |
| `href="https://..."`   | `<a>`                  | External link          |
| `on::click="handler"`  | `<button>`             | Click action           |
| `bind::value="?state"` | `<input>`              | Form input (future)    |
| _(none)_               | `<button>`             | Generic button         |

**Examples:**

```html
<!-- Navigation button (uses the built-in router) -->
<Action navigate::to="/about">About Us</Action>

<!-- External link -->
<Action href="https://github.com">GitHub</Action>

<!-- Button with click handler -->
<Action on::click="handleSubmit" class="btn">Submit</Action>
```

---

### 5.4 `<Collection>` — Lists & Data Iteration

The `Collection` block iterates over arrays to produce lists and tables. It replaces `<ul>`, `<ol>`, `<li>`, `<table>`, `<tr>`, and `<td>`.

**Basic usage:**

```html
<Collection>
  <Text>Item One</Text>
  <Text>Item Two</Text>
  <Text>Item Three</Text>
</Collection>
```

**Output:**

```html
<ul>
  <h1>Item One</h1>
  <h2>Item Two</h2>
  <h3>Item Three</h3>
</ul>
```

---

## 6. Styling

### Inline `<style>` Block

Every `.omni` file can include a `<style>` block. The CSS is automatically injected into the document `<head>` when the component mounts.

```html
<style>
  .card {
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    padding: 2rem;
    transition: border-color 0.25s ease;
  }
  .card:hover {
    border-color: rgba(255, 0, 127, 0.3);
  }
</style>

<Stack class="card">
  <Text>Hover me!</Text>
</Stack>
```

### Pass-Through Classes

OmniJS passes `class` attributes directly to the final rendered HTML element. This means you can use **any CSS framework** (Tailwind, Bootstrap, etc.) alongside OmniJS:

```html
<!-- Tailwind CSS classes work out of the box -->
<Stack class="flex items-center gap-4 p-6 bg-gray-900 rounded-xl">
  <Text class="text-2xl font-bold text-white">Dashboard</Text>
</Stack>
```

### Inline Styles

Standard `style` attributes are also passed through:

```html
<Text style="color: #ff007f; font-size: 3rem; font-weight: 800;"> Styled Text </Text>
```

### CSS Deduplication

If the same component is mounted multiple times, OmniJS automatically deduplicates the `<style>` injection using a content hash. Your styles are injected exactly once, no matter how many instances exist.

---

## 7. Reactivity — State & Signals

OmniJS uses a zero-overhead **Proxy/Signal** reactivity system. When state changes, only the specific DOM nodes that depend on it are updated — no virtual DOM diffing.

### Declaring Reactive State

Prefix any variable with `?` inside the `<script>` block:

```html
<script>
  let ?count = 0;
  let ?name = "OmniJS";
  let ?isVisible = true;
  let ?items = ["Alpha", "Beta", "Gamma"];
</script>
```

**What happens under the hood:**
The parser transforms `let ?count = 0` into `context.count = context.createSignal(0)`. This creates a signal object with a `.value` getter/setter that tracks subscribers and triggers DOM updates on mutation.

### Mutating State

Assign to reactive variables naturally — the `?` prefix is used consistently:

```html
<script>
  let ?count = 0;

  function increment() {
    ?count = ?count + 1;
  }

  function reset() {
    ?count = 0;
  }

  function setName(newName) {
    ?name = newName;
  }
</script>
```

### How Reactivity Flows

```
1. Developer writes:   let ?count = 0;
2. Parser transforms:  context.count = context.createSignal(0);
3. Template uses:      <Text bind::text="?count"></Text>
4. Renderer creates:   effect(() => el.textContent = context.count.value)
5. On mutation:        ?count = 5 → context.count.value = 5 → effect re-runs → DOM updates
```

---

## 8. Declarative Bindings

Bindings connect reactive state to DOM properties without imperative code.

### `bind::text` — Text Content

Binds a signal's value as the text content of an element:

```html
<Text bind::text="?count"></Text>
```

When `?count` changes, the text updates instantly.

### `bind::value` — Input Value

Binds a signal to an input element's value:

```html
<Action bind::value="?username"></Action>
```

### `bind::[attribute]` — Any Attribute

You can bind to **any** HTML attribute:

```html
<!-- Bind to a class attribute -->
<Stack bind::class="?currentClass"></Stack>

<!-- Bind to a data attribute -->
<Stack bind::data-status="?status"></Stack>
```

### Inline Interpolation

You can embed reactive values directly in text using curly braces:

```html
<Text>Hello, {?name}! You have {?count} items.</Text>
```

The framework wraps interpolated text in a reactive effect, so the display updates automatically when any referenced signal changes.

---

## 9. Event Handling

### `on::click` — Click Events

```html
<script>
  function handleClick() {
    ?count = ?count + 1;
  }
</script>

<Action on::click="handleClick">Click Me</Action>
```

### `on::[event]` — Any DOM Event

The `on::` prefix works with **any** standard DOM event name:

```html
<Action on::mouseover="handleHover">Hover Me</Action>
<Action on::keydown="handleKey">Type Here</Action>
<Action on::submit="handleSubmit">Submit</Action>
```

### Event Handler Rules

1. The value of `on::event` must be the **name** of a function declared in the `<script>` block.
2. Functions are automatically attached to the component context by the parser.
3. Inside event handlers, you can read and mutate any `?state` variable.

---

## 10. Routing

OmniJS has a **fully abstracted, built-in router**. No imports. No config files. No `react-router`. No `vue-router`. It just works.

### How It Works

The router uses **hash-based URLs** (`#/path`) so it works on any static file server with zero configuration. A hidden reactive signal tracks the current route, and route containers automatically mount/unmount based on URL matches.

### `navigate::to` — Navigation Links

Attach this attribute to any `<Action>` to create a client-side navigation link:

```html
<Action navigate::to="/">Home</Action>
<Action navigate::to="/about">About</Action>
<Action navigate::to="/contact">Contact</Action>
```

When clicked:

1. The URL hash updates (e.g., `http://localhost:5500/#/about`)
2. The internal router signal updates
3. All `route` containers re-evaluate
4. The matching container shows, others hide
5. **No page reload occurs**

### `route` — View Containers

Attach this attribute to any `<Stack>` to make it a route-aware container:

```html
<Stack route="/">
  <Text>This is the Home page</Text>
</Stack>

<Stack route="/about">
  <Text>This is the About page</Text>
</Stack>

<Stack route="/contact">
  <Text>This is the Contact page</Text>
</Stack>
```

Only the `<Stack>` whose `route` value matches the current URL hash is visible. All others are hidden via `display: none`.

### Full Routing Example

```html
<style>
  .nav {
    display: flex;
    gap: 1rem;
    padding: 1rem;
  }
  .nav-link {
    background: none;
    border: none;
    color: #00f0ff;
    cursor: pointer;
  }
</style>

<Stack>
  <!-- Navigation Bar -->
  <Stack class="nav">
    <Action class="nav-link" navigate::to="/">Home</Action>
    <Action class="nav-link" navigate::to="/docs">Docs</Action>
    <Action class="nav-link" navigate::to="/about">About</Action>
  </Stack>

  <!-- Page Views -->
  <Stack route="/">
    <Text>Welcome Home</Text>
  </Stack>

  <Stack route="/docs">
    <Text>Documentation</Text>
  </Stack>

  <Stack route="/about">
    <Text>About Us</Text>
  </Stack>
</Stack>
```

### Default Route

The `/` route matches when the URL hash is empty (`#/` or no hash at all). This makes it the natural "home" or default page.

### Browser Back/Forward

The router listens to the browser's `hashchange` event. Pressing the browser's back and forward buttons works exactly as expected — the reactive signal updates and the correct route container shows.

---

## 11. Component Imports & Composition

### The `<Use>` Tag

Import other `.omni` files as reusable components:

```html
<Use component="./Header.omni" name="Header" />
<Use component="./Footer.omni" name="Footer" />
<Use component="./Card.omni" name="Card" />
```

**Parameters:**
| Attribute | Purpose |
|---|---|
| `component` | Relative path to the `.omni` file |
| `name` | The tag name to use in your template |

### Using Imported Components

After declaring a `<Use>` import, use the component by its `name` as a custom tag:

```html
<Use component="./Header.omni" name="Header" />
<Use component="./Footer.omni" name="Footer" />

<Stack>
  <header />
  <Text>Page content goes here</Text>
  <footer />
</Stack>
```

### How Component Loading Works

**Dev Mode:**

1. The parser extracts all `<Use>` tags and records their `src` and `name`.
2. When the renderer encounters a custom tag (e.g., `<Header />`), it looks up the registered component.
3. It fetches the `.omni` file via HTTP (`fetch()`).
4. It mounts the fetched component into a wrapper `<div>`.

**Production Mode:**
The CLI compiler resolves all component imports statically at build time and bundles them into the final output. No runtime fetching occurs.

### Component Isolation

Each component has its own:

- **Style scope**: CSS from one component doesn't leak into another (they're injected with unique hashes).
- **Script scope**: Functions and state from one component don't collide with another.

### File Path Rules

Component paths in `<Use>` are resolved **relative to the HTML page being served**, not relative to the `.omni` file. This is because in Dev Mode, the browser's `fetch()` resolves paths relative to the document.

```html
<!-- If your index.html is in /docs/ and components are in /docs/src/ -->
<Use component="./src/Header.omni" name="Header" />
```

---

## 12. Animations (GSAP Integration)

OmniJS has a native integration with GSAP (GreenSock Animation Platform). Animations are declared as attributes — the framework manages the full lifecycle.

### Setup

Install GSAP locally (no CDN required):

```bash
npm install gsap
```

Include it in your HTML before the OmniJS runtime:

```html
<script src="./node_modules/gsap/dist/gsap.min.js"></script>
<script src="./omni-runtime.js" type="module"></script>
```

### `animate::load` — Entrance Animations

Trigger animations when an element mounts:

```html
<!-- Fade in from below -->
<Stack animate::load="from: { opacity: 0, y: 50, duration: 0.8 }">
  <Text>I slide up and fade in</Text>
</Stack>

<!-- Fade in from the left -->
<Text animate::load="from: { opacity: 0, x: -30, duration: 0.5 }"> I slide in from the left </Text>

<!-- Scale in -->
<Stack animate::load="from: { opacity: 0, scale: 0.9, duration: 0.6 }">
  <Text>I scale up and fade in</Text>
</Stack>
```

### Animation Syntax

The value follows the pattern:

```
from: { property: value, property: value, duration: seconds }
```

Any valid GSAP tween property works:

- `opacity` — Transparency (0 to 1)
- `x`, `y` — Horizontal/vertical offset in pixels
- `scale` — Size multiplier
- `rotation` — Degrees of rotation
- `duration` — Animation length in seconds
- `delay` — Wait before starting
- `ease` — Easing function (e.g., `"power2.out"`)

### Example with Easing and Delay

```html
<Stack animate::load="from: { opacity: 0, y: 100, duration: 1.2, ease: 'power3.out', delay: 0.3 }">
  <Text>Smoothly animated content</Text>
</Stack>
```

---

## 13. Single-File vs Multi-File Components

### Single-File Components (SFC)

The default and recommended approach. Logic, styles, and template live in one `.omni` file:

```html
<script>
  let ?count = 0;
  function add() { ?count = ?count + 1; }
</script>

<style>
  .counter {
    padding: 2rem;
  }
</style>

<Stack class="counter">
  <Text bind::text="?count"></Text>
  <Action on::click="add">+1</Action>
</Stack>
```

### Multi-File Components (Separation of Concerns)

For large components, you can split logic and styles into separate files using `src::` directives:

```html
<script src::logic="./Counter.js"></script>
<style src::style="./Counter.css"></style>

<Stack class="counter">
  <Text bind::text="?count"></Text>
  <Action on::click="add">+1</Action>
</Stack>
```

**`Counter.js`:**

```javascript
let ?count = 0;
function add() { ?count = ?count + 1; }
```

**`Counter.css`:**

```css
.counter {
  padding: 2rem;
}
```

In Dev Mode, the runtime fetches these files asynchronously. In Production Mode, the CLI bundles and minifies them statically.

---

## 14. Dev Mode — Zero-Build Runtime

### How It Works

1. You include `omni-runtime.js` via a `<script>` tag in your HTML.
2. You add `<script type="text/omni" src="./App.omni">` tags pointing to your components.
3. On page load, the runtime:
   - Finds all `<script type="text/omni">` tags
   - Fetches each `.omni` file via HTTP
   - Parses the source into an AST (script, style, template)
   - Transforms the `<script>` block (reactive syntax → signals)
   - Injects the `<style>` block into `<head>`
   - Walks the template tree and generates real DOM nodes
   - Sets up reactive bindings and event listeners
   - Initializes the router

### When to Use Dev Mode

- Local development and prototyping
- Rapid iteration without waiting for builds
- Testing new components in isolation
- Learning the framework

### Limitations of Dev Mode

- Each `.omni` file triggers an HTTP request (acceptable locally, not for production)
- The parser runs in the browser (adds ~10kb to the page)
- No tree-shaking or minification

---

## 15. Production Mode — AOT Compiler CLI

### How It Works

The `@omni/cli` package provides the `omni` command. It uses esbuild with a custom plugin that:

1. Intercepts `.omni` file imports
2. Runs the same parser as the Dev Runtime
3. Transforms the reactive syntax
4. Generates optimized JavaScript render functions
5. Extracts CSS into the bundle
6. Applies tree-shaking to remove unused code
7. Minifies everything

### Running a Build

```bash
omni build src/App.omni --outdir=dist
```

### Build Output

```
dist/
├── App.js    # Minified, tree-shaken JavaScript bundle
```

### Serving the Production Build

Create a `dist/index.html`:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>My App</title>
  </head>
  <body>
    <script type="module">
      import mount from './App.js';
      mount(document.body);
    </script>
  </body>
</html>
```

Then serve the `dist/` directory:

```bash
npx serve dist
```

### Dev vs Production Comparison

| Feature      | Dev Mode                    | Production Mode           |
| ------------ | --------------------------- | ------------------------- |
| Build step   | None                        | `omni build`              |
| File loading | HTTP fetch per `.omni` file | Single bundled `.js` file |
| Parser       | Runs in browser             | Runs at build time only   |
| CSS          | Injected at runtime         | Inlined in bundle         |
| Minification | No                          | Yes                       |
| Tree-shaking | No                          | Yes                       |
| Bundle size  | ~10kb runtime + raw files   | Optimized single file     |

---

## 16. Project Structure Best Practices

### Small Project

```
my-app/
├── index.html
├── omni-runtime.js
├── src/
│   ├── App.omni
│   ├── Header.omni
│   └── Footer.omni
└── package.json
```

### Medium Project

```
my-app/
├── index.html
├── omni-runtime.js
├── src/
│   ├── App.omni           # Root layout + routing
│   ├── components/
│   │   ├── Header.omni
│   │   ├── Footer.omni
│   │   ├── Card.omni
│   │   └── Button.omni
│   ├── pages/
│   │   ├── Home.omni
│   │   ├── About.omni
│   │   └── Contact.omni
│   └── styles/
│       └── global.css
├── dist/                   # Production output
└── package.json
```

### Enterprise Monorepo

```
omni-project/
├── packages/
│   ├── runtime/            # @omni/runtime
│   └── cli/                # @omni/cli
├── apps/
│   ├── marketing-site/
│   │   ├── index.html
│   │   └── src/
│   ├── admin-dashboard/
│   │   ├── index.html
│   │   └── src/
│   └── docs/
│       ├── index.html
│       └── src/
├── package.json            # Monorepo root with workspaces
└── README.md
```

---

## 17. Accessibility

OmniJS automatically handles several accessibility concerns:

### Semantic HTML

The core block mapping ensures your output uses proper semantic elements:

- `<main>`, `<section>` instead of generic `<div>`
- Proper heading hierarchy (`<h1>` through `<h6>`)
- `<button>` and `<a>` instead of clickable `<div>`s

### Automatic ARIA Attributes

- `<Action navigate::to="...">` gets `role="link"`
- Buttons are real `<button>` elements (keyboard accessible by default)
- Links are real `<a>` elements (screen reader compatible)

### Manual ARIA

You can add any ARIA attribute manually, and it passes through to the rendered element:

```html
<Stack role="alert" aria-live="polite">
  <Text>Important notification</Text>
</Stack>

<Action aria-label="Close dialog" on::click="close">✕</Action>
```

---

## 18. Complete Reference Cheatsheet

### Core Blocks

```
<Stack>        → <main> / <section> / <div>    (by depth)
<Text>         → <h1>–<h6> / <p>               (by hierarchy)
<Action>       → <button> / <a> / <input>       (by attributes)
<Collection>   → <ul> / <ol> / <table>          (by data)
```

### Reactive State

```
let ?myVar = value;              Declare a reactive signal
?myVar = newValue;               Mutate it (triggers DOM update)
```

### Bindings

```
bind::text="?var"                Bind signal to text content
bind::value="?var"               Bind signal to input value
bind::[attr]="?var"              Bind signal to any attribute
```

### Events

```
on::click="functionName"         Click handler
on::mouseover="functionName"     Mouseover handler
on::[event]="functionName"       Any DOM event
```

### Routing

```
navigate::to="/path"             Navigate to a route (on Action)
route="/path"                    Show this Stack when URL matches
```

### Components

```
<Use component="./File.omni" name="Tag" />    Import a component
<Tag />                                        Use it in template
```

### Animations

```
animate::load="from: { opacity: 0, y: 50, duration: 0.8 }"    Entrance animation
```

### Multi-File Mapping

```
<script src::logic="./file.js"></script>       External JS
<style src::style="./file.css"></style>         External CSS
```

---

**You now know everything about OmniJS.** Start building.
