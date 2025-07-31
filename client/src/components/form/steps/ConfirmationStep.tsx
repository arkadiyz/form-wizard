'use client';

import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { useFormStore } from '../../../store/formStore';
import { referenceDataService } from '../../../services/referenceDataService';
import { StepHeader } from '../StepHeader';
import styles from './ConfirmationStep.module.css';

interface ConfirmationStepProps {
  locale?: string;
}

interface SubmissionState {
  isLoading: boolean;
  isSuccess: boolean;
  error: string | null;
}

export interface ConfirmationStepRef {
  handleSubmit: () => void;
}

export const ConfirmationStep = forwardRef<ConfirmationStepRef, ConfirmationStepProps>(
  ({ locale = 'en' }, ref) => {
    const { formData, resetForm } = useFormStore();
    const [submission, setSubmission] = useState<SubmissionState>({
      isLoading: false,
      isSuccess: false,
      error: null,
    });

    // Load reference data to convert GUIDs to names
    const { data: categories = [] } = useQuery({
      queryKey: ['categories'],
      queryFn: referenceDataService.getCategories,
    });

    const { data: locations = [] } = useQuery({
      queryKey: ['locations'],
      queryFn: referenceDataService.getLocations,
    });

    const { data: skills = [] } = useQuery({
      queryKey: ['skills'],
      queryFn: () => referenceDataService.getSkillsByCategory(),
    });

    // Load roles based on selected categories
    const { data: roles = [] } = useQuery({
      queryKey: ['roles', formData.jobInterest.categoryIds],
      queryFn: () => {
        if (!formData.jobInterest.categoryIds?.length) return Promise.resolve([]);
        return referenceDataService.searchRolesByCategoriesAndText(
          formData.jobInterest.categoryIds,
          '',
        );
      },
      enabled: !!formData.jobInterest.categoryIds?.length,
    });

    // Helper functions to convert GUIDs to names
    const getCategoryNames = (categoryIds: string[]) => {
      if (!categoryIds?.length) return 'Not selected';
      const names = categoryIds
        .map((id) => categories.find((cat) => cat.value === id)?.label)
        .filter(Boolean);
      return names.length > 0 ? names.join(', ') : 'Not selected';
    };

    const getRoleNames = (roleIds: string[]) => {
      if (!roleIds?.length) return 'Not selected';
      const names = roleIds
        .map((id) => roles.find((role) => role.value === id)?.label)
        .filter(Boolean);
      return names.length > 0 ? names.join(', ') : 'Not selected';
    };

    const getLocationName = (locationId: string | null) => {
      if (!locationId) return 'Not selected';
      const location = locations.find((loc) => loc.value === locationId);
      return location?.label || 'Not selected';
    };

    const getSkillNames = (skillIds: string[]) => {
      if (!skillIds?.length) return 'Not selected';
      const names = skillIds
        .map((id) => skills.find((skill) => skill.value === id)?.label)
        .filter(Boolean);
      return names.length > 0 ? names.join(', ') : 'Not selected';
    };

    const handleSubmit = async () => {
      setSubmission({ isLoading: true, isSuccess: false, error: null });

      try {
        const response = await fetch('/api/form/submit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          throw new Error('Failed to submit form');
        }

        await response.json();
        setSubmission({ isLoading: false, isSuccess: true, error: null });

        setTimeout(() => {
          resetForm();
        }, 3000);
      } catch (error) {
        setSubmission({
          isLoading: false,
          isSuccess: false,
          error: error instanceof Error ? error.message : 'Something went wrong',
        });
      }
    };

    useImperativeHandle(ref, () => ({
      handleSubmit,
    }));

    if (submission.isSuccess) {
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          className={styles.successContainer}
        >
          <div className={styles.successIcon}>✅</div>
          <h2 className={styles.successTitle}>Application Submitted Successfully!</h2>
          <p className={styles.successMessage}>
            Thank you for your application. We&apos;ll review your information and get back to you
            soon.
          </p>
        </motion.div>
      );
    }

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        className={styles.container}
      >
        <StepHeader
          title="Review Your Application"
          subtitle="Please review your information below before submitting your application."
        />

        <div className={styles.summaryGrid}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className={styles.summaryCard}
          >
            <div className={styles.cardHeader}>
              <span className={styles.cardIcon}>👤</span>
              <h3 className={styles.cardTitle}>Personal Information</h3>
            </div>
            <div className={styles.cardContent}>
              <div className={styles.dataRow}>
                <span className={styles.label}>First Name:</span>
                <span className={styles.value}>
                  {formData.personalInfo.firstName || 'Not provided'}
                </span>
              </div>
              <div className={styles.dataRow}>
                <span className={styles.label}>Last Name:</span>
                <span className={styles.value}>
                  {formData.personalInfo.lastName || 'Not provided'}
                </span>
              </div>
              <div className={styles.dataRow}>
                <span className={styles.label}>Email:</span>
                <span className={styles.value}>
                  {formData.personalInfo.email || 'Not provided'}
                </span>
              </div>
              <div className={styles.dataRow}>
                <span className={styles.label}>Phone:</span>
                <span className={styles.value}>
                  {formData.personalInfo.phone || 'Not provided'}
                </span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className={styles.summaryCard}
          >
            <div className={styles.cardHeader}>
              <span className={styles.cardIcon}>💼</span>
              <h3 className={styles.cardTitle}>Job Interest</h3>
            </div>
            <div className={styles.cardContent}>
              <div className={styles.dataRow}>
                <span className={styles.label}>Categories:</span>
                <span className={styles.value}>
                  {getCategoryNames(formData.jobInterest.categoryIds)}
                </span>
              </div>
              <div className={styles.dataRow}>
                <span className={styles.label}>Roles:</span>
                <span className={styles.value}>{getRoleNames(formData.jobInterest.roleIds)}</span>
              </div>
              <div className={styles.dataRow}>
                <span className={styles.label}>Location:</span>
                <span className={styles.value}>
                  {getLocationName(formData.jobInterest.locationId)}
                </span>
              </div>
              <div className={styles.dataRow}>
                <span className={styles.label}>Mandatory Skills:</span>
                <span className={styles.value}>
                  {getSkillNames(formData.jobInterest.mandatorySkills)}
                </span>
              </div>
              <div className={styles.dataRow}>
                <span className={styles.label}>Advantage Skills:</span>
                <span className={styles.value}>
                  {getSkillNames(formData.jobInterest.advantageSkills)}
                </span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className={styles.summaryCard}
          >
            <div className={styles.cardHeader}>
              <span className={styles.cardIcon}>🔔</span>
              <h3 className={styles.cardTitle}>Notification Preferences</h3>
            </div>
            <div className={styles.cardContent}>
              <div className={styles.dataRow}>
                <span className={styles.label}>Email Notifications:</span>
                <span
                  className={`${styles.value} ${formData.notifications.email ? styles.enabled : styles.disabled}`}
                >
                  {formData.notifications.email ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              <div className={styles.dataRow}>
                <span className={styles.label}>Phone Notifications:</span>
                <span
                  className={`${styles.value} ${formData.notifications.phone ? styles.enabled : styles.disabled}`}
                >
                  {formData.notifications.phone ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              {formData.notifications.phone && (
                <>
                  <div className={styles.dataRow}>
                    <span className={styles.label}>• Voice Calls:</span>
                    <span
                      className={`${styles.value} ${formData.notifications.call ? styles.enabled : styles.disabled}`}
                    >
                      {formData.notifications.call ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                  <div className={styles.dataRow}>
                    <span className={styles.label}>• SMS Messages:</span>
                    <span
                      className={`${styles.value} ${formData.notifications.sms ? styles.enabled : styles.disabled}`}
                    >
                      {formData.notifications.sms ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                  <div className={styles.dataRow}>
                    <span className={styles.label}>• WhatsApp:</span>
                    <span
                      className={`${styles.value} ${formData.notifications.whatsapp ? styles.enabled : styles.disabled}`}
                    >
                      {formData.notifications.whatsapp ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </div>

        {submission.error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={styles.errorMessage}
          >
            {submission.error}
          </motion.div>
        )}
      </motion.div>
    );
  },
);

ConfirmationStep.displayName = 'ConfirmationStep';
