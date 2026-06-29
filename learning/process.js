import { readFile } from "node:fs/promises";
import { extname } from "node:path";
import { tokenize } from "./tokenizer.js";
import { parse } from "./parser.js";
import { OmniError } from "./error.js";

const EXPECTED_EXTENSION = ".omni";

/**
 * Reads a .omni source file from disk and returns its raw text content.
 *
 * Deliberately does NOT catch/wrap filesystem errors into OmniError — a
 * missing file, bad permissions, etc. are I/O failures, not
 * syntax/lexical/semantic/runtime errors in the OmniError taxonomy. Callers
 * that want a unified error type should catch both error kinds themselves.
 *
 * @param {string} filePath - path to a .omni file
 * @param {object} [options]
 * @param {boolean} [options.skipExtensionCheck=false] - allow non-.omni paths
 * @returns {Promise<string>} raw file contents
 */
async function readOmniFile(filePath, options = {}) {
    const { skipExtensionCheck = false } = options;

    if (!filePath || typeof filePath !== "string") {
        throw new TypeError(`readOmniFile expected a string file path, received: ${typeof filePath}`);
    }

    if (!skipExtensionCheck && extname(filePath).toLowerCase() !== EXPECTED_EXTENSION) {
        throw new Error(
            `Expected a '${EXPECTED_EXTENSION}' file but received '${filePath}'. ` +
            `Pass { skipExtensionCheck: true } to read this file anyway.`
        );
    }

    let contents;
    try {
        contents = await readFile(filePath, { encoding: "utf-8" });
    } catch (err) {
        // Re-throw with the original file path attached for easier debugging,
        // but preserve the original error (ENOENT, EACCES, etc.) as `cause`
        // rather than masking it behind an OmniError.
        throw new Error(`Failed to read Omni file at '${filePath}': ${err.message}`, { cause: err });
    }

    return contents;
}

/**
 * Convenience pipeline: read a .omni file from disk, tokenize it, and parse
 * it into a roots object in one call. This is the function most entry points
 * (CLI, dev server, file-picker handler) will actually want.
 *
 * Any OmniError thrown during tokenize/parse propagates unchanged — it
 * already carries code/line/category info, no need to re-wrap it here.
 *
 * @param {string} filePath - path to a .omni file
 * @param {object} [options] - forwarded to readOmniFile
 * @returns {Promise<{script: object|null, style: object|null, stack: object}>}
 *   the parsed roots object — `stack` is always present (parse() throws if
 *   missing), `style`/`script` are null if absent from the source. Pass
 *   directly to renderer.mount(roots, target).
 */
async function loadOmniFile(filePath, options = {}) {
    const source = await readOmniFile(filePath, options);

    let tokens;
    try {
        tokens = tokenize(source);
    } catch (err) {
        if (err instanceof OmniError) {
            // Attach the file path so a multi-file project can tell which
            // file actually failed — OmniError already has line, but not path.
            err.filePath = filePath;
        }
        throw err;
    }

    let roots;
    try {
        roots = parse(tokens);
    } catch (err) {
        if (err instanceof OmniError) {
            err.filePath = filePath;
        }
        throw err;
    }

    return roots;
}

export { readOmniFile, loadOmniFile };