import { OmniError } from "./error.js";

// ----------------------------------------------------------------------------
// script-tokenizer.js
// ----------------------------------------------------------------------------
// Lexes the RAW TEXT content of a <script> block — a completely separate
// grammar from markup (statements and expressions, not tags). This is
// deliberately its own module/tokenizer rather than bolted onto tokenizer.js,
// for the same reason markup and CSS aren't lexed by the same code: they're
// different languages that happen to be embedded in the same file format.
//
// Grammar this lexer supports tokens for:
//   state IDENT = EXPR
//   func IDENT ( ) { STATEMENT* }
//   STATEMENT := IDENT = EXPR
//   EXPR := term (('+'|'-') term)*
//   term := factor (('*'|'/') factor)*
//   factor := NUMBER | STRING | IDENT | '(' EXPR ')'
// ----------------------------------------------------------------------------

const KEYWORDS = new Set(["state", "func"]);

function tokenizeScript(code) {
    let tokens = [];
    let cursor = 0;
    let line = 1;

    while (cursor < code.length) {
        const char = code[cursor];

        if (char === "\n") {
            line++;
            cursor++;
            continue;
        }

        if (/\s/.test(char)) {
            cursor++;
            continue;
        }

        // Line comments: // ... to end of line. Not in the original spec,
        // but script bodies without ANY way to annotate code are painful in
        // practice — cheap to support, costs nothing if unused.
        if (char === "/" && code[cursor + 1] === "/") {
            while (cursor < code.length && code[cursor] !== "\n") cursor++;
            continue;
        }

        if (char === "(") { tokens.push({ type: "LPAREN", value: "(", line }); cursor++; continue; }
        if (char === ")") { tokens.push({ type: "RPAREN", value: ")", line }); cursor++; continue; }
        if (char === "{") { tokens.push({ type: "LBRACE", value: "{", line }); cursor++; continue; }
        if (char === "}") { tokens.push({ type: "RBRACE", value: "}", line }); cursor++; continue; }
        if (char === "+") { tokens.push({ type: "PLUS", value: "+", line }); cursor++; continue; }
        if (char === "-") { tokens.push({ type: "MINUS", value: "-", line }); cursor++; continue; }
        if (char === "*") { tokens.push({ type: "STAR", value: "*", line }); cursor++; continue; }
        if (char === "/") { tokens.push({ type: "SLASH", value: "/", line }); cursor++; continue; }
        if (char === "=") { tokens.push({ type: "ASSIGN", value: "=", line }); cursor++; continue; }
        if (char === ",") { tokens.push({ type: "COMMA", value: ",", line }); cursor++; continue; }

        // String literal: 'single' or "double" quoted.
        if (char === "'" || char === '"') {
            const quote = char;
            let value = "";
            cursor++;
            const startLine = line;
            while (cursor < code.length && code[cursor] !== quote) {
                if (code[cursor] === "\n") line++;
                value += code[cursor];
                cursor++;
            }
            if (cursor >= code.length) {
                throw new OmniError(2002, `Unterminated string literal in <script> block. Expected closing ${quote}.`, startLine);
            }
            cursor++; // skip closing quote
            tokens.push({ type: "STRING", value, line: startLine });
            continue;
        }

        // Number literal: integer or decimal.
        if (/[0-9]/.test(char)) {
            let value = "";
            while (cursor < code.length && /[0-9.]/.test(code[cursor])) {
                value += code[cursor];
                cursor++;
            }
            tokens.push({ type: "NUMBER", value: Number(value), line });
            continue;
        }

        // Identifier or keyword.
        if (/[a-zA-Z_]/.test(char)) {
            let value = "";
            while (cursor < code.length && /[a-zA-Z0-9_]/.test(code[cursor])) {
                value += code[cursor];
                cursor++;
            }
            if (KEYWORDS.has(value)) {
                tokens.push({ type: value.toUpperCase(), value, line }); // STATE, FUNC
            } else if (value === "true" || value === "false") {
                tokens.push({ type: "BOOLEAN", value: value === "true", line });
            } else {
                tokens.push({ type: "IDENT", value, line });
            }
            continue;
        }

        throw new OmniError(2001, `Unexpected character '${char}' in <script> block.`, line);
    }

    tokens.push({ type: "EOF", value: null, line });
    return tokens;
}

export { tokenizeScript };