
import { runOmniUrl, OmniError } from "../learning/index.browser.js";

const statusEl = document.getElementById("status");
const target = document.getElementById("app");

try {
    const ast = await runOmniUrl("./demo.omni", target);
    statusEl.textContent = "✅ Mounted demo.omni successfully. See rendered output below.";
    statusEl.className = "ok";
    console.log("Parsed AST:", ast);
} catch (err) {
    statusEl.className = "error";
    if (err instanceof OmniError) {
        statusEl.textContent = `❌ OmniError [${err.code}]: ${err.message}`;
    } else {
        statusEl.textContent = `❌ ${err.message}`;
    }
    console.error(err);
}