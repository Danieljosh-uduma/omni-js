import { parse, transformReactivitySyntax } from './parser.js';
import { render } from './renderer.js';
import { createSignal, effect } from './reactivity.js';
import { createResource } from './resource.js';
import { useForm } from './form.js';
import { initRouter, navigate, getRouterSignal, beforeEach } from './router.js';
import { handleOmniError } from './error.js';

export async function mount(source, container, props = {}, parentContext = null) {
  let ast;
  try {
    ast = parse(source);
  } catch (e) {
    handleOmniError('Failed to parse OmniJS component.', e);
    return;
  }

  // Initialize the global router on first mount
  initRouter();

  if (!window.globalOmniContext) {
    window.globalOmniContext = {
      currentPage: getRouterSignal()
    };
  }

  // Build the component context with framework utilities
  const context = {
    createSignal,
    effect,
    createResource,
    useForm,
    navigate,
    getRouterSignal,
    beforeEach,
    log: (...args) => console.log('[OmniJS]', ...args),
    props,
    parentContext,
    provide(key, value) {
      if (!context.provides) context.provides = {};
      context.provides[key] = value;
    },
    inject(key) {
      let parent = parentContext;
      while (parent) {
        if (parent.provides && key in parent.provides) {
          return parent.provides[key];
        }
        parent = parent.parentContext;
      }
      console.warn(`[OmniJS] Context key "${key}" not found in parent ancestry.`);
      return undefined;
    },
    ...window.globalOmniContext
  };
  // Execute the component's <script> block, attaching signals/functions to context
  if (ast.script.content) {
    const transformedScript = transformReactivitySyntax(ast.script.content);
    try {
      const runScript = new Function('context', `
        const { createSignal, effect, createResource, useForm, provide, inject, navigate, getRouterSignal, beforeEach, log, props } = context;
        \${transformedScript}
      `);
      runScript(context);
    } catch(e) {
      handleOmniError('Script execution failed during compilation/mount.', e);
    }
  }

  // Inject the component's <style> block into the document head
  if (ast.style.content) {
    const hash = simpleHash(ast.style.content);
    const id = `omni-style-${hash}`;
    if (!document.getElementById(id)) {
      const styleEl = document.createElement('style');
      styleEl.id = id;
      styleEl.textContent = ast.style.content;
      document.head.appendChild(styleEl);
    }
  }

  // Render the template
  try {
    await render(ast, context, container);
  } catch(e) {
    handleOmniError('Template rendering failed.', e);
  }
}

function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

// ── Dev Mode Auto-Bootstrap ──
if (typeof window !== 'undefined') {
  // Expose mount globally so child components can self-inject
  window.__omni_mount = mount;
  
  window.addEventListener('DOMContentLoaded', () => {
    const scripts = document.querySelectorAll('script[type="text/omni"]');
    scripts.forEach(async script => {
      let source = script.textContent;
      if (script.hasAttribute('src')) {
        const res = await fetch(script.getAttribute('src'), { cache: 'no-cache' });
        source = await res.text();
      }
      const container = document.createElement('div');
      container.id = 'omni-root';
      script.parentNode.insertBefore(container, script);
      await mount(source, container);
    });
  });
}
