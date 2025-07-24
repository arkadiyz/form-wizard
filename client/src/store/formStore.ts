import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Types for form data
export interface PersonalInfo {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
}

export interface JobInterest {
  categoryId: string;
  roleIds: string[];
  locationId: string;
  skills: string[];
}

export interface NotificationSettings {
  email: boolean;
  phone: boolean;
  call: boolean;
  sms: boolean;
  whatsapp: boolean;
}

export interface FormData {
  personalInfo: PersonalInfo;
  jobInterest: JobInterest;
  notifications: NotificationSettings;
}

interface FormState {
  // Data
  currentStep: number;
  formData: FormData;
  validationErrors: Record<string, string>;

  // Actions
  setStep: (step: number) => void;
  updatePersonalInfo: (data: Partial<PersonalInfo>) => void;
  updateJobInterest: (data: Partial<JobInterest>) => void;
  updateNotifications: (data: Partial<NotificationSettings>) => void;
  setValidationError: (field: string, error: string) => void;
  clearValidationError: (field: string) => void;
  resetForm: () => void;
}

const initialFormData: FormData = {
  personalInfo: {
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
  },
  jobInterest: {
    categoryId: '',
    roleIds: [],
    locationId: '',
    skills: [],
  },
  notifications: {
    email: false,
    phone: false,
    call: false,
    sms: false,
    whatsapp: false,
  },
};

export const useFormStore = create<FormState>()(
  persist(
    (set, get) => ({
      currentStep: 1,
      formData: initialFormData,
      validationErrors: {},

      setStep: (step) => set({ currentStep: step }),

      updatePersonalInfo: (data) =>
        set((state) => ({
          formData: {
            ...state.formData,
            personalInfo: { ...state.formData.personalInfo, ...data },
          },
        })),

      updateJobInterest: (data) =>
        set((state) => ({
          formData: {
            ...state.formData,
            jobInterest: { ...state.formData.jobInterest, ...data },
          },
        })),

      updateNotifications: (data) =>
        set((state) => ({
          formData: {
            ...state.formData,
            notifications: { ...state.formData.notifications, ...data },
          },
        })),

      setValidationError: (field, error) =>
        set((state) => ({
          validationErrors: { ...state.validationErrors, [field]: error },
        })),

      clearValidationError: (field) =>
        set((state) => {
          const { [field]: _, ...rest } = state.validationErrors;
          return { validationErrors: rest };
        }),

      resetForm: () =>
        set({
          currentStep: 1,
          formData: initialFormData,
          validationErrors: {},
        }),
    }),
    {
      name: 'form-wizard-storage',
      partialize: (state) => ({ formData: state.formData, currentStep: state.currentStep }),
    },
  ),
);
