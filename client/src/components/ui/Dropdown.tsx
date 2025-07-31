'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Portal } from './Portal';
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
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
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
      // בדיקה מורחבת יותר - גם Portal וגם container מקורי
      const portalElement = document.getElementById('portal-root');
      const isClickInPortal = portalElement?.contains(event.target as Node);
      const isClickInContainer = dropdownRef.current?.contains(event.target as Node);
      
      if (!isClickInContainer && !isClickInPortal) {
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

  // Calculate dropdown position when it opens
  useEffect(() => {
    if (isOpen && dropdownRef.current) {
      const updatePosition = () => {
        if (dropdownRef.current) {
          const rect = dropdownRef.current.getBoundingClientRect();
          setDropdownPosition({
            top: rect.bottom + window.scrollY + 4, // 4px gap
            left: rect.left + window.scrollX,
            width: rect.width,
          });
        }
      };

      // עדכון מיקום ראשוני
      updatePosition();

      // סגירת הפורטל בגלילה - גם חיצונית וגם פנימית
      const handleScroll = () => {
        setIsOpen(false);
        setFocusedIndex(-1);
      };

      // סגירת הפורטל בשינוי גודל חלון
      const handleResize = () => {
        setIsOpen(false);
        setFocusedIndex(-1);
      };

      // האזנה לגלילה של החלון הראשי
      window.addEventListener('scroll', handleScroll, { passive: true });
      window.addEventListener('resize', handleResize);

      // האזנה לגלילה פנימית של הטופס
      const formContent = document.querySelector('.formContent, [class*="formContent"]');
      if (formContent) {
        formContent.addEventListener('scroll', handleScroll, { passive: true });
      }

      // האזנה לכל גלילה אפשרית בדף
      const scrollableElements = document.querySelectorAll('[style*="overflow"], [class*="scroll"], [class*="overflow"]');
      scrollableElements.forEach((element) => {
        element.addEventListener('scroll', handleScroll, { passive: true });
      });

      return () => {
        window.removeEventListener('scroll', handleScroll);
        window.removeEventListener('resize', handleResize);
        
        if (formContent) {
          formContent.removeEventListener('scroll', handleScroll);
        }

        scrollableElements.forEach((element) => {
          element.removeEventListener('scroll', handleScroll);
        });
      };
    }
  }, [isOpen]);

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
          <Portal>
            <div className={styles.dropdown} style={{ top: dropdownPosition.top, left: dropdownPosition.left, width: dropdownPosition.width }}>
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
          </Portal>
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
