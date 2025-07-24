'use client';

import React, { useState, useRef, useEffect } from 'react';
import styles from './Dropdown.module.css';

export interface DropdownOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface DropdownProps {
  label?: string;
  options: DropdownOption[];
  value?: string;
  placeholder?: string;
  error?: string;
  hint?: string;
  isRequired?: boolean;
  disabled?: boolean;
  onValueChange?: (value: string) => void;
  onSelectionChange?: (value: string) => void;
  onValidationTrigger?: () => void;
  dir?: 'ltr' | 'rtl';
  className?: string;
}

export const Dropdown: React.FC<DropdownProps> = ({
  label,
  options,
  value = '',
  placeholder = 'Select an option',
  error,
  hint,
  isRequired = false,
  disabled = false,
  onValueChange,
  onSelectionChange,
  onValidationTrigger,
  dir = 'ltr',
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const showError = hasInteracted && error;
  const selectedOption = options.find((option) => option.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = () => {
    if (disabled) return;

    if (!hasInteracted) {
      setHasInteracted(true);
      onValidationTrigger?.();
    }

    setIsOpen(!isOpen);
  };

  const handleSelect = (optionValue: string) => {
    if (!hasInteracted) {
      setHasInteracted(true);
    }

    onValueChange?.(optionValue);
    onSelectionChange?.(optionValue);
    setIsOpen(false);
    onValidationTrigger?.();
  };

  return (
    <div className={`${styles.dropdownWrapper} ${className || ''}`} dir={dir} ref={dropdownRef}>
      <label className={styles.label}>
        {label}
        {isRequired && <span className={styles.required}>*</span>}
      </label>

      <div className={styles.dropdownContainer}>
        <button
          type="button"
          className={`${styles.trigger} ${showError ? styles.error : ''} ${disabled ? styles.disabled : ''}`}
          onClick={handleToggle}
          disabled={disabled}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
        >
          <span className={selectedOption ? styles.selected : styles.placeholder}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <span className={`${styles.arrow} ${isOpen ? styles.open : ''}`}>▼</span>
        </button>

        {isOpen && (
          <div className={styles.dropdown}>
            <ul className={styles.options} role="listbox">
              {options.map((option) => (
                <li
                  key={option.value}
                  className={`${styles.option} ${option.disabled ? styles.optionDisabled : ''} ${value === option.value ? styles.optionSelected : ''}`}
                  onClick={() => !option.disabled && handleSelect(option.value)}
                  role="option"
                  aria-selected={value === option.value}
                >
                  {option.label}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {hint && !showError && <span className={styles.hint}>{hint}</span>}

      {showError && (
        <span className={styles.errorMessage} role="alert">
          {error}
        </span>
      )}
    </div>
  );
};
