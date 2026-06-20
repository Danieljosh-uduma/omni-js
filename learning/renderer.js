import {
    resetPageLayoutState,
    resolveActionTag,
    resolveCollectionTag,
    resolveFormTag,
    resolveMediaTag,
    resolvePortalTag,
    resolveStackTag,
    resolveTextTag,
} from "./resolver.js"


function renderNode(node) {
    if (!node) return null;

    // Handle raw string nodes
    if (node.type === "Text") {
        return document.createTextNode(node.value);
    }

    if (node.type === "Element") {
        let htmlTagName;
        const lowerTagName = node.tagName.toLowerCase();

        // Direct routing loop down to our smart validation guards
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
            default:
                htmlTagName = "div";
        }

        // Generate the real-world browser element
        const element = document.createElement(htmlTagName);
        element.classList.add(`omni-${lowerTagName}`);

        // Inject attributes safely while stripping out the structural "as" instruction
        for (const [key, value] of Object.entries(node.attributes)) {
            if (key !== "as") {
                element.setAttribute(key, value);
            }
        }

        // Walk through the nested node tree array
        if (node.children && node.children.length > 0) {
            node.children.forEach(childAST => {
                const childDOM = renderNode(childAST, htmlTagName);
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
 * Triggers the complete render pass and paints the application on-screen.
 */
function mount(ast, target) {
    if (!target) {
        console.error("[Omni Runtime Error]: Container mount point element not found.");
        return;
    }
    target.innerHTML = "";
    const rootDOM = renderNode(ast);
    if (rootDOM) {
        target.appendChild(rootDOM);
    }
}

export { renderNode, mount };