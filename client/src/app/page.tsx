'use client';

import React, { useRef } from 'react';
import { FormWizard } from '../components/form/FormWizard';
import { PersonalInfoStep } from '../components/form/steps/PersonalInfoStep';
import { JobInterestStep } from '../components/form/steps/JobInterestStep';
import { NotificationsStep } from '../components/form/steps/NotificationsStep';
import { ConfirmationStep } from '../components/form/steps/ConfirmationStep';
import { useFormStore } from '../store/formStore';
import { useTranslation } from '../lib/i18n';

export default function HomePage() {
  const { currentStep, setStep } = useFormStore();
  const { t } = useTranslation();
  const confirmationRef = useRef<{ handleSubmit: () => void }>(null);

  const stepTitles = [
    t('steps.personalInfo'),
    t('steps.jobInterest'),
    t('steps.notifications'),
    t('steps.confirmation'),
  ];

  const handleNext = () => {
    if (currentStep === 4) {
      // If we're on confirmation step, submit the form
      confirmationRef.current?.handleSubmit();
    } else if (currentStep < 4) {
      setStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setStep(currentStep - 1);
    }
  };

  const handleStepClick = (step: number) => {
    setStep(step);
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return <PersonalInfoStep />;
      case 2:
        return <JobInterestStep />;
      case 3:
        return <NotificationsStep />;
      case 4:
        return <ConfirmationStep ref={confirmationRef} />;
      default:
        return null;
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '2rem 1rem',
        boxSizing: 'border-box',
      }}
    >
      <FormWizard
        currentStep={currentStep}
        totalSteps={4}
        stepTitles={stepTitles}
        onStepClick={handleStepClick}
        onNext={handleNext}
        onBack={handleBack}
        isLastStep={currentStep === 4}
      >
        {renderCurrentStep()}
      </FormWizard>
    </div>
  );
}
