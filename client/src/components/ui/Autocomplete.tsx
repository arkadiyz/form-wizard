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
  label?: string;
  placeholder?: string;
  options: AutocompleteOption[];
  selectedValues?: string[]; // הוספת prop לערכים שנבחרו
  onSelectionChange?: (value: string | string[]) => void;
  isRequired?: boolean;
  error?: string;
  hint?: string;
  dir?: 'ltr' | 'rtl';
  multiSelect?: boolean;
  maxSelections?: number;
  isDisabled?: boolean;
  // Add custom validation function
  customValidation?: (
    currentSelections: string[],
    newSelection: string,
  ) => {
    canAdd: boolean;
    reason?: string;
  };
}
export const Autocomplete: React.FC<AutocompleteProps> = ({
  label,
  placeholder = 'Type to search...',
  options,
  selectedValues: controlledSelectedValues,
  onSelectionChange,
  isRequired = false,
  error,
  hint,
  dir = 'ltr',
  multiSelect = false,
  maxSelections,
  isDisabled = false,
  customValidation,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [selectedValues, setSelectedValues] = useState<string[]>(controlledSelectedValues || []);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const showError = hasInteracted && error;
  const minSearchLength = 2; // הקטנת הדרישה מ-3 ל-2 תווים
  const maxSuggestions = 8; // הגדלת מספר התוצאות

  // Filter options based on input
  const filteredOptions = useMemo(() => {
    console.log('🔍 Autocomplete filteredOptions:', {
      multiSelect,
      optionsCount: options.length,
      selectedValuesCount: selectedValues.length,
      inputValue,
      inputValueLength: inputValue.length,
    });

    // In multiSelect mode, show available options even without input
    if (multiSelect) {
      // Filter out already selected values
      const availableOptions = options.filter((option) => !selectedValues.includes(option.value));

      console.log('📊 Available options after filtering selected:', availableOptions.length);

      if (!inputValue || inputValue.length === 0) {
        const result = availableOptions.slice(0, maxSuggestions);
        console.log('📤 Returning all available options:', result.length);
        return result;
      }

      const searchTerm = inputValue.toLowerCase();
      const filtered = availableOptions.filter(
        (option) =>
          option.label.toLowerCase().includes(searchTerm) ||
          option.category?.toLowerCase().includes(searchTerm),
      );

      const result = filtered.slice(0, maxSuggestions);
      console.log('📤 Returning filtered options:', result.length);
      return result;
    }

    // For single select, keep the original behavior
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
  }, [inputValue, options, multiSelect, selectedValues]);

  useEffect(() => {
    setInputValue('');
  }, []);

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

  // סנכרון ערכים חיצוניים עם state פנימי
  useEffect(() => {
    if (controlledSelectedValues) {
      setSelectedValues(controlledSelectedValues);
    }
  }, [controlledSelectedValues]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    if (multiSelect) {
      // In multiSelect, always show options when typing or when there are available options
      setIsOpen(true);
    } else {
      // For single select, keep the original behavior
      setIsOpen(newValue.length >= minSearchLength);
    }

    setSelectedIndex(-1);

    if (hasInteracted) {
      // Trigger validation if needed
    }
  };

  const handleInputFocus = () => {
    if (!hasInteracted) {
      setHasInteracted(true);
    }

    if (multiSelect) {
      // In multiSelect, always show available options when focused
      setIsOpen(true);
    } else if (inputValue.length >= minSearchLength) {
      setIsOpen(true);
    }
  };

  const handleInputBlur = () => {
    if (!hasInteracted) {
      setHasInteracted(true);
    }
  };

  const handleOptionSelect = (option: AutocompleteOption) => {
    if (multiSelect) {
      // Custom validation if provided
      if (customValidation) {
        const validation = customValidation(selectedValues, option.value);
        if (!validation.canAdd) {
          // Show validation error (e.g., via a toast or inline message)
          console.warn(validation.reason);
          return;
        }
      }

      const newValues = [...selectedValues, option.value];
      if (maxSelections && newValues.length > maxSelections) return;

      setSelectedValues(newValues);
      onSelectionChange?.(newValues);

      // נקה את הטקסט בשדה הקלט כדי לאפשר חיפוש נוסף
      setInputValue('');
    } else {
      setInputValue(option.label);
      onSelectionChange?.(option.value);
    }

    setIsOpen(false);
    setSelectedIndex(-1);
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

  const handleClearInput = () => {
    // מנקה רק את הטקסט בשדה הקלט, לא את הבחירות
    setInputValue('');
    setIsOpen(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  const handleClearAll = () => {
    // מנקה הכל - טקסט ובחירות
    setInputValue('');
    setSelectedValues([]);
    setIsOpen(false);
    setSelectedIndex(-1);
    onSelectionChange?.(multiSelect ? [] : '');
    inputRef.current?.focus();
  };

  const highlightText = (text: string, search: string) => {
    if (!search) return text;

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
    <div className={`${styles.autocompleteWrapper}`} dir={dir}>
      {label && (
        <label className={styles.label}>
          {label}
          {isRequired && <span className={styles.required}>*</span>}
        </label>
      )}

      {/* Show selected items in multiSelect mode */}
      {multiSelect && selectedValues.length > 0 && (
        <div className={styles.selectedItems}>
          {selectedValues.map((value) => {
            const option = options.find((opt) => opt.value === value);
            return option ? (
              <span key={value} className={styles.selectedItem}>
                {option.label}
                <button
                  type="button"
                  onClick={() => {
                    const newValues = selectedValues.filter((v) => v !== value);
                    setSelectedValues(newValues);
                    onSelectionChange?.(newValues);
                  }}
                  className={styles.removeItem}
                >
                  ×
                </button>
              </span>
            ) : null;
          })}
        </div>
      )}

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
          disabled={isDisabled}
          className={`${styles.input} ${showError ? styles.error : ''}`}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-autocomplete="list"
          role="combobox"
        />

        {(inputValue || (!multiSelect && selectedValues.length > 0)) && !isDisabled && (
          <button
            type="button"
            className={styles.clearButton}
            onClick={multiSelect ? handleClearInput : handleClearAll}
            aria-label={multiSelect ? 'Clear input text' : 'Clear selection'}
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
