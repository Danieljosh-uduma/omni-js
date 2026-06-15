import { createSignal } from './reactivity.js';

export function useForm({ initialValues = {}, validate = () => ({}) }) {
  // Initialize errors with empty strings for each key in initialValues
  const initialErrors = {};
  Object.keys(initialValues).forEach(key => {
    initialErrors[key] = '';
  });

  const values = createSignal({ ...initialValues });
  const errors = createSignal(initialErrors);
  const submitting = createSignal(false);

  function reset() {
    values.value = { ...initialValues };
    errors.value = { ...initialErrors };
    submitting.value = false;
  }

  function handleSubmit(onSubmit) {
    return async function(e) {
      if (e && typeof e.preventDefault === 'function') {
        e.preventDefault();
      }

      const rawValues = values.value;
      const validationErrors = validate(rawValues) || {};
      
      // Merge with initial empty errors to ensure keys are present and clean
      const finalErrors = { ...initialErrors };
      Object.keys(validationErrors).forEach(key => {
        finalErrors[key] = validationErrors[key] || '';
      });
      errors.value = finalErrors;

      const hasErrors = Object.keys(validationErrors).some(key => validationErrors[key]);
      if (!hasErrors) {
        submitting.value = true;
        try {
          await onSubmit(rawValues);
        } catch (err) {
          console.error('[OmniJS Form] Submission failed:', err);
        } finally {
          submitting.value = false;
        }
      }
    };
  }

  return {
    values,
    errors,
    submitting,
    handleSubmit,
    reset
  };
}
