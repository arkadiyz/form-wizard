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
  // שמירת מצב הטופס
  async saveFormState(request: {
    sessionId: string;
    formData: FormData;
    currentStep: number;
  }): Promise<IApiResponse<void>> {
    console.log('🟣 FormService: saveFormState called with:', request);

    try {
      // המר את הנתונים לפורמט שהשרת מצפה לו
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
            skillIds: [], // Keep empty for backward compatibility
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

      console.log('🟣 Converted request for server:', serverRequest);
      console.log(
        '🟣 JobInterest data being sent:',
        JSON.stringify(serverRequest.formData.jobInterest, null, 2),
      );
      console.log('🟣 Making POST request to /form/save-state...');

      // שלח ישירות בלי עטיפה נוספת
      const response = await httpService.post<IApiResponse<void>>(
        '/form/save-state',
        serverRequest,
      );
      console.log('🟣 HTTP response received:', response);
      return response;
    } catch (error) {
      console.error('🟣 FormService error:', error);
      throw error;
    }
  },

  // טעינת מצב הטופס
  async getFormState(sessionId: string): Promise<IApiResponse<FormStateResponse>> {
    console.log('🟣 FormService: getFormState called with sessionId:', sessionId);

    try {
      const response = await httpService.get<IApiResponse<FormStateResponse>>(
        `/form/state/${sessionId}`,
      );
      console.log('🟣 GetFormState response:', response);
      return response;
    } catch (error) {
      console.error('🟣 GetFormState error:', error);
      throw error;
    }
  },
};
