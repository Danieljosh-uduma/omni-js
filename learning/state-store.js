import { OmniError } from "./error.js";

// ----------------------------------------------------------------------------
// state-store.js
// ----------------------------------------------------------------------------
// Two responsibilities, kept together because they're tightly coupled:
//
//   1. A reactive key/value store with pub-sub: createStateStore() returns
//      { getState, setState, subscribe }. setState notifies every
//      subscriber whose watched key changed.
//
//   2. An expression evaluator + function-call runner that operates on the
//      Program AST produced by script-parser.js, reading/writing through
//      the store above so "func increment() { age = age + 1 }" actually
//      mutates real, observable state.
// ----------------------------------------------------------------------------

/**
 * Creates an isolated reactive state store. Each mounted .omni app gets its
 * own store instance (NOT a module-level singleton) — this matters if more
 * than one Omni app is ever mounted on the same page (e.g. two widgets),
 * since they must not share or clobber each other's state.
 */
function createStateStore() {
    const values = new Map();
    // key -> Set of listener functions. A listener receives the new value.
    const subscribers = new Map();

    function getState(key) {
        return values.get(key);
    }

    function setState(key, value) {
        const prev = values.get(key);
        values.set(key, value);
        // Always notify, even if value === prev — assigning the same value
        // is still a deliberate "set" the author asked for, and silently
        // skipping notification on no-op writes is a surprising special
        // case (e.g. resetting to the same value should still refresh any
        // dependent display logic that might exist later, like a "last
        // updated" indicator). Cheap to keep simple now.
        const listeners = subscribers.get(key);
        if (listeners) {
            for (const listener of listeners) {
                listener(value, prev);
            }
        }
    }

    function subscribe(key, listener) {
        if (!subscribers.has(key)) {
            subscribers.set(key, new Set());
        }
        subscribers.get(key).add(listener);

        // Return an unsubscribe function, standard pub-sub ergonomics —
        // needed later when DOM nodes bound to a key get removed/replaced
        // and must stop listening to avoid a memory leak.
        return () => {
            const listeners = subscribers.get(key);
            if (listeners) listeners.delete(listener);
        };
    }

    return { getState, setState, subscribe };
}

// ----------------------------------------------------------------------------
// Expression evaluation
// ----------------------------------------------------------------------------

/**
 * Evaluate an Expr AST node (from script-parser.js) against a state store.
 *
 * Arithmetic/concat semantics, decided explicitly rather than inherited from
 * JS's `+` coercion quirks:
 *   - number + number -> numeric addition
 *   - string + string -> concatenation
 *   - string + number OR number + string -> concatenation (number coerced
 *     to its string form). This is the one deliberate "coercion" allowed,
 *     since "username = username + ' is ' + age" is an extremely natural
 *     thing to want to write, and forbidding it would be needlessly strict
 *     for a templating-oriented language.
 *   - boolean operands in arithmetic (+, -, *, /) -> rejected with a clear
 *     error, rather than silently coercing true/false to 1/0 the way JS does.
 *     Silent bool->number coercion is a common source of confusing bugs and
 *     isn't something this language needs to inherit.
 *   - -, *, / between two strings, or involving a boolean -> rejected.
 */
function evaluateExpr(node, store) {
    switch (node.type) {
        case "Number":
            return node.value;
        case "String":
            return node.value;
        case "Boolean":
            return node.value;
        case "Identifier": {
            const value = store.getState(node.name);
            if (value === undefined) {
                throw new OmniError(1004, `Reference to undeclared state variable '${node.name}'. Did you forget a 'state ${node.name} = ...' declaration?`, node.line);
            }
            return value;
        }
        case "BinaryOp": {
            const left = evaluateExpr(node.left, store);
            const right = evaluateExpr(node.right, store);
            return evaluateBinaryOp(node.op, left, right, node.line);
        }
        default:
            throw new OmniError(1004, `Unknown expression node type '${node.type}'.`, node.line);
    }
}

function evaluateBinaryOp(op, left, right, line) {
    const leftIsString = typeof left === "string";
    const rightIsString = typeof right === "string";
    const leftIsBool = typeof left === "boolean";
    const rightIsBool = typeof right === "boolean";

    if (leftIsBool || rightIsBool) {
        throw new OmniError(1004, `Cannot use boolean values in arithmetic ('${left} ${op} ${right}'). Booleans can only be assigned directly, not combined with +, -, *, or /.`, line);
    }

    if (op === "+") {
        if (leftIsString || rightIsString) {
            // String concatenation — coerce the non-string side to its
            // string form (numbers only, booleans already rejected above).
            return String(left) + String(right);
        }
        return left + right;
    }

    // -, *, / are numeric-only — reject if either side is a string.
    if (leftIsString || rightIsString) {
        throw new OmniError(1004, `Cannot use '${op}' with a string operand ('${left} ${op} ${right}'). Only '+' supports string concatenation.`, line);
    }

    switch (op) {
        case "-": return left - right;
        case "*": return left * right;
        case "/":
            if (right === 0) {
                throw new OmniError(1004, `Division by zero ('${left} / ${right}').`, line);
            }
            return left / right;
        default:
            throw new OmniError(1004, `Unknown operator '${op}'.`, line);
    }
}

/**
 * Initialize a store's state from a Program AST's `state` declarations.
 * Declarations are initialized in source order, so a later declaration's
 * initializer COULD reference an earlier one (e.g. state a = 1, state b = a
 * + 1) — this isn't explicitly asked for, but falls out naturally from
 * evaluating in order, and forbidding it would require extra checks for no
 * real benefit.
 */
function initializeState(program, store) {
    for (const decl of program.state) {
        const value = evaluateExpr(decl.init, store);
        store.setState(decl.name, value);
    }
}

/**
 * Run a named function's body (a list of Assignment statements) against the
 * store. Throws if the function doesn't exist — callers (event handlers)
 * should have already validated this at bind-time, but defending here too
 * costs nothing and gives a clearer error than "cannot read body of
 * undefined" if it's ever reached some other way.
 */
function callFunction(program, store, functionName) {
    const fn = program.functions[functionName];
    if (!fn) {
        throw new OmniError(1004, `Cannot call undefined function '${functionName}'. Declared functions: ${Object.keys(program.functions).join(", ") || "(none)"}.`, null);
    }

    for (const statement of fn.body) {
        if (statement.type === "Assignment") {
            // ✅ Reject assignment to an undeclared state variable rather
            // than silently creating a new one — keeps "state" as the only
            // way to introduce a variable, matching the spec's framing of
            // state as the (only) global variable mechanism. A function
            // that tries to invent a new variable on the fly is almost
            // certainly a typo (e.g. "ag = age + 1" instead of "age = ...").
            if (store.getState(statement.name) === undefined) {
                throw new OmniError(1004, `Cannot assign to '${statement.name}' inside func ${functionName}() — it was never declared with 'state ${statement.name} = ...'.`, statement.line);
            }
            const value = evaluateExpr(statement.expr, store);
            store.setState(statement.name, value);
        } else {
            throw new OmniError(1004, `Unsupported statement type '${statement.type}' inside func ${functionName}().`, statement.line);
        }
    }
}

export { createStateStore, evaluateExpr, initializeState, callFunction };