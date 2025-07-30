'use client';

import React, { useImperativeHandle, forwardRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { PersonalInfoSchema, type PersonalInfo } from '../../../schemas/formSchemas';
import { useFormStore } from '../../../store/formStore';
import { useTranslation } from '../../../lib/i18n';
import { useDelayedValidation, checkEmailUniqueness } from '../../../hooks/useFormValidation';
import { Input } from '../../ui';
import { FormGrid } from '../FormGrid';
import { StepHeader } from '../StepHeader';
import styles from './PersonalInfoStep.module.css';

interface PersonalInfoStepProps {
  locale?: string;
  onNext?: () => void;
}

export interface PersonalInfoStepRef {
  save: () => Promise<boolean>;
  isValid: () => boolean;
}

export const PersonalInfoStep = forwardRef<PersonalInfoStepRef, PersonalInfoStepProps>(
  ({ locale = 'en', onNext }, ref) => {
    const {
      formData,
      updatePersonalInfo,
      saveCurrentStep,
      isSaving,
      generateSessionId,
      sessionId,
      currentStep,
    } = useFormStore();
    const { t } = useTranslation(locale);

    const {
      control,
      handleSubmit,
      formState: { errors },
      setValue,
      clearErrors,
      watch,
      reset,
    } = useForm<PersonalInfo>({
      resolver: zodResolver(PersonalInfoSchema),
      defaultValues: formData.personalInfo,
      mode: 'onBlur',
    });

    // עדכן את הטופס כשחוזרים לשלב הראשון
    React.useEffect(() => {
      if (currentStep === 1) {
        console.log('🔄 Resetting form with store data:', formData.personalInfo);
        reset(formData.personalInfo);
      }
    }, [currentStep, formData.personalInfo, reset]);

    // Watch email field for delayed validation
    const emailValue = watch('email');

    // Email uniqueness validation with debouncing
    const {
      isValidating: isEmailValidating,
      error: emailUniquenessError,
      isValid: isEmailUnique,
    } = useDelayedValidation({
      value: emailValue || '',
      validator: checkEmailUniqueness,
      delay: 500,
    });

    // פונקציה לבדיקת תקינות הטופס
    const isFormValid = (): boolean => {
      const currentData = watch();
      const hasNoErrors = Object.keys(errors).length === 0;
      const hasAllRequiredFields = Boolean(
        currentData.firstName && currentData.lastName && currentData.phone && currentData.email,
      );
      const emailIsValid = Boolean(isEmailUnique === true && !emailUniquenessError);

      return hasNoErrors && hasAllRequiredFields && emailIsValid;
    };

    // פונקציה ציבורית לשמירה
    const saveData = async (): Promise<boolean> => {
      const currentData = watch();
      console.log('🟠 Saving form data:', currentData);

      try {
        updatePersonalInfo(currentData);

        if (!sessionId) {
          generateSessionId();
        }

        const success = await saveCurrentStep();
        return success;
      } catch (error) {
        console.error('❌ Error saving:', error);
        return false;
      }
    };

    // חשוף את הפונקציות לקומפוננטה האב
    useImperativeHandle(ref, () => ({
      save: saveData,
      isValid: isFormValid,
    }));

    // Enhanced phone input handler for Israeli phone numbers
    const handlePhoneInput = (value: string, onChange: (value: string) => void) => {
      // Only allow numbers and dash
      const cleaned = value.replace(/[^0-9-]/g, '');
      const digitsOnly = cleaned.replace(/-/g, '');

      // Auto-format with dash after 3 digits (Israeli format)
      let formatted = cleaned;
      if (digitsOnly.length >= 3 && !cleaned.includes('-')) {
        formatted = digitsOnly.slice(0, 3) + '-' + digitsOnly.slice(3, 10);
      }

      // Max 10 digits total
      if (digitsOnly.length <= 10) {
        onChange(formatted);
        clearErrors('phone');
      }
    };

    // Update store on blur
    const handleBlur = (field: keyof PersonalInfo, value: string) => {
      updatePersonalInfo({ [field]: value });
    };

    // Determine final email error
    const finalEmailError = errors.email?.message || emailUniquenessError || undefined;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={styles.stepContainer}
      >
        <StepHeader
          title="Personal Information"
          subtitle="Please provide your basic personal information to get started."
        />

        <form onSubmit={handleSubmit(saveData)} className={styles.form}>
          <FormGrid columns={2} gap="lg">
            <Controller
              name="firstName"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  label={t('fields.firstName')}
                  placeholder="John"
                  error={errors.firstName?.message}
                  isRequired
                  dir={locale === 'he' ? 'rtl' : 'ltr'}
                  hint={locale === 'en' ? 'English letters only' : undefined}
                  onBlur={(e) => {
                    field.onBlur();
                    handleBlur('firstName', e.target.value);
                  }}
                />
              )}
            />

            <Controller
              name="lastName"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  label={t('fields.lastName')}
                  placeholder="Doe"
                  error={errors.lastName?.message}
                  isRequired
                  dir={locale === 'he' ? 'rtl' : 'ltr'}
                  hint={locale === 'en' ? 'English letters only' : undefined}
                  onBlur={(e) => {
                    field.onBlur();
                    handleBlur('lastName', e.target.value);
                  }}
                />
              )}
            />

            <Controller
              name="phone"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  label={t('fields.phone')}
                  placeholder="050-1234567"
                  error={errors.phone?.message}
                  isRequired
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9-]*"
                  maxLength={11}
                  onChange={(e) => handlePhoneInput(e.target.value, field.onChange)}
                  onBlur={(e) => {
                    field.onBlur();
                    handleBlur('phone', e.target.value);
                  }}
                  dir={locale === 'he' ? 'rtl' : 'ltr'}
                  hint="Israeli mobile format: 050-1234567"
                />
              )}
            />

            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  label={t('fields.email')}
                  placeholder="john@example.com"
                  error={finalEmailError}
                  isRequired
                  isLoading={isEmailValidating}
                  type="email"
                  dir={locale === 'he' ? 'rtl' : 'ltr'}
                  onBlur={(e) => {
                    field.onBlur();
                    handleBlur('email', e.target.value);
                  }}
                  hint={isEmailUnique === true ? '✓ Email is available' : undefined}
                />
              )}
            />
          </FormGrid>
        </form>
      </motion.div>
    );
  },
);

PersonalInfoStep.displayName = 'PersonalInfoStep';
