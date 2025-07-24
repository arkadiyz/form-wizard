'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { JobInterestSchema, type JobInterest } from '../../../schemas/formSchemas';
import { useFormStore } from '../../../store/formStore';
import { useTranslation } from '../../../lib/i18n';
import { Autocomplete, Dropdown, Chips } from '../../ui';
import { FormGrid } from '../FormGrid';
import styles from './JobInterestStep.module.css';

interface JobInterestStepProps {
  onNext: () => void;
  onBack: () => void;
  locale?: string;
}

// Mock data - later will come from API
const mockCategories = [
  { id: '1', label: 'Software Development', value: 'software' },
  { id: '2', label: 'Marketing', value: 'marketing' },
  { id: '3', label: 'Design', value: 'design' },
  { id: '4', label: 'Student', value: 'student' },
  { id: '5', label: 'No Experience', value: 'no-experience' },
];

const mockRoles = {
  software: [
    { id: '1', label: 'Web Developer', value: 'web-dev' },
    { id: '2', label: 'Mobile Developer', value: 'mobile-dev' },
    { id: '3', label: 'Full Stack Engineer', value: 'fullstack' },
    { id: '4', label: 'DevOps Engineer', value: 'devops' },
  ],
  marketing: [
    { id: '5', label: 'Digital Marketing', value: 'digital-marketing' },
    { id: '6', label: 'Content Creator', value: 'content' },
    { id: '7', label: 'SEO Specialist', value: 'seo' },
  ],
  design: [
    { id: '8', label: 'UI/UX Designer', value: 'uiux' },
    { id: '9', label: 'Graphic Designer', value: 'graphic' },
    { id: '10', label: 'Product Designer', value: 'product' },
  ],
  student: [
    { id: '11', label: 'Internship', value: 'internship' },
    { id: '12', label: 'Part-time Student', value: 'part-time' },
  ],
  'no-experience': [
    { id: '13', label: 'Entry Level', value: 'entry' },
    { id: '14', label: 'Trainee', value: 'trainee' },
  ],
};

const mockLocations = [
  { id: '1', label: 'Tel Aviv', value: 'tel-aviv' },
  { id: '2', label: 'Jerusalem', value: 'jerusalem' },
  { id: '3', label: 'Haifa', value: 'haifa' },
  { id: '4', label: 'Beer Sheva', value: 'beer-sheva' },
  { id: '5', label: 'Remote', value: 'remote' },
];

const mockSkills = [
  { id: '1', label: 'React', value: 'react', type: 'mandatory' },
  { id: '2', label: 'TypeScript', value: 'typescript', type: 'advantage' },
  { id: '3', label: 'Node.js', value: 'nodejs', type: 'mandatory' },
  { id: '4', label: 'Python', value: 'python', type: 'advantage' },
  { id: '5', label: 'JavaScript', value: 'javascript', type: 'mandatory' },
  { id: '6', label: 'CSS', value: 'css', type: 'advantage' },
  { id: '7', label: 'HTML', value: 'html', type: 'mandatory' },
  { id: '8', label: 'Git', value: 'git', type: 'advantage' },
];

export const JobInterestStep: React.FC<JobInterestStepProps> = ({
  onNext,
  onBack,
  locale = 'en',
}) => {
  const { formData, updateJobInterest } = useFormStore();
  const { t } = useTranslation(locale);

  const [selectedCategory, setSelectedCategory] = useState(formData.jobInterest.categoryId);

  const {
    handleSubmit,
    formState: { isValid },
    setValue,
  } = useForm<JobInterest>({
    resolver: zodResolver(JobInterestSchema),
    defaultValues: formData.jobInterest,
    mode: 'onChange',
  });

  const onSubmit = (data: JobInterest) => {
    updateJobInterest(data);
    onNext();
  };

  const handleCategoryChange = (categoryValue: string | string[]) => {
    const value = Array.isArray(categoryValue) ? categoryValue[0] : categoryValue;
    setSelectedCategory(value);
    setValue('categoryId', value, { shouldValidate: true });
    setValue('roleIds', [], { shouldValidate: true });
  };

  const handleRoleChange = (roleIds: string | string[]) => {
    const values = Array.isArray(roleIds) ? roleIds : [roleIds];
    setValue('roleIds', values, { shouldValidate: true });
  };

  const handleLocationChange = (locationId: string) => {
    setValue('locationId', locationId, { shouldValidate: true });
  };

  const handleSkillsChange = (skills: string[]) => {
    setValue('skills', skills, { shouldValidate: true });
  };

  const availableRoles = selectedCategory
    ? mockRoles[selectedCategory as keyof typeof mockRoles] || []
    : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={styles.stepContainer}
    >
      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        <FormGrid columns={1} gap="lg">
          {/* Category Selection */}
          <Autocomplete
            label="Job Category"
            placeholder="Start typing to search categories..."
            options={mockCategories}
            onSelectionChange={handleCategoryChange}
            isRequired
            dir={locale === 'he' ? 'rtl' : 'ltr'}
          />

          {/* Role Selection - Only show when category is selected */}
          {selectedCategory && (
            <Autocomplete
              label="Job Roles"
              placeholder="Select up to 3 roles..."
              options={availableRoles}
              onSelectionChange={handleRoleChange}
              multiSelect
              maxSelections={
                selectedCategory === 'student' || selectedCategory === 'no-experience' ? 2 : 3
              }
              isRequired
              dir={locale === 'he' ? 'rtl' : 'ltr'}
            />
          )}

          {/* Location Selection */}
          <Dropdown
            label="Location"
            placeholder="Select your preferred location"
            options={mockLocations}
            onSelectionChange={handleLocationChange}
            isRequired
            dir={locale === 'he' ? 'rtl' : 'ltr'}
          />

          {/* Skills Selection */}
          <div className={styles.skillsSection}>
            <h3>Skills & Preferences</h3>

            <div className={styles.skillsGrid}>
              <div className={styles.skillColumn}>
                <Chips
                  label="Mandatory Skills"
                  options={mockSkills.filter((skill) => skill.type === 'mandatory')}
                  onSelectionChange={handleSkillsChange}
                  maxSelections={5}
                  hint="Select your core skills"
                />
              </div>

              <div className={styles.skillColumn}>
                <Chips
                  label="Advantage Skills"
                  options={mockSkills.filter((skill) => skill.type === 'advantage')}
                  onSelectionChange={handleSkillsChange}
                  maxSelections={5}
                  hint="Nice to have skills"
                />
              </div>
            </div>
          </div>
        </FormGrid>

        <div className={styles.actions}>
          <motion.button
            type="button"
            onClick={onBack}
            className={styles.backButton}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {t('buttons.back')}
          </motion.button>

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
