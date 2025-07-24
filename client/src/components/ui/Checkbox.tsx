'use client';

import React, { useState } from 'react';
import styles from './Checkbox.module.css';

export interface CheckboxProps {
  label: string;
  checked?: boolean;
  disabled?: boolean;
  indeterminate?: boolean;
  onChange?: (checked: boolean) => void;
  onValidationTrigger?: () => void;
  dir?: 'ltr' | 'rtl';
  className?: string;
  hint?: string;
  showConfirmDialog?: boolean;
  onConfirmChange?: (checked: boolean) => Promise<boolean> | boolean;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  label,
  checked = false,
  disabled = false,
  indeterminate = false,
  onChange,
  onValidationTrigger,
  dir = 'ltr',
  className,
  hint,
  showConfirmDialog = false,
  onConfirmChange,
}) => {
  const [isChanging, setIsChanging] = useState(false);

  const handleChange = async () => {
    if (disabled || isChanging) return;

    setIsChanging(true);

    try {
      // If unchecking and confirmation is needed
      if (checked && showConfirmDialog && onConfirmChange) {
        const confirmed = await onConfirmChange(!checked);
        if (!confirmed) {
          setIsChanging(false);
          return;
        }
      }

      // Optimistic update
      onChange?.(!checked);
      onValidationTrigger?.();
    } finally {
      setIsChanging(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      handleChange();
    }
  };

  return (
    <div className={`${styles.checkboxWrapper} ${className || ''}`} dir={dir}>
      <div className={styles.checkboxContainer}>
        <button
          type="button"
          role="checkbox"
          aria-checked={indeterminate ? 'mixed' : checked}
          aria-disabled={disabled}
          className={`${styles.checkbox} ${checked ? styles.checked : ''} ${indeterminate ? styles.indeterminate : ''} ${disabled ? styles.disabled : ''} ${isChanging ? styles.changing : ''}`}
          onClick={handleChange}
          onKeyDown={handleKeyDown}
          disabled={disabled}
        >
          {checked && !indeterminate && (
            <svg className={styles.checkIcon} viewBox="0 0 16 16" fill="currentColor">
              <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z" />
            </svg>
          )}

          {indeterminate && (
            <svg className={styles.indeterminateIcon} viewBox="0 0 16 16" fill="currentColor">
              <path d="M4 8a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7A.5.5 0 0 1 4 8z" />
            </svg>
          )}
        </button>

        <label className={styles.label} onClick={handleChange}>
          {label}
        </label>
      </div>

      {hint && <span className={styles.hint}>{hint}</span>}
    </div>
  );
};
