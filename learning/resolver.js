import { parse } from "./parser.js"
import { OmniError } from "./error.js"; // Pull in our error handler

// Define strict sets of allowed override tags
const ALLOWED_STACK_OVERRIDES = new Set(["header", "footer", "section", "nav", "aside", "article", "div"]);
const ALLOWED_TEXT_OVERRIDES = new Set(["h1", "h2", "h3", "h4", "h5", "h6", "p", "em", "i", "b", "strong", "span", "mark", "pre"]);
const ALLOWED_MEDIA_OVERRIDES = new Set(["img", "video", "audio", "iframe", "svg"]);
const ALLOWED_COLLECTION_OVERRIDES = new Set(["table", "tr", "td", "thead", "ul", "ol", "li"]);
const ALLOWED_ACTION_OVERRIDES = new Set(["a", "link", "button"]);
const ALLOWED_FORM_OVERRIDES = new Set(["input", "form", "label", "select", "option", "textarea", "button"]);

let pageLayoutState = {
    hasMain: false,
    hasH1: false
}

function resetPageLayoutState() {
    pageLayoutState.hasMain = false
    pageLayoutState.hasH1 = false
}

function resolveStackTag(node) {
    if (node.attributes && node.attributes.as) {
        const targetTag = node.attributes.as.toLowerCase();

        if (!ALLOWED_STACK_OVERRIDES.has(targetTag)) {
            throw new OmniError(1006, `Invalid layout override '<stack as="${node.attributes.as}">'. Allowed elements are: ${Array.from(ALLOWED_STACK_OVERRIDES).join(', ')}.`, node.line);
        } else if (node.depth === 0) {
            targetTag = "main"
        } else if (node.depth === 1) {
            if (node.totalSiblings >= 3) {
                if (node.index === 0) return "header"
                if (node.index === node.totalSiblings - 1) return "footer" 
            }
            return "section"
        }
        if (tag === "main") {
            if (pageLayoutState.hasMain) {
                throw new OmniError(1007, `Layout conflict: Only one '<main>' root element is permitted per document structure.`, node.line);
            }
            pageLayoutState.hasMain = true;
        }
        return targetTag;
    }

    return "div"
}

function resolveTextTag(node) {
    if (node.attributes && node.attributes.as) {
        const targetTag = node.attributes.as.toLowerCase();

        // 🚨 Guard Check: Validate permitted typographic elements
        if (!ALLOWED_TEXT_OVERRIDES.has(targetTag)) {
            throw new OmniError(1006, `Invalid typographic override '<text as="${node.attributes.as}">'. Allowed tags are: ${Array.from(ALLOWED_TEXT_OVERRIDES).join(', ')}.`, node.line);
        }
        return targetTag;
    }

    return "p"
}

function resolveActionTag(node) {
    if (node.attributes && node.attributes.as) {
        const targetTag = node.attributes.as.toLowerCase();
        if (!ALLOWED_ACTION_OVERRIDES.has(targetTag)) {
            throw new OmniError(1006, `Invalid action override '<action as="${node.attributes.as}">'. Allowed tags are: ${Array.from(ALLOWED_ACTION_OVERRIDES).join(', ')}.`, node.line);
        }
        return targetTag;
    }

    return "a"
}

function resolveMediaTag(node) {
    if (node.attributes && node.attributes.as) {
        const targetTag = node.attributes.as.toLowerCase();
        if (!ALLOWED_MEDIA_OVERRIDES.has(targetTag)) {
            throw new OmniError(1006, `Invalid media override '<media as="${node.attributes.as}">'. Allowed tags are: ${Array.from(ALLOWED_MEDIA_OVERRIDES).join(', ')}.`, node.line);
        }
        return targetTag;
    }

    return "img"
}

function resolveCollectionTag(node) {
    if (node.attributes && node.attributes.as) {
        const targetTag = node.attributes.as.toLowerCase();
        if (!ALLOWED_COLLECTION_OVERRIDES.has(targetTag)) {
            throw new OmniError(1006, `Invalid collection override '<collection as="${node.attributes.as}">'. Allowed tags are: ${Array.from(ALLOWED_COLLECTION_OVERRIDES).join(', ')}.`, node.line);
        }
        return targetTag;
    }

    return "li"
}

function resolvePortalTag(node) {
    if (node.attributes && node.attributes.as) {
        return node.attributes.as.toLowerCase()
    }

    return "modal"
}

function resolveFormTag(node) {
    if (node.attributes && node.attributes.as) {
        const targetTag = node.attributes.as.toLowerCase();
        if (!ALLOWED_FORM_OVERRIDES.has(targetTag)) {
            throw new OmniError(1006, `Invalid form override '<form as="${node.attributes.as}">'. Allowed tags are: ${Array.from(ALLOWED_FORM_OVERRIDES).join(', ')}.`, node.line);
        }
        return targetTag;
    }

    return "form"
}

export {
    resolveActionTag,
    resolveCollectionTag,
    resolveFormTag,
    resolveMediaTag,
    resolvePortalTag,
    resolveStackTag,
    resolveTextTag,
    resetPageLayoutState
}