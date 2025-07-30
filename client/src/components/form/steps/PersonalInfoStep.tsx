'use client';

import React, { useImperativeHandle, forwardRef } from 'react';
import { useForm } from 'react-hook-form';
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

// הוסף ref interface
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
    } = useFormStore();
    const { t } = useTranslation(locale);

    const {
      register,
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

    // עדכן את הטופס כשהנתונים ב-store משתנים (כשחוזרים לשלב)
    React.useEffect(() => {
      console.log('🔄 Syncing form with store data:', formData.personalInfo);
      reset(formData.personalInfo);
    }, [formData.personalInfo, reset]);

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
      console.log('🟠 PersonalInfoStep: saveData called');
      const currentData = watch();
      console.log('🟠 Current form data:', currentData);

      try {
        // עדכן את הנתונים ב-store
        console.log('🟠 Updating store...');
        updatePersonalInfo(currentData);

        // יצור session ID אם לא קיים
        if (!sessionId) {
          console.log('🟠 No sessionId, generating...');
          generateSessionId();
        } else {
          console.log('🟠 Using existing sessionId:', sessionId);
        }

        // שמור לשרת
        console.log('🟠 Calling saveCurrentStep...');
        const success = await saveCurrentStep();
        console.log('🟠 saveCurrentStep result:', success);

        if (success) {
          console.log('✅ Personal info saved successfully');
          return true;
        } else {
          console.error('❌ Failed to save personal info');
          return false;
        }
      } catch (error) {
        console.error('❌ Error saving personal info:', error);
        return false;
      }
    };

    // חשוף את הפונקציות לקומפוננטה האב
    useImperativeHandle(ref, () => ({
      save: saveData,
      isValid: isFormValid,
    }));

    const onSubmit = async (data: PersonalInfo) => {
      // עדכון הנתונים ב-store
      updatePersonalInfo(data);

      // יצירת session ID אם לא קיים
      if (!sessionId) {
        generateSessionId();
      }

      // שמירה לשרת
      try {
        const saveSuccess = await saveCurrentStep();

        if (saveSuccess) {
          console.log('✅ Personal info saved successfully');
          // מעבר לשלב הבא
          onNext?.();
        } else {
          console.error('❌ Failed to save personal info');
          // אפשר להציג הודעת שגיאה למשתמש
          alert('Failed to save data. Please try again.');
        }
      } catch (error) {
        console.error('❌ Error saving personal info:', error);
        alert('An error occurred while saving. Please try again.');
      }
    };

    // Enhanced phone input handler for Israeli phone numbers
    const handlePhoneInput = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;

      // Only allow numbers and dash
      const cleaned = value.replace(/[^0-9-]/g, '');

      // Limit to 10 digits (excluding dash)
      const digitsOnly = cleaned.replace(/-/g, '');

      // Auto-format with dash after 3 digits (Israeli format)
      let formatted = cleaned;
      if (digitsOnly.length >= 3 && !cleaned.includes('-')) {
        formatted = digitsOnly.slice(0, 3) + '-' + digitsOnly.slice(3, 10);
      }

      // Max 10 digits total
      if (digitsOnly.length <= 10) {
        setValue('phone', formatted);
        clearErrors('phone');
      }
    };

    // Update store only on blur (when user finishes editing)
    const handleBlur = (field: keyof PersonalInfo, value: string) => {
      updatePersonalInfo({ [field]: value });
    };

    // Determine final email error (form validation or uniqueness)
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

        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          <FormGrid columns={2} gap="lg">
            <Input
              {...register('firstName')}
              label={t('fields.firstName')}
              placeholder="John"
              error={errors.firstName?.message}
              isRequired
              dir={locale === 'he' ? 'rtl' : 'ltr'}
              hint={locale === 'en' ? 'English letters only' : undefined}
              onBlur={(e) => handleBlur('firstName', e.target.value)}
            />

            <Input
              {...register('lastName')}
              label={t('fields.lastName')}
              placeholder="Doe"
              error={errors.lastName?.message}
              isRequired
              dir={locale === 'he' ? 'rtl' : 'ltr'}
              hint={locale === 'en' ? 'English letters only' : undefined}
              onBlur={(e) => handleBlur('lastName', e.target.value)}
            />

            <Input
              {...register('phone')}
              label={t('fields.phone')}
              placeholder="050-1234567"
              error={errors.phone?.message}
              isRequired
              type="tel"
              inputMode="numeric"
              pattern="[0-9-]*"
              maxLength={11}
              onChange={handlePhoneInput}
              onBlur={(e) => handleBlur('phone', e.target.value)}
              dir={locale === 'he' ? 'rtl' : 'ltr'}
              hint="Israeli mobile format: 050-1234567"
            />

            <Input
              {...register('email')}
              label={t('fields.email')}
              placeholder="john@example.com"
              error={finalEmailError}
              isRequired
              isLoading={isEmailValidating}
              type="email"
              dir={locale === 'he' ? 'rtl' : 'ltr'}
              onBlur={(e) => handleBlur('email', e.target.value)}
              hint={isEmailUnique === true ? '✓ Email is available' : undefined}
            />
          </FormGrid>

          {/* כפתור Next עם מצב טעינה */}
          <div className={styles.buttonContainer}></div>
        </form>
      </motion.div>
    );
  },
);

PersonalInfoStep.displayName = 'PersonalInfoStep';
