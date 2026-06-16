import { parse, transformReactivitySyntax } from './parser.js';
import { render } from './renderer.js';
import { createSignal, effect, createStore } from './reactivity.js';
import { createResource } from './resource.js';
import { useForm } from './form.js';
import { initRouter, navigate, getRouterSignal, beforeEach } from './router.js';
import { handleOmniError, OmniError } from './error.js';

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
      currentPage: getRouterSignal(),
    };
  }

  // Build the component context with framework utilities
  const baseContext = {
    createSignal,
    effect,
    createResource,
    createStore,
    useForm,
    navigate,
    getRouterSignal,
    beforeEach,
    log: (...args) => console.log('[OmniJS]', ...args),
    props,
    parentContext,
    provide(key, value) {
      if (!baseContext.provides) baseContext.provides = {};
      baseContext.provides[key] = value;
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
    ...window.globalOmniContext,
  };

  const context = new Proxy(baseContext, {
    get(target, prop, receiver) {
      if (prop in target) {
        return Reflect.get(target, prop, receiver);
      }
      if (typeof window !== 'undefined' && window.globalOmniState && prop in window.globalOmniState) {
        return {
          __isSignal: true,
          get value() {
            return window.globalOmniState[prop];
          },
          set value(newValue) {
            window.globalOmniState[prop] = newValue;
          },
        };
      }
      if (typeof window !== 'undefined' && window.globalOmniStores && prop in window.globalOmniStores) {
        return window.globalOmniStores[prop];
      }
      return undefined;
    },
    set(target, prop, value, receiver) {
      return Reflect.set(target, prop, value, receiver);
    },
    has(target, prop) {
      return (
        prop in target ||
        (typeof window !== 'undefined' && window.globalOmniState && prop in window.globalOmniState) ||
        (typeof window !== 'undefined' && window.globalOmniStores && prop in window.globalOmniStores)
      );
    },
  });

  // Execute the component's <script> block, attaching signals/functions to context
  if (ast.script.content) {
    const transformedScript = transformReactivitySyntax(ast.script.content);
    try {
      const runScript = new Function(
        'context',
        `
        const { createSignal, effect, createResource, createStore, useForm, provide, inject, navigate, getRouterSignal, beforeEach, log, props } = context;
        ${transformedScript}
      `
      );
      runScript(context);
    } catch (e) {
      const wrappedError = new OmniError(e.message || String(e), {
        componentName: parentContext ? 'Child Component' : 'Root Component',
        phase: 'Script execution / Mount',
      });
      wrappedError.stack = e.stack || wrappedError.stack;
      handleOmniError('Script execution failed during compilation/mount.', wrappedError);
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
  } catch (e) {
    handleOmniError('Template rendering failed.', e);
  }
}

function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
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
    scripts.forEach(async (script) => {
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

export { OmniError, handleOmniError, createStore };
