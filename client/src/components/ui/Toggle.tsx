'use client';

import React, { useState } from 'react';
import styles from './Toggle.module.css';

export interface ToggleProps {
  label: string;
  checked?: boolean;
  disabled?: boolean;
  onToggle?: (checked: boolean) => void;
  onValidationTrigger?: () => void;
  dir?: 'ltr' | 'rtl';
  className?: string;
  hint?: string;
  showConfirmDialog?: boolean;
  onConfirmToggle?: (checked: boolean) => Promise<boolean> | boolean;
}

export const Toggle: React.FC<ToggleProps> = ({
  label,
  checked = false,
  disabled = false,
  onToggle,
  onValidationTrigger,
  dir = 'ltr',
  className,
  hint,
  showConfirmDialog = false,
  onConfirmToggle,
}) => {
  const [isToggling, setIsToggling] = useState(false);

  const handleToggle = async () => {
    if (disabled || isToggling) return;

    setIsToggling(true);

    try {
      // If turning OFF and confirmation is needed
      if (checked && showConfirmDialog && onConfirmToggle) {
        const confirmed = await onConfirmToggle(!checked);
        if (!confirmed) {
          setIsToggling(false);
          return;
        }
      }

      // Optimistic update
      onToggle?.(!checked);
      onValidationTrigger?.();
    } finally {
      setIsToggling(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      handleToggle();
    }
  };

  return (
    <div className={`${styles.toggleWrapper} ${className || ''}`} dir={dir}>
      <div className={styles.toggleContainer}>
        <button
          type="button"
          role="switch"
          aria-checked={checked}
          aria-disabled={disabled}
          className={`${styles.toggle} ${checked ? styles.checked : ''} ${disabled ? styles.disabled : ''} ${isToggling ? styles.toggling : ''}`}
          onClick={handleToggle}
          onKeyDown={handleKeyDown}
          disabled={disabled}
        >
          <span className={`${styles.thumb} ${checked ? styles.thumbChecked : ''}`} />
        </button>

        <label className={styles.label} onClick={handleToggle}>
          {label}
        </label>
      </div>

      {hint && <span className={styles.hint}>{hint}</span>}
    </div>
  );
};
