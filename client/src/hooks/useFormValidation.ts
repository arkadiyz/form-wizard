'use client';

import { useState, useCallback } from 'react';
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
