import { TOKENS } from "./tokenizer.js";

function parse(tokens) {
    let current = 0;
    let stack = [];
    let root = []; // Or an array if multiple roots are allowed

    while (current < tokens.length) {
        let token = tokens[current];
        
        // Parsing logic will go here
        if (token.type == "TAG_OPEN") {
            let nextToken = tokens[current + 1]

            if (nextToken && nextToken.type == "IDENTIFIER") {
                let element = {
                    type: "Element",
                    tagName: nextToken.value,
                    attributes: {},
                    children: []
                }
                stack.push(element)
                current += 2

                while (tokens[current] && tokens[current].type != "TAG_CLOSE") {
                    if (tokens[current] && tokens[current].type == "IDENTIFIER") {
                        let attrName = tokens[current].value
                        let attrValue = tokens[current + 2].value
                        element.attributes[attrName] = attrValue
                        current += 3
                    }
                }
                current++
                // root.push(stack.pop())
            }
        }
    }
}

console.log(parse(TOKENS))