'use client';

import React from 'react';
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
}

export const PersonalInfoStep: React.FC<PersonalInfoStepProps> = ({ locale = 'en' }) => {
  const { formData, updatePersonalInfo } = useFormStore();
  const { t } = useTranslation(locale);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    clearErrors,
    watch,
  } = useForm<PersonalInfo>({
    resolver: zodResolver(PersonalInfoSchema),
    defaultValues: formData.personalInfo,
    mode: 'onBlur',
  });

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

  const onSubmit = (data: PersonalInfo) => {
    updatePersonalInfo(data);
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
      </form>
    </motion.div>
  );
};
