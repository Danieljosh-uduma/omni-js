// Simple Proxy/Signal based reactivity system

let currentSubscriber = null;

export function createSignal(initialValue) {
  const subscribers = new Set();

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
    get value() {
      if (currentSubscriber) {
        subscribers.add(currentSubscriber);
      }
      return rawValue;
    },
    set value(newValue) {
      if (rawValue !== newValue) {
        rawValue = makeReactive(newValue);
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
