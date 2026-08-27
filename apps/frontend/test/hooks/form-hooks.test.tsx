import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useField, useForm } from '@/hooks/form-hooks';

// ------------------------------------------------------------------
// useField
// ------------------------------------------------------------------
describe('useField', () => {
  it('initializes with provided value and isValid=true', () => {
    const { result } = renderHook(() => useField('hello'));
    expect(result.current.value).toBe('hello');
    expect(result.current.error).toBeNull();
    expect(result.current.isValid).toBe(true);
    expect(result.current.touched).toBe(false);
    expect(result.current.dirty).toBe(false);
  });

  it('marks dirty and validates on change – required rule', () => {
    const { result } = renderHook(() => useField('', { required: true }));
    // initial value '' → not validated until onChange, so initially valid
    // but after explicit empty change, error appears
    act(() => result.current.onChange(''));
    expect(result.current.error).toBe('This field is required');
    expect(result.current.isValid).toBe(false);
    expect(result.current.dirty).toBe(true);

    act(() => result.current.onChange('ok'));
    expect(result.current.error).toBeNull();
    expect(result.current.isValid).toBe(true);
  });

  it('validates minLength / maxLength', () => {
    const { result } = renderHook(() => useField('ab', { minLength: 3 }));
    act(() => result.current.onChange('ab'));
    expect(result.current.error).toMatch(/Minimum length is 3/);

    act(() => result.current.onChange('abcd'));
    expect(result.current.error).toBeNull();
  });

  it('validates maxLength', () => {
    const { result } = renderHook(() => useField('toolong', { maxLength: 4 }));
    act(() => result.current.onChange('toolong'));
    expect(result.current.error).toMatch(/Maximum length is 4/);

    act(() => result.current.onChange('ok'));
    expect(result.current.error).toBeNull();
  });

  it('validates pattern', () => {
    const { result } = renderHook(() => useField('abc', { pattern: /^[0-9]+$/ }));
    act(() => result.current.onChange('abc'));
    expect(result.current.error).toBe('Invalid format');

    act(() => result.current.onChange('123'));
    expect(result.current.error).toBeNull();
  });

  it('validates number min/max', () => {
    const { result } = renderHook(() => useField(5, { min: 10, max: 20 }));
    act(() => result.current.onChange(5));
    expect(result.current.error).toMatch(/Minimum value is 10/);

    act(() => result.current.onChange(15));
    expect(result.current.error).toBeNull();

    act(() => result.current.onChange(25));
    expect(result.current.error).toMatch(/Maximum value is 20/);
  });

  it('supports custom validator returning string', () => {
    const { result } = renderHook(() =>
      useField('bad', { custom: (v) => (v === 'good' ? true : 'must be good') }),
    );
    act(() => result.current.onChange('bad'));
    expect(result.current.error).toBe('must be good');

    act(() => result.current.onChange('good'));
    expect(result.current.error).toBeNull();
  });

  it('supports custom validator returning boolean', () => {
    const { result } = renderHook(() =>
      useField('x', { custom: (v) => v.length > 2 }),
    );
    act(() => result.current.onChange('x'));
    expect(result.current.error).toBe('Invalid value');

    act(() => result.current.onChange('xyz'));
    expect(result.current.error).toBeNull();
  });

  it('toggles touched on blur', () => {
    const { result } = renderHook(() => useField('val'));
    expect(result.current.touched).toBe(false);
    act(() => result.current.onBlur());
    expect(result.current.touched).toBe(true);
  });

  it('resets to initial value and clears state', () => {
    const { result } = renderHook(() => useField('init', { required: true }));
    act(() => result.current.onChange(''));
    act(() => result.current.onBlur());
    expect(result.current.dirty).toBe(true);
    expect(result.current.touched).toBe(true);

    act(() => result.current.reset());
    expect(result.current.value).toBe('init');
    expect(result.current.error).toBeNull();
    expect(result.current.touched).toBe(false);
    expect(result.current.dirty).toBe(false);
  });
});

// ------------------------------------------------------------------
// useForm
// ------------------------------------------------------------------
describe('useForm', () => {
  const fields = {
    name: { initialValue: '', validation: { required: true } },
    age: { initialValue: 20, validation: { min: 18 } },
    bio: { initialValue: 'hi', validation: { maxLength: 5 } },
  } as const;

  it('initializes values from fieldConfigs', () => {
    const { result } = renderHook(() => useForm(fields));
    expect(result.current.values).toEqual({ name: '', age: 20, bio: 'hi' });
    expect(result.current.isSubmitting).toBe(false);
    expect(result.current.isDirty).toBe(false);
  });

  it('handleChange updates value, dirty, and validates', () => {
    const { result } = renderHook(() => useForm(fields));
    act(() => result.current.handleChange('name', 'Alice'));
    expect(result.current.values.name).toBe('Alice');
    expect(result.current.dirty.name).toBe(true);
    expect(result.current.isDirty).toBe(true);
    expect(result.current.errors.name).toBeNull();

    act(() => result.current.handleChange('name', ''));
    expect(result.current.errors.name).toBe('This field is required');
  });

  it('handleBlur marks field as touched', () => {
    const { result } = renderHook(() => useForm(fields));
    act(() => result.current.handleBlur('name'));
    expect(result.current.touched.name).toBe(true);
  });

  it('setField updates value programmatically', () => {
    const { result } = renderHook(() => useForm(fields));
    act(() => result.current.setField('age', 10));
    expect(result.current.values.age).toBe(10);
    expect(result.current.errors.age).toMatch(/Minimum value is 18/);

    act(() => result.current.setField('age', 25));
    expect(result.current.errors.age).toBeNull();
  });

  it('resetForm restores initial values and clears errors/touched/dirty', () => {
    const { result } = renderHook(() => useForm(fields));
    act(() => result.current.handleChange('name', 'Bob'));
    act(() => result.current.handleBlur('name'));
    expect(result.current.isDirty).toBe(true);

    act(() => result.current.resetForm());
    expect(result.current.values).toEqual({ name: '', age: 20, bio: 'hi' });
    expect(result.current.errors).toEqual({});
    expect(result.current.touched).toEqual({});
    expect(result.current.dirty).toEqual({});
    expect(result.current.isDirty).toBe(false);
  });

  it('handleSubmit validates and calls onSubmit when valid', async () => {
    const onSubmit = vi.fn(async () => {});
    const { result } = renderHook(() => useForm({ name: { initialValue: 'Alice' } }, onSubmit as unknown as (v: { name: string }) => Promise<void>));

    await act(async () => {
      await result.current.handleSubmit({ preventDefault: vi.fn() } as unknown as React.FormEvent);
    });

    expect(onSubmit).toHaveBeenCalledWith({ name: 'Alice' });
    expect(result.current.isSubmitting).toBe(false);
  });

  it('handleSubmit blocks submission when validation fails', async () => {
    const onSubmit = vi.fn(async () => {});
    const { result } = renderHook(() =>
      useForm({ name: { initialValue: '', validation: { required: true } } }, onSubmit as unknown as (v: { name: string }) => Promise<void>),
    );

    await act(async () => {
      await result.current.handleSubmit({ preventDefault: vi.fn() } as unknown as React.FormEvent);
    });

    expect(onSubmit).not.toHaveBeenCalled();
    // all fields marked touched
    expect(result.current.touched.name).toBe(true);
    expect(result.current.errors.name).toBe('This field is required');
  });

  it('isValid reflects current errors', () => {
    const { result } = renderHook(() => useForm(fields));
    expect(result.current.isValid).toBe(true);
    act(() => result.current.handleChange('name', ''));
    // name required but we set to '' via handleChange → error set
    expect(result.current.errors.name).toBe('This field is required');
    expect(result.current.isValid).toBe(false);
  });

  it('setErrors allows programmatic error injection', () => {
    const { result } = renderHook(() => useForm(fields));
    act(() => result.current.setErrors({ name: 'Server error' }));
    expect(result.current.errors.name).toBe('Server error');
    expect(result.current.isValid).toBe(false);
  });

  it('handles onSubmit throwing without stuck isSubmitting', async () => {
    const onSubmit = vi.fn(async () => {
      throw new Error('boom');
    });
    const { result } = renderHook(() =>
      useForm({ name: { initialValue: 'ok' } }, onSubmit as unknown as (v: { name: string }) => Promise<void>),
    );

    await act(async () => {
      await result.current.handleSubmit({ preventDefault: vi.fn() } as unknown as React.FormEvent);
    });

    expect(result.current.isSubmitting).toBe(false);
  });
});
