import { httpService, IApiResponse } from './http.service';
import type { FormData } from '../store/formStore';

interface SaveFormStateRequest {
  sessionId: string;
  formData: {
    personalInfo: {
      firstName: string;
      lastName: string;
      phone: string;
      email: string;
    };
    jobInterest: {
      categoryIds: string[];
      roleIds: string[];
      locationId: string | null;
      mandatorySkills: string[];
      advantageSkills: string[];
      skillIds: string[];
      experienceLevel: string | null;
      salaryExpectation: number | null;
    };
    notifications: {
      isEmailEnabled: boolean;
      isPhoneEnabled: boolean;
      isCallEnabled: boolean;
      isSmsEnabled: boolean;
      isWhatsappEnabled: boolean;
    };
  };
  currentStep: number;
}

interface FormStateResponse {
  id: string;
  sessionId: string;
  formData: FormData;
  currentStep: number;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export const formService = {
  async saveFormState(request: {
    sessionId: string;
    formData: FormData;
    currentStep: number;
  }): Promise<IApiResponse<void>> {
    try {
      const serverRequest: SaveFormStateRequest = {
        sessionId: request.sessionId,
        formData: {
          personalInfo: {
            firstName: request.formData.personalInfo.firstName,
            lastName: request.formData.personalInfo.lastName,
            phone: request.formData.personalInfo.phone,
            email: request.formData.personalInfo.email,
          },
          jobInterest: {
            categoryIds: request.formData.jobInterest.categoryIds || [],
            roleIds: request.formData.jobInterest.roleIds || [],
            locationId: request.formData.jobInterest.locationId || null,
            mandatorySkills: request.formData.jobInterest.mandatorySkills || [],
            advantageSkills: request.formData.jobInterest.advantageSkills || [],
            skillIds: [],
            experienceLevel: null,
            salaryExpectation: null,
          },
          notifications: {
            isEmailEnabled: request.formData.notifications.email,
            isPhoneEnabled: request.formData.notifications.phone,
            isCallEnabled: request.formData.notifications.call,
            isSmsEnabled: request.formData.notifications.sms,
            isWhatsappEnabled: request.formData.notifications.whatsapp,
          },
        },
        currentStep: request.currentStep,
      };

      const response = await httpService.post<IApiResponse<void>>(
        '/form/save-state',
        serverRequest,
      );
      return response;
    } catch (error) {
      throw error;
    }
  },

  async getFormState(sessionId: string): Promise<IApiResponse<FormStateResponse>> {
    try {
      const response = await httpService.get<IApiResponse<FormStateResponse>>(
        `/form/state/${sessionId}`,
      );
      return response;
    } catch (error) {
      throw error;
    }
  },
};
