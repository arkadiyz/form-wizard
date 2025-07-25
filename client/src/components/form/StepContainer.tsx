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
    </div>
  );
};
