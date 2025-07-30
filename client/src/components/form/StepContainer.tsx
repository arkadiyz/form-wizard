'use client';

import React from 'react';
import styles from './StepContainer.module.css';

interface StepContainerProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  onNext?: () => void;
  onBack?: () => void;
  nextLabel?: string;
  backLabel?: string;
  isNextDisabled?: boolean;
  isLastStep?: boolean;
  isLoading?: boolean;
  dir?: 'ltr' | 'rtl';
}

export const StepContainer: React.FC<StepContainerProps> = ({
  title,
  description,
  children,
  onNext,
  onBack,
  nextLabel = 'Next',
  backLabel = 'Back',
  isNextDisabled = false,
  isLastStep = false,
  isLoading = false,
  dir = 'ltr',
}) => {
  return (
    <div className={styles.stepContainer} dir={dir}>
      <header className={styles.stepHeader}>
        <h2 className={styles.stepTitle}>{title}</h2>
        {description && <p className={styles.stepDescription}>{description}</p>}
      </header>

      <div className={styles.stepBody}>{children}</div>

      {/* כפתורי ניווט */}
      <div className={styles.stepFooter}>
        {onBack && (
          <button
            type="button"
            onClick={() => {
              console.log('🔴 BACK button clicked!');
              onBack();
            }}
            className={styles.backButton}
            disabled={isLoading}
          >
            {backLabel}
          </button>
        )}

        {onNext && (
          <button
            type="button"
            onClick={() => {
              console.log('🔴 NEXT button clicked!');
              onNext();
            }}
            className={styles.nextButton}
            disabled={isNextDisabled || isLoading}
          >
            {isLoading ? 'Saving...' : isLastStep ? 'Submit' : nextLabel}
          </button>
        )}
      </div>
    </div>
  );
};
