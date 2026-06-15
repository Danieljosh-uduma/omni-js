import { createSignal, effect } from './reactivity.js';

/**
 * Creates an asynchronous data fetching resource.
 * @param {Function} fetcher Async data fetching function.
 * @param {Function|Object} [source] Optional signal or getter function that triggers a refetch when mutated.
 */
export function createResource(fetcher, source) {
  const [value, setValue] = createSignal(undefined);
  const [loading, setLoading] = createSignal(false);
  const [error, setError] = createSignal(null);

  async function execute(sourceVal) {
    setLoading(true);
    setError(null);
    try {
      const data = await fetcher(sourceVal);
      setValue(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }

  if (source) {
    effect(() => {
      // Evaluate source: call if function, read value if signal, or use as is
      const sourceVal = (typeof source === 'function')
        ? source()
        : (source && source.value !== undefined ? source.value : source);
      execute(sourceVal);
    });
  } else {
    execute(undefined);
  }

  return {
    get value() { return value.value; },
    get loading() { return loading.value; },
    get error() { return error.value; },
    $value: value,
    $loading: loading,
    $error: error
  };
}
