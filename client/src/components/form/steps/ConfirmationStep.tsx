import React from 'react';
import { StepHeader } from '../StepHeader';
import styles from './ConfirmationStep.module.css';

interface ConfirmationStepProps {
  locale?: string;
}

async function getReferenceData() {
  try {
    const baseUrl =
      process.env.NODE_ENV === 'production'
        ? 'https://your-production-url.com'
        : 'http://localhost:5202';

    const [categories, locations, skills] = await Promise.all([
      fetch(`${baseUrl}/api/reference/categories`).then((res) => res.json()),
      fetch(`${baseUrl}/api/reference/locations`).then((res) => res.json()),
      fetch(`${baseUrl}/api/reference/skills`).then((res) => res.json()),
    ]);

    return {
      categories:
        categories.data?.map((item: any) => ({
          id: item.id,
          label: item.name,
          value: item.id,
        })) || [],
      locations:
        locations.data?.map((item: any) => ({
          id: item.id,
          label: item.name,
          value: item.id,
        })) || [],
      skills:
        skills.data?.map((item: any) => ({
          id: item.id,
          label: item.name,
          value: item.id,
          category: item.category || 'advantage',
          skillCategoryId: item.skillCategoryId,
        })) || [],
    };
  } catch (error) {
    return {
      categories: [],
      locations: [],
      skills: [],
    };
  }
}

export async function ConfirmationStep({ locale = 'en' }: ConfirmationStepProps) {
  const referenceData = await getReferenceData();

  return (
    <div className={styles.container}>
      <StepHeader
        title="Review Your Application"
        subtitle="Please review your information below before submitting your application."
      />

      <div className={styles.summaryGrid}>
        <div className={styles.summaryCard}>
          <div className={styles.cardHeader}>
            <span className={styles.cardIcon}>👤</span>
            <h3 className={styles.cardTitle}>Personal Information</h3>
          </div>
          <div className={styles.cardContent}>
            <div className={styles.dataRow}>
              <span className={styles.label}>Available Categories:</span>
              <span className={styles.value}>
                {referenceData.categories.length} categories loaded from server
              </span>
            </div>
            <div className={styles.dataRow}>
              <span className={styles.label}>Available Locations:</span>
              <span className={styles.value}>
                {referenceData.locations.length} locations loaded from server
              </span>
            </div>
            <div className={styles.dataRow}>
              <span className={styles.label}>Available Skills:</span>
              <span className={styles.value}>
                {referenceData.skills.length} skills loaded from server
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.note}>
        <p>✅ This step is rendered on the SERVER (SSR)</p>
        <p>Data was fetched from the API during server-side rendering.</p>
      </div>
    </div>
  );
}
