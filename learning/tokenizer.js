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
        
        if (/\s/.test(char) && !isInsideTag) {
            cursor++
            continue
        }

        if (char == "<") {
            tokens.push({ type: "TAG_OPEN", value: char, line: line})
            isInsideTag = true
        } else if (char == "/") {
            tokens.push({ type: "SLASH", value: char, line: line})
        } else if (char == ">") {
            tokens.push({ type: "TAG_CLOSE", value: char, line: line})
            isInsideTag = false
        } else if (char == "=") {
            tokens.push({ type: "ASSIGN", value: char, line: line})
        } else if (/[a-zA-Z0-9]/.test(char)) {
            let value = ""
            if (isInsideTag) {
                while (cursor < code.length && /[a-zA-Z0-9]/.test(code[cursor])) {
                    value += code[cursor]
                    cursor++
                }
                tokens.push({ type: "IDENTIFIER", value: value, line: line})
                continue
            } else {
                while (cursor < code.length && code[cursor] != "<" && code[cursor] != "\n") {
                    value += code[cursor]
                    cursor++
                }
                tokens.push({ type: "TEXT", value: value, line: line})
                continue
            }
        } else if (char == '"') {
            let value = ""
            cursor++
            while (cursor < code.length && code[cursor] != '"') {
                value += code[cursor]
                cursor++
            }
            tokens.push({ type: "VALUE", value: value, line: line})
            cursor++
            continue
        }

        cursor++
    }

    return tokens
}
const text = `
    <div>I am a friend of your parent</div>
    <p>be cool bro?</p>
    <button type="submit"></button>
`

export const TOKENS = tokenize(text)