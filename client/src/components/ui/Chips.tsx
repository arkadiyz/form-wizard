'use client';

import React, { useState, useRef, useEffect } from 'react';
import styles from './Chips.module.css';

export interface ChipOption {
  value: string;
  label: string;
  category?: 'mandatory' | 'advantage';
  disabled?: boolean;
}

export interface ChipsProps {
  label?: string;
  options: ChipOption[];
  selectedValues?: string[];
  onSelectionChange?: (values: string[]) => void;
  maxSelections?: number;
  hint?: string;
  dir?: 'ltr' | 'rtl';
  className?: string;
  error?: string;
  isRequired?: boolean;
}

export const Chips: React.FC<ChipsProps> = ({
  label,
  options,
  selectedValues = [],
  onSelectionChange,
  maxSelections,
  hint,
  dir = 'ltr',
  className,
  error,
  isRequired = false,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [hasInteracted, setHasInteracted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const showError = hasInteracted && error;
  const canAddMore = !maxSelections || selectedValues.length < maxSelections;

  // Filter available options
  const availableOptions = options.filter(
    (option) =>
      !selectedValues.includes(option.value) &&
      option.label.toLowerCase().includes(inputValue.toLowerCase()),
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    setIsOpen(value.length > 0 && canAddMore);

    if (!hasInteracted) {
      setHasInteracted(true);
    }
  };

  const handleInputFocus = () => {
    if (!hasInteracted) {
      setHasInteracted(true);
    }
    if (inputValue.length > 0 && canAddMore) {
      setIsOpen(true);
    }
  };

  const handleInputBlur = () => {
    if (!hasInteracted) {
      setHasInteracted(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      // For now, just add the input as a chip if allowed
      if (canAddMore) {
        addChip(inputValue.trim());
      }
    } else if (e.key === 'Backspace' && !inputValue && selectedValues.length > 0) {
      removeChip(selectedValues[selectedValues.length - 1]);
    }
  };

  const addChip = (value: string) => {
    if (!canAddMore || selectedValues.includes(value)) return;

    const newValues = [...selectedValues, value];
    onSelectionChange?.(newValues);
    setInputValue('');
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const removeChip = (valueToRemove: string) => {
    const newValues = selectedValues.filter((value) => value !== valueToRemove);
    onSelectionChange?.(newValues);
    inputRef.current?.focus();
  };

  const getChipLabel = (value: string) => {
    const option = options.find((opt) => opt.value === value);
    return option?.label || value.replace('custom_', '');
  };

  const getChipCategory = (value: string) => {
    const option = options.find((opt) => opt.value === value);
    return option?.category;
  };

  return (
    <div className={`${styles.chipsWrapper} ${className || ''}`} dir={dir} ref={containerRef}>
      <label className={styles.label}>
        {label}
        {isRequired && <span className={styles.required}>*</span>}
        {maxSelections && (
          <span className={styles.counter}>
            ({selectedValues.length}/{maxSelections})
          </span>
        )}
      </label>

      <div className={`${styles.chipsContainer} ${showError ? styles.error : ''}`}>
        <div className={styles.selectedChips}>
          {selectedValues.map((value) => {
            const category = getChipCategory(value);
            return (
              <span key={value} className={`${styles.chip} ${category ? styles[category] : ''}`}>
                <span className={styles.chipLabel}>{getChipLabel(value)}</span>
                <button
                  type="button"
                  className={styles.removeButton}
                  onClick={() => removeChip(value)}
                  aria-label={`Remove ${getChipLabel(value)}`}
                >
                  ×
                </button>
              </span>
            );
          })}

          {canAddMore && (
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              placeholder={selectedValues.length === 0 ? 'Add skills...' : ''}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              onKeyDown={handleKeyDown}
              disabled={false}
              className={styles.input}
            />
          )}
        </div>

        {isOpen && availableOptions.length > 0 && (
          <div className={styles.suggestions}>
            <ul className={styles.optionsList}>
              {availableOptions.map((option) => (
                <li
                  key={option.value}
                  className={`${styles.option} ${option.disabled ? styles.disabled : ''}`}
                  onClick={() => !option.disabled && addChip(option.value)}
                >
                  <span className={styles.optionLabel}>{option.label}</span>
                  {option.category && (
                    <span className={`${styles.optionBadge} ${styles[option.category]}`}>
                      {option.category}
                    </span>
                  )}
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
