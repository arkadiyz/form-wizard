'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { z } from 'zod';

interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string[]>;
}

interface UseFormValidationProps<T> {
  schema: z.ZodSchema<T>;
  data: T;
  onValidationChange?: (result: ValidationResult) => void;
}

export function useFormValidation<T>({
  schema,
  data,
  onValidationChange,
}: UseFormValidationProps<T>) {
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());

  const validateField = useCallback(
    (fieldName: string, value: unknown) => {
      try {
        // Create updated data object
        const updatedData = { ...data, [fieldName]: value } as T;

        // Parse the entire object
        const result = schema.safeParse(updatedData);

        if (result.success) {
          // Remove error for this field if validation passed
          setErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors[fieldName];
            return newErrors;
          });
          return true;
        } else {
          // Extract errors for this specific field
          const fieldErrors = result.error.issues
            .filter((err: z.ZodIssue) => err.path[0] === fieldName)
            .map((err: z.ZodIssue) => err.message);

          if (fieldErrors.length > 0) {
            setErrors((prev) => ({
              ...prev,
              [fieldName]: fieldErrors,
            }));
          }
          return false;
        }
      } catch {
        return false;
      }
    },
    [schema, data],
  );

  const validateAll = useCallback(() => {
    const result = schema.safeParse(data);

    if (result.success) {
      setErrors({});
      const validationResult = { isValid: true, errors: {} };
      onValidationChange?.(validationResult);
      return validationResult;
    } else {
      const newErrors: Record<string, string[]> = {};

      result.error.issues.forEach((err: z.ZodIssue) => {
        const fieldName = err.path[0] as string;
        if (!newErrors[fieldName]) {
          newErrors[fieldName] = [];
        }
        newErrors[fieldName].push(err.message);
      });

      setErrors(newErrors);
      const validationResult = { isValid: false, errors: newErrors };
      onValidationChange?.(validationResult);
      return validationResult;
    }
  }, [schema, data, onValidationChange]);

  const markFieldTouched = useCallback((fieldName: string) => {
    setTouchedFields((prev) => new Set([...prev, fieldName]));
  }, []);

  const getFieldError = useCallback(
    (fieldName: string) => {
      if (!touchedFields.has(fieldName)) return undefined;
      return errors[fieldName]?.[0];
    },
    [errors, touchedFields],
  );

  const isFieldValid = useCallback(
    (fieldName: string) => {
      return !errors[fieldName] || errors[fieldName].length === 0;
    },
    [errors],
  );

  return {
    errors,
    validateField,
    validateAll,
    markFieldTouched,
    getFieldError,
    isFieldValid,
    touchedFields,
  };
}

// Hook for delayed validation with debouncing
interface UseDelayedValidationProps {
  value: string;
  validator: (value: string) => Promise<boolean> | boolean;
  delay?: number;
  triggerValidation?: boolean;
}

interface DelayedValidationResult {
  isValidating: boolean;
  error: string | null;
  isValid: boolean | null;
}

export function useDelayedValidation({
  value,
  validator,
  delay = 300,
  triggerValidation = false,
}: UseDelayedValidationProps): DelayedValidationResult {
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [hasInteracted, setHasInteracted] = useState(false);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    // Only validate if user has interacted or triggerValidation is true
    if (!hasInteracted && !triggerValidation) {
      return;
    }

    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Reset states
    setError(null);
    setIsValid(null);

    // Don't validate empty values
    if (!value.trim()) {
      setIsValidating(false);
      return;
    }

    // Start delayed validation
    timeoutRef.current = setTimeout(async () => {
      setIsValidating(true);

      // Create new abort controller for this request
      abortControllerRef.current = new AbortController();

      try {
        const result = await validator(value);

        // Check if request was aborted
        if (abortControllerRef.current.signal.aborted) {
          return;
        }

        setIsValid(result);
        if (!result) {
          setError('Validation failed');
        }
      } catch (err) {
        // Check if request was aborted
        if (abortControllerRef.current.signal.aborted) {
          return;
        }

        setIsValid(false);
        setError(err instanceof Error ? err.message : 'Validation error');
      } finally {
        setIsValidating(false);
      }
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [value, validator, delay, hasInteracted, triggerValidation]);

  // Mark as interacted when value changes and it's not the first render
  useEffect(() => {
    if (value && !hasInteracted) {
      setHasInteracted(true);
    }
  }, [value, hasInteracted]);

  return {
    isValidating,
    error,
    isValid,
  };
}

// Mock API function for email uniqueness check (client-side simulation)
export const checkEmailUniqueness = async (email: string): Promise<boolean> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 800));

  // Mock some existing emails for testing
  const existingEmails = [
    'test@example.com',
    'admin@test.com',
    'user@demo.com',
    'john@company.com',
  ];

  // Check if email exists (case insensitive)
  const emailExists = existingEmails.some(
    (existing) => existing.toLowerCase() === email.toLowerCase(),
  );

  if (emailExists) {
    throw new Error('This email is already registered!');
  }

  return true; // Email is unique
};
