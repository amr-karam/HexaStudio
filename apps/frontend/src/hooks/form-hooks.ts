'use client';

import { useState, useCallback, useRef } from 'react';

/* ------------------------------------------------------------------ */
/* Types                                                              */
/* ------------------------------------------------------------------ */

interface ValidationRule<T> {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  custom?: (value: T) => boolean | string;
}

interface FieldConfig<T> {
  initialValue: T;
  validation?: ValidationRule<T>;
}

interface FieldState<T> {
  value: T;
  error: string | null;
  touched: boolean;
  dirty: boolean;
}

interface FieldResult<T> {
  value: T;
  error: string | null;
  touched: boolean;
  dirty: boolean;
  onChange: (value: T) => void;
  onBlur: () => void;
  reset: () => void;
  isValid: boolean;
}

interface FormState<T extends Record<string, any>> {
  values: T;
  errors: Partial<Record<keyof T, string | null>>;
  touched: Partial<Record<keyof T, boolean>>;
  dirty: Partial<Record<keyof T, boolean>>;
  isSubmitting: boolean;
  isValid: boolean;
  isDirty: boolean;
}

interface FormActions<T extends Record<string, any>> {
  handleChange: <K extends keyof T>(name: K, value: T[K]) => void;
  handleBlur: <K extends keyof T>(name: K) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  resetForm: () => void;
  setField: <K extends keyof T>(name: K, value: T[K]) => void;
  setErrors: (errors: Partial<Record<keyof T, string | null>>) => void;
}

/* ------------------------------------------------------------------ */
/* useField — single field state with validation                      */
/* ------------------------------------------------------------------ */

/**
 * Manages a single form field with validation, error tracking, and
 * dirty/touched state. Returns a stable API for binding to inputs.
 *
 * @param initialValue - Initial value of the field
 * @param validation - Optional validation rules
 * @returns Field state and change handlers
 */
export function useField<T>(
  initialValue: T,
  validation?: ValidationRule<T>
): FieldResult<T> {
  const [state, setState] = useState<FieldState<T>>({
    value: initialValue,
    error: null,
    touched: false,
    dirty: false,
  });

  // Validate function with stable reference
  const validate = useCallback(
    (value: T): string | null => {
      if (!validation) return null;

      if (validation.required && (value === '' || value === null || value === undefined)) {
        return 'This field is required';
      }

      if (typeof value === 'string') {
        if (validation.minLength !== undefined && value.length < validation.minLength) {
          return `Minimum length is ${validation.minLength}`;
        }
        if (validation.maxLength !== undefined && value.length > validation.maxLength) {
          return `Maximum length is ${validation.maxLength}`;
        }
        if (validation.pattern && !validation.pattern.test(value)) {
          return 'Invalid format';
        }
      }

      if (typeof value === 'number') {
        if (validation.min !== undefined && value < validation.min) {
          return `Minimum value is ${validation.min}`;
        }
        if (validation.max !== undefined && value > validation.max) {
          return `Maximum value is ${validation.max}`;
        }
      }

      if (validation.custom) {
        const result = validation.custom(value);
        if (typeof result === 'string') return result;
        if (result === false) return 'Invalid value';
      }

      return null;
    },
    [validation]
  );

  const handleChange = useCallback(
    (newValue: T) => {
      setState(prev => ({
        ...prev,
        value: newValue,
        dirty: true,
        error: validate(newValue),
      }));
    },
    [validate]
  );

  const handleBlur = useCallback(() => {
    setState(prev => ({ ...prev, touched: true }));
  }, []);

  const reset = useCallback(() => {
    setState({
      value: initialValue,
      error: null,
      touched: false,
      dirty: false,
    });
  }, [initialValue]);

  return {
    value: state.value,
    error: state.error,
    touched: state.touched,
    dirty: state.dirty,
    onChange: handleChange,
    onBlur: handleBlur,
    reset,
    isValid: state.error === null,
  };
}

/* ------------------------------------------------------------------ */
/* useForm — multi-field form manager                                 */
/* ------------------------------------------------------------------ */

/**
 * Manages multiple form fields with validation, submission handling,
 * and state tracking. Provides a complete form API.
 *
 * @param fieldConfigs - Map of field names to configuration objects
 * @param onSubmit - Async callback invoked on valid submission
 * @returns Form state, actions, and derived values
 */
export function useForm<T extends Record<string, any>>(
  fieldConfigs: Record<string, FieldConfig<any>>,
  onSubmit: (values: T) => Promise<void> = async () => {}
): FormState<T> & FormActions<T> {
  const [values, setValues] = useState<T>(() => {
    const initial: Record<string, any> = {};
    for (const [key, config] of Object.entries(fieldConfigs)) {
      initial[key] = config.initialValue;
    }
    return initial as T;
  });

  const [errors, setErrors] = useState<Partial<Record<keyof T, string | null>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
  const [dirty, setDirty] = useState<Partial<Record<keyof T, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Keep latest configs in a ref to avoid re-running effects
  const configsRef = useRef(fieldConfigs);
  configsRef.current = fieldConfigs;

  // Validate a single field
  const validateField = useCallback(
    <K extends keyof T>(name: K, value: T[K]): string | null => {
      const config = configsRef.current[name as string];
      if (!config?.validation) return null;

      const rules = config.validation;

      if (rules.required && (value === '' || value === null || value === undefined)) {
        return 'This field is required';
      }

      if (typeof value === 'string') {
        if (rules.minLength !== undefined && value.length < rules.minLength) {
          return `Minimum length is ${rules.minLength}`;
        }
        if (rules.maxLength !== undefined && value.length > rules.maxLength) {
          return `Maximum length is ${rules.maxLength}`;
        }
        if (rules.pattern && !rules.pattern.test(value)) {
          return 'Invalid format';
        }
      }

      if (typeof value === 'number') {
        if (rules.min !== undefined && value < rules.min) {
          return `Minimum value is ${rules.min}`;
        }
        if (rules.max !== undefined && value > rules.max) {
          return `Maximum value is ${rules.max}`;
        }
      }

      if (rules.custom) {
        const result = rules.custom(value);
        if (typeof result === 'string') return result;
        if (result === false) return 'Invalid value';
      }

      return null;
    },
    []
  );

  // Validate all fields
  const validateAll = useCallback((): Partial<Record<keyof T, string | null>> => {
    const newErrors: Partial<Record<keyof T, string | null>> = {};
    let hasError = false;

    for (const [key, config] of Object.entries(configsRef.current)) {
      const error = validateField(key as keyof T, values[key as keyof T]);
      if (error) {
        newErrors[key as keyof T] = error;
        hasError = true;
      }
    }

    return newErrors;
  }, [values, validateField]);

  // Handle field value changes
  const handleChange = useCallback(
    <K extends keyof T>(name: K, value: T[K]) => {
      setValues(prev => ({ ...prev, [name]: value }));
      setDirty(prev => ({ ...prev, [name]: true }));
      setErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
    },
    [validateField]
  );

  // Handle field blur
  const handleBlur = useCallback(<K extends keyof T>(name: K) => {
    setTouched(prev => ({ ...prev, [name]: true }));
  }, []);

  // Set field value programmatically
  const setField = useCallback(
    <K extends keyof T>(name: K, value: T[K]) => {
      setValues(prev => ({ ...prev, [name]: value }));
      setErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
    },
    [validateField]
  );

  // Set errors programmatically
  const setErrorsCallback = useCallback(
    (newErrors: Partial<Record<keyof T, string | null>>) => {
      setErrors(newErrors);
    },
    []
  );

  // Reset form to initial values
  const resetForm = useCallback(() => {
    const initial: Record<string, any> = {};
    for (const [key, config] of Object.entries(configsRef.current)) {
      initial[key] = config.initialValue;
    }
    setValues(initial as T);
    setErrors({});
    setTouched({});
    setDirty({});
  }, []);

  // Handle form submission
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (isSubmitting) return;

      // Mark all fields as touched
      const allTouched: Partial<Record<keyof T, boolean>> = {};
      for (const key of Object.keys(values)) {
        allTouched[key as keyof T] = true;
      }
      setTouched(allTouched);

      // Validate all fields
      const newErrors = validateAll();
      setErrors(newErrors);

      // Check if any errors
      const hasErrors = Object.values(newErrors).some(error => error !== null);
      if (hasErrors) return;

      setIsSubmitting(true);
      try {
        await onSubmit(values as T);
      } catch (error) {
        console.error('Form submission failed:', error);
      } finally {
        setIsSubmitting(false);
      }
    },
    [isSubmitting, values, onSubmit, validateAll]
  );

  // Derived values
  const isValid = Object.values(errors).every(error => error === null);
  const isDirty = Object.values(dirty).some(d => d === true);

  return {
    values,
    errors,
    touched,
    dirty,
    isSubmitting,
    isValid,
    isDirty,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
    setField,
    setErrors: setErrorsCallback,
  };
}