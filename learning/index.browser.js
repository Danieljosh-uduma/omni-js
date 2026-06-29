// ----------------------------------------------------------------------------
// index.browser.js — Omni runtime: browser entry point
// ----------------------------------------------------------------------------
// Mirrors index.js's runOmniSource/runOmniFile, but for real browsers:
//   - no node:fs (readfile.js is Node-only and is NOT imported here)
//   - "loading a file" means fetch()-ing it as text over HTTP, not reading
//     from local disk
//
// This is the file a <script type="module"> tag in an actual webpage should
// import.
// ----------------------------------------------------------------------------

import { tokenize } from "./tokenizer.js";
import { parse } from "./parser.js";
import { mount, renderNode } from "./renderer.js";
import { OmniError } from "./error.js";

/**
 * Fetch a .omni file over HTTP and run it through tokenize -> parse -> mount.
 *
 * @param {string} url - URL (relative or absolute) to a .omni file, served
 *   as plain text by whatever is hosting it (no special server config
 *   needed beyond serving the file's bytes — .omni has no MIME type that
 *   matters here since we only ever call response.text()).
 * @param {Element} target - DOM element to mount the rendered app into
 * @returns {Promise<object>} the parsed AST
 */
async function runOmniUrl(url, target) {
    if (!target) {
        throw new TypeError("runOmniUrl requires a `target` DOM element to mount into.");
    }

    let response;
    try {
        response = await fetch(url);
    } catch (err) {
        throw new Error(`Failed to fetch Omni file at '${url}': ${err.message}`, { cause: err });
    }

    if (!response.ok) {
        throw new Error(`Failed to fetch Omni file at '${url}': HTTP ${response.status} ${response.statusText}`);
    }

    const source = await response.text();
    return runOmniSource(source, target);
}

/**
 * Run raw .omni source text directly (e.g. from an inline <script> tag, a
 * textarea-based live editor, or already-fetched text).
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

export { runOmniUrl, runOmniSource, tokenize, parse, mount, renderNode, OmniError };