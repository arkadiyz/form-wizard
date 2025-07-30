import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { formService } from '../services/form.service';

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
  sessionId: string;
  isLoading: boolean;
  isSaving: boolean;

  // Actions
  setStep: (step: number) => void;
  updatePersonalInfo: (data: Partial<PersonalInfo>) => void;
  updateJobInterest: (data: Partial<JobInterest>) => void;
  updateNotifications: (data: Partial<NotificationSettings>) => void;
  setValidationError: (field: string, error: string) => void;
  clearValidationError: (field: string) => void;
  resetForm: () => void;

  // New actions for server integration
  saveCurrentStep: () => Promise<boolean>;
  loadFormState: () => Promise<void>;
  generateSessionId: () => void;
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
      sessionId: '',
      isLoading: false,
      isSaving: false,

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
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { [field]: _, ...rest } = state.validationErrors;
          return { validationErrors: rest };
        }),

      resetForm: () =>
        set({
          currentStep: 1,
          formData: initialFormData,
          validationErrors: {},
        }),

      generateSessionId: () => {
        const sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2)}`;
        set({ sessionId });
      },

      saveCurrentStep: async () => {
        console.log('🔵 FormStore: saveCurrentStep called');
        const state = get();
        console.log('🔵 Current state:', {
          sessionId: state.sessionId,
          currentStep: state.currentStep,
        });

        if (!state.sessionId) {
          console.log('🔵 No sessionId, generating new one...');
          state.generateSessionId();
        }

        set({ isSaving: true });
        console.log('🔵 Set isSaving to true');

        try {
          console.log('🔵 Calling formService.saveFormState...');
          console.log('🔵 Request data:', {
            sessionId: state.sessionId,
            formData: state.formData,
            currentStep: state.currentStep,
          });

          const response = await formService.saveFormState({
            sessionId: state.sessionId,
            formData: state.formData,
            currentStep: state.currentStep,
          });

          console.log('🔵 FormService response:', response);

          if (response.success) {
            console.log('🔵 Form state saved successfully');
            return true;
          } else {
            console.error('🔵 Failed to save form state:', response.message);
            return false;
          }
        } catch (error) {
          console.error('🔵 Error saving form state:', error);
          return false;
        } finally {
          set({ isSaving: false });
          console.log('🔵 Set isSaving to false');
        }
      },

      loadFormState: async () => {
        const state = get();

        if (!state.sessionId) {
          return;
        }

        set({ isLoading: true });

        try {
          const response = await formService.getFormState(state.sessionId);

          if (response.success && response.data) {
            set({
              formData: response.data.formData,
              currentStep: response.data.currentStep,
            });
            console.log('Form state loaded successfully');
          }
        } catch (error) {
          console.error('Error loading form state:', error);
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: 'form-wizard-storage',
      partialize: (state) => ({
        formData: state.formData,
        currentStep: state.currentStep,
        sessionId: state.sessionId,
      }),
    },
  ),
);
