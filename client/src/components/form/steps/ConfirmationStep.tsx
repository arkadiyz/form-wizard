'use client';

import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { motion } from 'framer-motion';
import { useFormStore } from '../../../store/formStore';
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
  (props, ref) => {
    const { formData, resetForm } = useFormStore();
    const [submission, setSubmission] = useState<SubmissionState>({
      isLoading: false,
      isSuccess: false,
      error: null,
    });

    const handleSubmit = async () => {
      setSubmission({ isLoading: true, isSuccess: false, error: null });

      try {
        // API call to submit form data
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

        // Success state
        setSubmission({ isLoading: false, isSuccess: true, error: null });

        // Optional: Reset form after successful submission
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

    // Expose handleSubmit to parent component
    useImperativeHandle(ref, () => ({
      handleSubmit,
    }));

    // Success state component
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

        {/* Summary Cards */}
        <div className={styles.summaryGrid}>
          {/* Personal Information Card */}
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

          {/* Job Interest Card */}
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
                  {formData.jobInterest.categoryIds?.length > 0
                    ? formData.jobInterest.categoryIds.join(', ')
                    : 'Not selected'}
                </span>
              </div>
              <div className={styles.dataRow}>
                <span className={styles.label}>Roles:</span>
                <span className={styles.value}>
                  {formData.jobInterest.roleIds?.length > 0
                    ? formData.jobInterest.roleIds.join(', ')
                    : 'Not selected'}
                </span>
              </div>
              <div className={styles.dataRow}>
                <span className={styles.label}>Location:</span>
                <span className={styles.value}>
                  {formData.jobInterest.locationId || 'Not selected'}
                </span>
              </div>
              <div className={styles.dataRow}>
                <span className={styles.label}>Skills:</span>
                <span className={styles.value}>
                  {formData.jobInterest.skills?.length > 0
                    ? formData.jobInterest.skills.join(', ')
                    : 'Not selected'}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Notification Preferences Card */}
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

        {/* Error Message Only */}
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
