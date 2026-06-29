// ----------------------------------------------------------------------------
// index.js — Omni runtime: public entry point
// ----------------------------------------------------------------------------
// Wires the full pipeline together:
//
//   .omni file on disk
//        │  readOmniFile / loadOmniFile   (readfile.js)
//        ▼
//   raw source text
//        │  tokenize                      (tokenizer.js)
//        ▼
//   token stream
//        │  parse                         (parser.js)
//        ▼
//   AST (root Element node)
//        │  mount -> renderNode           (renderer.js, which internally
//        │           calls resolveXTag    calls into resolver.js per node)
//        ▼
//   live DOM, appended into a target container
//
// ⚠️ ENVIRONMENT NOTE: this file imports BOTH a Node-only module
// (readfile.js, via node:fs/promises) AND a browser-only module
// (renderer.js, via `document`). That's fine for a Node *script* that drives
// a DOM-like environment (e.g. a dev server using jsdom, or a future CLI),
// but this file will NOT work if bundled and shipped to a real browser,
// since node:fs/promises doesn't exist there. If/when a pure browser entry
// point is needed (e.g. fetch() a .omni file instead of reading from disk),
// that should be a separate index.browser.js that skips readfile.js and
// instead accepts raw source text directly into tokenize/parse.
// ----------------------------------------------------------------------------

import { readOmniFile, loadOmniFile } from "./process.js";
import { tokenize } from "./tokenizer.js";
import { parse } from "./parser.js";
import { mount, renderNode } from "./renderer.js";
import { OmniError } from "./error.js";

/**
 * Run a .omni file from disk all the way to a mounted, live DOM tree.
 *
 * This is the highest-level convenience function — read, tokenize, parse,
 * and mount, in one call. Most callers (a dev server, a CLI preview command,
 * a future <script src="app.omni"> style loader) want exactly this.
 *
 * @param {string} filePath - path to a .omni file
 * @param {Element} target - DOM element to mount the rendered app into
 * @param {object} [options] - forwarded to readOmniFile (e.g. skipExtensionCheck)
 * @returns {Promise<object>} the parsed AST (useful for debugging/inspection
 *   after mount — e.g. checking _resolvedTag on nodes post-render)
 */
async function runOmniFile(filePath, target, options = {}) {
    if (!target) {
        // Fail fast and clearly here rather than letting mount()'s internal
        // "Container mount point element not found" console.error be the
        // only signal — this is a programmer error (forgot to pass a target),
        // distinct from the runtime's own "target was falsy" defensive check.
        throw new TypeError("runOmniFile requires a `target` DOM element to mount into.");
    }

    const ast = await loadOmniFile(filePath, options);
    mount(ast, target);
    return ast;
}

/**
 * Same as runOmniFile, but takes raw .omni source text directly instead of
 * a file path — useful for in-memory/browser use, tests, or a live-preview
 * editor where the source isn't (yet) backed by a file on disk.
 *
 * @param {string} source - raw .omni source text
 * @param {Element} target - DOM element to mount the rendered app into
 * @returns {object} the parsed AST
 */
function runOmniSource(source, target) {
    if (!target) {
        throw new TypeError("runOmniSource requires a `target` DOM element to mount into.");
    }

    const tokens = tokenize(source);
    const ast = parse(tokens);
    mount(ast, target);
    return ast;
}

export {
    // High-level: file path or raw source, all the way to a mounted DOM
    runOmniFile,
    runOmniSource,

    // Mid-level: individual pipeline stages, re-exported for callers who
    // want to inspect/intercept the AST or tokens before rendering (e.g. a
    // linter, a build-time static analysis tool, or test code).
    readOmniFile,
    loadOmniFile,
    tokenize,
    parse,
    mount,
    renderNode,

    // Error type, so consumers can `instanceof` check without reaching into
    // error.js directly.
    OmniError,
};