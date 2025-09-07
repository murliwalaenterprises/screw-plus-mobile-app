
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { encode as btoa } from 'base-64';

export const API_BASE_URL = 'https://api.razorpay.com/v1';

// Create axios instance
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor
axiosInstance.interceptors.request.use(
  config => {
    // Add Razorpay auth key if available
    const keyId = 'rzp_test_RDRYAr7BuRV4uT';
    const keySecret = 'AdvgXm9WI5ZGvv4ZeMmcJSVG';

    // Razorpay needs Basic Auth
    const basicAuth = 'Basic ' + btoa(`${keyId}:${keySecret}`);
    config.headers.Authorization = basicAuth;

    return config;
  },
  error => Promise.reject(error),
);

// Response Interceptor
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => response,
  error => {
    console.error('[API Error]', error?.response?.data || error.message);
    return Promise.reject(error);
  },
);

// Generic API Service
class AxiosService {
  static async get<T>(
    url: string,
    params?: Record<string, any>,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const response: AxiosResponse<T> = await axiosInstance.get(url, {
      ...config,
      params,
    });
    return response.data;
  }

  static async post<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const response: AxiosResponse<T> = await axiosInstance.post(url, data, config);
    return response.data;
  }

  static async put<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const response: AxiosResponse<T> = await axiosInstance.put(url, data, config);
    return response.data;
  }

  static async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await axiosInstance.delete(url, config);
    return response.data;
  }
}

export default AxiosService;