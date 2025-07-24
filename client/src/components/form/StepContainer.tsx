'use client';

import React from 'react';
import { Button } from '../ui';
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
  dir = 'ltr',
}) => {
  return (
    <div className={styles.stepContainer} dir={dir}>
      <header className={styles.stepHeader}>
        <h2 className={styles.stepTitle}>{title}</h2>
        {description && <p className={styles.stepDescription}>{description}</p>}
      </header>

      <div className={styles.stepBody}>{children}</div>

      <footer className={styles.stepFooter}>
        <div className={styles.buttonGroup}>
          {onBack && (
            <Button variant="outline" onClick={onBack} className={styles.backButton}>
              {backLabel}
            </Button>
          )}

          {onNext && (
            <Button
              variant={isLastStep ? 'primary' : 'primary'}
              onClick={onNext}
              disabled={isNextDisabled}
              className={styles.nextButton}
            >
              {isLastStep ? 'Submit' : nextLabel}
            </Button>
          )}
        </div>
      </footer>
    </div>
  );
};
