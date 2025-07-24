'use client';

import React, { useState, useRef, useEffect } from 'react';
import styles from './Input.module.css';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label: string;
  error?: string;
  hint?: string;
  isRequired?: boolean;
  onValueChange?: (value: string) => void;
  onValidationTrigger?: () => void;
  clearable?: boolean;
  dir?: 'ltr' | 'rtl';
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  hint,
  isRequired = false,
  onValueChange,
  onValidationTrigger,
  clearable = true,
  dir = 'ltr',
  className,
  ...props
}) => {
  const [value, setValue] = useState(props.value || '');
  const [hasInteracted, setHasInteracted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const showError = hasInteracted && error;
  const showClear = clearable && value && !props.disabled;

  useEffect(() => {
    if (props.value !== undefined) {
      setValue(props.value);
    }
  }, [props.value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    onValueChange?.(newValue);

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
    setValue('');
    onValueChange?.('');
    inputRef.current?.focus();
    if (hasInteracted) {
      onValidationTrigger?.();
    }
  };

  return (
    <div className={`${styles.inputWrapper} ${className || ''}`} dir={dir}>
      <label className={styles.label}>
        {label}
        {isRequired && <span className={styles.required}>*</span>}
      </label>

      <div className={styles.inputContainer}>
        <input
          ref={inputRef}
          {...props}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          className={`${styles.input} ${showError ? styles.error : ''}`}
          aria-invalid={showError ? 'true' : undefined}
          aria-describedby={error ? `${props.id}-error` : undefined}
        />

        {showClear && (
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
