import { OmniError } from "./error.js"

function tokenize(code) {
    let tokens = []
    let cursor = 0
    let isInsideTag = false
    let line = 1

    while (cursor < code.length) {
        let char = code[cursor]
        if (/\n/.test(char)) {
            line++
            cursor++
            continue
        }
        else if (/\s/.test(char) && !isInsideTag) {
            cursor++
            continue
        }
        else if (/\s/.test(char) && isInsideTag) {
            cursor++
            continue
        }
        else if (char == "<") {
            tokens.push({ type: "TAG_OPEN", value: char, line: line })
            isInsideTag = true
        }
        else if (char == "/") {
            tokens.push({ type: "SLASH", value: char, line: line })
        }
        else if (char == ">") {
            tokens.push({ type: "TAG_CLOSE", value: char, line: line })
            isInsideTag = false
        }
        else if (char == "=") {
            tokens.push({ type: "ASSIGN", value: char, line: line })
        }
        else if (/[a-zA-Z0-9]/.test(char)) {
            let value = ""
            if (isInsideTag) {
                while (cursor < code.length && /[a-zA-Z0-9]/.test(code[cursor])) {
                    value += code[cursor]
                    cursor++
                }
                tokens.push({ type: "IDENTIFIER", value: value, line: line })
                continue
            } else {
                while (cursor < code.length && code[cursor] != "<" && code[cursor] != "\n") {
                    value += code[cursor]
                    cursor++
                }
                tokens.push({ type: "TEXT", value: value, line: line })
                continue
            }
        }
        else if (char == '"' || char == "'") {
            let quoteType = char
            let value = ""
            cursor++
            while (cursor < code.length && code[cursor] != quoteType) {
                value += code[cursor]
                cursor++
            }
            if (cursor === code.length) {
                throw new OmniError(2002, "Unterminated string literal. Expected a closing double quote.", line);
            }
            tokens.push({ type: "VALUE", value: value, line: line })
            cursor++
            continue
        }
        else {
            throw new OmniError(2001, `Unexpected character literal '${char}' outside text context`, line);
        }
        cursor++
    }

    return tokens
}


export { tokenize }