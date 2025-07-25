'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './FormWizard.module.css';

interface FormWizardProps {
  children: React.ReactNode;
  currentStep: number;
  totalSteps: number;
  stepTitles: string[];
  onStepClick?: (step: number) => void;
  onNext?: () => void;
  onBack?: () => void;
  isNextDisabled?: boolean;
  isLastStep?: boolean;
  dir?: 'ltr' | 'rtl';
}

export const FormWizard: React.FC<FormWizardProps> = ({
  children,
  currentStep,
  totalSteps,
  stepTitles,
  onStepClick,
  onNext,
  onBack,
  isNextDisabled = false,
  isLastStep = false,
  dir = 'ltr',
}) => {
  return (
    <div className={styles.wizardContainer} dir={dir}>
      {/* Progress Bar */}
      <div className={styles.progressSection}>
        <div className={styles.progressBar}>
          <motion.div
            className={styles.progressFill}
            initial={{ width: 0 }}
            animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <div className={styles.progressText}>
          Step {currentStep} of {totalSteps}
        </div>
      </div>

      {/* Step Navigation */}
      <nav className={styles.stepNavigation}>
        {stepTitles.map((title, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber === currentStep;
          const isCompleted = stepNumber < currentStep;
          const isClickable = stepNumber <= currentStep;

          return (
            <button
              key={stepNumber}
              className={`${styles.stepButton} ${isActive ? styles.active : ''} ${isCompleted ? styles.completed : ''}`}
              onClick={() => isClickable && onStepClick?.(stepNumber)}
              disabled={!isClickable}
            >
              <span className={styles.stepNumber}>{isCompleted ? '✓' : stepNumber}</span>
              <span className={styles.stepTitle}>{title}</span>
            </button>
          );
        })}
      </nav>

      {/* Form Content */}
      <div className={styles.formContent}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: dir === 'rtl' ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: dir === 'rtl' ? 20 : -20 }}
            transition={{ duration: 0.3 }}
            className={styles.stepContent}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Fixed Footer with buttons */}
      {(onNext || onBack) && (
        <footer className={styles.wizardFooter}>
          <div className={styles.buttonGroup}>
            {onBack && (
              <button onClick={onBack} className={styles.backButton}>
                Back
              </button>
            )}

            {onNext && (
              <button
                onClick={onNext}
                disabled={isNextDisabled}
                className={`${styles.nextButton} ${isNextDisabled ? styles.disabled : ''}`}
              >
                {isLastStep ? 'Submit' : 'Next'}
              </button>
            )}
          </div>
        </footer>
      )}
    </div>
  );
};
