'use client';

import React, { useState, useRef } from 'react';
import styles from './Input.module.css';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label?: string;
  error?: string;
  hint?: string;
  isRequired?: boolean;
  dir?: 'ltr' | 'rtl';
  clearable?: boolean;
  isLoading?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onValueChange?: (value: string) => void;
  onValidationTrigger?: () => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  hint,
  isRequired = false,
  isLoading = false,
  onValueChange,
  onValidationTrigger,
  clearable = true,
  dir = 'ltr',
  className,
  onChange,
  ...props
}) => {
  // פשוט יותר - אין state פנימי, השתמש רק בערך מ-props
  const [hasInteracted, setHasInteracted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const value = props.value || '';
  const showError = hasInteracted && error;
  const showClear = clearable && value && !props.disabled;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // קורא ישירות ל-onChange של Controller
    onChange?.(e);
    onValueChange?.(e.target.value);

    if (hasInteracted) {
      onValidationTrigger?.();
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    if (!hasInteracted) {
      setHasInteracted(true);
      onValidationTrigger?.();
    }
    props.onBlur?.(e);
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    if (!hasInteracted) {
      setHasInteracted(true);
    }
    props.onFocus?.(e);
  };

  const handleClear = () => {
    // יוצר synthetic event לטופס
    const clearEvent = {
      target: { value: '' },
      currentTarget: { value: '' },
    } as React.ChangeEvent<HTMLInputElement>;

    onChange?.(clearEvent);
    onValueChange?.('');
    inputRef.current?.focus();

    if (hasInteracted) {
      onValidationTrigger?.();
    }
  };

  return (
    <div className={`${styles.inputWrapper} ${className || ''}`} dir={dir}>
      {label && (
        <label className={styles.label}>
          {label}
          {isRequired && <span className={styles.required}>*</span>}
        </label>
      )}

      <div className={styles.inputContainer}>
        <input
          ref={inputRef}
          {...props}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          className={`${styles.input} ${showError ? styles.error : ''} ${isLoading ? styles.loading : ''}`}
          aria-invalid={showError ? 'true' : undefined}
          aria-describedby={error ? `${props.id}-error` : undefined}
        />

        {isLoading && (
          <div className={styles.loadingSpinner} aria-label="Validating">
            <div className={styles.spinner}></div>
          </div>
        )}

        {showClear && !isLoading && (
          <button
            type="button"
            className={styles.clearButton}
            onClick={handleClear}
            aria-label="Clear input"
          >
            ×
          </button>
        )}
      </div>

      {hint && !showError && <span className={styles.hint}>{hint}</span>}

      {showError && (
        <span id={`${props.id}-error`} className={styles.errorMessage} role="alert">
          {error}
        </span>
      )}
    </div>
  );
};
