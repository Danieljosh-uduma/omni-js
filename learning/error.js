/*
    1***: SYNTAX_ERROR
    2***: LEXICAL_ERROR
    3***: SEMANTIC_ERROR
    4***: RUNTIME_ERROR
*/
const ERROR_CODES = {
    1001: "ERR_PARSE_MISSING_PARENT",
    1002: "ERR_PARSE_UNCLOSED_TAG",
    1003: "ERR_PARSE_MISMATCHED_TAG",
    1004: "ERR_PARSE_MALFORMED_ATTR",
    1005: "ERR_PARSE_INVALID_TAG",
    2001: "ERR_LEX_UNEXPECTED_CHAR",
}

class OmniError extends Error {
    constructor(code, message, line) {
        const location = line ? `at line ${line}` : ""

        // Dynamically determine the category type based on the code prefix
        let errorType = "ERROR";
        if (code >= 1000 && code < 2000) errorType = "SYNTAX_ERROR";
        else if (code >= 2000 && code < 3000) errorType = "LEXICAL_ERROR";
        else if (code >= 3000 && code < 4000) errorType = "SEMANTIC_ERROR";
        else if (code >= 4000 && code < 5000) errorType = "RUNTIME_ERROR";

        const errorLabel = ERROR_CODES[code] ? `${ERROR_CODES[code]} (${code})` : `UNKNOWN_ERROR (${code})`;
        super(`[${errorType} -> ${errorLabel}]: ${message} ${location}`);

        this.name = "OmniError"
        this.code = code
        this.errorName = ERROR_CODES[code] || null
        this.line = line

        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, OmniError)
        }
    }
}

export { OmniError }