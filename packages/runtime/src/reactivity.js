// Simple Proxy/Signal based reactivity system
import { handleOmniError } from './error.js';

let currentSubscriber = null;
let globalSignalId = 0;

// Central global state object
const globalOmniStateTarget = {};
const globalStateSubscribers = new Map(); // propName -> Set of execute callbacks

function makeGlobalReactive(obj, propName) {
  if (obj && typeof obj === 'object') {
    return new Proxy(obj, {
      get(target, prop, receiver) {
        if (currentSubscriber) {
          if (!globalStateSubscribers.has(propName)) {
            globalStateSubscribers.set(propName, new Set());
          }
          globalStateSubscribers.get(propName).add(currentSubscriber);
        }
        const val = Reflect.get(target, prop, receiver);
        if (val && typeof val === 'object') {
          return makeGlobalReactive(val, propName);
        }
        return val;
      },
      set(target, prop, value, receiver) {
        const oldVal = Reflect.get(target, prop, receiver);
        if (oldVal !== value) {
          Reflect.set(target, prop, value, receiver);
          if (globalStateSubscribers.has(propName)) {
            globalStateSubscribers.get(propName).forEach((sub) => sub());
          }
          if (typeof window !== 'undefined' && window.__OMNI_DEVTOOLS__) {
            window.__OMNI_DEVTOOLS__.logMutation(0, `state.${propName}.${String(prop)}`, oldVal, value);
          }
        }
        return true;
      },
    });
  }
  return obj;
}

const globalOmniStateProxy = new Proxy(globalOmniStateTarget, {
  get(target, prop, receiver) {
    if (currentSubscriber) {
      if (!globalStateSubscribers.has(prop)) {
        globalStateSubscribers.set(prop, new Set());
      }
      globalStateSubscribers.get(prop).add(currentSubscriber);
    }
    const val = Reflect.get(target, prop, receiver);
    if (val && typeof val === 'object') {
      return makeGlobalReactive(val, String(prop));
    }
    return val;
  },
  set(target, prop, value, receiver) {
    const oldVal = Reflect.get(target, prop, receiver);
    if (oldVal !== value) {
      Reflect.set(target, prop, value, receiver);
      if (globalStateSubscribers.has(prop)) {
        globalStateSubscribers.get(prop).forEach((sub) => sub());
      }
      if (typeof window !== 'undefined' && window.__OMNI_DEVTOOLS__) {
        window.__OMNI_DEVTOOLS__.logMutation(0, `state.${String(prop)}`, oldVal, value);
      }
    }
    return true;
  },
});

if (typeof window !== 'undefined') {
  window.globalOmniState = globalOmniStateProxy;
} else {
  globalThis.globalOmniState = globalOmniStateProxy;
}

// Expose DevTools hook globally
const DevToolsExplorer = {
  signals: new Map(), // Map of signalId -> { name, value }
  listeners: new Set(),
  history: [], // Array of mutations

  registerSignal(id, name, value) {
    this.signals.set(id, { name, value });
    this.broadcast('register', { id, name, value });
  },

  logMutation(id, name, oldValue, newValue) {
    if (this.signals.has(id)) {
      this.signals.get(id).value = newValue;
    }
    const payload = { id, name, oldValue, newValue, timestamp: Date.now() };
    this.history.push(payload);
    this.broadcast('mutation', payload);
  },

  onEvent(handler) {
    this.listeners.add(handler);
    return () => this.listeners.delete(handler);
  },

  broadcast(type, payload) {
    this.listeners.forEach((cb) => cb({ type, payload }));
  },
};

if (typeof window !== 'undefined') {
  window.__OMNI_DEVTOOLS__ = DevToolsExplorer;
}

export function createSignal(initialValue, debugName = '') {
  const signalId = ++globalSignalId;
  const subscribers = new Set();
  const resolvedName = debugName || `signal_${signalId}`;

  // If a debugName is provided, this represents a declared state variable.
  // Store its value in the central global state object and return a delegate signal.
  if (debugName) {
    const globalState = typeof window !== 'undefined' ? window.globalOmniState : globalThis.globalOmniState;
    if (globalState) {
      if (!(debugName in globalState)) {
        globalState[debugName] = initialValue;
      }

      if (typeof window !== 'undefined' && window.__OMNI_DEVTOOLS__) {
        window.__OMNI_DEVTOOLS__.registerSignal(signalId, resolvedName, initialValue);
      }

      return {
        __isSignal: true,
        get value() {
          return globalState[debugName];
        },
        set value(newValue) {
          globalState[debugName] = newValue;
        },
      };
    }
  }

  if (typeof window !== 'undefined' && window.__OMNI_DEVTOOLS__) {
    window.__OMNI_DEVTOOLS__.registerSignal(signalId, resolvedName, initialValue);
  }

  function makeReactive(obj) {
    if (obj && typeof obj === 'object') {
      return new Proxy(obj, {
        get(target, prop, receiver) {
          if (currentSubscriber) {
            subscribers.add(currentSubscriber);
          }
          const val = Reflect.get(target, prop, receiver);
          if (val && typeof val === 'object') {
            return makeReactive(val);
          }
          return val;
        },
        set(target, prop, value, receiver) {
          const oldVal = Reflect.get(target, prop, receiver);
          if (oldVal !== value) {
            Reflect.set(target, prop, value, receiver);
            if (typeof window !== 'undefined' && window.__OMNI_DEVTOOLS__) {
              window.__OMNI_DEVTOOLS__.logMutation(signalId, resolvedName, oldVal, value);
            }
            subscribers.forEach((sub) => sub());
          }
          return true;
        },
      });
    }
    return obj;
  }

  let rawValue = makeReactive(initialValue);

  return {
    __isSignal: true,
    get value() {
      if (currentSubscriber) {
        subscribers.add(currentSubscriber);
      }
      return rawValue;
    },
    set value(newValue) {
      if (rawValue !== newValue) {
        const oldValue = rawValue;
        rawValue = makeReactive(newValue);
        if (typeof window !== 'undefined' && window.__OMNI_DEVTOOLS__) {
          window.__OMNI_DEVTOOLS__.logMutation(signalId, resolvedName, oldValue, newValue);
        }
        subscribers.forEach((sub) => sub());
      }
    },
  };
}

export function effect(fn) {
  const execute = () => {
    currentSubscriber = execute;
    try {
      fn();
    } catch (e) {
      handleOmniError('Error occurred in reactivity effect.', e);
    } finally {
      currentSubscriber = null;
    }
  };
  execute();
}

export function createStore(initialState = {}, storeName = 'store') {
  if (storeName && typeof window !== 'undefined' && window.globalOmniStores && window.globalOmniStores[storeName]) {
    return window.globalOmniStores[storeName];
  }

  const subscribers = new Set();
  const storeId = ++globalSignalId;

  if (typeof window !== 'undefined' && window.__OMNI_DEVTOOLS__) {
    window.__OMNI_DEVTOOLS__.registerSignal(storeId, storeName, initialState);
  }

  function makeStoreReactive(obj, path = '') {
    if (obj && typeof obj === 'object') {
      return new Proxy(obj, {
        get(target, prop, receiver) {
          if (currentSubscriber) {
            subscribers.add(currentSubscriber);
          }
          const val = Reflect.get(target, prop, receiver);
          if (val && typeof val === 'object') {
            return makeStoreReactive(val, path ? `${path}.${String(prop)}` : String(prop));
          }
          return val;
        },
        set(target, prop, value, receiver) {
          const oldVal = Reflect.get(target, prop, receiver);
          if (oldVal !== value) {
            const newVal = makeStoreReactive(value, path ? `${path}.${String(prop)}` : String(prop));
            Reflect.set(target, prop, newVal, receiver);
            if (typeof window !== 'undefined' && window.__OMNI_DEVTOOLS__) {
              const fullPath = path ? `${storeName}.${path}.${String(prop)}` : `${storeName}.${String(prop)}`;
              window.__OMNI_DEVTOOLS__.logMutation(storeId, fullPath, oldVal, value);
            }
            subscribers.forEach((sub) => sub());
          }
          return true;
        },
      });
    }
    return obj;
  }

  const store = makeStoreReactive(initialState);
  if (storeName && typeof window !== 'undefined') {
    window.globalOmniStores = window.globalOmniStores || {};
    window.globalOmniStores[storeName] = store;
  }
  return store;
}
