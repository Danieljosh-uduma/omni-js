import {
    resetPageLayoutState,
    resolveActionTag,
    resolveCollectionTag,
    resolveFormTag,
    resolveMediaTag,
    resolvePortalTag,
    resolveStackTag,
    resolveStyleTag,
    resolveTextTag,
} from "./resolver.js"
import { parseScript } from "./script-parser.js";
import { createStateStore, initializeState, callFunction } from "./state-store.js";
import { OmniError } from "./error.js";

// ✅ NEW: HTML void elements — these can never have children/appendChild
// called on them in the DOM. Relevant now that collection/media/form can
// resolve to col, img, input, etc. A self-closing <media src="x.png" /> or
// <form as="checkbox" /> will have node.children === [] anyway (parser
// guarantees this), but this set is a hard backstop: if a future change to
// the language ever allowed children on these in the AST, we still refuse
// to append into them rather than letting the DOM throw or silently no-op.
const VOID_ELEMENTS = new Set([
    "input", "img", "br", "hr", "col", "area", "base", "embed",
    "link", "meta", "param", "source", "track", "wbr"
]);

// ✅ NEW: marker attribute + id used to make Tailwind CDN injection
// idempotent — calling mount() more than once (hot reload, SPA navigation)
// must not inject the <script> tag a second time.
const TAILWIND_CDN_SCRIPT_ID = "omni-tailwind-cdn";
const TAILWIND_CDN_URL = "https://cdn.tailwindcss.com";

/**
 * Ensure the Tailwind Play CDN script is present in <head>, injecting it
 * exactly once regardless of how many times mount() runs.
 *
 * ⚠️ Tailwind's own docs mark the Play CDN as NOT intended for production —
 * it JIT-compiles utility classes in-browser on every load, which is fine
 * for prototyping/dev but ships the entire Tailwind compiler to every
 * visitor and recompiles on each page load. A real production deployment
 * should replace this with a proper Tailwind build step (PostCSS/CLI)
 * generating a static stylesheet instead. This function is intentionally
 * isolated so swapping it out later doesn't require touching renderNode.
 */
function ensureTailwindLoaded() {
    if (typeof document === "undefined") return; // defensive: non-browser env
    if (document.getElementById(TAILWIND_CDN_SCRIPT_ID)) return; // already injected

    const script = document.createElement("script");
    script.id = TAILWIND_CDN_SCRIPT_ID;
    script.src = TAILWIND_CDN_URL;
    document.head.appendChild(script);
}

/**
 * Render a tree of Omni AST nodes into real DOM nodes.
 *
 * ✅ CHANGED: now accepts an optional `ctx` — { program, store } — produced
 * by mount() from a top-level <script> block (see runScript() below). When
 * present, ctx enables two things:
 *   - "Interpolation" nodes ({username}) render as LIVE state-bound text
 *     nodes, subscribing to the store so future setState() calls update the
 *     DOM automatically.
 *   - an "onclick" attribute on any element is treated as a function name
 *     to call (via callFunction) on click, rather than passed through as a
 *     literal HTML attribute.
 *
 * ctx defaults to null so files with no <script> block (or direct
 * renderNode() calls from tests/older code) keep working — Interpolation
 * nodes with no ctx render as empty text (can't resolve a value with no
 * store), and onclick is silently ignored with no ctx (no function to call).
 */
function renderNode(node, ctx = null) {
    if (!node) return null;

    // Handle raw string nodes
    if (node.type === "Text") {
        return document.createTextNode(node.value);
    }

    // ✅ NEW: raw text nodes (CSS content from inside <style>...</style>).
    // Rendered as a literal text node, identical mechanism to "Text" above —
    // kept as a separate branch (rather than merging with "Text") because
    // the two node types represent semantically different content (markup
    // text vs. raw CSS) even though today they render the same way. Keeping
    // them distinct leaves room for e.g. future minification/sanitization
    // applied only to RawText, without touching normal text rendering.
    if (node.type === "RawText") {
        return document.createTextNode(node.value);
    }

    // ✅ NEW: live state-bound interpolation, e.g. {username}. Creates a
    // real text node, sets its initial value from the store, and subscribes
    // to future changes so the DOM updates automatically when the bound
    // state variable is reassigned by a function (full reactivity, per
    // spec — not one-time templating).
    if (node.type === "Interpolation") {
        if (!ctx || !ctx.store) {
            // No script context at all (file has no <script> block, or
            // renderNode was called directly without ctx) — nothing to bind
            // to. Render an empty text node rather than throwing, since a
            // missing <script> block with stray {interpolations} in markup
            // is a content/authoring issue, not something that should crash
            // the whole render. (Arguably this should be a parse/validate-
            // time error instead — flagging as a improvement; for now it
            // degrades gracefully to "renders nothing".)
            return document.createTextNode("");
        }

        const initialValue = ctx.store.getState(node.name);
        if (initialValue === undefined) {
            throw new OmniError(1004, `'{${node.name}}' in markup references undeclared state variable '${node.name}'. Did you forget 'state ${node.name} = ...' in <script>?`, node.line);
        }

        const textNode = document.createTextNode(String(initialValue));

        // Subscribe to live updates. Unsubscribe function is returned but
        // intentionally not stored anywhere yet — nothing currently REMOVES
        // bound nodes from the DOM dynamically (no conditional rendering or
        // list diffing exists yet), so there's nothing to clean up against.
        // This is a known gap to revisit once/if elements can be removed
        // after initial mount.
        ctx.store.subscribe(node.name, (newValue) => {
            textNode.textContent = String(newValue);
        });

        return textNode;
    }

    if (node.type === "Element") {
        let htmlTagName;
        const lowerTagName = node.tagName.toLowerCase();

        // ⚠️ IMPORTANT ORDERING INVARIANT: resolution MUST happen root-down,
        // parent before children. resolveCollectionTag/resolveFormTag rely on
        // node._resolvedTag already being set on every ANCESTOR by the time
        // they run (to walk up and find the nearest <table>, etc). Because
        // this function resolves `node` here and only recurses into
        // node.children further down, that invariant holds automatically as
        // long as nobody reorders this function. Do not resolve children
        // before parents elsewhere in the codebase.
        switch (lowerTagName) {
            case "stack":
                htmlTagName = resolveStackTag(node);
                break;
            case "text":
                htmlTagName = resolveTextTag(node);
                break;
            case "media":
                htmlTagName = resolveMediaTag(node);
                break;
            case "collection":
                htmlTagName = resolveCollectionTag(node);
                break;
            case "action":
                htmlTagName = resolveActionTag(node);
                break;
            case "form":
                htmlTagName = resolveFormTag(node);
                break;
            case "portal":
                htmlTagName = resolvePortalTag(node);
                break;
            case "style":
                htmlTagName = resolveStyleTag(node);
                break;
            default:
                htmlTagName = "div";
                // ✅ NEW: cache _resolvedTag even on the unhandled-tag
                // fallback path, so ancestor-walks from deeper nodes don't
                // see `undefined` for this node if it ever sits between a
                // table and a cell (defensive — shouldn't happen given
                // ALLOWED_TAGS in the parser, but keeps the invariant total).
                node._resolvedTag = "div";
        }

        // Generate the real-world browser element
        const element = document.createElement(htmlTagName);

        // ✅ CHANGED: don't add the omni-style bookkeeping class to <style>
        // elements. It's harmless either way (a <style class="omni-style">
        // is valid HTML and the class does nothing special there), but a
        // <style> tag is never targeted by CSS selectors itself, so the
        // class is pure noise. Every other tag keeps its omni-<tag> class
        // exactly as before.
        if (lowerTagName !== "style") {
            element.classList.add(`omni-${lowerTagName}`);
        }

        // Inject attributes safely while stripping out the structural "as"
        // instruction. Note: resolveFormTag may have already written
        // node.attributes.type as a side effect (as="checkbox" -> type
        // auto-set) BEFORE we get here, since resolution above happens
        // before this loop runs — so the auto-mapped type attribute is
        // picked up for free, no special-casing needed.
        for (const [key, value] of Object.entries(node.attributes)) {
            if (key === "as") continue;

            // "class" needs special handling, not pass-through via
            // setAttribute like every other attribute. setAttribute
            // OVERWRITES the element's class list wholesale — it would
            // silently erase the omni-<tag> bookkeeping class added above
            // the moment an author writes class="..." for Tailwind
            // utilities. classList.add(...) appends instead of replacing.
            if (key === "class") {
                const extraClasses = value.split(/\s+/).filter(Boolean);
                if (extraClasses.length > 0) {
                    element.classList.add(...extraClasses);
                }
                continue;
            }

            // ✅ NEW: onclick="functionName" — intercepted rather than
            // passed through via setAttribute. setAttribute("onclick",
            // "increment") would create a literal HTML inline-event-handler
            // attribute that tries to run a bare identifier `increment` as
            // JS in the GLOBAL scope, which has no relationship to this
            // app's program/store — it would throw "increment is not
            // defined" in the browser console, not call our function. A
            // real addEventListener is required to close over ctx.
            if (key === "onclick") {
                if (!ctx || !ctx.program || !ctx.store) {
                    // No <script> block exists, so there's no function to
                    // call. Don't silently setAttribute either (would just
                    // produce the broken behavior described above) — warn
                    // so the author notices their onclick does nothing,
                    // rather than silently failing at click-time later.
                    console.warn(`[Omni Runtime Warning]: onclick="${value}" found but no <script> block is present — this element's click will do nothing.`);
                    continue;
                }

                const functionName = value;
                if (!ctx.program.functions[functionName]) {
                    throw new OmniError(1004, `onclick="${functionName}" references undefined function. Declared functions: ${Object.keys(ctx.program.functions).join(", ") || "(none)"}.`, node.line);
                }

                element.addEventListener("click", () => {
                    try {
                        callFunction(ctx.program, ctx.store, functionName);
                    } catch (err) {
                        // A runtime error inside a function body (e.g.
                        // division by zero, undeclared variable) shouldn't
                        // crash/freeze the whole page on a single click —
                        // log it clearly and keep the app interactive.
                        console.error(`[Omni Runtime Error]: error running onclick="${functionName}":`, err.message);
                    }
                });
                continue;
            }

            element.setAttribute(key, value);
        }

        // ✅ NEW: void-element guard. Real void tags never receive children
        // in valid HTML — skip the walk entirely rather than calling
        // appendChild into something like <input> or <col>. The parser
        // already prevents children on self-closed elements, but media/form
        // resolution can route a node to "img"/"input" even when it was
        // opened/closed normally with no self-close syntax (e.g. legacy
        // <media src="x.png"></media> with no body) — this guard catches
        // that case structurally rather than relying on parse-time shape.
        const isVoid = VOID_ELEMENTS.has(htmlTagName);

        if (!isVoid && node.children && node.children.length > 0) {
            node.children.forEach(childAST => {
                // ✅ CHANGED: ctx threaded through recursion so descendants
                // (interpolations, onclick handlers arbitrarily deep in the
                // tree) all share the same program/store instance.
                const childDOM = renderNode(childAST, ctx);
                if (childDOM) {
                    element.appendChild(childDOM);
                }
            });
        }

        return element;
    }

    return null;
}

/**
 * Render a top-level <style> root node's raw CSS into a real <style>
 * element appended to document.head — NOT into the mounted `target`
 * container. A page-level stylesheet belongs in <head> per normal document
 * semantics; style is no longer nested inside <stack> in the AST (it's a
 * sibling top-level root), so this is also the structurally correct place
 * for it now, unlike the in-body placement from before the 3-root change.
 *
 * Idempotent per omni-style id, mirroring ensureTailwindLoaded()'s pattern —
 * a re-mount replaces the previous injected stylesheet rather than stacking
 * up duplicates.
 */
const OMNI_STYLE_ELEMENT_ID = "omni-style-root";

function injectStyleRoot(styleNode) {
    if (typeof document === "undefined") return;
    if (!styleNode) {
        // No top-level <style> in this file — remove any previously
        // injected one from a prior mount() call, so navigating from a
        // styled file to an unstyled one doesn't leave stale CSS behind.
        const stale = document.getElementById(OMNI_STYLE_ELEMENT_ID);
        if (stale) stale.remove();
        return;
    }

    let styleEl = document.getElementById(OMNI_STYLE_ELEMENT_ID);
    if (!styleEl) {
        styleEl = document.createElement("style");
        styleEl.id = OMNI_STYLE_ELEMENT_ID;
        document.head.appendChild(styleEl);
    }

    // Concatenate all RawText children (normally there's exactly one, but
    // handle multiple defensively rather than assuming children.length === 1).
    const cssText = (styleNode.children || [])
        .filter(child => child.type === "RawText")
        .map(child => child.value)
        .join("\n");

    styleEl.textContent = cssText;
}

/**
 * Turn a top-level <script> root node into a runnable { program, store }
 * context: extract its raw text, parse it into a Program AST (state decls +
 * function defs), create a fresh state store, and initialize state from the
 * program's declarations.
 *
 * Returns null if scriptNode is null (file has no <script> block) — mount()
 * then renders with ctx=null, and Interpolation/onclick degrade gracefully
 * as documented in renderNode() above.
 *
 * A NEW store is created per call (i.e. per mount()) rather than reusing one
 * across mounts — each fresh render of a .omni file gets its own clean
 * state, matching how a page reload would reset JS globals. If state needs
 * to persist across re-mounts later (e.g. SPA navigation), that's a
 * deliberate future decision, not an accident of this implementation.
 */
function runScript(scriptNode) {
    if (!scriptNode) return null;

    const rawSource = (scriptNode.children || [])
        .filter(child => child.type === "RawText")
        .map(child => child.value)
        .join("\n");

    const program = parseScript(rawSource);
    const store = createStateStore();
    initializeState(program, store);

    return { program, store };
}

/**
 * Triggers the complete render pass and paints the application on-screen.
 *
 * ✅ CHANGED: `roots` is now the { script, style, stack } object returned by
 * parse(), not a single AST node. Each slot is handled according to its
 * role:
 *   - roots.stack  : rendered into `target`, exactly as the old single-root
 *                    `ast` was — now with ctx (program/store) threaded
 *                    through so Interpolation/onclick work.
 *   - roots.style  : raw CSS injected into document.head (see
 *                    injectStyleRoot above), never rendered into `target`.
 *   - roots.script : parsed and run via runScript() to produce ctx BEFORE
 *                    the stack tree renders, so state exists and is
 *                    initialized by the time any {interpolation} needs it.
 */
function mount(roots, target) {
    if (!target) {
        console.error("[Omni Runtime Error]: Container mount point element not found.");
        return;
    }

    if (!roots || !roots.stack) {
        // Defensive — parse() already throws 1007 if <stack> is missing, so
        // this should be unreachable via the normal pipeline, but mount()
        // can in principle be called directly with a hand-built roots
        // object (e.g. from tests), so don't assume the shape blindly.
        console.error("[Omni Runtime Error]: roots.stack is missing — nothing to mount.");
        return;
    }

    // ✅ NEW: make sure Tailwind's Play CDN script is loaded before the app
    // renders, so class="..." utilities take effect as soon as elements hit
    // the DOM. Idempotent — safe across repeated mount() calls.
    ensureTailwindLoaded();

    // ✅ NEW: inject (or clear) the top-level <style> root into document.head.
    injectStyleRoot(roots.style);

    // ✅ NEW: parse + run the top-level <script> root (state + functions)
    // BEFORE rendering the stack tree, so every {interpolation} has a real
    // value to read and every onclick has a real function to call by the
    // time the corresponding DOM nodes are created.
    const ctx = runScript(roots.script);

    // ✅ NEW: reset cross-render layout state (hasMain/hasH1 tracking in the
    // resolver) before every fresh mount. Without this, a second mount() call
    // in the same session (e.g. hot-reload, SPA route change re-rendering a
    // new .omni file) would see pageLayoutState.hasMain still `true` from the
    // PREVIOUS render, and incorrectly throw a 3002 "only one <main>" error
    // on a brand new, perfectly valid document.
    resetPageLayoutState();

    target.innerHTML = "";
    const rootDOM = renderNode(roots.stack, ctx);
    if (rootDOM) {
        target.appendChild(rootDOM);
    }
}

export { renderNode, mount, ensureTailwindLoaded, runScript };