'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { JobInterestSchema, type JobInterest } from '../../../schemas/formSchemas';
import { useFormStore } from '../../../store/formStore';
import { Autocomplete, Dropdown, Chips } from '../../ui';
import { FormGrid } from '../FormGrid';
import { StepHeader } from '../StepHeader';
import styles from './JobInterestStep.module.css';

interface JobInterestStepProps {
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

// Extended skills pool for replacement system
const allMockSkills = [
  // Mandatory skills pool
  { id: '1', label: 'React', value: 'react' },
  { id: '2', label: 'JavaScript', value: 'javascript' },
  { id: '3', label: 'Node.js', value: 'nodejs' },
  { id: '4', label: 'HTML', value: 'html' },
  { id: '5', label: 'CSS', value: 'css' },
  { id: '6', label: 'Python', value: 'python' },
  { id: '7', label: 'Java', value: 'java' },
  { id: '8', label: 'SQL', value: 'sql' },
  { id: '9', label: 'PHP', value: 'php' },
  { id: '10', label: 'C#', value: 'csharp' },
  { id: '11', label: 'Angular', value: 'angular' },
  { id: '12', label: 'Vue.js', value: 'vue' },
  // Advantage skills pool
  { id: '13', label: 'TypeScript', value: 'typescript' },
  { id: '14', label: 'Git', value: 'git' },
  { id: '15', label: 'Docker', value: 'docker' },
  { id: '16', label: 'AWS', value: 'aws' },
  { id: '17', label: 'MongoDB', value: 'mongodb' },
  { id: '18', label: 'GraphQL', value: 'graphql' },
  { id: '19', label: 'Redux', value: 'redux' },
  { id: '20', label: 'Sass', value: 'sass' },
  { id: '21', label: 'Webpack', value: 'webpack' },
  { id: '22', label: 'Jest', value: 'jest' },
  { id: '23', label: 'Figma', value: 'figma' },
  { id: '24', label: 'Adobe XD', value: 'adobe-xd' },
];

export const JobInterestStep: React.FC<JobInterestStepProps> = ({ locale = 'en' }) => {
  const { formData, updateJobInterest } = useFormStore();

  // Category/Role state
  const [selectedCategory, setSelectedCategory] = useState(formData.jobInterest.categoryId);

  // Skills state management
  const [mandatorySkills, setMandatorySkills] = useState<string[]>([]);
  const [advantageSkills, setAdvantageSkills] = useState<string[]>([]);
  const [removedSkills, setRemovedSkills] = useState<string[]>([]);
  const [showLimitNotification, setShowLimitNotification] = useState(false);

  // Available skills for display (8 chips initially: 4 + 4)
  const [availableMandatory, setAvailableMandatory] = useState<typeof allMockSkills>([]);
  const [availableAdvantage, setAvailableAdvantage] = useState<typeof allMockSkills>([]);

  // Initialize 8 recommended chips (4 mandatory + 4 advantage)
  useEffect(() => {
    const shuffled = [...allMockSkills].sort(() => 0.5 - Math.random());
    setAvailableMandatory(shuffled.slice(0, 4));
    setAvailableAdvantage(shuffled.slice(4, 8));
  }, []);

  const { handleSubmit, setValue } = useForm<JobInterest>({
    resolver: zodResolver(JobInterestSchema),
    defaultValues: formData.jobInterest,
    mode: 'onChange',
  });

  const onSubmit = (data: JobInterest) => {
    updateJobInterest(data);
    // Remove onNext call since FormWizard handles navigation
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

  // Calculate total skills
  const totalSkills = mandatorySkills.length + advantageSkills.length;
  const maxSkills = 10;

  // Handle mandatory skills with mutual exclusivity and limits
  const handleMandatorySkillsChange = (selectedValues: string[]) => {
    // Check if trying to exceed limit
    const newTotal = selectedValues.length + advantageSkills.length;
    if (newTotal > maxSkills) {
      showSkillLimitNotification();
      return;
    }

    // Remove from advantage if exists (mutual exclusivity)
    const cleanedAdvantageSkills = advantageSkills.filter(
      (skill) => !selectedValues.includes(skill),
    );

    // Update states
    setMandatorySkills(selectedValues);
    setAdvantageSkills(cleanedAdvantageSkills);

    // Update form with combined skills
    const allSkills = [...selectedValues, ...cleanedAdvantageSkills];
    setValue('skills', allSkills, { shouldValidate: true });

    // Handle chip replacement
    replaceRemovedChips(selectedValues, availableMandatory, setAvailableMandatory);
  };

  // Handle advantage skills with mutual exclusivity and limits
  const handleAdvantageSkillsChange = (selectedValues: string[]) => {
    // Check if trying to exceed limit
    const newTotal = mandatorySkills.length + selectedValues.length;
    if (newTotal > maxSkills) {
      showSkillLimitNotification();
      return;
    }

    // Remove from mandatory if exists (mutual exclusivity)
    const cleanedMandatorySkills = mandatorySkills.filter(
      (skill) => !selectedValues.includes(skill),
    );

    // Update states
    setAdvantageSkills(selectedValues);
    setMandatorySkills(cleanedMandatorySkills);

    // Update form with combined skills
    const allSkills = [...cleanedMandatorySkills, ...selectedValues];
    setValue('skills', allSkills, { shouldValidate: true });

    // Handle chip replacement
    replaceRemovedChips(selectedValues, availableAdvantage, setAvailableAdvantage);
  };

  // Replace removed chips with new ones
  const replaceRemovedChips = (
    currentSelection: string[],
    currentAvailable: typeof allMockSkills,
    setAvailable: React.Dispatch<React.SetStateAction<typeof allMockSkills>>,
  ) => {
    // Find removed chips (chips that were available but not selected anymore)
    const previouslyAvailable = currentAvailable.map((chip) => chip.value);
    const removedChips = previouslyAvailable.filter(
      (chip) =>
        !currentSelection.includes(chip) &&
        currentAvailable.some((available) => available.value === chip),
    );

    if (removedChips.length > 0) {
      // Add to removed list so they don't appear again
      setRemovedSkills((prev) => [...prev, ...removedChips]);

      // Find replacement chips
      const usedSkills = [...mandatorySkills, ...advantageSkills, ...currentSelection];
      const replacementChips = allMockSkills
        .filter(
          (skill) =>
            !usedSkills.includes(skill.value) &&
            !removedSkills.includes(skill.value) &&
            !removedChips.includes(skill.value),
        )
        .slice(0, removedChips.length);

      // Update available chips
      setAvailable((prev) => [
        ...prev.filter((chip) => currentSelection.includes(chip.value)),
        ...replacementChips,
      ]);
    }
  };

  // Show notification for skill limit with auto-close
  const showSkillLimitNotification = () => {
    setShowLimitNotification(true);
    setTimeout(() => {
      setShowLimitNotification(false);
    }, 5000);
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
      <StepHeader
        title="Job Interest & Skills"
        subtitle="Tell us about your job preferences and showcase your skills."
      />

      {/* Skill Limit Notification */}
      {showLimitNotification && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className={styles.notification}
        >
          <div className={styles.notificationContent}>
            <span>You can choose up to 10 mandatory and advantage skills total</span>
            <button
              onClick={() => setShowLimitNotification(false)}
              className={styles.notificationClose}
            >
              ×
            </button>
          </div>
        </motion.div>
      )}

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
            <p className={styles.skillsHint}>
              Add up to 10 skills ({totalSkills}/{maxSkills})
            </p>

            <div className={styles.skillsGrid}>
              <div className={styles.skillColumn}>
                <Chips
                  label="Mandatory Skills"
                  options={availableMandatory}
                  selectedValues={mandatorySkills}
                  onSelectionChange={handleMandatorySkillsChange}
                  hint="Select your core skills"
                  dir={locale === 'he' ? 'rtl' : 'ltr'}
                />
              </div>

              <div className={styles.skillColumn}>
                <Chips
                  label="Advantage Skills"
                  options={availableAdvantage}
                  selectedValues={advantageSkills}
                  onSelectionChange={handleAdvantageSkillsChange}
                  hint="Nice to have skills"
                  dir={locale === 'he' ? 'rtl' : 'ltr'}
                />
              </div>
            </div>
          </div>
        </FormGrid>
      </form>
    </motion.div>
  );
};
