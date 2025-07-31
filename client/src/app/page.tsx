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

  const stepTitles = [
    t('steps.personalInfo'),
    t('steps.jobInterest'),
    t('steps.notifications'),
    t('steps.confirmation'),
  ];

  const handleNext = async () => {
    console.log('🟡 handleNext clicked, currentStep:', currentStep);

    if (currentStep === 1 && personalInfoRef.current) {
      console.log('🟡 In step 1, checking validity...');

      // בדוק שהטופס תקין
      const isValid = personalInfoRef.current.isValid();
      console.log('🟡 Form is valid:', isValid);

      if (!isValid) {
        alert('Please complete all required fields correctly');
        return;
      }

      setIsSaving(true);
      console.log('🟡 Starting to save...');

      try {
        // שמור את הנתונים
        console.log('🟡 Calling personalInfoRef.current.save()...');
        const success = await personalInfoRef.current.save();
        console.log('🟡 Save result:', success);

        if (success) {
          console.log('🟢 Save successful, moving to next step');
          setStep(currentStep + 1);
        } else {
          console.log('🔴 Save failed');
          alert('Failed to save data. Please try again.');
        }
      } catch (error) {
        console.error('🔴 Error saving:', error);
        alert('An error occurred while saving. Please try again.');
      } finally {
        setIsSaving(false);
        console.log('🟡 Finished saving process');
      }
    } else if (currentStep === 2 && jobInterestRef.current) {
      console.log('🟡 In step 2, checking validity...');

      // בדוק שהטופס תקין
      const isValid = jobInterestRef.current.isValid();
      console.log('🟡 Form is valid:', isValid);

      if (!isValid) {
        alert('Please complete all required fields correctly');
        return;
      }

      setIsSaving(true);
      console.log('🟡 Starting to save...');

      try {
        // שמור את הנתונים
        console.log('🟡 Calling jobInterestRef.current.save()...');
        const success = await jobInterestRef.current.save();
        console.log('🟡 Save result:', success);

        if (success) {
          console.log('🟢 Save successful, moving to next step');
          setStep(currentStep + 1);
        } else {
          console.log('🔴 Save failed');
          alert('Failed to save data. Please try again.');
        }
      } catch (error) {
        console.error('🔴 Error saving:', error);
        alert('An error occurred while saving. Please try again.');
      } finally {
        setIsSaving(false);
        console.log('🟡 Finished saving process');
      }
    } else if (currentStep === 3 && notificationsRef.current) {
      console.log('🟡 In step 3, checking validity...');

      // בדוק שהטופס תקין
      const isValid = notificationsRef.current.isValid();
      console.log('🟡 Form is valid:', isValid);

      if (!isValid) {
        alert('Please complete all required fields correctly');
        return;
      }

      setIsSaving(true);
      console.log('🟡 Starting to save...');

      try {
        // שמור את הנתונים
        console.log('🟡 Calling notificationsRef.current.save()...');
        const success = await notificationsRef.current.save();
        console.log('🟡 Save result:', success);

        if (success) {
          console.log('🟢 Save successful, moving to next step');
          setStep(currentStep + 1);
        } else {
          console.log('🔴 Save failed');
          alert('Failed to save data. Please try again.');
        }
      } catch (error) {
        console.error('🔴 Error saving:', error);
        alert('An error occurred while saving. Please try again.');
      } finally {
        setIsSaving(false);
        console.log('🟡 Finished saving process');
      }
    } else if (currentStep === 4) {
      // If we're on confirmation step, submit the form
      confirmationRef.current?.handleSubmit();
    } else if (currentStep < 4) {
      console.log('🟡 Moving to next step without saving');
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
        return <PersonalInfoStep ref={personalInfoRef} />;
      case 2:
        return <JobInterestStep ref={jobInterestRef} />;
      case 3:
        return <NotificationsStep ref={notificationsRef} />;
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
        isLoading={isSaving}
      >
        {renderCurrentStep()}
      </FormWizard>
    </div>
  );
}
