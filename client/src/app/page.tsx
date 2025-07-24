'use client';

import React from 'react';
import { FormWizard } from '../components/form/FormWizard';
import { StepContainer } from '../components/form/StepContainer';
import { PersonalInfoStep } from '../components/form/steps/PersonalInfoStep';
import { JobInterestStep } from '../components/form/steps/JobInterestStep';
import { useFormStore } from '../store/formStore';
import { useTranslation } from '../lib/i18n';

export default function HomePage() {
  const { currentStep, setStep } = useFormStore();
  const { t } = useTranslation();

  const stepTitles = [
    t('steps.personalInfo'),
    t('steps.jobInterest'),
    t('steps.notifications'),
    t('steps.confirmation'),
  ];

  const handleNext = () => {
    if (currentStep < 4) {
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
        return (
          <StepContainer
            title={t('steps.personalInfo')}
            description="Please provide your basic information"
            onNext={handleNext}
          >
            <PersonalInfoStep onNext={handleNext} />
          </StepContainer>
        );
      case 2:
        return (
          <StepContainer
            title={t('steps.jobInterest')}
            description="Tell us about your career interests"
            onNext={handleNext}
            onBack={handleBack}
          >
            <JobInterestStep onNext={handleNext} onBack={handleBack} />
          </StepContainer>
        );
      case 3:
        return (
          <StepContainer
            title={t('steps.notifications')}
            description="Choose your notification preferences"
            onNext={handleNext}
            onBack={handleBack}
          >
            <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
              Notifications Step - Coming Soon
            </div>
          </StepContainer>
        );
      case 4:
        return (
          <StepContainer
            title={t('steps.confirmation')}
            description="Review and confirm your application"
            onBack={handleBack}
            isLastStep
          >
            <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
              Confirmation Step - Coming Soon
            </div>
          </StepContainer>
        );
      default:
        return null;
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
    >
      <FormWizard
        currentStep={currentStep}
        totalSteps={4}
        stepTitles={stepTitles}
        onStepClick={handleStepClick}
      >
        {renderCurrentStep()}
      </FormWizard>
    </div>
  );
}
