/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com).
 *
 * WSO2 LLC. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
import { renderHook, act } from '@testing-library/react';
import { useForm, UseFormConfig } from '../hooks/useForm';
import { vi, describe, it, expect } from 'vitest';

interface LoginForm extends Record<string, string> {
    username: string;
    password: string;
    email?: string;
}

describe('useForm hook - full coverage', () => {
    const initialValues: LoginForm = { username: '', password: '', email: '' };
    const fields = [
        { name: 'username', required: true },
        { name: 'password', required: true },
        { name: 'email', required: false, validator: (value: string) => value.includes('@') ? null : 'Invalid email' }
    ];

    const globalValidator = (values: LoginForm) => {
        const errors: Record<string, string> = {};
        if (values.password && values.password.length < 6) {
            errors['password'] = 'Password too short';
        }
        return errors;
    };

    const config: UseFormConfig<LoginForm> = { initialValues, fields, validator: globalValidator };

    it('initial state', () => {
        const { result } = renderHook(() => useForm<LoginForm>(config));
        expect(result.current.values).toEqual(initialValues);
        expect(result.current.errors).toEqual({});
        expect(result.current.touched).toEqual({});
        expect(result.current.isValid).toBe(true);
        expect(result.current.isSubmitted).toBe(false);
    });

    it('setValue and validate on change', () => {
        const { result } = renderHook(() => useForm<LoginForm>({ ...config, validateOnChange: true }));

        act(() => result.current.setValue('username', 'Alice'));
        expect(result.current.values.username).toBe('Alice');

        act(() => result.current.setValue('email', 'wrong-email'));
        expect(result.current.errors['email']).toBe('Invalid email');

        act(() => result.current.setValue('email', 'alice@example.com'));
        expect(result.current.errors['email']).toBeUndefined();
    });

    it('bulk setValues', () => {
        const { result } = renderHook(() => useForm<LoginForm>(config));

        act(() => result.current.setValues({ username: 'Bob', password: '123456' }));
        expect(result.current.values.username).toBe('Bob');
        expect(result.current.values.password).toBe('123456');
    });

    it('setTouched and validate on blur', () => {
        const { result } = renderHook(() => useForm<LoginForm>(config));

        act(() => result.current.setTouched('username'));
        expect(result.current.touched['username']).toBe(true);
        expect(result.current.errors['username']).toBe('This field is required');
    });

    it('bulk setTouchedFields', () => {
        const { result } = renderHook(() => useForm<LoginForm>(config));
        act(() => result.current.setTouchedFields({ username: true, password: true }));
        expect(result.current.touched['username']).toBe(true);
        expect(result.current.touched['password']).toBe(true);
    });

    it('touchAllFields triggers validation', () => {
        const { result } = renderHook(() => useForm<LoginForm>(config));
        act(() => result.current.touchAllFields());
        expect(result.current.touched['username']).toBe(true);
        expect(result.current.touched['password']).toBe(true);
        expect(result.current.errors['username']).toBe('This field is required');
    });

    it('setErrors and clearErrors', () => {
        const { result } = renderHook(() => useForm<LoginForm>(config));
        act(() => result.current.setErrors({ username: 'Custom error', password: 'Another error' }));
        expect(result.current.errors['username']).toBe('Custom error');
        expect(result.current.errors['password']).toBe('Another error');

        act(() => result.current.clearErrors());
        expect(result.current.errors).toEqual({});
    });

    it('validateField returns correct errors', () => {
        const { result } = renderHook(() => useForm<LoginForm>(config));
        act(() => result.current.setValue('email', 'invalid'));
        expect(result.current.validateField('email')).toBe('Invalid email');
        expect(result.current.validateField('username')).toBe('This field is required');
    });

    it('validateForm returns correct ValidationResult', () => {
        const { result } = renderHook(() => useForm<LoginForm>(config));
        act(() => result.current.setValue('password', '123'));
        const validation = result.current.validateForm();
        expect(validation.isValid).toBe(false);
        expect(validation.errors['password']).toBe('Password too short');
    });

    it('handleSubmit prevents submission if invalid', async () => {
        const { result } = renderHook(() => useForm<LoginForm>(config));
        const onSubmit = vi.fn();

        await act(async () => {
            await result.current.handleSubmit(onSubmit)({ preventDefault: vi.fn() } as any);
        });

        expect(onSubmit).not.toHaveBeenCalled();
        expect(result.current.isSubmitted).toBe(true);
    });

    it('handleSubmit calls onSubmit if valid', async () => {
        const { result } = renderHook(() => useForm<LoginForm>(config));
        const onSubmit = vi.fn();

        act(() => {
            result.current.setValues({ username: 'Alice', password: '123456', email: 'alice@example.com' });
        });

        await act(async () => {
            await result.current.handleSubmit(onSubmit)();
        });

        expect(onSubmit).toHaveBeenCalledWith({ username: 'Alice', password: '123456', email: 'alice@example.com' });
    });

    it('reset restores initial state', () => {
        const { result } = renderHook(() => useForm<LoginForm>(config));
        act(() => {
            result.current.setValue('username', 'Changed');
            result.current.setTouched('username');
            result.current.setError('username', 'Error');
            result.current.reset();
        });

        expect(result.current.values).toEqual(initialValues);
        expect(result.current.touched).toEqual({});
        expect(result.current.errors).toEqual({});
        expect(result.current.isSubmitted).toBe(false);
    });

    it('getFieldProps works correctly', () => {
        const { result } = renderHook(() => useForm<LoginForm>(config));
        const props = result.current.getFieldProps('username');

        expect(props.name).toBe('username');
        expect(props.required).toBe(true);
        expect(props.value).toBe('');
        expect(props.touched).toBe(false);
        expect(props.error).toBeUndefined();
        expect(typeof props.onBlur).toBe('function');
        expect(typeof props.onChange).toBe('function');

        act(() => props.onChange('NewValue'));
        expect(result.current.values.username).toBe('NewValue');

        act(() => props.onBlur());
        expect(result.current.touched['username']).toBe(true);
    });
});
