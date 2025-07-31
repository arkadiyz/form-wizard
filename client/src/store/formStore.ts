import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { formService } from '../services/form.service';

export interface PersonalInfo {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
}

export interface JobInterest {
  categoryIds: string[];
  roleIds: string[];
  locationId: string;
  mandatorySkills: string[];
  advantageSkills: string[];
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
  currentStep: number;
  formData: FormData;
  validationErrors: Record<string, string>;
  sessionId: string;
  isLoading: boolean;
  isSaving: boolean;

  setStep: (step: number) => void;
  updatePersonalInfo: (data: Partial<PersonalInfo>) => void;
  updateJobInterest: (data: Partial<JobInterest>) => void;
  updateNotifications: (data: Partial<NotificationSettings>) => void;
  setValidationError: (field: string, error: string) => void;
  clearValidationError: (field: string) => void;
  resetForm: () => void;

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
    categoryIds: [],
    roleIds: [],
    locationId: '',
    mandatorySkills: [],
    advantageSkills: [],
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

      setStep: (step) => {
        set({ currentStep: step });
      },

      updatePersonalInfo: (data) => {
        set((state) => ({
          formData: {
            ...state.formData,
            personalInfo: { ...state.formData.personalInfo, ...data },
          },
        }));
      },

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
        const state = get();

        if (!state.sessionId) {
          state.generateSessionId();
        }

        set({ isSaving: true });

        try {
          const response = await formService.saveFormState({
            sessionId: state.sessionId,
            formData: state.formData,
            currentStep: state.currentStep,
          });

          if (response.success) {
            return true;
          } else {
            return false;
          }
        } catch (error) {
          return false;
        } finally {
          set({ isSaving: false });
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
          }
        } catch (error) {
          // Silent fail
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
