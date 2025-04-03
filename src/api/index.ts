import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

export const createAxiosClient = (config?: AxiosRequestConfig): AxiosInstance => {

  const axiosInstance = axios.create({
    // 默认配置
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000',
    timeout: 1000*60*10,
    headers: {
      'Content-Type': 'application/json',
      "access-control-allow-origin": "*",
    },
    // 合并用户提供的配置
    ...config,
  });

  return axiosInstance;
};


const httpClient = createAxiosClient();
export default httpClient;


export type { AxiosInstance, AxiosRequestConfig, AxiosResponse };

// 导出所有API
export * from './color';
export * from './rank';
export * from './upload';
export * from './icon';
