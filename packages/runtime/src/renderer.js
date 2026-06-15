import { effect } from './reactivity.js';
import { navigate, getRouterSignal } from './router.js';

// Pre-process template source to convert OmniJS attribute syntax
// into valid HTML data-* attributes before DOMParser touches it.
// This prevents the browser from stripping colons in attribute names.
// Pre-process template source to convert OmniJS attribute syntax
// into valid HTML data-* attributes before DOMParser touches it.
// This prevents the browser from stripping colons in attribute names.
function preprocessTemplate(templateSource, components = []) {
  let src = templateSource;
  
  // Case-sensitively rewrite custom component tags to prevent case-insensitivity issues
  // in DOMParser. (e.g., <Header ...> → <omni-component-header omni-name="Header" ...>)
  for (const comp of components) {
    const compName = comp.name;
    const startTagRegex = new RegExp('<' + compName + '\\b', 'g');
    const endTagRegex = new RegExp('</' + compName + '\\b', 'g');
    src = src.replace(startTagRegex, `<omni-component-${compName.toLowerCase()} omni-name="${compName}"`);
    src = src.replace(endTagRegex, `</omni-component-${compName.toLowerCase()}>`);
  }

  // navigate::to="..." → navigate-to="..."
  src = src.replace(/navigate::to=/g, 'navigate-to=');
  // bind::prop="..." → bind-prop="..."  
  src = src.replace(/bind::([a-zA-Z0-9_-]+)=/g, 'bind-$1=');
  // on::event="..." → on-event="..."
  src = src.replace(/on::([a-zA-Z0-9_-]+)=/g, 'on-$1=');
  // animate::trigger="..." → animate-trigger="..."
  src = src.replace(/animate::([a-zA-Z0-9_-]+)=/g, 'animate-$1=');
  // if::condition="..." → if-condition="..."
  src = src.replace(/if::condition=/g, 'if-condition=');
  // src::logic="..." → src-logic="..."
  src = src.replace(/src::logic=/g, 'src-logic=');
  // src::style="..." → src-style="..."
  src = src.replace(/src::style=/g, 'src-style=');
  return src;
}

export async function render(ast, context, container) {
  const preprocessed = preprocessTemplate(ast.templateSource, ast.components || []);
  const parser = new DOMParser();
  const doc = parser.parseFromString(preprocessed, 'text/html');
  const rootNodes = Array.from(doc.body.childNodes);
  
  for (const node of rootNodes) {
    const el = await walkAndTransform(node, context, { stackDepth: 0, textDepth: 1 }, ast.components || []);
    if (el) container.appendChild(el);
  }
}

async function walkAndTransform(node, context, state, components) {
  // ── Text Nodes ──
  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.textContent;
    if (!text.trim()) return null;
    
    // Handle inline interpolation: {?varName} or {varName.prop}
    if (text.includes('{') && text.includes('}')) {
      const span = document.createElement('span');
      effect(() => {
        let resolved = text.replace(/\{[?]?([a-zA-Z0-9_.]+)\}/g, (match, path) => {
          const parts = path.split('.');
          let val = context;
          
          for (const p of parts) {
            if (val && typeof val === 'object') {
              if (p in val) {
                val = val[p];
                // Unpack signals automatically
                if (val && typeof val === 'object' && 'value' in val && Object.keys(val).length <= 2) {
                  val = val.value;
                }
              } else {
                return match;
              }
            } else {
              return match;
            }
          }
          return val !== undefined ? val : match;
        });
        span.textContent = resolved;
      });
      return span;
    }
    return document.createTextNode(text);
  }

  // ── Comments, etc. ──
  if (node.nodeType !== Node.ELEMENT_NODE) return null;

  const tagName = node.tagName.toLowerCase();
  
  if (tagName === 'portal') {
    const target = node.getAttribute('target') || 'body';
    const targetEl = document.querySelector(target) || document.body;
    
    // Create placeholder to stay in the original DOM hierarchy
    const placeholder = document.createElement('span');
    placeholder.style.display = 'none';
    placeholder.className = 'omni-portal-placeholder';
    
    // Create the wrapper for portal contents
    const portalContent = document.createElement('div');
    portalContent.className = 'omni-portal-content';
    
    // Transfer non-internal attributes from <Portal> to the content wrapper
    Array.from(node.attributes).forEach(attr => {
      if (attr.name !== 'target' && attr.name !== 'as') {
        portalContent.setAttribute(attr.name, attr.value);
      }
    });

    // Render children into portalContent
    for (const child of Array.from(node.childNodes)) {
      const childEl = await walkAndTransform(child, context, state, components);
      if (childEl) portalContent.appendChild(childEl);
    }
    
    // Append content to the target destination
    targetEl.appendChild(portalContent);

    // Sync visibility of the portal content with the placeholder's visibility in the document tree
    const syncVisibility = () => {
      const isVisible = placeholder.isConnected && (placeholder.offsetParent !== null || placeholder.getBoundingClientRect().width > 0);
      portalContent.style.display = isVisible ? '' : 'none';
    };

    // Watch for attribute changes (style, class) in the entire document to detect parent visibility toggles
    const observer = new MutationObserver(syncVisibility);
    observer.observe(document.body, { attributes: true, subtree: true, attributeFilter: ['style', 'class'] });

    // Initial sync
    setTimeout(syncVisibility, 0);

    // Clean up observer and portal content when the placeholder is removed from the DOM
    const disconnectObserver = new MutationObserver(() => {
      if (!placeholder.isConnected) {
        portalContent.remove();
        observer.disconnect();
        disconnectObserver.disconnect();
      }
    });
    disconnectObserver.observe(document.body, { childList: true, subtree: true });

    return placeholder;
  }

  // ── Custom Component Handling ──
  let customComp = null;
  if (tagName.startsWith('omni-component-')) {
    const originalName = node.getAttribute('omni-name');
    customComp = components.find(c => c.name === originalName);
  }

  if (customComp) {
    const wrapper = document.createElement('div');
    wrapper.className = `omni-component-${customComp.name.toLowerCase()}`;
    
    // Extract props
    const props = {};
    Array.from(node.attributes).forEach(attr => {
      if (attr.name === 'omni-name') return;
      let val = attr.value;
      if (val.includes('{') && val.includes('}')) {
        val = val.replace(/\{[?]?([a-zA-Z0-9_.]+)\}/g, (match, path) => {
          const parts = path.split('.');
          let v = context;
          for (const p of parts) {
            if (v && typeof v === 'object') {
              if (p in v) {
                v = v[p];
                if (v && typeof v === 'object' && 'value' in v && Object.keys(v).length <= 2) {
                  v = v.value;
                }
              } else {
                return match;
              }
            } else {
              return match;
            }
          }
          return v !== undefined ? v : match;
        });
      }
      
      if (attr.name.startsWith('on-')) {
        const eventName = attr.name.replace('on-', '');
        props[`on${eventName.charAt(0).toUpperCase() + eventName.slice(1)}`] = context[attr.value];
      } else {
        props[attr.name] = val;
      }
    });

    if (customComp.mount) {
      // Production mode - statically compiled component
      await customComp.mount(wrapper, props, context);
    } else {
      // Dev mode - fetch and dynamically compile/mount
      try {
        const res = await fetch(customComp.src, { cache: 'no-cache' });
        const source = await res.text();
        if (window.__omni_mount) {
          await window.__omni_mount(source, wrapper, props, context);
        }
      } catch(e) {
        console.error(`[OmniJS] Failed to load component <${customComp.name}>`, e);
      }
    }
    return wrapper;
  }

  let el;
  let newState = { ...state };

  // ── 1. Map Core Blocks to Semantic HTML ──
  const asAttr = node.getAttribute('as');

  if (tagName === 'stack') {
    newState.stackDepth++;
    if (asAttr) {
      el = document.createElement(asAttr);
    } else if (newState.stackDepth === 1) {
      el = document.createElement('main');
    } else if (newState.stackDepth === 2) {
      el = document.createElement('section');
    } else {
      el = document.createElement('div');
    }
  } 
  else if (tagName === 'text') {
    if (asAttr) {
      el = document.createElement(asAttr);
    } else if (state.collectionType === 'tr') {
      const type = node.getAttribute('type');
      el = document.createElement(type === 'th' ? 'th' : 'td');
    } else if (state.inCollection && (state.collectionType === 'ul' || state.collectionType === 'ol' || !state.collectionType)) {
      el = document.createElement('li');
    } else if (newState.textDepth <= 6) {
      el = document.createElement(`h${newState.textDepth}`);
      newState.textDepth++;
    } else {
      el = document.createElement('p');
    }
  }
  else if (tagName === 'action') {
    if (asAttr === 'link' || (!asAttr && node.hasAttribute('href'))) {
      el = document.createElement('a');
      if (node.hasAttribute('href')) el.href = node.getAttribute('href');
    } else if (asAttr === 'submit') {
      el = document.createElement('button');
      el.type = 'submit';
    } else if (node.hasAttribute('navigate-to')) {
      el = document.createElement('button');
      el.setAttribute('role', 'link');
    } else if (asAttr) {
      el = document.createElement(asAttr);
    } else {
      el = document.createElement('button');
    }
  }
  else if (tagName === 'collection') {
    if (asAttr) {
      el = document.createElement(asAttr);
    } else {
      const type = node.getAttribute('type') || 'ul';
      if (type === 'table') el = document.createElement('table');
      else if (type === 'thead') el = document.createElement('thead');
      else if (type === 'tbody') el = document.createElement('tbody');
      else if (type === 'tr') el = document.createElement('tr');
      else if (type === 'ol') el = document.createElement('ol');
      else el = document.createElement('ul');
      newState.collectionType = type;
    }
    newState.inCollection = true;
  }
  else if (tagName === 'media') {
    if (asAttr) {
      el = document.createElement(asAttr);
    } else {
      const src = node.getAttribute('src') || '';
      const type = node.getAttribute('type');
      if (type === 'video' || src.endsWith('.mp4') || src.endsWith('.webm')) {
        el = document.createElement('video');
      } else if (type === 'audio' || src.endsWith('.mp3') || src.endsWith('.wav')) {
        el = document.createElement('audio');
      } else if (type === 'iframe' || src.includes('youtube.com') || src.includes('vimeo.com')) {
        el = document.createElement('iframe');
      } else {
        el = document.createElement('img');
      }
    }
  }
  else if (tagName === 'form') {
    if (asAttr) {
      el = document.createElement(asAttr);
    } else {
      const isInputControl = node.hasAttribute('bind-value') || node.hasAttribute('placeholder') || node.hasAttribute('type');
      if (!newState.inForm && !isInputControl) {
        el = document.createElement('form');
        newState.inForm = true;
      } else {
        const type = node.getAttribute('type') || 'text';
        if (type === 'textarea') el = document.createElement('textarea');
        else if (type === 'select') el = document.createElement('select');
        else if (type === 'label') el = document.createElement('label');
        else {
          el = document.createElement('input');
          el.type = type;
        }
      }
    }
  }
  else {
    el = document.createElement(node.tagName);
  }

  // ── 2. Extract Route Path ──
  let routePath = null;
  if (node.hasAttribute('route')) {
    routePath = node.getAttribute('route');
  }

  // ── 3. Process All Attributes ──
  Array.from(node.attributes).forEach(attr => {
    const name = attr.name;
    const value = attr.value;

    // Route — handled in step 5
    if (name === 'route') return;
    if (name === 'as') return;

    // Navigate
    if (name === 'navigate-to') {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        navigate(value);
      });
      return;
    }

    // Bind
    if (name.startsWith('bind-')) {
      const prop = name.replace('bind-', '');
      const path = value.replace('?', '');
      const parts = path.split('.');
      const rootSignalName = parts[0];
      
      if (context[rootSignalName]) {
        effect(() => {
          let val = context[rootSignalName];
          if (val && typeof val === 'object' && val.__isSignal === true) {
            val = val.value;
          }
          for (let i = 1; i < parts.length; i++) {
            if (val && typeof val === 'object') {
              val = val[parts[i]];
              if (val && typeof val === 'object' && val.__isSignal === true) {
                val = val.value;
              }
            } else {
              val = undefined;
            }
          }
          
          if (prop === 'text') el.textContent = val !== undefined && val !== null ? val : '';
          else if (prop === 'value') {
            if (el.value !== val) {
              el.value = val;
            }
          }
          else if (prop === 'show') {
            el.style.display = val ? '' : 'none';
          }
          else if (prop === 'hide') {
            el.style.display = val ? 'none' : '';
          }
          else el.setAttribute(prop, val);
        });

        // Two-way binding for inputs
        if (prop === 'value') {
          el.addEventListener('input', (e) => {
            if (parts.length === 1) {
              context[rootSignalName].value = e.target.value;
            } else {
              let val = context[rootSignalName].value;
              for (let i = 1; i < parts.length - 1; i++) {
                val = val[parts[i]];
              }
              val[parts[parts.length - 1]] = e.target.value;
            }
          });
        }
      }
      return;
    }

    // Event
    if (name.startsWith('on-')) {
      const eventName = name.replace('on-', '');
      if (context[value]) {
        el.addEventListener(eventName, context[value]);
      }
      return;
    }



    // Legacy if:: — skip
    if (name === 'if-condition') return;

    // Pass-through standard attributes (class, style, id, aria-*, data-*, etc.)
    el.setAttribute(name, value);
  });

  // ── 4. Process Children ──
  if (tagName === 'collection' && node.hasAttribute('data') && node.hasAttribute('as')) {
    const signalName = node.getAttribute('data').replace('?', '');
    const asName = node.getAttribute('as');

    if (context[signalName]) {
      const templateChildren = Array.from(node.childNodes);
      
      effect(() => {
        // Simple list re-render
        el.innerHTML = '';
        const array = context[signalName].value || [];
        
        array.forEach(async (item) => {
          const childContext = { ...context, [asName]: item };
          for (const child of templateChildren) {
            const childClone = child.cloneNode(true);
            const childEl = await walkAndTransform(childClone, childContext, newState, components);
            if (childEl) el.appendChild(childEl);
          }
        });
      });
    }
  } else {
    for (const child of Array.from(node.childNodes)) {
      const childEl = await walkAndTransform(child, context, newState, components);
      if (childEl) el.appendChild(childEl);
    }
  }

  // ── 5. Route Lifecycle (mount/unmount based on URL hash) ──
  if (routePath !== null) {
    const routerSignal = getRouterSignal();
    el.style.display = 'none';
    
    effect(() => {
      const current = routerSignal.value;
      const isMatch = (routePath === current) || 
                      (routePath === '/' && (current === '/' || current === ''));
      el.style.display = isMatch ? '' : 'none';
    });
  }

  return el;
}
