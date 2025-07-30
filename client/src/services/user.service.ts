import { httpService, IApiResponse } from './http.service';

interface EmailCheckResponse {
  email: string;
  isAvailable: boolean;
  message: string;
}

export async function checkEmailAvailability(email: string): Promise<EmailCheckResponse> {
  return await httpService.get<EmailCheckResponse>(
    `/users/check-email/${encodeURIComponent(email)}`,
  );

  //   async function createUser(personalInfo: any): Promise<ApiResponse<string>> {
  //     return await httpService.post<ApiResponse<string>>('/users', personalInfo);
  //   },
}
