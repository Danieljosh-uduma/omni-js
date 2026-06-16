# OmniJS Semantic Element System Specification

OmniJS simplifies UI composition by replacing dozens of arbitrary HTML tags with **six core semantic blocks**: `Stack`, `Text`, `Action`, `Collection`, `Media`, and `Form`.

At build and render time, the framework automatically maps these blocks to standard HTML5 tags based on nesting depth, parent context, or explicit overrides, ensuring clean code, search engine optimization, and accessibility.

---

## 1. The Core Semantic Blocks

### 1.1 `Stack`

Represents layout structures (vertical/horizontal boxes, sidebars, grids, main wrappers).

- **Default Mapping**:
  - Root `Stack` (depth = 1) -> `<main>`
  - Secondary `Stack` (depth = 2) -> `<section>`
  - Deeply nested `Stack` (depth > 2) -> `<div>`
- **Override**: Use the `as` attribute to force a specific HTML tag (e.g. `<Stack as="nav">` compiles to `<nav>`).

### 1.2 `Text`

Represents any textual elements including headings, paragraphs, list items, and table cells.

- **Default Mapping**:
  - Mapped to `<h1-h6>` headings based on nesting depth. Each nested dynamic `<Text>` level increments the heading level starting from `<h1>` down to `<h6>`.
  - Beyond depth 6 -> `<p>`
  - Inside a table row `Collection` (type="tr") -> `<th>` (if `type="th"` is set) or `<td>` (otherwise).
  - Inside a list `Collection` (type="ul" / "ol") -> `<li>`.
- **Override**: Use the `as` attribute to force a specific tag (e.g., `<Text as="span">` or `<Text as="small">`).

### 1.3 `Action`

Represents interactive triggers such as buttons, anchor links, and custom navigational controls.

- **Default Mapping**:
  - Mapped to `<a>` if `as="link"` or if it has an `href` attribute.
  - Mapped to `<button>` with role/type:
    - `<Action as="submit">` -> `<button type="submit">`
    - With `navigate-to` attribute -> `<button role="link">`
    - Standard action -> `<button>`
- **Override**: Use the `as` attribute to force any container tag.

### 1.4 `Collection`

Represents lists, groups of repeating elements, or structural tables.

- **Default Mapping**:
  - `type` attribute specifies the structural container tag:
    - `type="table"` -> `<table>`
    - `type="thead"` -> `<thead>`
    - `type="tbody"` -> `<tbody>`
    - `type="tr"` -> `<tr>`
    - `type="ol"` -> `<ol>`
    - Default/otherwise -> `<ul>`
- **Override**: Use the `as` attribute to compile to a custom element wrapper.

### 1.5 `Media`

Represents images, video, audio, or iframe embedding.

- **Default Mapping**:
  - Determined by `type` or file extensions in the `src` attribute:
    - `type="video"` or `.mp4`/`.webm` -> `<video>`
    - `type="audio"` or `.mp3`/`.wav` -> `<audio>`
    - `type="iframe"` or YouTube/Vimeo URLs -> `<iframe>`
    - Default/otherwise -> `<img>`
- **Override**: Use `as` to specify an alternate container.

### 1.6 `Form`

Represents form containers or input controls.

- **Default Mapping**:
  - Mapped to `<form>` wrapper if it does not contain input control properties (`bind-value`, `placeholder`, `type`).
  - Mapped to input controls if those properties exist:
    - `type="textarea"` -> `<textarea>`
    - `type="select"` -> `<select>`
    - `type="label"` -> `<label>`
    - Default/otherwise -> `<input type="{type}">`
- **Override**: Use the `as` attribute to force specific form control tags.

---

## 2. Summary Reference Matrix

| Semantic Block   | Common Attributes    | Default Tag (Implicit) | Contextual Variant Tags                         | Override Attribute Example |
| :--------------- | :------------------- | :--------------------- | :---------------------------------------------- | :------------------------- |
| **`Stack`**      | `class`, `id`        | `<main>` (Root)        | `<section>` (L2), `<div>` (L3+)                 | `<Stack as="header">`      |
| **`Text`**       | `class`, `id`        | `<h1>` to `<h6>`       | `<li>` (List), `<th>` / `<td>` (Table)          | `<Text as="span">`         |
| **`Action`**     | `on-click`, `href`   | `<button>`             | `<a>` (w/ `href` / `as="link"`)                 | `<Action as="div">`        |
| **`Collection`** | `data`, `as`         | `<ul>`                 | `<table>`, `<thead>`, `<tbody>`, `<tr>`, `<ol>` | `<Collection as="div">`    |
| **`Media`**      | `src`, `alt`, `type` | `<img>`                | `<video>`, `<audio>`, `<iframe>`                | `<Media as="picture">`     |
| **`Form`**       | `bind-value`, `type` | `<form>`               | `<input>`, `<textarea>`, `<select>`, `<label>`  | `<Form as="fieldset">`     |
