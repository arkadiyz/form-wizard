'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { PersonalInfoSchema, type PersonalInfo } from '../../../schemas/formSchemas';
import { useFormStore } from '../../../store/formStore';
import { useTranslation } from '../../../lib/i18n';
import { Input } from '../../ui';
import { FormGrid } from '../FormGrid';
import styles from './PersonalInfoStep.module.css';

interface PersonalInfoStepProps {
  onNext: () => void;
  locale?: string;
}

export const PersonalInfoStep: React.FC<PersonalInfoStepProps> = ({ onNext, locale = 'en' }) => {
  const { formData, updatePersonalInfo } = useFormStore();
  const { t } = useTranslation(locale);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    clearErrors,
  } = useForm<PersonalInfo>({
    resolver: zodResolver(PersonalInfoSchema),
    defaultValues: formData.personalInfo,
    mode: 'onBlur',
  });

  const onSubmit = (data: PersonalInfo) => {
    updatePersonalInfo(data);
    onNext();
  };

  const handlePhoneInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow numbers and dash
    const cleaned = value.replace(/[^0-9-]/g, '');
    // Limit to 10 digits (excluding dash)
    const digitsOnly = cleaned.replace(/-/g, '');
    if (digitsOnly.length <= 10) {
      setValue('phone', cleaned);
      clearErrors('phone');
    }
  };

  // Update store only on blur (when user finishes editing)
  const handleBlur = (field: keyof PersonalInfo, value: string) => {
    updatePersonalInfo({ [field]: value });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={styles.stepContainer}
    >
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
            onChange={handlePhoneInput}
            onBlur={(e) => handleBlur('phone', e.target.value)}
            dir={locale === 'he' ? 'rtl' : 'ltr'}
          />

          <Input
            {...register('email')}
            label={t('fields.email')}
            placeholder="john@example.com"
            error={errors.email?.message}
            isRequired
            type="email"
            dir={locale === 'he' ? 'rtl' : 'ltr'}
            onBlur={(e) => handleBlur('email', e.target.value)}
          />
        </FormGrid>

        <div className={styles.actions}>
          <motion.button
            type="submit"
            disabled={!isValid}
            className={`${styles.nextButton} ${!isValid ? styles.disabled : ''}`}
            whileHover={{ scale: isValid ? 1.02 : 1 }}
            whileTap={{ scale: isValid ? 0.98 : 1 }}
          >
            {t('buttons.next')}
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
};
