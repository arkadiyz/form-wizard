'use client';

import React, {
  useMemo,
  useState,
  useCallback,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { JobInterestSchema, type JobInterest } from '../../../schemas/formSchemas';
import { useFormStore } from '../../../store/formStore';
import { Autocomplete, Dropdown, Chips } from '../../ui';
import { FormGrid } from '../FormGrid';
import { StepHeader } from '../StepHeader';
import { referenceDataService } from '../../../services/referenceDataService';
import styles from './JobInterestStep.module.css';

interface JobInterestStepProps {
  locale?: string;
}

export interface JobInterestStepRef {
  save: () => Promise<boolean>;
  isValid: () => boolean;
}

export const JobInterestStep = forwardRef<JobInterestStepRef, JobInterestStepProps>(
  ({ locale = 'en' }, ref) => {
    const { formData, updateJobInterest, saveCurrentStep } = useFormStore();
    const [roleSearchText, setRoleSearchText] = useState('');
    const [debouncedRoleSearchText, setDebouncedRoleSearchText] = useState('');

    const {
      control,
      handleSubmit,
      formState: { errors, isValid },
      setValue,
      watch,
      setError,
      clearErrors,
      trigger,
    } = useForm<JobInterest>({
      resolver: zodResolver(JobInterestSchema),
      defaultValues: formData.jobInterest,
      mode: 'onBlur',
    });

    useEffect(() => {
      const timer = setTimeout(() => {
        setDebouncedRoleSearchText(roleSearchText);
      }, 300);

      return () => clearTimeout(timer);
    }, [roleSearchText]);

    const categoryIds = useMemo(() => watch('categoryIds') || [], [watch]);
    const roleIds = useMemo(() => watch('roleIds') || [], [watch]);

    const {
      data: categories = [],
      isLoading: categoriesLoading,
      error: categoriesError,
    } = useQuery({
      queryKey: ['categories'],
      queryFn: referenceDataService.getCategories,
      retry: 2,
      staleTime: 5 * 60 * 1000,
    });

    const getSpecialCategoryIds = useMemo(() => {
      if (!categories || categories.length === 0) return { studentId: null, noExpId: null };

      const studentCategory = categories.find((cat) => cat.label.toLowerCase().includes('student'));

      const noExpCategory = categories.find(
        (cat) =>
          cat.label.toLowerCase().includes('no') && cat.label.toLowerCase().includes('experience'),
      );

      return {
        studentId: studentCategory?.value || null,
        noExpId: noExpCategory?.value || null,
      };
    }, [categories]);

    const getCategoryValidation = useMemo(() => {
      const { studentId, noExpId } = getSpecialCategoryIds;
      const hasStudentExperience = studentId && categoryIds.includes(studentId);
      const hasNoExperience = noExpId && categoryIds.includes(noExpId);

      if (hasStudentExperience || hasNoExperience) {
        return {
          maxSelections: 3,
          canAddMore: categoryIds.length < 3,
          message: hasStudentExperience
            ? "With 'Student' selected, you can choose up to 3 categories total"
            : "With 'No Experience' selected, you can choose up to 3 categories total",
        };
      }

      if (categoryIds.length === 2 && !hasStudentExperience && !hasNoExperience) {
        return {
          maxSelections: 3,
          canAddMore: true,
          message: 'You can add Student or No Experience as a 3rd category',
        };
      }

      return {
        maxSelections: 2,
        canAddMore: categoryIds.length < 2,
        message: 'Select up to 2 categories (or 3 if including Student/No Experience)',
      };
    }, [categoryIds, getSpecialCategoryIds]);

    const getRoleLimit = useMemo(() => {
      const categoryCount = categoryIds.length;

      if (categoryCount === 0) {
        return 0;
      }

      if (categoryCount === 1) {
        return 3;
      } else if (categoryCount === 2) {
        return 4;
      }

      return 0;
    }, [categoryIds]);

    const {
      data: roles = [],
      isLoading: rolesLoading,
      error: rolesError,
    } = useQuery({
      queryKey: ['roles', categoryIds, debouncedRoleSearchText],
      queryFn: () => {
        if (categoryIds.length === 0) return Promise.resolve([]);
        return referenceDataService.searchRolesByCategoriesAndText(
          categoryIds,
          debouncedRoleSearchText,
        );
      },
      enabled: categoryIds.length > 0,
      retry: 2,
      staleTime: 5 * 60 * 1000,
    });

    const handleRoleSearch = useCallback((searchText: string) => {
      setRoleSearchText(searchText);
    }, []);

    const {
      data: locations = [],
      isLoading: locationsLoading,
      error: locationsError,
    } = useQuery({
      queryKey: ['locations'],
      queryFn: referenceDataService.getLocations,
      retry: 2,
      staleTime: 10 * 60 * 1000,
    });

    const {
      data: skills = [],
      isLoading: skillsLoading,
      error: skillsError,
    } = useQuery({
      queryKey: ['skills'],
      queryFn: () => referenceDataService.getSkillsByCategory(),
      retry: 2,
      staleTime: 10 * 60 * 1000,
    });

    const validateRoles = (selectedRoles: string[]) => {
      const limit = getRoleLimit;

      if (selectedRoles.length > limit) {
        const categoryCount = categoryIds.length;
        let message = '';

        if (categoryCount === 1) {
          message = `With 1 category selected, you can choose up to 3 roles (currently ${selectedRoles.length})`;
        } else if (categoryCount === 2) {
          message = `With 2 categories selected, you can choose up to 2 roles from each category (max 4 total, currently ${selectedRoles.length})`;
        } else {
          message = `You can select up to ${limit} roles with your current categories (currently ${selectedRoles.length})`;
        }

        setError('roleIds', { message });
        return false;
      } else {
        clearErrors('roleIds');
        return true;
      }
    };

    const validateCategorySelection = (currentSelections: string[], newSelection: string) => {
      const { studentId, noExpId } = getSpecialCategoryIds;

      if (newSelection === studentId || newSelection === noExpId) {
        if (
          (newSelection === studentId && currentSelections.includes(noExpId || '')) ||
          (newSelection === noExpId && currentSelections.includes(studentId || ''))
        ) {
          return {
            canAdd: false,
            reason: "Cannot select both 'Student' and 'No Experience'",
          };
        }

        if (currentSelections.length >= 3) {
          return {
            canAdd: false,
            reason: 'Maximum 3 categories allowed',
          };
        }

        return { canAdd: true };
      }

      const hasStudentExperience = currentSelections.includes(studentId || '');
      const hasNoExperience = currentSelections.includes(noExpId || '');

      if (hasStudentExperience || hasNoExperience) {
        if (currentSelections.length >= 3) {
          return {
            canAdd: false,
            reason: 'Maximum 3 categories allowed with Student/No Experience',
          };
        }
      } else {
        if (currentSelections.length >= 2) {
          return {
            canAdd: false,
            reason: 'Maximum 2 regular categories (you can still add Student/No Experience as 3rd)',
          };
        }
      }

      return { canAdd: true };
    };

    const handleCategoryChange = (value: string | string[]) => {
      const newCategoryIds = Array.isArray(value) ? value : [value];
      setValue('categoryIds', newCategoryIds);

      const currentRoles = roleIds;
      if (currentRoles.length > 0) {
        setTimeout(() => validateRoles(currentRoles), 100);
      }
    };

    const handleRoleChange = (value: string | string[]) => {
      const newRoleIds = Array.isArray(value) ? value : [value];

      setValue('roleIds', newRoleIds);

      validateRoles(newRoleIds);
    };

    useImperativeHandle(ref, () => ({
      save: async (): Promise<boolean> => {
        try {
          const currentData = watch();

          const isValid = await trigger();
          if (!isValid) {
            return false;
          }

          updateJobInterest(currentData);

          const success = await saveCurrentStep();
          return success;
        } catch (error) {
          return false;
        }
      },
      isValid: (): boolean => {
        const hasErrors = Object.keys(errors).length > 0;
        if (hasErrors) {
          return false;
        }

        const currentData = watch();

        const checks = {
          hasCategories: (currentData.categoryIds?.length || 0) > 0,
          hasRoles: (currentData.roleIds?.length || 0) > 0,
          hasLocation: !!currentData.locationId && currentData.locationId.trim() !== '',
          hasMandatorySkills: (currentData.mandatorySkills?.length || 0) > 0,
        };

        const isFormValid =
          checks.hasCategories &&
          checks.hasRoles &&
          checks.hasLocation &&
          checks.hasMandatorySkills;

        return isFormValid;
      },
    }));

    if (categoriesLoading || locationsLoading || skillsLoading) {
      return (
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Loading job preferences...</p>
        </div>
      );
    }

    if (categoriesError || locationsError || skillsError) {
      return (
        <div className={styles.errorContainer}>
          <h3>Unable to load job preferences</h3>
          <p>Please check your connection and try again.</p>
          <button onClick={() => window.location.reload()} className={styles.retryButton}>
            Retry
          </button>
        </div>
      );
    }

    const onSubmit = (data: JobInterest) => {
      if (!validateRoles(data.roleIds)) {
        return;
      }
      updateJobInterest(data);
    };

    const getRolePlaceholder = () => {
      const categoryCount = categoryIds.length;
      if (categoryCount === 0) {
        return 'Select categories first to see available roles';
      } else if (categoryCount === 1) {
        return 'Select up to 3 roles from your category';
      } else if (categoryCount === 2) {
        return 'Select up to 2 roles from each category';
      } else {
        return `Select up to ${getRoleLimit} roles from your categories`;
      }
    };

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

        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          <FormGrid columns={1} gap="lg">
            <Controller
              name="categoryIds"
              control={control}
              render={({ field }) => (
                <Autocomplete
                  label="Job Categories"
                  placeholder="Select up to 2 categories..."
                  options={categories}
                  selectedValues={field.value || []}
                  onSelectionChange={handleCategoryChange}
                  multiSelect
                  maxSelections={getCategoryValidation.maxSelections}
                  customValidation={validateCategorySelection}
                  isRequired
                  error={errors.categoryIds?.message}
                  dir={locale === 'he' ? 'rtl' : 'ltr'}
                />
              )}
            />

            <Controller
              name="roleIds"
              control={control}
              render={({ field }) => (
                <div>
                  <>
                    <Autocomplete
                      label="Job Roles"
                      placeholder="Type to search roles based on your categories..."
                      options={roles}
                      selectedValues={field.value || []}
                      inputValue={roleSearchText}
                      onSelectionChange={handleRoleChange}
                      onSearchChange={handleRoleSearch}
                      multiSelect
                      maxSelections={getRoleLimit}
                      isRequired
                      error={errors.roleIds?.message}
                      dir={locale === 'he' ? 'rtl' : 'ltr'}
                    />
                  </>
                  {categoryIds.length === 0 && (
                    <div className={styles.roleHint}>
                      Please select job categories first to see available roles
                    </div>
                  )}
                </div>
              )}
            />

            <Controller
              name="locationId"
              control={control}
              render={({ field }) => (
                <Dropdown
                  label="Preferred Location"
                  placeholder="Select your preferred work location"
                  options={locations}
                  value={field.value || ''}
                  onSelectionChange={field.onChange}
                  isRequired
                  error={errors.locationId?.message}
                  dir={locale === 'he' ? 'rtl' : 'ltr'}
                />
              )}
            />

            <FormGrid columns={1} gap="md">
              <Controller
                name="mandatorySkills"
                control={control}
                render={({ field }) => (
                  <Chips
                    label="Mandatory Skills"
                    options={skills}
                    selectedValues={field.value || []}
                    onSelectionChange={(values) => {
                      field.onChange(values);
                      const currentAdvantageSkills = watch('advantageSkills') || [];
                      const newAdvantageSkills = currentAdvantageSkills.filter(
                        (skill) => !values.includes(skill),
                      );
                      if (newAdvantageSkills.length !== currentAdvantageSkills.length) {
                        setValue('advantageSkills', newAdvantageSkills);
                      }
                    }}
                    maxSelections={10}
                    isRequired
                    error={errors.mandatorySkills?.message}
                    hint="Select your core technical and professional skills"
                    dir={locale === 'he' ? 'rtl' : 'ltr'}
                  />
                )}
              />

              <Controller
                name="advantageSkills"
                control={control}
                render={({ field }) => {
                  const mandatorySkills = watch('mandatorySkills') || [];
                  const totalSkills = mandatorySkills.length + (field.value?.length || 0);
                  const remainingSlots = Math.max(0, 10 - mandatorySkills.length);

                  return (
                    <Chips
                      label="Advantage Skills"
                      options={skills.filter((skill) => !mandatorySkills.includes(skill.value))}
                      selectedValues={field.value || []}
                      onSelectionChange={(values) => {
                        field.onChange(values);
                        const currentMandatorySkills = watch('mandatorySkills') || [];
                        const newMandatorySkills = currentMandatorySkills.filter(
                          (skill) => !values.includes(skill),
                        );
                        if (newMandatorySkills.length !== currentMandatorySkills.length) {
                          setValue('mandatorySkills', newMandatorySkills);
                        }
                      }}
                      maxSelections={remainingSlots}
                      isRequired={false}
                      error={errors.advantageSkills?.message}
                      hint={`Add skills that give you an advantage (${remainingSlots} slots remaining)`}
                      dir={locale === 'he' ? 'rtl' : 'ltr'}
                    />
                  );
                }}
              />
            </FormGrid>
          </FormGrid>
        </form>
      </motion.div>
    );
  },
);

JobInterestStep.displayName = 'JobInterestStep';
