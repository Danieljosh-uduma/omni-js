import { tokenize } from "./tokenizer.js";
import { OmniError } from "./error.js";

const ALLOWED_TAGS = new Set(["stack", "form", "text", "collection", "action", "media", "portal"]);

function parse(tokens) {
    let current = 0;
    let stack = []; // store a list of nested nodes
    let ast = null; // store the tree

    while (current < tokens.length) {
        let token = tokens[current];

        if (token.type === "TAG_OPEN") {
            let nextToken = tokens[current + 1]

            // check for opening tags
            if (nextToken && nextToken.type === "IDENTIFIER") {
                let tagName = nextToken.value.toLowerCase();

                // 🚨 Rule Check: Enforce allowed framework tags only (1005)
                if (!ALLOWED_TAGS.has(tagName)) {
                    throw new OmniError(1005, `Invalid element tag '<${nextToken.value}>'. This framework only supports the following native components: ${Array.from(ALLOWED_TAGS).join(', ')}.`, nextToken.line);
                }

                let currentParent = stack[stack - 1]
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
                    parentNode: currentParent || null
                }

                // Rule Check: Enforce a single parent root element constraint
                // If the AST already has a completed root, but we find ANOTHER top-level tag opening...
                if (ast !== null && stack.length === 0) {
                    throw new OmniError(1001, `Component must have exactly one root element. Found a secondary top-level <${element.tagName}> tag.`, token.line);
                }

                // add the element to the stack
                stack.push(element)
                current += 2

                // check for attributes in the opening tag
                while (tokens[current] && tokens[current].type != "TAG_CLOSE") {
                    if (tokens[current].type === "IDENTIFIER") {
                        let attrName = tokens[current].value

                        // Rule Check: Strict key="value" pattern validation (1004)
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

                // Guard: Ensure the opening bracket actually finishes with a '>'
                if (!tokens[current] || tokens[current].type !== "TAG_CLOSE") {
                    throw new OmniError(1002, `The opening tag <${element.tagName}> missing its closing '>' delimiter.`, element.line);
                }

                // skip TAG_CLOSE token
                current++
                continue
            }

            // check for closing tags
            if (nextToken && nextToken.type === "SLASH") {
                let tagNameToken = tokens[current + 2];

                // Rule Check: Closing tag without an open tag on the stack (1003)
                if (stack.length === 0) {
                    throw new OmniError(1003, `Unexpected closing tag </${tagNameToken?.value || ""}> discovered with no corresponding open tag context.`, token.line);
                }

                // get the last element in the stack
                let FinalElement = stack.pop()

                // Rule Check: Mismatched closing tag (1003)
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

                // check if the stack is empty
                if (stack.length === 0) {
                    ast = FinalElement
                } else {
                    let parent = stack[stack.length - 1]
                    parent.children.push(FinalElement)
                }
                // skip all closing tag tokens
                current += 3

                // skip the last TAG_CLOSE token
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
                // Rule Check: Text hanging out outside the single root wrapper (1001)
                throw new OmniError(1001, `Floating text literal "${token.value.substring(0, 15)}..." discovered outside a root element. All contents must reside within a primary root component`, token.line);
            }
        }
        current++
    }

    if (stack.length > 0) {
        let unclosedElement = stack[stack.length - 1];
        throw new OmniError(1002, `Unclosed template tag error. The element <${unclosedElement.tagName}> was opened but never closed by the end of the file.`, unclosedElement.line);
    }

    return ast
}

// const text = `
//     <stack>
//         <stack>
//             <stack></stack>
//             <stack>
//                 <stack></stack>
//                 <text>
//                     <text></text>
//                 </text>
//             </stack>
//         </stack>
//     </stack>
// `
// try {
//     console.log(parse(tokenize(text)))
// } catch (error) {
//     console.log(error)
// }

export { parse }