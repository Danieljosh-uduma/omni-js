// OmniJS Router - Fully abstracted, History API based routing engine

import { createSignal } from './reactivity.js';

let routerInitialized = false;
let currentPath = null;
const guards = [];

export function beforeEach(guard) {
  guards.push(guard);
}

async function runGuards(to, from) {
  let index = 0;

  return new Promise((resolve) => {
    function next(action) {
      if (action === false) {
        resolve({ status: 'cancel' });
      } else if (typeof action === 'string') {
        resolve({ status: 'redirect', path: action });
      } else if (action === true || action === undefined) {
        index++;
        if (index < guards.length) {
          try {
            guards[index](to, from, next);
          } catch (err) {
            console.error('[OmniJS Router] Guard error:', err);
            resolve({ status: 'cancel' });
          }
        } else {
          resolve({ status: 'ok' });
        }
      }
    }

    if (guards.length === 0) {
      resolve({ status: 'ok' });
    } else {
      try {
        guards[0](to, from, next);
      } catch (err) {
        console.error('[OmniJS Router] Guard error:', err);
        resolve({ status: 'cancel' });
      }
    }
  });
}

const getPath = () => window.location.pathname || '/';

export function initRouter() {
  if (routerInitialized) return currentPath;
  
  // Create a reactive signal bound to the current URL pathname
  currentPath = createSignal(getPath());

  // Sync browser back/forward with the reactive signal
  window.addEventListener('popstate', async () => {
    const from = currentPath.value;
    const to = getPath();

    if (to === from) return;

    const result = await runGuards(to, from);

    if (result.status === 'ok') {
      currentPath.value = to;
      window.scrollTo({ top: 0, behavior: 'instant' });
    } else if (result.status === 'redirect') {
      window.history.pushState(null, '', result.path);
      currentPath.value = result.path;
      window.scrollTo({ top: 0, behavior: 'instant' });
    } else {
      // Revert history URL back to `from`
      window.history.pushState(null, '', from);
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  });

  routerInitialized = true;
  return currentPath;
}

export async function navigate(path) {
  if (!currentPath) initRouter();
  
  const from = currentPath.value;
  const to = path;

  if (to === from) return;

  const result = await runGuards(to, from);

  if (result.status === 'ok') {
    window.history.pushState(null, '', to);
    currentPath.value = to;
    window.scrollTo({ top: 0, behavior: 'instant' });
  } else if (result.status === 'redirect') {
    navigate(result.path);
  } else {
    // Cancelled — do nothing
  }
}

export function getRouterSignal() {
  if (!currentPath) initRouter();
  return currentPath;
}

