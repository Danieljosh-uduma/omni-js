import { createSignal, effect } from './reactivity.js';

/**
 * Creates an asynchronous data fetching resource.
 * @param {Function} fetcher Async data fetching function.
 * @param {Function|Object} [source] Optional signal or getter function that triggers a refetch when mutated.
 */
export function createResource(fetcher, source) {
  const value = createSignal(undefined);
  const loading = createSignal(false);
  const error = createSignal(null);

  async function execute(sourceVal) {
    loading.value = true;
    error.value = null;
    try {
      const data = await fetcher(sourceVal);
      value.value = data;
    } catch (err) {
      error.value = err instanceof Error ? err : new Error(String(err));
    } finally {
      loading.value = false;
    }
  }

  if (source) {
    effect(() => {
      // Evaluate source: call if function, read value if signal, or use as is
      const sourceVal =
        typeof source === 'function' ? source() : source && source.value !== undefined ? source.value : source;
      execute(sourceVal);
    });
  } else {
    execute(undefined);
  }

  return {
    get value() {
      return value.value;
    },
    get loading() {
      return loading.value;
    },
    get error() {
      return error.value;
    },
    $value: value,
    $loading: loading,
    $error: error,
  };
}
