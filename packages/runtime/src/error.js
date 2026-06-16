export class OmniError extends Error {
  constructor(message, context = {}) {
    super(message);
    this.name = 'OmniError';
    this.context = context;
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, OmniError);
    }
  }
}

export function handleOmniError(message, error) {
  // Clear and abstracted console logging
  console.error(
    `%c 🚨 OmniJS Error `,
    'background: #ff2d7b; color: white; border-radius: 4px; padding: 2px 6px; font-weight: bold;',
    message
  );
  console.error(error);

  // Do not render overlay in production (assumed if window is undefined or custom flag)
  if (typeof window === 'undefined') return;

  // Render context information if present
  let contextHtml = '';
  if (error instanceof OmniError && error.context && Object.keys(error.context).length > 0) {
    contextHtml = `
      <div style="margin-top: 1rem; margin-bottom: 1rem; background: rgba(255, 255, 255, 0.05); padding: 1rem; border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.1);">
        <strong style="color: #ff9f43; font-size: 0.9rem; display: block; margin-bottom: 0.25rem;">Error Context:</strong>
        <pre style="margin: 0; color: #e2e8f0; font-size: 0.8rem; font-family: inherit;">${JSON.stringify(error.context, null, 2)}</pre>
      </div>
    `;
  }

  const overlay = document.createElement('div');
  overlay.className = 'omni-error-overlay';
  overlay.style.cssText = `
    position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
    background: rgba(15, 15, 15, 0.95); color: #ff8e8e; z-index: 999999;
    padding: 3rem; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; 
    overflow-y: auto; box-sizing: border-box; backdrop-filter: blur(10px);
  `;

  const stack = error && error.stack ? error.stack : error || 'Unknown Error';

  overlay.innerHTML = `
    <div style="max-width: 800px; margin: 0 auto;">
      <h1 style="color: #ff2d7b; margin-top: 0; font-size: 1.5rem; letter-spacing: -0.02em; margin-bottom: 0.5rem;">🚨 OmniJS Error</h1>
      <h3 style="color: white; font-weight: 500; font-size: 1.1rem; margin-bottom: 1.5rem;">${message}</h3>
      ${contextHtml}
      <pre style="background: rgba(255, 45, 123, 0.1); color: #ffb3c6; padding: 1.5rem; border-radius: 12px; border: 1px solid rgba(255, 45, 123, 0.2); white-space: pre-wrap; font-size: 0.85rem; line-height: 1.6; overflow-x: auto;">${stack}</pre>
      <button onclick="this.parentElement.parentElement.remove()" style="margin-top: 2rem; padding: 0.75rem 1.5rem; background: white; color: black; border: none; border-radius: 8px; font-weight: bold; cursor: pointer; transition: opacity 0.2s;">Dismiss Overlay</button>
    </div>
  `;

  document.body.appendChild(overlay);
}
