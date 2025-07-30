'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
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
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const showError = hasInteracted && error;
  const canAddMore = !maxSelections || selectedValues.length < maxSelections;

  // Filter available options based on input value - use useMemo for better performance
  const displayOptions = useMemo(() => {
    const filtered = options.filter((option) => !selectedValues.includes(option.value));

    if (inputValue.length === 0) {
      return filtered; // Show all available options when no input
    }

    const searchFiltered = filtered.filter((option) =>
      option.label.toLowerCase().includes(inputValue.toLowerCase()),
    );
    return searchFiltered;
  }, [options, selectedValues, inputValue]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    // Auto-scroll when dropdown opens
    const handleAutoScroll = () => {
      if (isOpen && containerRef.current) {
        setTimeout(() => {
          const container = containerRef.current;
          if (!container) return;

          const rect = container.getBoundingClientRect();
          const dropdownHeight = 12 * 16; // 12rem converted to pixels (assuming 16px = 1rem)
          const viewportHeight = window.innerHeight;
          const scrollBuffer = 20; // Extra space for comfort

          // Check if dropdown would be cut off at the bottom
          const bottomOfDropdown = rect.bottom + dropdownHeight;
          const isDropdownCutOff = bottomOfDropdown > viewportHeight - scrollBuffer;

          if (isDropdownCutOff) {
            // Calculate how much to scroll
            const scrollAmount = bottomOfDropdown - viewportHeight + scrollBuffer;

            // Smooth scroll
            window.scrollBy({
              top: scrollAmount,
              behavior: 'smooth',
            });
          }
        }, 100); // Small delay to ensure dropdown is rendered
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    if (isOpen) {
      handleAutoScroll();
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    if (!hasInteracted) {
      setHasInteracted(true);
    }

    // Always try to open if there are options and can add more
    if (canAddMore) {
      setIsOpen(true);
    }
  };

  const handleInputFocus = () => {
    if (!hasInteracted) {
      setHasInteracted(true);
    }
    // Always open dropdown when focusing if can add more
    if (canAddMore) {
      setIsOpen(true);
    }
  };

  const handleInputBlur = (e: React.FocusEvent) => {
    if (!hasInteracted) {
      setHasInteracted(true);
    }

    // Delay closing to allow clicks on options
    setTimeout(() => {
      // Only close if focus didn't move to an option
      if (!containerRef.current?.contains(document.activeElement)) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    }, 150);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (isOpen && displayOptions.length > 0) {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) => (prev < displayOptions.length - 1 ? prev + 1 : 0));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : displayOptions.length - 1));
          break;
        case 'Enter':
          e.preventDefault();
          if (selectedIndex >= 0 && selectedIndex < displayOptions.length) {
            addChip(displayOptions[selectedIndex].value);
          } else if (inputValue.trim() && canAddMore) {
            addChip(inputValue.trim());
          }
          break;
        case 'Escape':
          e.preventDefault();
          setIsOpen(false);
          setSelectedIndex(-1);
          break;
        default:
          if (e.key === 'Enter' && inputValue.trim()) {
            e.preventDefault();
            if (canAddMore) {
              addChip(inputValue.trim());
            }
          } else if (e.key === 'Backspace' && !inputValue && selectedValues.length > 0) {
            removeChip(selectedValues[selectedValues.length - 1]);
          }
      }
    } else {
      if (e.key === 'Enter' && inputValue.trim()) {
        e.preventDefault();
        if (canAddMore) {
          addChip(inputValue.trim());
        }
      } else if (e.key === 'Backspace' && !inputValue && selectedValues.length > 0) {
        removeChip(selectedValues[selectedValues.length - 1]);
      }
    }
  };

  const addChip = (value: string) => {
    if (!canAddMore || selectedValues.includes(value)) return;

    const newValues = [...selectedValues, value];
    onSelectionChange?.(newValues);
    setInputValue('');
    setIsOpen(false);
    setSelectedIndex(-1); // Reset selection
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

  useEffect(() => {
    // Reset selected index when options change
    setSelectedIndex(-1);
  }, [displayOptions]);

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

      {/* Container with chips and input inside */}
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
      </div>

      {/* Move suggestions outside the container */}
      {isOpen && displayOptions.length > 0 && (
        <div className={styles.suggestions}>
          <ul className={styles.optionsList}>
            {displayOptions.map((option, index) => (
              <li
                key={option.value}
                className={`${styles.option} ${option.disabled ? styles.disabled : ''} ${
                  selectedIndex === index ? styles.keyboardSelected : ''
                }`}
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

      {hint && !showError && <span className={styles.hint}>{hint}</span>}

      {showError && (
        <span className={styles.errorMessage} role="alert">
          {error}
        </span>
      )}
    </div>
  );
};
