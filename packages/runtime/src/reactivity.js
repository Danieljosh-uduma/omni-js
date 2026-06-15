// Simple Proxy/Signal based reactivity system

let currentSubscriber = null;
let globalSignalId = 0;

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
    this.listeners.forEach(cb => cb({ type, payload }));
  }
};

if (typeof window !== 'undefined') {
  window.__OMNI_DEVTOOLS__ = DevToolsExplorer;
}

export function createSignal(initialValue, debugName = '') {
  const signalId = ++globalSignalId;
  const subscribers = new Set();
  const resolvedName = debugName || `signal_${signalId}`;

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
            subscribers.forEach(sub => sub());
          }
          return true;
        }
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
        subscribers.forEach(sub => sub());
      }
    }
  };
}

export function effect(fn) {
  const execute = () => {
    currentSubscriber = execute;
    try {
      fn();
    } finally {
      currentSubscriber = null;
    }
  };
  execute();
}
