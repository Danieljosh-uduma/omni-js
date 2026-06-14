// OmniJS Router - Fully abstracted, History API based routing engine

import { createSignal, effect } from './reactivity.js';

let routerInitialized = false;
let currentPath = null;
const routeElements = new Map(); // path -> { el, placeholder }

export function initRouter() {
  if (routerInitialized) return currentPath;
  
  // Create a reactive signal bound to the current URL path
  // Use hash-based routing for static file servers (no server-side rewrite needed)
  const getPath = () => window.location.hash.slice(1) || '/';
  currentPath = createSignal(getPath());

  // Sync browser back/forward with the reactive signal
  window.addEventListener('hashchange', () => {
    currentPath.value = getPath();
    window.scrollTo({ top: 0, behavior: 'instant' });
  });

  routerInitialized = true;
  return currentPath;
}

export function navigate(path) {
  if (!currentPath) initRouter();
  window.location.hash = path;
  window.scrollTo({ top: 0, behavior: 'instant' });
}

export function getRouterSignal() {
  if (!currentPath) initRouter();
  return currentPath;
}
