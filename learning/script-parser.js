import { tokenizeScript } from "./script-tokenizer.js";
import { OmniError } from "./error.js";

// ----------------------------------------------------------------------------
// script-parser.js
// ----------------------------------------------------------------------------
// Parses a <script> block's raw text into a program AST:
//
//   Program
//     state: [{ name, init: Expr }]
//     functions: { [name]: { params: string[], body: Statement[] } }
//
//   Statement (only kind supported for now, per spec — reassignment only):
//     { type: "Assignment", name: string, expr: Expr, line }
//
//   Expr (one of):
//     { type: "Number",  value: number }
//     { type: "String",  value: string }
//     { type: "Boolean", value: boolean }
//     { type: "Identifier", name: string }
//     { type: "BinaryOp", op: "+"|"-"|"*"|"/", left: Expr, right: Expr }
//
// Expressions use standard precedence-climbing: term (+ / -) lowest,
// factor (* / ) higher, parens override. This is the same shape as any
// small arithmetic expression parser (e.g. a 4-function calculator grammar).
// ----------------------------------------------------------------------------

function parseScript(rawSource) {
    const tokens = tokenizeScript(rawSource);
    let pos = 0;

    function peek() { return tokens[pos]; }
    function advance() { return tokens[pos++]; }
    function expect(type, contextMsg) {
        const tok = tokens[pos];
        if (tok.type !== type) {
            throw new OmniError(1004, `Expected ${type} ${contextMsg || ""} but found '${tok.value ?? tok.type}'.`, tok.line);
        }
        return advance();
    }

    // ---- Expression grammar (precedence climbing) ----

    function parseExpr() {
        let left = parseTerm();
        while (peek().type === "PLUS" || peek().type === "MINUS") {
            const opTok = advance();
            const right = parseTerm();
            left = { type: "BinaryOp", op: opTok.value, left, right, line: opTok.line };
        }
        return left;
    }

    function parseTerm() {
        let left = parseFactor();
        while (peek().type === "STAR" || peek().type === "SLASH") {
            const opTok = advance();
            const right = parseFactor();
            left = { type: "BinaryOp", op: opTok.value, left, right, line: opTok.line };
        }
        return left;
    }

    function parseFactor() {
        const tok = peek();

        if (tok.type === "NUMBER") { advance(); return { type: "Number", value: tok.value, line: tok.line }; }
        if (tok.type === "STRING") { advance(); return { type: "String", value: tok.value, line: tok.line }; }
        if (tok.type === "BOOLEAN") { advance(); return { type: "Boolean", value: tok.value, line: tok.line }; }
        if (tok.type === "IDENT") { advance(); return { type: "Identifier", name: tok.value, line: tok.line }; }

        if (tok.type === "LPAREN") {
            advance();
            const expr = parseExpr();
            expect("RPAREN", "to close '('");
            return expr;
        }

        // Unary minus, e.g. "x = -1"
        if (tok.type === "MINUS") {
            advance();
            const operand = parseFactor();
            return { type: "BinaryOp", op: "-", left: { type: "Number", value: 0, line: tok.line }, right: operand, line: tok.line };
        }

        throw new OmniError(1004, `Unexpected token '${tok.value ?? tok.type}' in expression.`, tok.line);
    }

    // ---- Statement grammar ----

    function parseStatement() {
        // Only assignment statements exist for now: IDENT = EXPR
        const nameTok = expect("IDENT", "at the start of a statement (only 'identifier = expression' assignments are supported right now)");
        expect("ASSIGN", `after '${nameTok.value}' in an assignment`);
        const expr = parseExpr();
        return { type: "Assignment", name: nameTok.value, expr, line: nameTok.line };
    }

    function parseFunctionBody() {
        expect("LBRACE", "to start a function body");
        const statements = [];
        while (peek().type !== "RBRACE") {
            if (peek().type === "EOF") {
                throw new OmniError(1002, `Unclosed function body — expected '}' before end of <script> block.`, peek().line);
            }
            statements.push(parseStatement());
        }
        expect("RBRACE", "to close a function body");
        return statements;
    }

    // ---- Top-level: state declarations + function definitions ----

    const program = { state: [], functions: {} };

    while (peek().type !== "EOF") {
        const tok = peek();

        if (tok.type === "STATE") {
            advance();
            const nameTok = expect("IDENT", "after 'state' (expected a variable name)");
            expect("ASSIGN", `after 'state ${nameTok.value}' (state declarations must be initialized, e.g. state ${nameTok.value} = ...)`);
            const init = parseExpr();
            program.state.push({ name: nameTok.value, init, line: nameTok.line });
            continue;
        }

        if (tok.type === "FUNC") {
            advance();
            const nameTok = expect("IDENT", "after 'func' (expected a function name)");

            if (program.functions[nameTok.value]) {
                throw new OmniError(1006, `Duplicate function '${nameTok.value}' — a <script> block may only define each function name once.`, nameTok.line);
            }

            expect("LPAREN", `after function name '${nameTok.value}'`);
            // No parameters supported yet — just require an empty pair, per
            // spec ("func name()"). Reject anything between the parens
            // rather than silently ignoring it, so a typo like
            // "func foo(x)" fails loudly instead of pretending x exists.
            if (peek().type !== "RPAREN") {
                throw new OmniError(1004, `Function parameters are not supported yet — '${nameTok.value}(...)' must be declared with empty parentheses: ${nameTok.value}().`, peek().line);
            }
            expect("RPAREN", `to close '${nameTok.value}('`);

            const body = parseFunctionBody();
            program.functions[nameTok.value] = { params: [], body, line: nameTok.line };
            continue;
        }

        throw new OmniError(1004, `Unexpected token '${tok.value ?? tok.type}' at the top level of a <script> block. Expected 'state' or 'func'.`, tok.line);
    }

    return program;
}

export { parseScript };