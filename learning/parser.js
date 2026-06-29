import { tokenize } from "./tokenizer.js";
import { OmniError } from "./error.js";

const ALLOWED_TAGS = new Set(["stack", "form", "text", "collection", "action", "media", "portal", "style"]);

// ✅ NEW: the only tags permitted to appear at the TOP LEVEL of a .omni file.
// Previously the grammar enforced "exactly one root element, of any allowed
// tag." Now the file structurally has up to three top-level slots:
//   - <stack>  : mandatory. The actual renderable markup tree.
//   - <style>  : optional, at most one. Raw CSS, conceptually "head" content.
//   - <script> : optional, at most one. Reserved for now — accepted at the
//                grammar level so files can already declare it, but nothing
//                downstream (resolver/renderer) does anything with it yet.
//                NOTE: "script" is intentionally NOT added to ALLOWED_TAGS
//                above yet, since allowing it as a top-level-only special
//                case is simpler than teaching tokenizer/resolver/renderer
//                about a tag that has no behavior. It's special-cased here,
//                at the top-level check, independent of ALLOWED_TAGS.
const TOP_LEVEL_TAGS = new Set(["stack", "style", "script"]);

function parse(tokens) {
    let current = 0;
    let stack = []; // store a list of nested nodes

    // ✅ CHANGED: was a single `ast` node. Now three named slots — see
    // TOP_LEVEL_TAGS above. Each starts null/empty and gets filled in by
    // placeTopLevelElement() as matching top-level tags are closed.
    let roots = {
        script: null,
        style: null,
        stack: null
    };

    /**
     * Attempt to place a just-finished element (`element`) into its slot in
     * `roots`. Only called when stack.length === 0 at the moment of
     * finishing, i.e. this element really is top-level, not nested.
     *
     * Validates:
     *   - the tag is one of the three permitted top-level tags (1006's
     *     sibling check below handles "not one of the three" via the
     *     ALREADY-existing 1005 invalid-tag check for non-ALLOWED_TAGS
     *     names, but a tag that IS in ALLOWED_TAGS yet NOT in
     *     TOP_LEVEL_TAGS — e.g. <text> or <form> written at the top level —
     *     needs its own check here, since 1005 only catches names outside
     *     ALLOWED_TAGS entirely)
     *   - no duplicate top-level tag (e.g. two <style> blocks) -> 1006
     */
    function placeTopLevelElement(element) {
        const tagName = element.tagName.toLowerCase();

        if (!TOP_LEVEL_TAGS.has(tagName)) {
            throw new OmniError(1001, `'<${element.tagName}>' cannot appear at the top level of a .omni file. Only <stack>, <style>, and <script> are permitted as top-level elements — '<${element.tagName}>' must be nested inside <stack>.`, element.line);
        }

        if (roots[tagName] !== null) {
            throw new OmniError(1006, `Duplicate top-level '<${element.tagName}>'. A .omni file may contain at most one top-level <${element.tagName}>.`, element.line);
        }

        roots[tagName] = element;
    }

    while (current < tokens.length) {
        let token = tokens[current];

        if (token.type === "TAG_OPEN") {
            let nextToken = tokens[current + 1]

            // check for opening tags
            if (nextToken && nextToken.type === "IDENTIFIER") {
                let tagName = nextToken.value.toLowerCase();

                // 🚨 Rule Check: Enforce allowed framework tags only (1005)
                if (!ALLOWED_TAGS.has(tagName) && tagName !== "script") {
                    throw new OmniError(1005, `Invalid element tag '<${nextToken.value}>'. This framework only supports the following native components: ${Array.from(ALLOWED_TAGS).join(', ')}, script.`, nextToken.line);
                }

                let currentParent = stack[stack.length - 1]
                let siblingIndex = currentParent ? currentParent.children.length : 0
                let element = {
                    type: "Element",
                    tagName: nextToken.value,
                    attributes: {},
                    children: [],
                    line: nextToken.line,
                    depth: stack.length,
                    index: siblingIndex,
                    totalSiblings: 1,
                    parentNode: currentParent || null,
                    parentRef: currentParent || null
                }

                // ✅ REMOVED: the old "exactly one root" check
                // (`ast !== null && stack.length === 0`) is gone. Multiple
                // top-level elements are now expected — validity is
                // determined by placeTopLevelElement() once this element is
                // actually finished (self-closed or properly closed), not
                // at open-time. We can't validate at open-time anyway since
                // we don't yet know if e.g. a 2nd <style> here is even
                // going to be well-formed.

                // add the element to the stack
                stack.push(element)
                current += 2

                let isSelfClosing = false

                // check for attributes in the opening tag
                while (tokens[current] && tokens[current].type !== "TAG_CLOSE") {
                    if (tokens[current].type === "SLASH") {
                        isSelfClosing = true
                        current++
                        break
                    }

                    if (tokens[current].type === "IDENTIFIER") {
                        let attrName = tokens[current].value

                        let assignToken = tokens[current + 1];
                        let valueToken = tokens[current + 2];

                        if (!assignToken || assignToken.type !== "ASSIGN" || !valueToken || valueToken.type !== "VALUE") {
                            throw new OmniError(1004, `Malformed attribute configuration. Identifier '${attrName}' is missing a valid assignment or string value.`, tokens[current].line);
                        }

                        element.attributes[attrName] = valueToken.value
                        current += 3
                    } else {
                        throw new OmniError(1004, `Malformed attribute configuration. Expected an attribute identifier, but found an unexpected token of type '${tokens[current].type}'.`, tokens[current].line);
                    }
                }

                if (!tokens[current] || tokens[current].type !== "TAG_CLOSE") {
                    throw new OmniError(1002, `The opening tag <${element.tagName}> missing its closing '>' delimiter.`, element.line);
                }

                current++

                if (isSelfClosing) {
                    stack.pop()

                    if (stack.length === 0) {
                        // ✅ CHANGED: was `ast = element`. Now routes through
                        // placeTopLevelElement for validation.
                        placeTopLevelElement(element);
                    } else {
                        let parent = stack[stack.length - 1]
                        parent.children.push(element)
                    }
                }

                continue
            }

            // check for closing tags
            if (nextToken && nextToken.type === "SLASH") {
                let tagNameToken = tokens[current + 2];

                if (stack.length === 0) {
                    throw new OmniError(1003, `Unexpected closing tag </${tagNameToken?.value || ""}> discovered with no corresponding open tag context.`, token.line);
                }

                let FinalElement = stack.pop()

                if (FinalElement.tagName !== tagNameToken?.value) {
                    throw new OmniError(1003, `Mismatched closing tag. Expected </${FinalElement.tagName}> but found </${tagNameToken.value}> at line ${token.line}`, token.line);
                }

                const totalChildrenCount = FinalElement.children.length;
                let index = 0
                FinalElement.children.forEach(child => {
                    if (child.type === "Element") {
                        child.totalSiblings = totalChildrenCount;
                        child.parentNode = FinalElement.tagName
                        child.index = index++
                    }
                });

                if (stack.length === 0) {
                    // ✅ CHANGED: was `ast = FinalElement`. Now routes through
                    // placeTopLevelElement for validation.
                    placeTopLevelElement(FinalElement);
                } else {
                    let parent = stack[stack.length - 1]
                    parent.children.push(FinalElement)
                }
                current += 3

                if (tokens[current] && tokens[current].type === "TAG_CLOSE") {
                    current++;
                }
                continue
            }
        }

        // checks for text
        if (token.type === "TEXT") {
            if (stack.length > 0) {
                let parent = stack[stack.length - 1]
                parent.children.push({
                    type: "Text",
                    value: token.value,
                    line: token.line
                })
                current++
                continue
            } else {
                throw new OmniError(1001, `Floating text literal "${token.value.substring(0, 15)}..." discovered outside a root element. All contents must reside within <stack>, <style>, or <script>.`, token.line);
            }
        }

        if (token.type === "RAW_TEXT") {
            if (stack.length > 0) {
                let parent = stack[stack.length - 1]
                parent.children.push({
                    type: "RawText",
                    value: token.value,
                    line: token.line
                })
                current++
                continue
            } else {
                throw new OmniError(1001, `Floating raw text discovered outside a root element. All contents must reside within <stack>, <style>, or <script>.`, token.line);
            }
        }

        // ✅ NEW: state interpolation, e.g. {username}, tokenized as INTERP
        // by the markup tokenizer. Produces its own node type so the
        // renderer knows to create a LIVE state-bound text node (subscribed
        // to the store) rather than a static literal Text node.
        if (token.type === "INTERP") {
            if (stack.length > 0) {
                let parent = stack[stack.length - 1]
                parent.children.push({
                    type: "Interpolation",
                    name: token.value,
                    line: token.line
                })
                current++
                continue
            } else {
                throw new OmniError(1001, `Floating interpolation '{${token.value}}' discovered outside a root element. All contents must reside within <stack>, <style>, or <script>.`, token.line);
            }
        }
        current++
    }

    if (stack.length > 0) {
        let unclosedElement = stack[stack.length - 1];
        throw new OmniError(1002, `Unclosed template tag error. The element <${unclosedElement.tagName}> was opened but never closed by the end of the file.`, unclosedElement.line);
    }

    // ✅ NEW: <stack> is mandatory — a .omni file with only <style>/<script>
    // and no markup has nothing to render.
    if (roots.stack === null) {
        throw new OmniError(1007, `A .omni file must contain exactly one top-level <stack> element. None was found.`, null);
    }

    return roots
}

export { parse }