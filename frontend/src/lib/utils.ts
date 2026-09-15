import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import axios from "axios";
import { getAccesToken, makeRefreshToken } from '@/actions/auth.action';
import { Unauthorized } from '@/exceptions';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
};
let refreshPromise: null | Promise<boolean> = null;
const getNewToken = async () => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API}/auth/refresh-token`);
  const data = await response.json();
  return response;
};
export const httpRequest = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_API ?? "http://localhost:3100",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});
httpRequest.interceptors.request.use(async (config) => {
  const accessToken = await getAccesToken();
  if(accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  };
  return config;
});
httpRequest.interceptors.response.use((response) => response, async (error) => {
  if(+error.status === 401) {
    if(!refreshPromise) {
      refreshPromise = makeRefreshToken();
    };
    const newToken = await refreshPromise;
    if(newToken) {
      refreshPromise = null;
      return httpRequest(error.config);
    };
    throw new Unauthorized("Không có quyền truy cập", "UNAUTHORIZED");
  };
  return Promise.reject(error);
});