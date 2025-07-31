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
  onSubmissionSuccess?: () => void; // New callback prop
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
  ({ locale = 'en', onSubmissionSuccess }, ref) => {
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

        // Notify parent component about successful submission
        onSubmissionSuccess?.();

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
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className={styles.successContainer}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5, type: 'spring', stiffness: 200 }}
            className={styles.successIconWrapper}
          >
            <svg className={styles.successIcon} viewBox="0 0 52 52">
              <circle className={styles.successIconCircle} cx="26" cy="26" r="25" fill="none" />
              <path
                className={styles.successIconCheck}
                fill="none"
                d="m14.1 27.2l7.1 7.2 16.7-16.8"
              />
            </svg>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className={styles.successTitle}
          >
            Application Submitted Successfully
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className={styles.successMessage}
          >
            Thank you for your application. Our team will review your information and contact you
            within 2-3 business days.
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className={styles.successFooter}
          >
            <p>
              Reference ID:{' '}
              <span className={styles.referenceId}>
                #{Math.random().toString(36).substr(2, 9).toUpperCase()}
              </span>
            </p>
          </motion.div>
        </motion.div>
      );
    }

    return (
      <div className={styles.container}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className={styles.header}
        >
          <div className={styles.headerIcon}>
            <svg viewBox="0 0 24 24" fill="none" className={styles.documentIcon}>
              <path
                d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <polyline
                points="14,2 14,8 20,8"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <line
                x1="16"
                y1="13"
                x2="8"
                y2="13"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <line
                x1="16"
                y1="17"
                x2="8"
                y2="17"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <polyline
                points="10,9 9,9 8,9"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h1 className={styles.title}>Application Review</h1>
          <p className={styles.subtitle}>
            Please carefully review all information below before submitting your application
          </p>
        </motion.div>

        <div className={styles.summaryGrid}>
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className={styles.summaryCard}
          >
            <div className={styles.cardHeader}>
              <div className={styles.cardIconWrapper}>
                <svg className={styles.cardIcon} viewBox="0 0 24 24" fill="none">
                  <path
                    d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle
                    cx="12"
                    cy="7"
                    r="4"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div className={styles.cardTitleSection}>
                <h3 className={styles.cardTitle}>Personal Information</h3>
                <p className={styles.cardSubtitle}>Your contact details</p>
              </div>
            </div>
            <div className={styles.cardContent}>
              <div className={styles.dataRow}>
                <span className={styles.label}>Full Name</span>
                <span className={styles.value}>
                  {`${formData.personalInfo.firstName || ''} ${formData.personalInfo.lastName || ''}`.trim() ||
                    'Not provided'}
                </span>
              </div>
              <div className={styles.dataRow}>
                <span className={styles.label}>Email Address</span>
                <span className={styles.value}>
                  {formData.personalInfo.email || 'Not provided'}
                </span>
              </div>
              <div className={styles.dataRow}>
                <span className={styles.label}>Phone Number</span>
                <span className={styles.value}>
                  {formData.personalInfo.phone || 'Not provided'}
                </span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className={styles.summaryCard}
          >
            <div className={styles.cardHeader}>
              <div className={styles.cardIconWrapper}>
                <svg className={styles.cardIcon} viewBox="0 0 24 24" fill="none">
                  <rect
                    x="2"
                    y="3"
                    width="20"
                    height="14"
                    rx="2"
                    ry="2"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <line
                    x1="8"
                    y1="21"
                    x2="16"
                    y2="21"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <line
                    x1="12"
                    y1="17"
                    x2="12"
                    y2="21"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div className={styles.cardTitleSection}>
                <h3 className={styles.cardTitle}>Career Preferences</h3>
                <p className={styles.cardSubtitle}>Your job interests and requirements</p>
              </div>
            </div>
            <div className={styles.cardContent}>
              <div className={styles.dataRow}>
                <span className={styles.label}>Categories</span>
                <span className={styles.value}>
                  {getCategoryNames(formData.jobInterest.categoryIds)}
                </span>
              </div>
              <div className={styles.dataRow}>
                <span className={styles.label}>Preferred Roles</span>
                <span className={styles.value}>{getRoleNames(formData.jobInterest.roleIds)}</span>
              </div>
              <div className={styles.dataRow}>
                <span className={styles.label}>Location</span>
                <span className={styles.value}>
                  {getLocationName(formData.jobInterest.locationId)}
                </span>
              </div>
              <div className={styles.dataRow}>
                <span className={styles.label}>Required Skills</span>
                <span className={styles.value}>
                  {getSkillNames(formData.jobInterest.mandatorySkills)}
                </span>
              </div>
              <div className={styles.dataRow}>
                <span className={styles.label}>Additional Skills</span>
                <span className={styles.value}>
                  {getSkillNames(formData.jobInterest.advantageSkills)}
                </span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className={styles.summaryCard}
          >
            <div className={styles.cardHeader}>
              <div className={styles.cardIconWrapper}>
                <svg className={styles.cardIcon} viewBox="0 0 24 24" fill="none">
                  <path
                    d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M13.73 21a2 2 0 0 1-3.46 0"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div className={styles.cardTitleSection}>
                <h3 className={styles.cardTitle}>Communication Preferences</h3>
                <p className={styles.cardSubtitle}>How we can reach you</p>
              </div>
            </div>
            <div className={styles.cardContent}>
              <div className={styles.dataRow}>
                <span className={styles.label}>Email Notifications</span>
                <span
                  className={`${styles.value} ${styles.statusBadge} ${
                    formData.notifications.email ? styles.enabled : styles.disabled
                  }`}
                >
                  {formData.notifications.email ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              <div className={styles.dataRow}>
                <span className={styles.label}>Phone Notifications</span>
                <span
                  className={`${styles.value} ${styles.statusBadge} ${
                    formData.notifications.phone ? styles.enabled : styles.disabled
                  }`}
                >
                  {formData.notifications.phone ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              {formData.notifications.phone && (
                <>
                  <div className={styles.dataRow}>
                    <span className={styles.label}>Voice Calls</span>
                    <span
                      className={`${styles.value} ${styles.statusBadge} ${
                        formData.notifications.call ? styles.enabled : styles.disabled
                      }`}
                    >
                      {formData.notifications.call ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                  <div className={styles.dataRow}>
                    <span className={styles.label}>SMS Messages</span>
                    <span
                      className={`${styles.value} ${styles.statusBadge} ${
                        formData.notifications.sms ? styles.enabled : styles.disabled
                      }`}
                    >
                      {formData.notifications.sms ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                  <div className={styles.dataRow}>
                    <span className={styles.label}>WhatsApp</span>
                    <span
                      className={`${styles.value} ${styles.statusBadge} ${
                        formData.notifications.whatsapp ? styles.enabled : styles.disabled
                      }`}
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
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className={styles.errorMessage}
          >
            <svg className={styles.errorIcon} viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
              <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" strokeWidth="2" />
              <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" strokeWidth="2" />
            </svg>
            <span>{submission.error}</span>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className={styles.disclaimer}
        >
          <svg className={styles.disclaimerIcon} viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
            <line x1="12" y1="16" x2="12" y2="12" stroke="currentColor" strokeWidth="2" />
            <line x1="12" y1="8" x2="12.01" y2="8" stroke="currentColor" strokeWidth="2" />
          </svg>
          <p>
            By submitting this application, you confirm that all information provided is accurate
            and complete. You also agree to our terms of service and privacy policy.
          </p>
        </motion.div>
      </div>
    );
  },
);

ConfirmationStep.displayName = 'ConfirmationStep';
