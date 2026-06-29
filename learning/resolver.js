import { OmniError } from "./error.js";

// Define strict sets of allowed override tags
const ALLOWED_STACK_OVERRIDES = new Set(["header", "footer", "section", "nav", "aside", "article", "div"]);
const ALLOWED_TEXT_OVERRIDES = new Set(["h1", "h2", "h3", "h4", "h5", "h6", "p", "em", "i", "b", "strong", "span", "mark", "pre"]);
const ALLOWED_MEDIA_OVERRIDES = new Set(["img", "video", "audio", "iframe", "svg"]);

// ✅ EXPANDED: full table vocabulary + list vocabulary, in one allowed set.
// table, thead, tbody, tfoot, tr, th, td, caption, colgroup, col cover real
// HTML tables. ul, ol, li unchanged from before.
const ALLOWED_COLLECTION_OVERRIDES = new Set([
    "table", "thead", "tbody", "tfoot", "tr", "th", "td", "caption", "colgroup", "col",
    "ul", "ol", "li"
]);

const ALLOWED_ACTION_OVERRIDES = new Set(["a", "link", "button"]);

// ✅ EXPANDED: fieldset/legend/optgroup added for complete form coverage.
const ALLOWED_FORM_OVERRIDES = new Set([
    "input", "form", "label", "select", "option", "optgroup", "textarea", "button", "fieldset", "legend"
]);

// ✅ NEW: valid HTML <input> types. Used to validate/auto-map `as="checkbox"`
// etc. into `type="checkbox"` on the rendered <input>.
const ALLOWED_INPUT_TYPES = new Set([
    "text", "checkbox", "radio", "email", "password", "number", "date",
    "time", "datetime-local", "month", "week", "tel", "url", "search",
    "color", "range", "file", "hidden", "submit", "reset", "button", "image"
]);

let pageLayoutState = {
    hasMain: false,
    hasH1: false
}

function resetPageLayoutState() {
    pageLayoutState.hasMain = false
    pageLayoutState.hasH1 = false
}

// ----------------------------------------------------------------------------
// Ancestor-walk helpers
// ----------------------------------------------------------------------------

/**
 * Walk up the parentRef chain from `node` and return the nearest ancestor
 * whose *resolved* HTML tag matches `tagName`, or null if none is found.
 * Relies on `_resolvedTag` having been set on each node as it was resolved
 * (resolution happens root-down, so by the time a child is resolved every
 * ancestor above it already has `_resolvedTag` populated).
 */
function findNearestResolvedAncestor(node, tagName) {
    let current = node.parentRef;
    while (current) {
        if (current._resolvedTag === tagName) {
            return current;
        }
        current = current.parentRef;
    }
    return null;
}

/**
 * Distance (in parentRef hops) from `node` up to `ancestor`. Returns -1 if
 * `ancestor` is not actually an ancestor of `node`.
 */
function ancestorDistance(node, ancestor) {
    let distance = 0;
    let current = node.parentRef;
    while (current) {
        distance++;
        if (current === ancestor) return distance;
        current = current.parentRef;
    }
    return -1;
}

// ----------------------------------------------------------------------------
// stack / text / action / media (unchanged from before)
// ----------------------------------------------------------------------------

function resolveStackTag(node) {
    if (node.attributes && node.attributes.as) {
        const targetTag = node.attributes.as.toLowerCase();

        if (!ALLOWED_STACK_OVERRIDES.has(targetTag)) {
            throw new OmniError(3001, `Invalid layout override '<stack as="${node.attributes.as}">'. Allowed elements are: ${Array.from(ALLOWED_STACK_OVERRIDES).join(', ')}.`, node.line);
        }
        if (targetTag === "main") {
            if (pageLayoutState.hasMain) {
                throw new OmniError(3002, `Layout conflict: Only one '<main>' root element is permitted per document structure.`, node.line);
            }
            pageLayoutState.hasMain = true;
        }
        return targetTag;
    }
    if (node.depth === 0) {
        return "main"
    } else if (node.depth === 1) {
        // ✅ CHANGED: dropped footer positional inference. "First sibling is
        // a banner/header" is a reliable real-world pattern (nav bars, hero
        // sections, page titles consistently come first). "Last sibling is
        // a footer" is NOT reliably true once a page has more than a couple
        // of sections — it just means "whatever happened to be written
        // last," which is frequently a normal content section (e.g. a
        // contact form), not a site footer. Footer is now opt-in only, via
        // an explicit <stack as="footer">.
        if (node.totalSiblings >= 3 && node.index === 0) {
            return "header"
        }
        return "section"
    }

    return "div"
}

function resolveTextTag(node) {
    if (node.attributes && node.attributes.as) {
        const targetTag = node.attributes.as.toLowerCase();

        if (!ALLOWED_TEXT_OVERRIDES.has(targetTag)) {
            throw new OmniError(3001, `Invalid typographic override '<text as="${node.attributes.as}">'. Allowed tags are: ${Array.from(ALLOWED_TEXT_OVERRIDES).join(', ')}.`, node.line);
        }
        return targetTag;
    }
    if (node.parentNode === "text") {
        return "span"
    }

    return "p"
}

function resolveActionTag(node) {
    if (node.attributes && node.attributes.as) {
        const targetTag = node.attributes.as.toLowerCase();
        if (!ALLOWED_ACTION_OVERRIDES.has(targetTag)) {
            throw new OmniError(3001, `Invalid action override '<action as="${node.attributes.as}">'. Allowed tags are: ${Array.from(ALLOWED_ACTION_OVERRIDES).join(', ')}.`, node.line);
        }
        return targetTag;
    }

    return "a"
}

function resolveMediaTag(node) {
    if (node.attributes && node.attributes.as) {
        const targetTag = node.attributes.as.toLowerCase();
        if (!ALLOWED_MEDIA_OVERRIDES.has(targetTag)) {
            throw new OmniError(3001, `Invalid media override '<media as="${node.attributes.as}">'. Allowed tags are: ${Array.from(ALLOWED_MEDIA_OVERRIDES).join(', ')}.`, node.line);
        }
        return targetTag;
    }

    if (node.attributes && node.attributes.src) {
        const src = node.attributes.src.trim();
        const cleanSrc = src.split('?')[0].toLowerCase();

        if (cleanSrc.endsWith('.mp4') || cleanSrc.endsWith('.webm') || cleanSrc.endsWith('.ogg')) {
            return "video";
        }
        if (cleanSrc.endsWith('.mp3') || cleanSrc.endsWith('.wav') || cleanSrc.endsWith('.aac')) {
            return "audio";
        }
        if (cleanSrc.includes('youtube.com/embed/') || cleanSrc.includes('player.vimeo.com') || cleanSrc.endsWith('.html')) {
            return "iframe";
        }
        if (
            cleanSrc.endsWith('.png') ||
            cleanSrc.endsWith('.jpg') ||
            cleanSrc.endsWith('.jpeg') ||
            cleanSrc.endsWith('.webp') ||
            cleanSrc.endsWith('.gif') ||
            cleanSrc.endsWith('.svg') ||
            cleanSrc.endsWith('.avif')
        ) {
            return "img";
        }
    }

    return "img";
}

// ----------------------------------------------------------------------------
// ✅ REWRITTEN: collection — full table support, hybrid inference
// ----------------------------------------------------------------------------

/**
 * Resolution order for <collection>:
 *   1. Explicit `as=""` always wins (validated against ALLOWED_COLLECTION_OVERRIDES).
 *   2. Table-context inference: if this node has a <table> ancestor, infer
 *      tr / td based on distance from that table (row vs cell). Header cells
 *      (`th`) are NOT guessed from "first row" — that's an authorial choice,
 *      made explicit via `as="th"` or a `type="header"` attribute on the row.
 *   3. List-context inference (unchanged): nested directly inside another
 *      collection -> li.
 *   4. Standalone container: `type="ordered"/"unordered"` -> ol/ul, default ul.
 *
 * thead/tbody/tfoot/caption/colgroup/col have NO positional default — there's
 * no sane guess for "is this section the head or body of the table," so they
 * are only reachable via explicit as="".
 */
function resolveCollectionTag(node) {
    // 1. Explicit override takes highest priority
    if (node.attributes && node.attributes.as) {
        const targetTag = node.attributes.as.toLowerCase();
        if (!ALLOWED_COLLECTION_OVERRIDES.has(targetTag)) {
            throw new OmniError(3001, `Invalid collection override '<collection as="${node.attributes.as}">'. Allowed tags are: ${Array.from(ALLOWED_COLLECTION_OVERRIDES).join(', ')}.`, node.line);
        }
        node._resolvedTag = targetTag;
        return targetTag;
    }

    // 2. Table-context inference — only kicks in if a <table> ancestor exists.
    const tableAncestor = findNearestResolvedAncestor(node, "table");
    if (tableAncestor) {
        const distance = ancestorDistance(node, tableAncestor);

        // Distance 1: direct child of <table> (no thead/tbody in between) -> row
        if (distance === 1) {
            node._resolvedTag = "tr";
            return "tr";
        }

        // Distance 2: could be <table><tbody><tr> (this node IS the tr, distance
        // 1 from tbody / 2 from table) OR <table><tr><td> (this node is the td).
        // Disambiguate using the immediate parent's resolved tag rather than
        // raw distance, since thead/tbody/tfoot add an extra hop that pure
        // distance-from-table can't distinguish from a real nesting level.
        const parent = node.parentRef;
        if (parent && parent._resolvedTag === "tr") {
            node._resolvedTag = "td";
            return "td";
        }
        if (parent && (parent._resolvedTag === "thead" || parent._resolvedTag === "tbody" || parent._resolvedTag === "tfoot")) {
            node._resolvedTag = "tr";
            return "tr";
        }

        // Fallback within a table context but ambiguous nesting: default to tr
        // at the shallowest unresolved level, td otherwise.
        node._resolvedTag = distance <= 1 ? "tr" : "td";
        return node._resolvedTag;
    }

    // 3. Structural role: nested directly inside another collection container
    // that isn't a table -> list item.
    if (node.parentNode === "collection") {
        node._resolvedTag = "li";
        return "li";
    }

    // 4. Container role: explicit type attribute on a standalone collection.
    if (node.attributes && node.attributes.type) {
        const typeValue = node.attributes.type.toLowerCase();
        if (typeValue === "ordered") {
            node._resolvedTag = "ol";
            return "ol";
        }
        if (typeValue === "unordered") {
            node._resolvedTag = "ul";
            return "ul";
        }
    }

    // 5. Ultimate fallback for a standalone collection block
    node._resolvedTag = "ul";
    return "ul";
}

function resolvePortalTag(node) {
    if (node.attributes && node.attributes.as) {
        node._resolvedTag = node.attributes.as.toLowerCase();
        return node._resolvedTag;
    }

    node._resolvedTag = "modal";
    return "modal";
}

// ----------------------------------------------------------------------------
// ✅ NEW: style — always resolves to a literal <style> tag. No `as=""`
// override exists for this tag (there's nothing to override to — a style
// block IS a <style> element, full stop). Kept as its own resolver function
// for consistency with every other tag and so _resolvedTag bookkeeping
// stays correct for ancestor-walk purposes.
// ----------------------------------------------------------------------------
function resolveStyleTag(node) {
    if (node.attributes && node.attributes.as) {
        throw new OmniError(3001, `'<style>' does not support an 'as' override — it always renders as a literal <style> element.`, node.line);
    }
    node._resolvedTag = "style";
    return "style";
}

// ----------------------------------------------------------------------------
// ✅ REWRITTEN: form — full form-element coverage, as="" auto-maps input type
// ----------------------------------------------------------------------------

/**
 * Resolution order for <form>:
 *   1. Explicit `as=""` always wins, validated against ALLOWED_FORM_OVERRIDES.
 *   2. If `as=""` resolved to a value that is ALSO a valid <input> type
 *      (e.g. as="checkbox", as="email", as="radio"...) AND there is no
 *      conflicting literal `type` attribute already set, the element
 *      resolves to a real <input> and `type` is auto-populated from `as`.
 *      A literal `type` attribute, if present, is left untouched and wins
 *      (explicit attribute beats inferred one) — but if both are given and
 *      they DISAGREE, that's a real authoring mistake worth surfacing rather
 *      than silently picking one.
 *   3. Plain tag overrides (`as="select"`, `as="form"`, `as="fieldset"` etc.)
 *      resolve directly with no type-mapping.
 *   4. No `as` given -> default "form" (unchanged from original).
 */
function resolveFormTag(node) {
    if (node.attributes && node.attributes.as) {
        const rawAs = node.attributes.as;
        const targetTag = rawAs.toLowerCase();

        // ✅ FIX: check plain tag names FIRST, not input-type shorthand first.
        // "button" exists in BOTH vocabularies (a real <button> element, AND
        // a valid <input type="button">) — previously the input-type check
        // ran first and unconditionally won, making it impossible to ever
        // render a real <button> (and silently eating its text content,
        // since <input> is void). A name that is a genuine standalone tag
        // always means that tag; input-type inference only applies to names
        // that have NO meaning other than as an input type (checkbox, email,
        // radio, etc — none of those collide with a plain form tag name).
        if (ALLOWED_FORM_OVERRIDES.has(targetTag)) {
            node._resolvedTag = targetTag;
            return targetTag;
        }

        // Is this an input-type shorthand, e.g. as="checkbox", as="email"?
        if (ALLOWED_INPUT_TYPES.has(targetTag)) {
            const existingType = node.attributes.type;

            if (existingType && existingType.toLowerCase() !== targetTag) {
                throw new OmniError(1004, `Conflicting input configuration: 'as="${rawAs}"' implies type="${targetTag}", but an explicit type="${existingType}" was also given. Remove one.`, node.line);
            }

            // Auto-map as="checkbox" -> attributes.type = "checkbox", tag = input
            node.attributes.type = targetTag;
            node._resolvedTag = "input";
            return "input";
        }

        // Neither a plain form tag nor a valid input type -> invalid override.
        throw new OmniError(3001, `Invalid form override '<form as="${rawAs}">'. Allowed tags are: ${Array.from(ALLOWED_FORM_OVERRIDES).join(', ')}, or any valid input type (${Array.from(ALLOWED_INPUT_TYPES).join(', ')}).`, node.line);
    }

    node._resolvedTag = "form";
    return "form";
}

export {
    resolveActionTag,
    resolveCollectionTag,
    resolveFormTag,
    resolveMediaTag,
    resolvePortalTag,
    resolveStackTag,
    resolveStyleTag,
    resolveTextTag,
    resetPageLayoutState
}