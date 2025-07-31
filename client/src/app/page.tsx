'use client';

import React, { useRef } from 'react';
import { FormWizard } from '../components/form/FormWizard';
import { PersonalInfoStep, PersonalInfoStepRef } from '../components/form/steps/PersonalInfoStep';
import { JobInterestStep, type JobInterestStepRef } from '../components/form/steps/JobInterestStep';
import {
  NotificationsStep,
  type NotificationsStepRef,
} from '../components/form/steps/NotificationsStep';
import { ConfirmationStep } from '../components/form/steps/ConfirmationStep';
import { useFormStore } from '../store/formStore';
import { useTranslation } from '../lib/i18n';

export default function HomePage() {
  const { currentStep, setStep } = useFormStore();
  const { t } = useTranslation();
  const confirmationRef = useRef<{ handleSubmit: () => void }>(null);
  const personalInfoRef = useRef<PersonalInfoStepRef>(null);
  const jobInterestRef = useRef<JobInterestStepRef>(null);
  const notificationsRef = useRef<NotificationsStepRef>(null);
  const [isSaving, setIsSaving] = React.useState(false);
  const [isFormSubmitted, setIsFormSubmitted] = React.useState(false); // New state to track form submission

  const stepTitles = [
    t('steps.personalInfo'),
    t('steps.jobInterest'),
    t('steps.notifications'),
    t('steps.confirmation'),
  ];

  const handleNext = async () => {
    if (currentStep === 1 && personalInfoRef.current) {
      const isValid = personalInfoRef.current.isValid();

      if (!isValid) {
        alert('Please complete all required fields correctly');
        return;
      }

      setIsSaving(true);

      try {
        const success = await personalInfoRef.current.save();

        if (success) {
          setStep(currentStep + 1);
        } else {
          alert('Failed to save data. Please try again.');
        }
      } catch (error) {
        alert('An error occurred while saving. Please try again.');
      } finally {
        setIsSaving(false);
      }
    } else if (currentStep === 2 && jobInterestRef.current) {
      const isValid = jobInterestRef.current.isValid();

      if (!isValid) {
        alert('Please complete all required fields correctly');
        return;
      }

      setIsSaving(true);

      try {
        const success = await jobInterestRef.current.save();

        if (success) {
          setStep(currentStep + 1);
        } else {
          alert('Failed to save data. Please try again.');
        }
      } catch (error) {
        alert('An error occurred while saving. Please try again.');
      } finally {
        setIsSaving(false);
      }
    } else if (currentStep === 3 && notificationsRef.current) {
      const isValid = notificationsRef.current.isValid();

      if (!isValid) {
        alert('Please complete all required fields correctly');
        return;
      }

      setIsSaving(true);

      try {
        const success = await notificationsRef.current.save();

        if (success) {
          setStep(currentStep + 1);
        } else {
          alert('Failed to save data. Please try again.');
        }
      } catch (error) {
        alert('An error occurred while saving. Please try again.');
      } finally {
        setIsSaving(false);
      }
    } else if (currentStep === 4) {
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

  const handleSubmissionSuccess = () => {
    setIsFormSubmitted(true);
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return <PersonalInfoStep ref={personalInfoRef} />;
      case 2:
        return <JobInterestStep ref={jobInterestRef} />;
      case 3:
        return <NotificationsStep ref={notificationsRef} />;
      case 4:
        return (
          <ConfirmationStep
            ref={confirmationRef}
            locale="en"
            onSubmissionSuccess={handleSubmissionSuccess}
          />
        );
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
        isLoading={isSaving}
        hideFooter={false} // Always show navigation buttons
      >
        {renderCurrentStep()}
      </FormWizard>
    </div>
  );
}
