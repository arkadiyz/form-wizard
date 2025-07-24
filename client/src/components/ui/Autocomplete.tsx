'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import styles from './Autocomplete.module.css';

export interface AutocompleteOption {
  value: string;
  label: string;
  category?: string;
  disabled?: boolean;
}

export interface AutocompleteProps {
  label: string;
  options: AutocompleteOption[];
  value?: string;
  placeholder?: string;
  error?: string;
  hint?: string;
  isRequired?: boolean;
  disabled?: boolean;
  minSearchLength?: number;
  maxSuggestions?: number;
  onValueChange?: (value: string) => void;
  onValidationTrigger?: () => void;
  dir?: 'ltr' | 'rtl';
  className?: string;
  highlightMatch?: boolean;
}

export const Autocomplete: React.FC<AutocompleteProps> = ({
  label,
  options,
  value = '',
  placeholder = 'Type to search...',
  error,
  hint,
  isRequired = false,
  disabled = false,
  minSearchLength = 3,
  maxSuggestions = 5,
  onValueChange,
  onValidationTrigger,
  dir = 'ltr',
  className,
  highlightMatch = true,
}) => {
  const [inputValue, setInputValue] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const showError = hasInteracted && error;

  // Filter options based on input
  const filteredOptions = useMemo(() => {
    if (!inputValue || inputValue.length < minSearchLength) {
      return [];
    }

    const searchTerm = inputValue.toLowerCase();
    const filtered = options.filter(
      (option) =>
        option.label.toLowerCase().includes(searchTerm) ||
        option.category?.toLowerCase().includes(searchTerm),
    );

    return filtered.slice(0, maxSuggestions);
  }, [inputValue, options, minSearchLength, maxSuggestions]);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target as Node) &&
        listRef.current &&
        !listRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setIsOpen(newValue.length >= minSearchLength);
    setSelectedIndex(-1);

    onValueChange?.(newValue);

    if (hasInteracted) {
      onValidationTrigger?.();
    }
  };

  const handleInputFocus = () => {
    if (!hasInteracted) {
      setHasInteracted(true);
    }
    if (inputValue.length >= minSearchLength) {
      setIsOpen(true);
    }
  };

  const handleInputBlur = () => {
    if (!hasInteracted) {
      setHasInteracted(true);
      onValidationTrigger?.();
    }
  };

  const handleOptionSelect = (option: AutocompleteOption) => {
    setInputValue(option.label);
    setIsOpen(false);
    setSelectedIndex(-1);
    onValueChange?.(option.value);
    onValidationTrigger?.();
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || filteredOptions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => (prev < filteredOptions.length - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleOptionSelect(filteredOptions[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleClear = () => {
    setInputValue('');
    setIsOpen(false);
    onValueChange?.('');
    inputRef.current?.focus();
    if (hasInteracted) {
      onValidationTrigger?.();
    }
  };

  const highlightText = (text: string, search: string) => {
    if (!highlightMatch || !search) return text;

    const regex = new RegExp(`(${search})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark key={index} className={styles.highlight}>
          {part}
        </mark>
      ) : (
        part
      ),
    );
  };

  return (
    <div className={`${styles.autocompleteWrapper} ${className || ''}`} dir={dir}>
      <label className={styles.label}>
        {label}
        {isRequired && <span className={styles.required}>*</span>}
      </label>

      <div className={styles.inputContainer}>
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          placeholder={placeholder}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          className={`${styles.input} ${showError ? styles.error : ''}`}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-autocomplete="list"
          role="combobox"
        />

        {inputValue && !disabled && (
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

      {isOpen && filteredOptions.length > 0 && (
        <ul ref={listRef} className={styles.suggestions} role="listbox">
          {filteredOptions.map((option, index) => (
            <li
              key={option.value}
              className={`${styles.suggestion} ${index === selectedIndex ? styles.selected : ''} ${option.disabled ? styles.disabled : ''}`}
              onClick={() => !option.disabled && handleOptionSelect(option)}
              role="option"
              aria-selected={index === selectedIndex}
            >
              <div className={styles.optionContent}>
                <span className={styles.optionLabel}>
                  {highlightText(option.label, inputValue)}
                </span>
                {option.category && (
                  <span className={styles.optionCategory}>
                    {highlightText(option.category, inputValue)}
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {hint && !showError && <span className={styles.hint}>{hint}</span>}

      {showError && (
        <span className={styles.errorMessage} role="alert">
          {error}
        </span>
      )}
    </div>
  );
};
