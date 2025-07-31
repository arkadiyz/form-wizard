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
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [selectedValue, setSelectedValue] = useState(value);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const showError = hasInteracted && error;
  const selectedOption = options.find((option) => option.value === selectedValue);
  const enabledOptions = options.filter((option) => !option.disabled);

  // Update internal state when value prop changes
  useEffect(() => {
    setSelectedValue(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setFocusedIndex(-1);
        if (!hasInteracted) {
          setHasInteracted(true);
          onValidationTrigger?.();
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [hasInteracted, onValidationTrigger]);

  const handleToggle = () => {
    if (disabled) return;

    if (!hasInteracted) {
      setHasInteracted(true);
    }

    const wasOpen = isOpen;
    setIsOpen(!isOpen);

    // Only set focus when opening the dropdown
    if (!wasOpen) {
      const currentIndex = selectedValue
        ? enabledOptions.findIndex((opt) => opt.value === selectedValue)
        : -1;
      setFocusedIndex(currentIndex >= 0 ? currentIndex : 0);
    } else {
      // When closing, reset focus
      setFocusedIndex(-1);
    }
  };

  const handleSelect = (optionValue: string) => {
    if (!hasInteracted) {
      setHasInteracted(true);
    }

    setSelectedValue(optionValue);
    onValueChange?.(optionValue);
    onSelectionChange?.(optionValue);
    setIsOpen(false);
    setFocusedIndex(-1);
    onValidationTrigger?.();

    // Return focus to trigger button
    setTimeout(() => {
      triggerRef.current?.focus();
    }, 0);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (disabled) return;

    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (!isOpen) {
          handleToggle();
        } else if (focusedIndex >= 0 && focusedIndex < enabledOptions.length) {
          handleSelect(enabledOptions[focusedIndex].value);
        }
        break;

      case 'Escape':
        event.preventDefault();
        setIsOpen(false);
        setFocusedIndex(-1);
        triggerRef.current?.focus();
        break;

      case 'ArrowDown':
        event.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          setFocusedIndex((prev) => {
            const nextIndex = prev < enabledOptions.length - 1 ? prev + 1 : 0;
            return nextIndex;
          });
        }
        break;

      case 'ArrowUp':
        event.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          setFocusedIndex((prev) => {
            const prevIndex = prev > 0 ? prev - 1 : enabledOptions.length - 1;
            return prevIndex;
          });
        }
        break;

      case 'Home':
        if (isOpen) {
          event.preventDefault();
          setFocusedIndex(0);
        }
        break;

      case 'End':
        if (isOpen) {
          event.preventDefault();
          setFocusedIndex(enabledOptions.length - 1);
        }
        break;

      case 'Tab':
        if (isOpen) {
          setIsOpen(false);
          setFocusedIndex(-1);
        }
        break;
    }
  };

  const handleOptionMouseEnter = (index: number) => {
    setFocusedIndex(index);
  };

  const handleOptionClick = (optionValue: string) => {
    handleSelect(optionValue);
  };

  return (
    <div className={`${styles.dropdownWrapper} ${className || ''}`} dir={dir} ref={dropdownRef}>
      {label && (
        <label className={styles.label}>
          {label}
          {isRequired && <span className={styles.required}>*</span>}
        </label>
      )}

      <div className={styles.dropdownContainer}>
        <button
          ref={triggerRef}
          type="button"
          className={`${styles.trigger} ${showError ? styles.error : ''} ${disabled ? styles.disabled : ''} ${selectedValue ? styles.hasValue : ''}`}
          onClick={handleToggle}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-label={label || 'Dropdown menu'}
        >
          <span className={selectedOption ? styles.selected : styles.placeholder}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <span className={`${styles.arrow} ${isOpen ? styles.open : ''}`}>▼</span>
        </button>

        {isOpen && (
          <div className={styles.dropdown}>
            <ul className={styles.options} role="listbox">
              {enabledOptions.map((option, index) => (
                <li
                  key={option.value}
                  className={`${styles.option} ${selectedValue === option.value ? styles.optionSelected : ''} ${
                    index === focusedIndex ? styles.optionFocused : ''
                  }`}
                  onClick={() => handleOptionClick(option.value)}
                  onMouseEnter={() => handleOptionMouseEnter(index)}
                  role="option"
                  aria-selected={selectedValue === option.value}
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
