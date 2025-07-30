import Axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

export const RESPONSE_TYPE_BLOB = 'blob';
const CONTENT_TYPE = 'Content-Type';
const APPLICATION_JSON = 'application/json';
const RESPONSE_TYPE_TEXT = 'text';

export interface IApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
}

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const axios: AxiosInstance = Axios.create({
  withCredentials: true,
});

export interface IHttpService {
  get<T>(endpoint: string, data?: unknown): Promise<T>;
  post<T>(endpoint: string, data: unknown, URL?: string, responseType?: string): Promise<T>;
  put<T>(endpoint: string, data: unknown): Promise<T>;
  delete<T>(endpoint: string, data?: unknown): Promise<T>;
}

export const httpService: IHttpService = {
  get: <T>(endpoint: string, data?: unknown) => {
    return ajax<T>(endpoint, 'GET', data);
  },
  post: <T>(
    endpoint: string,
    data: unknown,
    URL?: string,
    responseType: string = RESPONSE_TYPE_TEXT,
  ) => {
    return ajax<T>(endpoint, 'POST', data, URL, responseType);
  },
  put: <T>(endpoint: string, data: unknown) => {
    return ajax<T>(endpoint, 'PUT', data);
  },
  delete: <T>(endpoint: string, data?: unknown) => {
    return ajax<T>(endpoint, 'DELETE', data);
  },
};

async function ajax<T>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  data: unknown = null,
  URL?: string,
  responseType: string = RESPONSE_TYPE_TEXT,
): Promise<T> {
  try {
    const jsonData = JSON.stringify(data);
    const config: AxiosRequestConfig = {
      headers: {
        [CONTENT_TYPE]: APPLICATION_JSON,
      },
      url: `http://localhost:5202/api${endpoint}`, // הוסף /api
      method,
      data: jsonData,
      responseType: responseType as AxiosRequestConfig['responseType'],
      withCredentials: true,
    };

    const res: AxiosResponse = await axios(config);

    return JSON.parse(res.data);
  } catch (err: unknown) {
    console.error('HTTP Request failed:', err);
    throw err;
  }
}
