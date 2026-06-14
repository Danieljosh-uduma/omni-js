import { effect } from './reactivity.js';
import { navigate, getRouterSignal } from './router.js';

// Pre-process template source to convert OmniJS attribute syntax
// into valid HTML data-* attributes before DOMParser touches it.
// This prevents the browser from stripping colons in attribute names.
function preprocessTemplate(templateSource) {
  let src = templateSource;
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
  const preprocessed = preprocessTemplate(ast.templateSource);
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
  
  // ── Custom Component Handling ──
  const customComp = components.find(c => c.name.toLowerCase() === tagName);
  if (customComp) {
    const wrapper = document.createElement('div');
    wrapper.className = `omni-component-${tagName}`;
    
    // Extract props
    const props = {};
    Array.from(node.attributes).forEach(attr => {
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

    try {
      const res = await fetch(customComp.src);
      const source = await res.text();
      if (window.__omni_mount) {
        await window.__omni_mount(source, wrapper, props);
      }
    } catch(e) {
      console.error(`[OmniJS] Failed to load component <${customComp.name}>`, e);
    }
    return wrapper;
  }

  let el;
  let newState = { ...state };

  // ── 1. Map Core Blocks to Semantic HTML ──
  if (tagName === 'stack') {
    newState.stackDepth++;
    if (newState.stackDepth === 1) el = document.createElement('main');
    else if (newState.stackDepth === 2) el = document.createElement('section');
    else el = document.createElement('div');
  } 
  else if (tagName === 'text') {
    if (state.collectionType === 'tr') {
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
    const asAttr = node.getAttribute('as');
    if (asAttr === 'link' || (!asAttr && node.hasAttribute('href'))) {
      el = document.createElement('a');
      if (node.hasAttribute('href')) el.href = node.getAttribute('href');
    } else if (asAttr === 'submit') {
      el = document.createElement('button');
      el.type = 'submit';
    } else if (node.hasAttribute('navigate-to')) {
      el = document.createElement('button');
      el.setAttribute('role', 'link');
    } else {
      el = document.createElement('button');
    }
  }
  else if (tagName === 'collection') {
    const type = node.getAttribute('type') || 'ul';
    if (type === 'table') el = document.createElement('table');
    else if (type === 'thead') el = document.createElement('thead');
    else if (type === 'tbody') el = document.createElement('tbody');
    else if (type === 'tr') el = document.createElement('tr');
    else if (type === 'ol') el = document.createElement('ol');
    else el = document.createElement('ul');
    
    newState.inCollection = true;
    newState.collectionType = type;
  }
  else if (tagName === 'media') {
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
  else if (tagName === 'form') {
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
          let val = context[rootSignalName].value;
          for (let i = 1; i < parts.length; i++) {
            if (val && typeof val === 'object') {
              val = val[parts[i]];
            }
          }
          
          if (prop === 'text') el.textContent = val;
          else if (prop === 'value') {
            if (el.value !== val) {
              el.value = val;
            }
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

    // Animation
    if (name.startsWith('animate-')) {
      const trigger = name.replace('animate-', '');
      if (trigger === 'load' && typeof gsap !== 'undefined') {
        if (value.startsWith('from:')) {
          try {
            const configStr = value.replace('from:', '').trim();
            const config = (new Function(`return ${configStr}`))();
            gsap.from(el, config);
          } catch(e) { /* silently skip */ }
        }
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
