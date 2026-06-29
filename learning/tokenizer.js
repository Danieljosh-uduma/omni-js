import { OmniError } from "./error.js"

// ✅ NEW: tags whose content must be scanned as raw, unparsed text rather
// than normal Omni markup — mirrors how real HTML treats <script>/<style>
// as "raw text elements." CSS syntax (., {, }, :, ;, #) has no meaning in
// the normal tokenizer's character set and would throw ERR_LEX_UNEXPECTED_CHAR
// if scanned character-by-character. "script" now included: its content is
// a SEPARATE statement-based grammar (state declarations, eventually real
// logic) that the markup tokenizer has no business trying to lex — the
// parser runs its own dedicated mini-tokenizer over the RAW_TEXT this
// produces (see parseScriptBody in parser.js).
const RAW_TEXT_TAGS = new Set(["style", "script"]);

/**
 * From `cursor` (positioned right after the opening tag's '>'), scan forward
 * verbatim until the literal closing sequence `</tagName>` is found
 * (case-insensitive, whitespace-tolerant around the tag name, matching how
 * browsers find the end of <script>/<style> bodies). Returns the raw content
 * and the cursor/line position immediately after consuming it, NOT including
 * the closing tag itself — the closing tag is left for normal tokenization
 * to handle, so </style> still produces the usual TAG_OPEN/SLASH/IDENTIFIER/
 * TAG_CLOSE tokens your parser already expects.
 */
function scanRawTextUntilClose(code, startCursor, startLine, tagName) {
    let cursor = startCursor;
    let line = startLine;
    let value = "";

    // Build a case-insensitive matcher for "</tagName" allowing whitespace
    // before the final '>', e.g. "</style >" — mirrors browser leniency.
    const closeMatcher = new RegExp(`^<\\/\\s*${tagName}\\s*>`, "i");

    while (cursor < code.length) {
        const remaining = code.slice(cursor);
        if (closeMatcher.test(remaining)) {
            // Found the real closing tag — stop here, leave it unconsumed.
            return { value, cursor, line };
        }
        if (code[cursor] === "\n") {
            line++;
        }
        value += code[cursor];
        cursor++;
    }

    // Reached end of file without finding a closing tag.
    throw new OmniError(1002, `Unclosed raw-text tag '<${tagName}>'. Expected a matching '</${tagName}>' before end of file.`, startLine);
}

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

            // ✅ NEW: just closed an opening tag — check if the tag we just
            // finished is a raw-text tag (style). If so, switch to raw
            // scanning mode immediately rather than resuming normal
            // char-by-char tokenization, which can't lex CSS.
            // Walk backward through already-emitted tokens to find the tag
            // name: pattern is [...,TAG_OPEN, IDENTIFIER(tagName), ...attrs..., TAG_CLOSE(this one)]
            // Find the most recent TAG_OPEN that isn't a closing tag (no SLASH
            // immediately after it) and read the IDENTIFIER right after it.
            let openIdx = tokens.length - 2; // skip the TAG_CLOSE we just pushed
            while (openIdx >= 0 && tokens[openIdx].type !== "TAG_OPEN") {
                openIdx--;
            }
            const tagNameToken = openIdx >= 0 ? tokens[openIdx + 1] : null;
            const justOpenedRawTag = tagNameToken && tagNameToken.type === "IDENTIFIER"
                && RAW_TEXT_TAGS.has(tagNameToken.value.toLowerCase());

            if (justOpenedRawTag) {
                cursor++; // move past the '>' we just tokenized
                const { value, cursor: newCursor, line: newLine } =
                    scanRawTextUntilClose(code, cursor, line, tagNameToken.value.toLowerCase());

                // Only emit a token if there's actual non-empty content —
                // an empty <style></style> shouldn't produce a stray
                // zero-length TEXT node.
                if (value.length > 0) {
                    tokens.push({ type: "RAW_TEXT", value: value, line: line });
                }

                cursor = newCursor;
                line = newLine;
                continue;
            }
        }
        else if (char == "=") {
            tokens.push({ type: "ASSIGN", value: char, line: line })
        }
        else if (isInsideTag && /[a-zA-Z0-9]/.test(char)) {
            let value = ""
            while (cursor < code.length && /[a-zA-Z0-9]/.test(code[cursor])) {
                value += code[cursor]
                cursor++
            }
            tokens.push({ type: "IDENTIFIER", value: value, line: line })
            continue
        }
        // ✅ FIX (pre-existing bug, surfaced by interpolation work): the old
        // text-scanning branch only fired if the FIRST character was
        // alphanumeric (`/[a-zA-Z0-9]/.test(char)`), meaning any text segment
        // starting with punctuation/symbols (e.g. ", welcome" — common right
        // after a {interpolation}) fell through to the catch-all "Unexpected
        // character" branch and threw 2001. This branch now owns ALL
        // non-tag-context text scanning regardless of starting character,
        // stopping only at the same three structural boundaries as before:
        // '<' (tag start), '\n' (newline), '{' (interpolation start).
        else if (!isInsideTag && char != "<" && char != "{" && char != "\"" && char != "'") {
            let value = ""
            while (cursor < code.length && code[cursor] != "<" && code[cursor] != "\n" && code[cursor] != "{") {
                value += code[cursor]
                cursor++
            }
            tokens.push({ type: "TEXT", value: value, line: line })
            continue
        }
        // ✅ NEW: state interpolation, e.g. "{username}" in markup text.
        // Only meaningful outside tag context (an attribute value like
        // class="{foo}" is NOT supported by this — attributes still go
        // through the quoted VALUE path entirely unchanged). Scans the
        // identifier between { and }, requires an immediate matching '}'
        // with no nested braces/expressions — this is intentionally a
        // single bare identifier binding, not a general expression
        // language, matching "state are global... access in {}" as
        // described, nothing fancier.
        else if (char == "{" && !isInsideTag) {
            let value = ""
            cursor++ // skip '{'
            while (cursor < code.length && /[a-zA-Z0-9_]/.test(code[cursor])) {
                value += code[cursor]
                cursor++
            }
            if (code[cursor] !== "}") {
                throw new OmniError(2001, `Malformed interpolation '{${value}'. Expected a single identifier followed by '}', e.g. '{username}'.`, line);
            }
            if (value.length === 0) {
                throw new OmniError(2001, `Empty interpolation '{}' — expected an identifier, e.g. '{username}'.`, line);
            }
            cursor++ // skip '}'
            tokens.push({ type: "INTERP", value: value, line: line })
            continue
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