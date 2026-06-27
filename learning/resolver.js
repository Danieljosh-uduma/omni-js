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
        if (node.totalSiblings >= 3) {
            if (node.index === 0) return "header"
            if (node.index === node.totalSiblings - 1) return "footer" 
        }
        return "section"
    }

    return "div"
}

function resolveTextTag(node) {
    if (node.attributes && node.attributes.as) {
        const targetTag = node.attributes.as.toLowerCase();

        // 🚨 Guard Check: Validate permitted typographic elements
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
    // 1. Explicit override takes highest priority
    if (node.attributes && node.attributes.as) {
        const targetTag = node.attributes.as.toLowerCase();
        if (!ALLOWED_MEDIA_OVERRIDES.has(targetTag)) {
            throw new OmniError(3001, `Invalid media override '<media as="${node.attributes.as}">'. Allowed tags are: ${Array.from(ALLOWED_MEDIA_OVERRIDES).join(', ')}.`, node.line);
        }
        return targetTag;
    }

    // 2. Infer element type from literal src attribute
    if (node.attributes && node.attributes.src) {
        const src = node.attributes.src.trim();
        
        // Strip out query parameters (e.g., "video.mp4?v=2" -> "video.mp4")
        const cleanSrc = src.split('?')[0].toLowerCase();
        // Video format checks
        if (cleanSrc.endsWith('.mp4') || cleanSrc.endsWith('.webm') || cleanSrc.endsWith('.ogg')) {
            return "video";
        }
        // Audio format checks
        if (cleanSrc.endsWith('.mp3') || cleanSrc.endsWith('.wav') || cleanSrc.endsWith('.aac')) {
            return "audio";
        }
        // Embed / Iframe checks
        if (cleanSrc.includes('youtube.com/embed/') || cleanSrc.includes('player.vimeo.com') || cleanSrc.endsWith('.html')) {
            return "iframe";
        }
        // Explicit Image format checks
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

    // 3. Ultimate fallback
    return "img";
}

function resolveCollectionTag(node) {
    // 1. Explicit override takes highest priority
    if (node.attributes && node.attributes.as) {
        const targetTag = node.attributes.as.toLowerCase();
        if (!ALLOWED_COLLECTION_OVERRIDES.has(targetTag)) {
            throw new OmniError(3001, `Invalid collection override '<collection as="${node.attributes.as}">'. Allowed tags are: ${Array.from(ALLOWED_COLLECTION_OVERRIDES).join(', ')}.`, node.line);
        }
        return targetTag;
    }

    // 2. Structural role: If nested directly inside another collection container, it's a list item
    if (node.parentNode === "collection") {
        return "li";
    }
    // 3. Container role: Look at the type attribute to choose between ordered or unordered lists
    if (node.attributes && node.attributes.type) {
        const typeValue = node.attributes.type.toLowerCase();
        if (typeValue === "ordered") {
            return "ol";
        }
        if (typeValue === "unordered") {
            return "ul";
        }
    }
    // 4. Ultimate fallback for a standalone collection block
    return "ul";
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
            throw new OmniError(3001, `Invalid form override '<form as="${node.attributes.as}">'. Allowed tags are: ${Array.from(ALLOWED_FORM_OVERRIDES).join(', ')}.`, node.line);
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